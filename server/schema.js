// Database tables (Cloudflare D1 / SQLite). Shared by the Worker, which creates
// them automatically on first use, and by scripts/make-admin.mjs.
export const SCHEMA_VERSION = "3";

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    entity TEXT NOT NULL,
    data TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS records_entity ON records (entity, created_date)`,
  `CREATE INDEX IF NOT EXISTS records_order_number ON records (json_extract(data, '$.order_id')) WHERE entity = 'Order'`,
  `CREATE TABLE IF NOT EXISTS checkout_guard (
    valid INTEGER NOT NULL CONSTRAINT checkout_snapshot_changed CHECK (valid = 1)
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    password_hash TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    created_date TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id)`,
  `CREATE TABLE IF NOT EXISTS codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS codes_user ON codes (user_id, kind)`,
  `CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    visibility TEXT NOT NULL,
    created_date TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS outbox (
    id TEXT PRIMARY KEY,
    to_addr TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    created_date TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  // Online checkouts waiting for payment. id is the Razorpay order id. The real
  // Order is only created once the payment is confirmed (status 'paid').
  `CREATE TABLE IF NOT EXISTS payment_intents (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    order_id TEXT,
    payment_id TEXT,
    error TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  )`,
];

// Password hashing parameters. PBKDF2-SHA256 at 100,000 iterations is the
// maximum Cloudflare Workers allow. Stored as: pbkdf2$<iterations>$<salt hex>$<key hex>
export const PBKDF2_ITERATIONS = 100000;
export const PBKDF2_KEY_BYTES = 32;

const hex = (bytes) => Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
const unhex = (s) => new Uint8Array((s.match(/.{2}/g) || []).map((h) => parseInt(h, 16)));

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(password)), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, PBKDF2_KEY_BYTES * 8);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITERATIONS}$${hex(salt)}$${hex(await derive(password, salt, PBKDF2_ITERATIONS))}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iterations, saltHex, keyHex] = String(stored || "").split("$");
  if (scheme !== "pbkdf2" || !saltHex || !keyHex) return false;
  const actual = hex(await derive(password, unhex(saltHex), Number(iterations)));
  return safeEqual(actual, keyHex);
}

/** Compares two strings without leaking where they differ. */
export function safeEqual(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export { hex };
