import Database from "better-sqlite3";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __jobfinderDb: Database.Database | undefined;
}

function init(): Database.Database {
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      card_last4 TEXT,
      payment_provider TEXT,
      payment_ref TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      salary TEXT,
      status TEXT NOT NULL DEFAULT 'Applied',
      interview_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  for (const migration of [
    "ALTER TABLE payments ADD COLUMN payment_provider TEXT",
    "ALTER TABLE payments ADD COLUMN payment_ref TEXT",
    "ALTER TABLE payments ADD COLUMN currency TEXT",
    "ALTER TABLE applications ADD COLUMN interview_at TEXT",
    "ALTER TABLE applications ADD COLUMN notes TEXT",
    "ALTER TABLE users ADD COLUMN password_hash TEXT",
  ]) {
    try {
      db.exec(migration);
    } catch {
      // already present on databases created before this column existed
    }
  }

  return db;
}

export function getDb(): Database.Database {
  if (!global.__jobfinderDb) {
    global.__jobfinderDb = init();
  }
  return global.__jobfinderDb;
}

export interface UserRow {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export function upsertUser(email: string, name?: string): UserRow {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  if (existing) {
    if (name && name !== existing.name) {
      db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, existing.id);
      return { ...existing, name };
    }
    return existing;
  }
  const info = db.prepare("INSERT INTO users (email, name) VALUES (?, ?)").run(email, name ?? null);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as UserRow;
}

export function recordPayment(params: {
  amountCents: number;
  currency: string;
  email: string;
  provider: string;
  referenceId: string;
}): void {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM payments WHERE payment_provider = ? AND payment_ref = ?")
    .get(params.provider, params.referenceId);
  if (existing) return;
  const user = upsertUser(params.email);
  db.prepare(
    "INSERT INTO payments (user_id, amount_cents, currency, status, payment_provider, payment_ref) VALUES (?, ?, ?, 'paid', ?, ?)"
  ).run(user.id, params.amountCents, params.currency, params.provider, params.referenceId);
}

export interface PaymentRow {
  id: number;
  amount_cents: number;
  currency: string | null;
  status: string;
  card_last4: string | null;
  payment_provider: string | null;
  created_at: string;
}

/** Every paid payment, for revenue reporting — currency is null on rows recorded before multi-currency support, which were always INR. */
export function getPaidPayments(): PaymentRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM payments WHERE status = 'paid'").all() as PaymentRow[];
}

export interface UserWithAuth extends UserRow {
  password_hash: string | null;
}

export function getUserByEmail(email: string): UserWithAuth | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserWithAuth | undefined;
}

export function getUserById(id: number): UserRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function setUserPassword(userId: number, passwordHash: string): void {
  const db = getDb();
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, userId);
}

export function deleteUserAccount(userId: number): void {
  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
}

export function getLatestPayment(userId: number): { created_at: string } | undefined {
  const db = getDb();
  return db
    .prepare("SELECT created_at FROM payments WHERE user_id = ? AND status = 'paid' ORDER BY created_at DESC LIMIT 1")
    .get(userId) as { created_at: string } | undefined;
}

export function getCv(userId: number): string | undefined {
  const db = getDb();
  const row = db.prepare("SELECT data FROM cvs WHERE user_id = ?").get(userId) as { data: string } | undefined;
  return row?.data;
}
