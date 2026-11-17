// Accounts and sessions: email + password sign-up with an emailed 6-digit
// verification code, bearer-token sessions, and password reset by email link.
import { HttpError, newId, nowIso, randomToken, sha256 } from "./db.js";
import { hashPassword, verifyPassword } from "./schema.js";
import { sendEmail, emailConfigured } from "./email.js";
import { BUSINESS } from "../src/lib/constants.js";

const SESSION_DAYS = 30;
const CODE_MINUTES = 15;
const RESET_MINUTES = 60;
const MAX_CODE_ATTEMPTS = 5;
const MIN_PASSWORD = 8;

function requireAccountEmail(env) {
  if (!emailConfigured(env)) {
    throw new HttpError(503, "Account email is temporarily unavailable. Please try again later.");
  }
}

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

const adminEmails = (env) =>
  String(env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function checkPassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD)
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters`);
  if (password.length > 200) throw new HttpError(400, "Password is too long");
}

const userByEmail = (env, email) => env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(normalizeEmail(email)).first();
const userById = (env, id) => env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();

export const publicUser = (u) =>
  u && { id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_date: u.created_date };

/** Emails listed in ADMIN_EMAILS become admins the next time they sign in. */
async function applyAdminList(env, user) {
  if (user.role !== "admin" && adminEmails(env).includes(user.email.toLowerCase())) {
    await env.DB.prepare("UPDATE users SET role = 'admin' WHERE id = ?").bind(user.id).run();
    return { ...user, role: "admin" };
  }
  return user;
}

async function createSession(env, userId) {
  const token = randomToken(32);
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await sha256(token), userId, now + SESSION_DAYS * 86400000),
  ]);
  return token;
}

/** Resolves the signed-in user from the Authorization header. Returns { user, tokenHash }. */
export async function identify(env, request) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { user: null, tokenHash: null };
  const tokenHash = await sha256(token);
  const row = await env.DB
    .prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?")
    .bind(tokenHash, Date.now())
    .first();
  return row ? { user: publicUser(row), tokenHash } : { user: null, tokenHash: null };
}

async function issueVerificationCode(env, user) {
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
  await env.DB.batch([
    env.DB.prepare("DELETE FROM codes WHERE user_id = ? AND kind = 'verify'").bind(user.id),
    env.DB.prepare("INSERT INTO codes (id, user_id, kind, code_hash, expires_at) VALUES (?, ?, 'verify', ?, ?)")
      .bind(newId(), user.id, await sha256(`${user.id}:${code}`), Date.now() + CODE_MINUTES * 60000),
  ]);
  await sendEmail(env, {
    to: user.email,
    subject: `Your ${BUSINESS.name} verification code`,
    text: `Your verification code is ${code}. It expires in ${CODE_MINUTES} minutes.\n\nIf you did not create an account, you can ignore this email.`,
    sensitive: true,
  }).catch(() => { throw new HttpError(503, "Could not send your verification code. Please try again later."); });
}

export async function register(env, { email, password }) {
  requireAccountEmail(env);
  email = normalizeEmail(email);
  if (!validEmail(email)) throw new HttpError(400, "Enter a valid email address");
  checkPassword(password);
  let user = await userByEmail(env, email);
  if (user && user.verified) throw new HttpError(409, "An account with this email already exists. Please log in.");
  const passwordHash = await hashPassword(password);
  if (user) {
    await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, user.id).run();
  } else {
    await env.DB
      .prepare("INSERT INTO users (id, email, full_name, role, password_hash, verified, created_date) VALUES (?, ?, ?, 'user', ?, 0, ?)")
      .bind(newId(), email, email.split("@")[0], passwordHash, nowIso())
      .run();
    user = await userByEmail(env, email);
  }
  await issueVerificationCode(env, user);
  return { success: true };
}

export async function resendOtp(env, { email }) {
  requireAccountEmail(env);
  const user = await userByEmail(env, email);
  if (user && !user.verified) await issueVerificationCode(env, user);
  return { success: true };
}

export async function verifyOtp(env, { email, otpCode }) {
  const invalid = new HttpError(400, "Invalid or expired verification code");
  const user = await userByEmail(env, email);
  if (!user) throw invalid;
  const row = await env.DB.prepare("SELECT * FROM codes WHERE user_id = ? AND kind = 'verify'").bind(user.id).first();
  if (!row || row.expires_at < Date.now() || row.attempts >= MAX_CODE_ATTEMPTS) throw invalid;
  if (row.code_hash !== (await sha256(`${user.id}:${String(otpCode || "").trim()}`))) {
    await env.DB.prepare("UPDATE codes SET attempts = attempts + 1 WHERE id = ?").bind(row.id).run();
    throw invalid;
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM codes WHERE id = ?").bind(row.id),
    env.DB.prepare("UPDATE users SET verified = 1 WHERE id = ?").bind(user.id),
  ]);
  const fresh = await applyAdminList(env, { ...user, verified: 1 });
  return { access_token: await createSession(env, fresh.id), user: publicUser(fresh) };
}

export async function login(env, { email, password }) {
  const user = await userByEmail(env, email);
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!ok) throw new HttpError(401, "Invalid email or password");
  if (!user.verified) throw new HttpError(403, "Please verify your email first. Register again to get a new code.");
  const fresh = await applyAdminList(env, user);
  return { access_token: await createSession(env, fresh.id), user: publicUser(fresh) };
}

export async function logout(env, tokenHash) {
  if (tokenHash) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  return { success: true };
}

export async function requestPasswordReset(env, { email }, origin) {
  requireAccountEmail(env);
  const user = await userByEmail(env, email);
  // Always answer the same way so this cannot be used to discover which emails have accounts.
  if (user) {
    const token = randomToken(32);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM codes WHERE user_id = ? AND kind = 'reset'").bind(user.id),
      env.DB.prepare("INSERT INTO codes (id, user_id, kind, code_hash, expires_at) VALUES (?, ?, 'reset', ?, ?)")
        .bind(newId(), user.id, await sha256(token), Date.now() + RESET_MINUTES * 60000),
    ]);
    const link = `${origin}/reset-password?token=${token}`;
    await sendEmail(env, {
      to: user.email,
      subject: `Reset your ${BUSINESS.name} password`,
      text: `Use this link to choose a new password (valid for ${RESET_MINUTES} minutes):\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
      sensitive: true,
    }).catch(() => console.error("[auth] Could not send an account email"));
  }
  return { success: true };
}

export async function resetPassword(env, { resetToken, newPassword }) {
  checkPassword(newPassword);
  const row = await env.DB
    .prepare("SELECT * FROM codes WHERE kind = 'reset' AND code_hash = ?")
    .bind(await sha256(resetToken || ""))
    .first();
  if (!row || row.expires_at < Date.now()) throw new HttpError(400, "This reset link is invalid or has expired");
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET password_hash = ?, verified = 1 WHERE id = ?").bind(await hashPassword(newPassword), row.user_id),
    env.DB.prepare("DELETE FROM codes WHERE id = ?").bind(row.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id),
  ]);
  return { success: true };
}
