import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __jobfinderPool: Pool | undefined;
}

function init(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set - point it at your Postgres instance.");
  }

  return new Pool({
    connectionString,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });
}

export function getPool(): Pool {
  if (!global.__jobfinderPool) {
    global.__jobfinderPool = init();
  }
  return global.__jobfinderPool;
}

let schemaReady: Promise<void> | null = null;

/** Creates tables on first use. Memoized, so repeated calls after the first are free. */
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cvs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount_cents INTEGER NOT NULL,
        currency TEXT,
        status TEXT NOT NULL,
        card_last4 TEXT,
        payment_provider TEXT,
        payment_ref TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        salary TEXT,
        status TEXT NOT NULL DEFAULT 'Applied',
        interview_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `).then(() => undefined);
  }
  return schemaReady;
}

/** Runs a parameterized query and returns its rows. Use $1, $2... placeholders. */
export async function query<T extends object = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query(sql, params);
  return result.rows as T[];
}

/** "YYYY-MM-DD HH:MM:SS" in UTC - matches the format the app's date-parsing code already expects everywhere. */
export function nowStamp(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export interface UserRow {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export async function upsertUser(email: string, name?: string): Promise<UserRow> {
  const [existing] = await query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
  if (existing) {
    if (name && name !== existing.name) {
      await query("UPDATE users SET name = $1 WHERE id = $2", [name, existing.id]);
      return { ...existing, name };
    }
    return existing;
  }
  const [created] = await query<UserRow>(
    "INSERT INTO users (email, name, created_at) VALUES ($1, $2, $3) RETURNING *",
    [email, name ?? null, nowStamp()]
  );
  return created;
}

export async function recordPayment(params: {
  amountCents: number;
  currency: string;
  email: string;
  provider: string;
  referenceId: string;
}): Promise<void> {
  const [existing] = await query(
    "SELECT id FROM payments WHERE payment_provider = $1 AND payment_ref = $2",
    [params.provider, params.referenceId]
  );
  if (existing) return;
  const user = await upsertUser(params.email);
  await query(
    "INSERT INTO payments (user_id, amount_cents, currency, status, payment_provider, payment_ref, created_at) VALUES ($1, $2, $3, 'paid', $4, $5, $6)",
    [user.id, params.amountCents, params.currency, params.provider, params.referenceId, nowStamp()]
  );
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
export async function getPaidPayments(): Promise<PaymentRow[]> {
  return query<PaymentRow>("SELECT * FROM payments WHERE status = 'paid'");
}

export interface UserWithAuth extends UserRow {
  password_hash: string | null;
}

export async function getUserByEmail(email: string): Promise<UserWithAuth | undefined> {
  const [row] = await query<UserWithAuth>("SELECT * FROM users WHERE email = $1", [email]);
  return row;
}

export async function getUserById(id: number): Promise<UserRow | undefined> {
  const [row] = await query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return row;
}

export async function setUserPassword(userId: number, passwordHash: string): Promise<void> {
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
}

export async function deleteUserAccount(userId: number): Promise<void> {
  await query("DELETE FROM users WHERE id = $1", [userId]);
}

export async function getLatestPayment(userId: number): Promise<{ created_at: string } | undefined> {
  const [row] = await query<{ created_at: string }>(
    "SELECT created_at FROM payments WHERE user_id = $1 AND status = 'paid' ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  return row;
}

export async function getCv(userId: number): Promise<string | undefined> {
  const [row] = await query<{ data: string }>("SELECT data FROM cvs WHERE user_id = $1", [userId]);
  return row?.data;
}
