// The site's backend: a Cloudflare Worker that answers everything under /api.
// Data lives in D1 (env.DB), uploaded files in R2 (env.FILES). The website
// itself is served by Cloudflare's static assets (see wrangler.jsonc).
import {
  HttpError, ensureReady, records, sortRecords, matchesQuery, newId, nowIso, appSecret, rateLimit,
} from "./db.js";
import { hex, safeEqual } from "./schema.js";
import * as auth from "./auth.js";
import { sendEmail } from "./email.js";
import { placeOrder, trackOrder, sendOrderEmails, getSettings } from "./orders.js";
import { escapeHtml } from "../src/lib/orderLogic.js";

const text = (value, max = 500) => String(value ?? "").trim().slice(0, max);

// ---------- access rules ----------
// read/write: "public" or "admin". publicCreate lets visitors submit a record
// (after it has been cleaned). Anything not listed here does not exist.
const ENTITIES = {
  Product: { read: "public", write: "admin" },
  StoreSetting: { read: "public", write: "admin" },
  Review: { read: "public", write: "admin", publicFilter: (r) => (r.status || "approved") === "approved" },
  Customer: { read: "admin", write: "admin" },
  Order: { read: "admin", write: "admin" },
  PatientInquiry: {
    read: "admin",
    write: "admin",
    async publicCreate(_env, body) {
      if (!text(body.name) || !text(body.phone)) throw new HttpError(400, "Name and phone number are required");
      return {
        name: text(body.name, 120), phone: text(body.phone, 30), email: text(body.email, 254),
        condition: text(body.condition, 120), preferred_day: text(body.preferred_day, 40),
        message: text(body.message, 2000), source: text(body.source, 60), status: "new",
      };
    },
    async afterPublicCreate(env, record) {
      await notifyAdmin(env, `New Patient Inquiry — ${record.name}`, [
        ["Name", record.name], ["Phone", record.phone], ["Email", record.email || "—"],
        ["Health concern", record.condition || "—"], ["Preferred day", record.preferred_day || "—"],
        ["Message", record.message || "—"], ["Source", record.source || "—"],
      ]);
    },
  },
  PrescriptionRequest: {
    read: "admin",
    write: "admin",
    async publicCreate(env, body) {
      if (!text(body.full_name) || !text(body.phone)) throw new HttpError(400, "Name and phone number are required");
      const files = [];
      for (const f of (Array.isArray(body.files) ? body.files : []).slice(0, 10)) {
        const row = await fileFromUri(env, f?.file_uri);
        if (!row || row.visibility !== "private") throw new HttpError(400, "An uploaded file could not be found. Please upload it again.");
        files.push({ file_uri: `private://${row.id}`, filename: row.filename, content_type: row.content_type, size: row.size });
      }
      const random = crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000;
      return {
        reference_id: /^DJM-\d{6}$/.test(body.reference_id || "") ? body.reference_id : `DJM-${random}`,
        full_name: text(body.full_name, 120), phone: text(body.phone, 30), email: text(body.email, 254),
        message: text(body.message, 2000),
        preferred_contact: ["whatsapp", "phone", "email"].includes(body.preferred_contact) ? body.preferred_contact : "whatsapp",
        status: "new", files, email_sent: false, admin_notes: "",
      };
    },
    async afterPublicCreate(env, record) {
      const sent = await notifyAdmin(env, `New Prescription Request ${record.reference_id}`, [
        ["Reference ID", record.reference_id], ["Customer", record.full_name], ["Mobile", record.phone],
        ["Email", record.email || "—"], ["Preferred contact", record.preferred_contact],
        ["Message", record.message || "—"],
        ["Prescription", `${record.files.length} file(s) — review securely in Admin → Prescriptions`],
      ]);
      if (sent) await records.update(env, "PrescriptionRequest", record.id, { email_sent: true });
    },
  },
};

async function notifyAdmin(env, subject, rows) {
  const to = (await getSettings(env)).admin_email;
  if (!to) return false;
  const html = `<div style="font-family:Arial,sans-serif;color:#222"><h2 style="color:#1f3a2e">${escapeHtml(subject)}</h2><table style="font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0;white-space:pre-line">${escapeHtml(v)}</td></tr>`)
    .join("")}</table><p style="color:#666;font-size:13px">Received ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p></div>`;
  try {
    return (await sendEmail(env, { to, subject, html })).sent;
  } catch (err) {
    console.error("[email] admin notification failed:", err.message);
    return false;
  }
}

// ---------- helpers ----------

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

const isAdmin = (c) => c.user?.role === "admin";

function requireAdmin(c) {
  if (!c.user) throw new HttpError(401, "Please sign in");
  if (!isAdmin(c)) throw new HttpError(403, "Admin access required");
}

function requireRole(c, level) {
  if (level !== "public") requireAdmin(c);
}

function entityOf(name) {
  const rules = Object.hasOwn(ENTITIES, name) ? ENTITIES[name] : null;
  if (!rules) throw new HttpError(404, "Not found");
  return rules;
}

const limitOf = (value) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1000) : 1000;
};

async function readJson(request) {
  const raw = await request.text();
  if (raw.length > 200_000) throw new HttpError(413, "Invalid request");
  if (!raw) return {};
  try {
    const body = JSON.parse(raw);
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
  } catch {
    throw new HttpError(400, "Invalid request");
  }
}

const visible = (c, rules, list) => (isAdmin(c) || !rules.publicFilter ? list : list.filter(rules.publicFilter));

// ---------- files (R2) ----------

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_MINUTES = 10;
const FILE_TYPES = [
  { type: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  { type: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { type: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
];

async function fileFromUri(env, uri) {
  const match = /^private:\/\/([a-f0-9]{24})$/.exec(String(uri || ""));
  return match ? env.DB.prepare("SELECT * FROM files WHERE id = ?").bind(match[1]).first() : null;
}

async function storeUpload(c, visibility, allowed) {
  const tooLarge = new HttpError(413, "File too large. Maximum 10 MB.");
  if (Number(c.request.headers.get("Content-Length") || 0) > MAX_FILE_BYTES + 100_000) throw tooLarge;
  let file = null;
  try {
    file = (await c.request.formData()).get("file");
  } catch {
    throw new HttpError(400, "Upload failed");
  }
  if (!file || typeof file === "string") throw new HttpError(400, "No file was uploaded");
  if (file.size > MAX_FILE_BYTES) throw tooLarge;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = FILE_TYPES.find((t) => t.magic.every((b, i) => bytes[i] === b))?.type;
  if (!type || !allowed.includes(type)) throw new HttpError(415, "Unsupported file type. Use JPG, PNG or PDF.");

  const id = newId();
  const filename = String(file.name || "file").split(/[\\/]/).pop().replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
  await c.env.FILES.put(`${visibility}/${id}`, bytes, { httpMetadata: { contentType: type } });
  await c.env.DB
    .prepare("INSERT INTO files (id, filename, content_type, size, visibility, created_date) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, filename, type, bytes.length, visibility, nowIso())
    .run();
  return id;
}

async function signFile(env, id, exp) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(await appSecret(env)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${exp}`)));
}

async function sendStoredFile(env, row) {
  const object = await env.FILES.get(`${row.visibility}/${row.id}`);
  if (!object) throw new HttpError(404, "File not found");
  return new Response(object.body, {
    headers: {
      "Content-Type": row.content_type,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `inline; filename="${row.filename.replace(/"/g, "")}"`,
      "Cache-Control": row.visibility === "private" ? "private, no-store" : "public, max-age=86400",
    },
  });
}

// ---------- routes ----------
// [method, path pattern, handler(c)]. `:name` segments become c.params.name.
const AUTH_LIMIT = ["auth", 30];
const SUBMIT_LIMIT = ["submit", 30];
const LOOKUP_LIMIT = ["lookup", 10];
const limit = (c, [bucket, max]) => rateLimit(c.env, c.request, bucket, max);

const ROUTES = [
  // ----- auth -----
  ["POST", "/auth/register", async (c) => { await limit(c, AUTH_LIMIT); return json(await auth.register(c.env, await readJson(c.request))); }],
  ["POST", "/auth/verify-otp", async (c) => { await limit(c, AUTH_LIMIT); return json(await auth.verifyOtp(c.env, await readJson(c.request))); }],
  ["POST", "/auth/resend-otp", async (c) => { await limit(c, AUTH_LIMIT); return json(await auth.resendOtp(c.env, await readJson(c.request))); }],
  ["POST", "/auth/login", async (c) => { await limit(c, AUTH_LIMIT); return json(await auth.login(c.env, await readJson(c.request))); }],
  ["POST", "/auth/logout", async (c) => json(await auth.logout(c.env, c.tokenHash))],
  ["GET", "/auth/me", async (c) => { if (!c.user) throw new HttpError(401, "Not signed in"); return json(c.user); }],
  ["POST", "/auth/forgot-password", async (c) => { await limit(c, AUTH_LIMIT); return json(await auth.requestPasswordReset(c.env, await readJson(c.request), c.origin)); }],
  ["POST", "/auth/reset-password", async (c) => { await limit(c, AUTH_LIMIT); return json(await auth.resetPassword(c.env, await readJson(c.request))); }],

  // ----- orders -----
  ["POST", "/orders", async (c) => { await limit(c, SUBMIT_LIMIT); return json(await placeOrder(c.env, await readJson(c.request), c.origin), 201); }],
  ["POST", "/orders/track", async (c) => {
    await limit(c, LOOKUP_LIMIT);
    return json(await trackOrder(c.env, await readJson(c.request)));
  }],
  ["POST", "/orders/:orderId/resend-email", async (c) => {
    requireAdmin(c);
    const order = await records.getOrderByNumber(c.env, c.params.orderId);
    if (!order) throw new HttpError(404, "Order not found");
    return json(await sendOrderEmails(c.env, order, await getSettings(c.env), c.origin));
  }],

  // ----- email (admin only: never an open relay) -----
  ["POST", "/email/send", async (c) => {
    requireAdmin(c);
    const { to, subject, body, text: plain } = await readJson(c.request);
    if (!to || !subject) throw new HttpError(400, "Email needs a recipient and a subject");
    return json(await sendEmail(c.env, { to, subject, html: body, text: plain }));
  }],

  // ----- files -----
  ["POST", "/files/private", async (c) => {
    await limit(c, SUBMIT_LIMIT);
    return json({ file_uri: `private://${await storeUpload(c, "private", FILE_TYPES.map((t) => t.type))}` }, 201);
  }],
  ["POST", "/files/public", async (c) => {
    requireAdmin(c);
    return json({ file_url: `/api/files/public/${await storeUpload(c, "public", ["image/jpeg", "image/png"])}` }, 201);
  }],
  ["POST", "/files/signed-url", async (c) => {
    requireAdmin(c);
    const row = await fileFromUri(c.env, (await readJson(c.request)).file_uri);
    if (!row) throw new HttpError(404, "File not found");
    const exp = Date.now() + SIGNED_URL_MINUTES * 60000;
    return json({ signed_url: `/api/files/private/${row.id}?exp=${exp}&sig=${await signFile(c.env, row.id, exp)}` });
  }],
  ["GET", "/files/private/:id", async (c) => {
    const exp = Number(c.url.searchParams.get("exp"));
    const sig = c.url.searchParams.get("sig") || "";
    const valid = exp > Date.now() && safeEqual(sig, await signFile(c.env, c.params.id, exp));
    const row = valid ? await c.env.DB.prepare("SELECT * FROM files WHERE id = ? AND visibility = 'private'").bind(c.params.id).first() : null;
    if (!row) throw new HttpError(403, "This link is invalid or has expired");
    return sendStoredFile(c.env, row);
  }],
  ["GET", "/files/public/:id", async (c) => {
    const row = await c.env.DB.prepare("SELECT * FROM files WHERE id = ? AND visibility = 'public'").bind(c.params.id).first();
    if (!row) throw new HttpError(404, "File not found");
    return sendStoredFile(c.env, row);
  }],

  // ----- entities -----
  ["GET", "/entities/:entity", async (c) => {
    const rules = entityOf(c.params.entity);
    requireRole(c, rules.read);
    const list = sortRecords(visible(c, rules, await records.all(c.env, c.params.entity)), c.url.searchParams.get("sort"));
    return json(list.slice(0, limitOf(c.url.searchParams.get("limit"))));
  }],
  ["POST", "/entities/:entity/query", async (c) => {
    const rules = entityOf(c.params.entity);
    requireRole(c, rules.read);
    const { query, sort, limit: max } = await readJson(c.request);
    const list = sortRecords(visible(c, rules, await records.all(c.env, c.params.entity)).filter((r) => matchesQuery(r, query)), sort);
    return json(list.slice(0, limitOf(max)));
  }],
  ["GET", "/entities/:entity/:id", async (c) => {
    const rules = entityOf(c.params.entity);
    requireRole(c, rules.read);
    const record = await records.get(c.env, c.params.entity, c.params.id);
    if (!record || visible(c, rules, [record]).length === 0) throw new HttpError(404, `${c.params.entity} not found`);
    return json(record);
  }],
  ["POST", "/entities/:entity", async (c) => {
    const rules = entityOf(c.params.entity);
    if (isAdmin(c)) return json(await records.create(c.env, c.params.entity, await readJson(c.request)), 201);
    if (!rules.publicCreate) requireRole(c, rules.write);
    await limit(c, SUBMIT_LIMIT);
    const record = await records.create(c.env, c.params.entity, await rules.publicCreate(c.env, await readJson(c.request)));
    if (rules.afterPublicCreate) await rules.afterPublicCreate(c.env, record);
    // Visitors get back only what they need, not the stored record.
    return json({ id: record.id, reference_id: record.reference_id, status: record.status }, 201);
  }],
  ["PATCH", "/entities/:entity/:id", async (c) => {
    const rules = entityOf(c.params.entity);
    requireRole(c, rules.write);
    const record = await records.update(c.env, c.params.entity, c.params.id, await readJson(c.request));
    if (!record) throw new HttpError(404, `${c.params.entity} not found`);
    return json(record);
  }],
  ["DELETE", "/entities/:entity/:id", async (c) => {
    const rules = entityOf(c.params.entity);
    requireRole(c, rules.write);
    if (!(await records.remove(c.env, c.params.entity, c.params.id))) throw new HttpError(404, `${c.params.entity} not found`);
    return json({ success: true });
  }],
].map(([method, pattern, handler]) => ({
  method,
  handler,
  keys: [...pattern.matchAll(/:(\w+)/g)].map((m) => m[1]),
  regex: new RegExp(`^${pattern.replace(/:(\w+)/g, "([^/]+)")}$`),
}));

async function handleApi(request, env, url) {
  const path = url.pathname.slice("/api".length);
  for (const route of ROUTES) {
    if (route.method !== request.method) continue;
    const match = route.regex.exec(path);
    if (!match) continue;
    await ensureReady(env);
    const params = {};
    try {
      route.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
    } catch {
      throw new HttpError(400, "Invalid request");
    }
    const { user, tokenHash } = await auth.identify(env, request);
    const origin = String(env.PUBLIC_URL || url.origin).replace(/\/$/, "");
    return route.handler({ request, env, url, params, user, tokenHash, origin });
  }
  throw new HttpError(404, "Not found");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api" && !url.pathname.startsWith("/api/")) {
      // Everything else is the website itself (static files + single-page-app fallback).
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
    }
    try {
      return await handleApi(request, env, url);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error("[server] unexpected error:", err);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  },
};
