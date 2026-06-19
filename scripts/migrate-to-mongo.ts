/**
 * One-time cutover script: copies all data from the Postgres database
 * (DATABASE_URL) into MongoDB (MONGODB_URI).
 *
 * Usage:
 *   DATABASE_URL=... MONGODB_URI=... npx tsx scripts/migrate-to-mongo.ts --yes
 *
 * This is NOT idempotent in the additive sense - re-running it drops and
 * recreates the 5 target collections in MongoDB before re-importing, so a
 * second run produces a correct result rather than duplicate documents.
 * Requires --yes (or MIGRATE_CONFIRM=1) so it can never run by accident.
 */
import { Pool } from "pg";
import { ObjectId } from "mongodb";
import { getDb, ensureIndexes } from "../lib/db";

interface PgUser {
  id: number;
  email: string;
  name: string | null;
  password_hash: string | null;
  created_at: string;
}

interface PgCv {
  id: number;
  user_id: number;
  data: string;
  updated_at: string;
}

interface PgPayment {
  id: number;
  user_id: number;
  amount_cents: number;
  currency: string | null;
  status: string;
  card_last4: string | null;
  payment_provider: string | null;
  payment_ref: string | null;
  created_at: string;
}

interface PgApplication {
  id: number;
  user_id: number;
  company: string;
  role: string;
  salary: string | null;
  status: string;
  interview_at: string | null;
  notes: string | null;
  created_at: string;
}

interface PgContactMessage {
  id: number;
  name: string | null;
  email: string;
  message: string;
  created_at: string;
}

async function main() {
  const confirmed = process.argv.includes("--yes") || process.env.MIGRATE_CONFIRM === "1";
  if (!confirmed) {
    console.error("Refusing to run without --yes (or MIGRATE_CONFIRM=1). This drops and rebuilds the target MongoDB collections.");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set - point it at the source Postgres database.");
    process.exit(1);
  }

  const pg = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });

  const db = await getDb();

  console.log(`Source: Postgres (${databaseUrl.split("@")[1] ?? "?"})`);
  console.log(`Target: MongoDB database "${db.databaseName}"`);

  console.log("Dropping target collections...");
  for (const name of ["users", "cvs", "payments", "applications", "contact_messages"]) {
    await db.collection(name).drop().catch(() => undefined); // ok if it doesn't exist yet
  }

  console.log("Creating indexes...");
  await ensureIndexes();

  console.log("Migrating users...");
  const { rows: pgUsers } = await pg.query<PgUser>("SELECT * FROM users ORDER BY id");
  const userIdMap = new Map<number, ObjectId>();
  if (pgUsers.length > 0) {
    const userDocs = pgUsers.map((u) => {
      const _id = new ObjectId();
      userIdMap.set(u.id, _id);
      return { _id, email: u.email, name: u.name, passwordHash: u.password_hash, createdAt: u.created_at };
    });
    await db.collection("users").insertMany(userDocs);
  }

  function mapUserId(oldUserId: number): ObjectId {
    const mapped = userIdMap.get(oldUserId);
    if (!mapped) {
      throw new Error(`No migrated user found for old user_id=${oldUserId} - source data has a dangling reference.`);
    }
    return mapped;
  }

  console.log("Migrating cvs...");
  const { rows: pgCvs } = await pg.query<PgCv>("SELECT * FROM cvs ORDER BY id");
  if (pgCvs.length > 0) {
    await db.collection("cvs").insertMany(
      pgCvs.map((c) => ({ _id: new ObjectId(), userId: mapUserId(c.user_id), data: c.data, updatedAt: c.updated_at }))
    );
  }

  console.log("Migrating payments...");
  const { rows: pgPayments } = await pg.query<PgPayment>("SELECT * FROM payments ORDER BY id");
  if (pgPayments.length > 0) {
    await db.collection("payments").insertMany(
      pgPayments.map((p) => ({
        _id: new ObjectId(),
        userId: mapUserId(p.user_id),
        amountCents: p.amount_cents,
        currency: p.currency,
        status: p.status,
        cardLast4: p.card_last4,
        paymentProvider: p.payment_provider,
        paymentRef: p.payment_ref,
        createdAt: p.created_at,
      }))
    );
  }

  console.log("Migrating applications...");
  const { rows: pgApplications } = await pg.query<PgApplication>("SELECT * FROM applications ORDER BY id");
  if (pgApplications.length > 0) {
    await db.collection("applications").insertMany(
      pgApplications.map((a) => ({
        _id: new ObjectId(),
        userId: mapUserId(a.user_id),
        company: a.company,
        role: a.role,
        salary: a.salary,
        status: a.status,
        interviewAt: a.interview_at,
        notes: a.notes,
        createdAt: a.created_at,
      }))
    );
  }

  console.log("Migrating contact_messages...");
  const { rows: pgContactMessages } = await pg.query<PgContactMessage>("SELECT * FROM contact_messages ORDER BY id");
  if (pgContactMessages.length > 0) {
    await db.collection("contact_messages").insertMany(
      pgContactMessages.map((m) => ({ _id: new ObjectId(), name: m.name, email: m.email, message: m.message, createdAt: m.created_at }))
    );
  }

  console.log("\nVerifying row counts...");
  const checks: Array<{ name: string; pgCount: number; mongoCollection: string }> = [
    { name: "users", pgCount: pgUsers.length, mongoCollection: "users" },
    { name: "cvs", pgCount: pgCvs.length, mongoCollection: "cvs" },
    { name: "payments", pgCount: pgPayments.length, mongoCollection: "payments" },
    { name: "applications", pgCount: pgApplications.length, mongoCollection: "applications" },
    { name: "contact_messages", pgCount: pgContactMessages.length, mongoCollection: "contact_messages" },
  ];

  let allMatch = true;
  for (const check of checks) {
    const mongoCount = await db.collection(check.mongoCollection).countDocuments();
    const match = mongoCount === check.pgCount;
    if (!match) allMatch = false;
    console.log(`  ${check.name}: postgres=${check.pgCount} mongo=${mongoCount} ${match ? "OK" : "MISMATCH"}`);
  }

  console.log("\nVerifying referential integrity (orphaned userId references)...");
  for (const collection of ["cvs", "payments", "applications"]) {
    const orphans = await db
      .collection(collection)
      .aggregate([
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { $match: { user: { $size: 0 } } },
        { $count: "count" },
      ])
      .toArray();
    const orphanCount = orphans[0]?.count ?? 0;
    if (orphanCount > 0) allMatch = false;
    console.log(`  ${collection}: ${orphanCount} orphaned document(s)`);
  }

  await pg.end();

  if (!allMatch) {
    console.error("\nMigration finished with mismatches - see above. Investigate before cutting over.");
    process.exit(1);
  }

  console.log("\nMigration complete - all counts match and no orphaned references found.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
