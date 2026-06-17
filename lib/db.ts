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

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
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
      stripe_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      salary TEXT,
      status TEXT NOT NULL DEFAULT 'Applied',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  try {
    db.exec("ALTER TABLE payments ADD COLUMN stripe_session_id TEXT");
  } catch {
    // already present on databases created before this column existed
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

export function recordStripePayment(params: { sessionId: string; amountCents: number; email: string }): void {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM payments WHERE stripe_session_id = ?").get(params.sessionId);
  if (existing) return;
  const user = upsertUser(params.email);
  db.prepare(
    "INSERT INTO payments (user_id, amount_cents, status, stripe_session_id) VALUES (?, ?, 'paid', ?)"
  ).run(user.id, params.amountCents, params.sessionId);
}
