// Data access for Cloudflare D1. Business records (products, orders, customers…)
// are stored as one JSON document per row in the `records` table.
import { SCHEMA, SCHEMA_VERSION, hex } from "./schema.js";
import { FEATURED_PRODUCTS } from "../src/lib/products.js";
import { slugify } from "../src/lib/slug.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const newId = () => hex(crypto.getRandomValues(new Uint8Array(12)));
export const randomToken = (bytes = 32) => hex(crypto.getRandomValues(new Uint8Array(bytes)));
export const nowIso = () => new Date().toISOString();

export async function sha256(value) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))));
}

// ---------- first-use setup ----------
// Tables are created, and the product catalogue seeded, the first time the
// Worker handles a request against an empty database. No migration step needed.
let ready = null;

export function ensureReady(env) {
  ready ||= setup(env).catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

async function setup(env) {
  let version = null;
  try {
    version = await env.DB.prepare("SELECT value FROM meta WHERE key = 'schema_version'").first("value");
  } catch {
    version = null; // tables do not exist yet
  }
  if (version !== SCHEMA_VERSION) {
    await env.DB.batch([
      ...SCHEMA.map((sql) => env.DB.prepare(sql)),
      env.DB.prepare(
        "UPDATE outbox SET body = '', error = NULL WHERE subject IN ('Your Deep Jyoti Medical verification code', 'Reset your Deep Jyoti Medical password')"
      ),
      env.DB.prepare("INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").bind(SCHEMA_VERSION),
    ]);
  }
  // Claim the seed marker first so two simultaneous first requests cannot both seed.
  const claim = await env.DB.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('seeded_products', ?)").bind(nowIso()).run();
  if (claim.meta.changes === 1) {
    const base = Date.now();
    await env.DB.batch(
      FEATURED_PRODUCTS.map((p, i) =>
        buildCreate(env, "Product", {
          name: p.name,
          slug: slugify(p.name),
          category: p.category,
          image: p.image,
          images: [],
          short_description: "",
          full_description: p.description,
          ingredients: p.ingredients,
          selling_price: Number(String(p.price).replace(/[^\d.]/g, "")) || 0,
          stock_status: "in_stock",
        }, new Date(base - i * 60000).toISOString()).stmt
      )
    );
  }
}

// ---------- meta ----------

/** Atomically increments a named counter and returns the new value. */
export async function nextCounter(env, name) {
  const value = await env.DB
    .prepare("INSERT INTO meta (key, value) VALUES (?, '1') ON CONFLICT (key) DO UPDATE SET value = CAST(value AS INTEGER) + 1 RETURNING value")
    .bind(`counter:${name}`)
    .first("value");
  return Number(value);
}

/** Secret used to sign private file links. Set the APP_SECRET secret to control it; otherwise one is generated and stored. */
export async function appSecret(env) {
  if (env.APP_SECRET) return env.APP_SECRET;
  await env.DB.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('app_secret', ?)").bind(randomToken()).run();
  return env.DB.prepare("SELECT value FROM meta WHERE key = 'app_secret'").first("value");
}

// ---------- records ----------

const toRecord = (row) =>
  row && { ...JSON.parse(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date };

const stripSystemFields = ({ id, created_date, updated_date, ...data }) => data;

/** Returns { stmt, record } so several writes can be sent as one atomic batch. */
export function buildCreate(env, entity, data, createdDate) {
  const id = newId();
  const stamp = createdDate || nowIso();
  const clean = stripSystemFields(data || {});
  const stmt = env.DB
    .prepare("INSERT INTO records (id, entity, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)")
    .bind(id, entity, JSON.stringify(clean), stamp, stamp);
  return { stmt, record: { ...clean, id, created_date: stamp, updated_date: stamp } };
}

export function buildUpdate(env, entity, current, changes) {
  const merged = stripSystemFields({ ...current, ...(changes || {}) });
  const stamp = nowIso();
  const stmt = env.DB
    .prepare("UPDATE records SET data = ?, updated_date = ? WHERE entity = ? AND id = ?")
    .bind(JSON.stringify(merged), stamp, entity, current.id);
  return { stmt, record: { ...merged, id: current.id, created_date: current.created_date, updated_date: stamp } };
}

/** A stale or missing record aborts the entire checkout batch. */
export function guardCheckoutRecord(env, entity, record) {
  return env.DB.prepare(
    `INSERT INTO checkout_guard (valid)
     SELECT 0 WHERE NOT EXISTS (
       SELECT 1 FROM records WHERE entity = ? AND id = ? AND updated_date = ? AND json(data) = json(?)
     )`
  ).bind(entity, record.id, record.updated_date, JSON.stringify(stripSystemFields(record)));
}

export const records = {
  async all(env, entity) {
    const { results } = await env.DB.prepare("SELECT * FROM records WHERE entity = ?").bind(entity).all();
    return results.map(toRecord);
  },
  async get(env, entity, id) {
    return toRecord(await env.DB.prepare("SELECT * FROM records WHERE entity = ? AND id = ?").bind(entity, String(id)).first());
  },
  async getOrderByNumber(env, orderNumber) {
    return toRecord(await env.DB.prepare(
      "SELECT * FROM records WHERE entity = 'Order' AND json_extract(data, '$.order_id') = ? LIMIT 1"
    ).bind(orderNumber).first());
  },
  async create(env, entity, data) {
    const { stmt, record } = buildCreate(env, entity, data);
    await stmt.run();
    return record;
  },
  async update(env, entity, id, changes) {
    const current = await records.get(env, entity, id);
    if (!current) return null;
    const { stmt, record } = buildUpdate(env, entity, current, changes);
    await stmt.run();
    return record;
  },
  async remove(env, entity, id) {
    const result = await env.DB.prepare("DELETE FROM records WHERE entity = ? AND id = ?").bind(entity, String(id)).run();
    return result.meta.changes > 0;
  },
};

export function sortRecords(list, sort) {
  if (!sort || typeof sort !== "string") return list;
  const desc = sort.startsWith("-");
  const field = sort.replace(/^[-+]/, "");
  return [...list].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (x === y) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return (x > y ? 1 : -1) * (desc ? -1 : 1);
  });
}

export function matchesQuery(record, query) {
  if (!query || typeof query !== "object") return true;
  return Object.entries(query).every(([key, expected]) => {
    const actual = record[key];
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      if (Array.isArray(expected.$in)) return expected.$in.includes(actual);
      if ("$ne" in expected) return actual !== expected.$ne;
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    return actual === expected;
  });
}

// ---------- rate limiting ----------

/** Counts a request against `bucket` for this visitor; throws 429 past `max` per window. */
export async function rateLimit(env, request, bucket, max, windowMinutes = 15) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const now = Date.now();
  const count = await env.DB
    .prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN reset_at < ?3 THEN 1 ELSE count + 1 END,
         reset_at = CASE WHEN reset_at < ?3 THEN ?2 ELSE reset_at END
       RETURNING count`
    )
    .bind(`${bucket}:${ip}`, now + windowMinutes * 60000, now)
    .first("count");
  if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM rate_limits WHERE reset_at < ?").bind(now).run();
  if (count > max) throw new HttpError(429, "Too many requests. Please try again in a few minutes.");
}
