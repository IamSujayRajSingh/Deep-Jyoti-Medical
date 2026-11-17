// Creates an admin account (or resets one and makes it admin).
//
//   npm run make-admin -- you@example.com            local development database
//   npm run make-admin -- you@example.com --remote   the live Cloudflare database
//
// The password is asked for interactively so it never lands in shell history.
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

import { SCHEMA, hashPassword } from "../server/schema.js";

const DATABASE = "deep-jyoti-db";

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((resolve) => {
    if (hidden) {
      rl._writeToOutput = (chunk) => {
        if (chunk.includes(question)) rl.output.write(chunk);
      };
    }
    let answered = "";
    rl.question(question, (answer) => {
      answered = answer;
      rl.close();
    });
    rl.on("close", () => {
      if (hidden) process.stdout.write("\n");
      resolve(answered);
    });
  });
}

const args = process.argv.slice(2);
const remote = args.includes("--remote");
const email = (args.find((a) => !a.startsWith("--")) || "").trim().toLowerCase();

if (!/^[^\s@']+@[^\s@']+\.[^\s@']+$/.test(email)) {
  console.error("Usage: npm run make-admin -- you@example.com [--remote]");
  process.exit(1);
}

const password = process.env.ADMIN_PASSWORD || (await ask("Password for this admin (min 8 characters): ", { hidden: true }));
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

// The hash only contains [a-z0-9$], and the email was checked above, so these are safe to inline.
const hash = await hashPassword(password);
const id = crypto.randomBytes(12).toString("hex");
const usersTable = SCHEMA.find((sql) => sql.includes("CREATE TABLE IF NOT EXISTS users"));
const sql = `${usersTable.replace(/\s+/g, " ")};
INSERT INTO users (id, email, full_name, role, password_hash, verified, created_date)
VALUES ('${id}', '${email}', '${email.split("@")[0]}', 'admin', '${hash}', 1, '${new Date().toISOString()}')
ON CONFLICT (email) DO UPDATE SET role = 'admin', verified = 1, password_hash = excluded.password_hash;
`;

const file = path.join(os.tmpdir(), `make-admin-${id}.sql`);
fs.writeFileSync(file, sql);
try {
  const result = spawnSync(
    `npx wrangler d1 execute ${DATABASE} ${remote ? "--remote" : "--local"} --yes --file="${file}"`,
    { stdio: ["inherit", "pipe", "pipe"], shell: true, encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    console.error(`Could not update the ${remote ? "live" : "local"} database.`);
    process.exit(1);
  }
  console.log(`${email} is now an admin on the ${remote ? "LIVE" : "local development"} database. Sign in at /login.`);
} finally {
  fs.rmSync(file, { force: true });
}
