/**
 * One-time helper: seeds a test account directly into MongoDB so you can log
 * in at /login without going through the CV builder or a real Cashfree
 * payment. Grants a fresh 7-day access window via a synthetic "paid" record.
 *
 * Usage: MONGODB_URI=... npx tsx scripts/seed-test-user.ts
 * Re-running is safe - upsertUser/recordPayment are both idempotent on email.
 */
import { upsertUser, setUserPassword, recordPayment } from "../lib/db";
import { hashPassword } from "../lib/auth";

const EMAIL = process.env.SEED_EMAIL || "rakshitbargotra@gmail.com";
const PASSWORD = process.env.SEED_PASSWORD || "JobFinder#2026";
const NAME = process.env.SEED_NAME || "Rakshit";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set - point it at your MongoDB Atlas cluster.");
    process.exit(1);
  }

  const user = await upsertUser(EMAIL, NAME);
  await setUserPassword(user.id, hashPassword(PASSWORD));
  await recordPayment({
    amountCents: 999,
    currency: "USD",
    email: EMAIL,
    provider: "manual-test",
    referenceId: `seed-${user.id}`,
  });

  console.log("Test account ready:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
  console.log(`  userId:   ${user.id}`);
  console.log("Log in at /login - this account has a fresh 7-day access window, so it lands straight in /dashboard.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
