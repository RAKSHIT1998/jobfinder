import dns from "dns";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { ACCESS_DURATION_MS } from "./access";

declare global {
  // eslint-disable-next-line no-var
  var __jobfinderMongoConnect: Promise<MongoClient> | undefined;
}

const DB_NAME = "jobfinder";

// Some local resolvers (VPN/ISP proxies) can't answer the DNS SRV queries that
// `mongodb+srv://` needs, failing with ECONNREFUSED even though the system
// resolver works fine. Falling back to public resolvers fixes that without
// requiring an OS-level DNS change.
dns.setServers([...dns.getServers(), "8.8.8.8", "1.1.1.1"]);

/** Network blips on `mongodb+srv://` DNS resolution are transient - a couple of
 * short retries here keeps a single bad lookup from failing the whole request. */
async function init(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set - point it at your MongoDB Atlas cluster.");
  }
  const attempts = [0, 500, 1500];
  let lastErr: unknown;
  for (const delayMs of attempts) {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      return await new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export function getClient(): Promise<MongoClient> {
  if (!global.__jobfinderMongoConnect) {
    global.__jobfinderMongoConnect = init().catch((err) => {
      global.__jobfinderMongoConnect = undefined;
      throw err;
    });
  }
  return global.__jobfinderMongoConnect;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}

let indexesReady: Promise<void> | null = null;

/** Creates indexes on first use. Memoized, so repeated calls after the first are free. */
export function ensureIndexes(): Promise<void> {
  if (!indexesReady) {
    indexesReady = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection("users").createIndex({ email: 1 }, { unique: true }),
        db.collection("cvs").createIndex({ userId: 1 }, { unique: true }),
        db.collection("payments").createIndex(
          { paymentProvider: 1, paymentRef: 1 },
          { unique: true, partialFilterExpression: { paymentProvider: { $type: "string" }, paymentRef: { $type: "string" } } }
        ),
        db.collection("payments").createIndex({ userId: 1 }),
        db.collection("applications").createIndex({ userId: 1 }),
      ]);
    })();
  }
  return indexesReady;
}

interface UserDoc {
  _id: ObjectId;
  email: string;
  name: string | null;
  passwordHash: string | null;
  createdAt: string;
}

interface CvDoc {
  _id: ObjectId;
  userId: ObjectId;
  data: string;
  updatedAt: string;
}

interface PaymentDoc {
  _id: ObjectId;
  userId: ObjectId;
  amountCents: number;
  currency: string | null;
  status: string;
  cardLast4: string | null;
  paymentProvider: string | null;
  paymentRef: string | null;
  createdAt: string;
}

interface ApplicationDoc {
  _id: ObjectId;
  userId: ObjectId;
  company: string;
  role: string;
  salary: string | null;
  status: string;
  interviewAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface ContactMessageDoc {
  _id: ObjectId;
  name: string | null;
  email: string;
  message: string;
  createdAt: string;
}

async function usersCollection(): Promise<Collection<UserDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<UserDoc>("users");
}

async function cvsCollection(): Promise<Collection<CvDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<CvDoc>("cvs");
}

async function paymentsCollection(): Promise<Collection<PaymentDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<PaymentDoc>("payments");
}

async function applicationsCollection(): Promise<Collection<ApplicationDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<ApplicationDoc>("applications");
}

async function contactMessagesCollection(): Promise<Collection<ContactMessageDoc>> {
  await ensureIndexes();
  return (await getDb()).collection<ContactMessageDoc>("contact_messages");
}

/** "YYYY-MM-DD HH:MM:SS" in UTC - matches the format the app's date-parsing code already expects everywhere. */
export function nowStamp(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

// Public row shapes mirror the original Postgres column names (snake_case) so
// every existing consumer keeps working unchanged except for `id` becoming a string.

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface UserWithAuth extends UserRow {
  password_hash: string | null;
}

export interface PaymentRow {
  id: string;
  amount_cents: number;
  currency: string | null;
  status: string;
  card_last4: string | null;
  payment_provider: string | null;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  salary: string | null;
  status: string;
  interview_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string | null;
  email: string;
  message: string;
  created_at: string;
}

function toUserRow(doc: UserDoc): UserRow {
  return { id: doc._id.toString(), email: doc.email, name: doc.name, created_at: doc.createdAt };
}

function toUserWithAuth(doc: UserDoc): UserWithAuth {
  return { ...toUserRow(doc), password_hash: doc.passwordHash };
}

function toPaymentRow(doc: PaymentDoc): PaymentRow {
  return {
    id: doc._id.toString(),
    amount_cents: doc.amountCents,
    currency: doc.currency,
    status: doc.status,
    card_last4: doc.cardLast4,
    payment_provider: doc.paymentProvider,
    created_at: doc.createdAt,
  };
}

function toApplicationRow(doc: ApplicationDoc): ApplicationRow {
  return {
    id: doc._id.toString(),
    company: doc.company,
    role: doc.role,
    salary: doc.salary,
    status: doc.status,
    interview_at: doc.interviewAt,
    notes: doc.notes,
    created_at: doc.createdAt,
  };
}

function toContactMessageRow(doc: ContactMessageDoc): ContactMessageRow {
  return { id: doc._id.toString(), name: doc.name, email: doc.email, message: doc.message, created_at: doc.createdAt };
}

export async function upsertUser(email: string, name?: string): Promise<UserRow> {
  const users = await usersCollection();
  const existing = await users.findOne({ email });
  if (existing) {
    if (name && name !== existing.name) {
      await users.updateOne({ _id: existing._id }, { $set: { name } });
      return { ...toUserRow(existing), name };
    }
    return toUserRow(existing);
  }
  const doc: UserDoc = { _id: new ObjectId(), email, name: name ?? null, passwordHash: null, createdAt: nowStamp() };
  await users.insertOne(doc);
  return toUserRow(doc);
}

export async function getUserByEmail(email: string): Promise<UserWithAuth | undefined> {
  const users = await usersCollection();
  const doc = await users.findOne({ email });
  return doc ? toUserWithAuth(doc) : undefined;
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  if (!isValidObjectId(id)) return undefined;
  const users = await usersCollection();
  const doc = await users.findOne({ _id: new ObjectId(id) });
  return doc ? toUserRow(doc) : undefined;
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<void> {
  const users = await usersCollection();
  await users.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordHash } });
}

export async function deleteUserAccount(userId: string): Promise<void> {
  if (!isValidObjectId(userId)) return;
  const _id = new ObjectId(userId);
  const client = await getClient();
  const db = client.db(DB_NAME);
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection("cvs").deleteOne({ userId: _id }, { session });
      await db.collection("payments").deleteMany({ userId: _id }, { session });
      await db.collection("applications").deleteMany({ userId: _id }, { session });
      await db.collection("users").deleteOne({ _id }, { session });
    });
  } finally {
    await session.endSession();
  }
}

export async function getLatestPayment(userId: string): Promise<{ created_at: string } | undefined> {
  if (!isValidObjectId(userId)) return undefined;
  const payments = await paymentsCollection();
  const doc = await payments.findOne(
    { userId: new ObjectId(userId), status: "paid" },
    { sort: { createdAt: -1 } }
  );
  return doc ? { created_at: doc.createdAt } : undefined;
}

/** Server-side source of truth for paywall access - never trust a client-supplied paid flag. */
export async function getAccessStatus(userId: string): Promise<{ paid: boolean; paidAt: Date | null }> {
  const payment = await getLatestPayment(userId);
  if (!payment) return { paid: false, paidAt: null };
  const paidAt = new Date(payment.created_at.replace(" ", "T") + "Z");
  return { paid: Date.now() - paidAt.getTime() < ACCESS_DURATION_MS, paidAt };
}

export async function getLatestPaymentByEmail(email: string): Promise<PaymentRow | undefined> {
  const user = await getUserByEmail(email);
  if (!user) return undefined;
  const payments = await paymentsCollection();
  const doc = await payments.findOne(
    { userId: new ObjectId(user.id), status: "paid" },
    { sort: { createdAt: -1 } }
  );
  return doc ? toPaymentRow(doc) : undefined;
}

export async function getCv(userId: string): Promise<string | undefined> {
  if (!isValidObjectId(userId)) return undefined;
  const cvs = await cvsCollection();
  const doc = await cvs.findOne({ userId: new ObjectId(userId) });
  return doc?.data;
}

export async function getCvDataByEmail(email: string): Promise<string | undefined> {
  const user = await getUserByEmail(email);
  if (!user) return undefined;
  return getCv(user.id);
}

export async function upsertCv(userId: string, dataJson: string): Promise<void> {
  const cvs = await cvsCollection();
  await cvs.updateOne(
    { userId: new ObjectId(userId) },
    { $set: { data: dataJson, updatedAt: nowStamp() } },
    { upsert: true }
  );
}

export async function recordPayment(params: {
  amountCents: number;
  currency: string;
  email: string;
  provider: string;
  referenceId: string;
}): Promise<void> {
  const payments = await paymentsCollection();
  const existing = await payments.findOne({ paymentProvider: params.provider, paymentRef: params.referenceId });
  if (existing) return;
  const user = await upsertUser(params.email);
  await payments.insertOne({
    _id: new ObjectId(),
    userId: new ObjectId(user.id),
    amountCents: params.amountCents,
    currency: params.currency,
    status: "paid",
    cardLast4: null,
    paymentProvider: params.provider,
    paymentRef: params.referenceId,
    createdAt: nowStamp(),
  });
}

/** Every paid payment, for revenue reporting - currency is null on rows recorded before multi-currency support, which were always INR. */
export async function getPaidPayments(): Promise<PaymentRow[]> {
  const payments = await paymentsCollection();
  const docs = await payments.find({ status: "paid" }).toArray();
  return docs.map(toPaymentRow);
}

export async function getPaymentsByUserId(userId: string): Promise<PaymentRow[]> {
  if (!isValidObjectId(userId)) return [];
  const payments = await paymentsCollection();
  const docs = await payments.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
  return docs.map(toPaymentRow);
}

export async function getApplicationsByEmail(email: string): Promise<ApplicationRow[]> {
  const user = await getUserByEmail(email);
  if (!user) return [];
  return getApplicationsByUserId(user.id);
}

export async function getApplicationsByUserId(userId: string): Promise<ApplicationRow[]> {
  if (!isValidObjectId(userId)) return [];
  const applications = await applicationsCollection();
  const docs = await applications.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
  return docs.map(toApplicationRow);
}

export async function createApplication(params: {
  userId: string;
  company: string;
  role: string;
  salary?: string | null;
  status?: string;
}): Promise<{ id: string }> {
  const applications = await applicationsCollection();
  const doc: ApplicationDoc = {
    _id: new ObjectId(),
    userId: new ObjectId(params.userId),
    company: params.company,
    role: params.role,
    salary: params.salary ?? null,
    status: params.status ?? "Applied",
    interviewAt: null,
    notes: null,
    createdAt: nowStamp(),
  };
  await applications.insertOne(doc);
  return { id: doc._id.toString() };
}

export async function updateApplication(
  id: string,
  patch: { status?: string; interviewAt?: string | null; notes?: string | null }
): Promise<void> {
  if (!isValidObjectId(id)) return;
  const set: Record<string, unknown> = {};
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.interviewAt !== undefined) set.interviewAt = patch.interviewAt;
  if (patch.notes !== undefined) set.notes = patch.notes;
  if (Object.keys(set).length === 0) return;
  const applications = await applicationsCollection();
  await applications.updateOne({ _id: new ObjectId(id) }, { $set: set });
}

export async function createContactMessage(params: { name?: string | null; email: string; message: string }): Promise<void> {
  const contactMessages = await contactMessagesCollection();
  await contactMessages.insertOne({
    _id: new ObjectId(),
    name: params.name ?? null,
    email: params.email,
    message: params.message,
    createdAt: nowStamp(),
  });
}

export async function getContactMessages(): Promise<ContactMessageRow[]> {
  const contactMessages = await contactMessagesCollection();
  const docs = await contactMessages.find().sort({ createdAt: -1 }).toArray();
  return docs.map(toContactMessageRow);
}

export interface AdminStats {
  totalUsers: number;
  totalCvs: number;
  totalPayments: number;
  totalApplications: number;
  revenueCents: number;
  recentUsers: UserRow[];
}

export async function getAdminStats(recentLimit: number): Promise<AdminStats> {
  const db = await getDb();
  await ensureIndexes();
  const [totalUsers, totalCvs, totalApplications, totalPayments, revenue, recentDocs] = await Promise.all([
    db.collection<UserDoc>("users").countDocuments(),
    db.collection<CvDoc>("cvs").countDocuments(),
    db.collection<ApplicationDoc>("applications").countDocuments(),
    db.collection<PaymentDoc>("payments").countDocuments({ status: "paid" }),
    db
      .collection<PaymentDoc>("payments")
      .aggregate<{ total: number }>([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amountCents" } } }])
      .toArray(),
    db.collection<UserDoc>("users").find().sort({ createdAt: -1 }).limit(recentLimit).toArray(),
  ]);
  return {
    totalUsers,
    totalCvs,
    totalApplications,
    totalPayments,
    revenueCents: revenue[0]?.total ?? 0,
    recentUsers: recentDocs.map(toUserRow),
  };
}

export interface AdminUserListRow extends UserRow {
  has_cv: boolean;
  paid_count: number;
  application_count: number;
}

export async function getAdminUserList(): Promise<AdminUserListRow[]> {
  const db = await getDb();
  await ensureIndexes();
  const users = await db.collection<UserDoc>("users").find().sort({ createdAt: -1 }).toArray();
  const userIds = users.map((u) => u._id);

  const [cvUserIds, paidCounts, applicationCounts] = await Promise.all([
    db.collection<CvDoc>("cvs").find({ userId: { $in: userIds } }).map((d) => d.userId.toString()).toArray(),
    db
      .collection<PaymentDoc>("payments")
      .aggregate<{ _id: ObjectId; count: number }>([
        { $match: { userId: { $in: userIds }, status: "paid" } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection<ApplicationDoc>("applications")
      .aggregate<{ _id: ObjectId; count: number }>([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const cvUserIdSet = new Set(cvUserIds);
  const paidCountMap = new Map(paidCounts.map((p) => [p._id.toString(), p.count]));
  const applicationCountMap = new Map(applicationCounts.map((a) => [a._id.toString(), a.count]));

  return users.map((u) => {
    const id = u._id.toString();
    return {
      ...toUserRow(u),
      has_cv: cvUserIdSet.has(id),
      paid_count: paidCountMap.get(id) ?? 0,
      application_count: applicationCountMap.get(id) ?? 0,
    };
  });
}

export interface AdminUserDetail {
  user: UserRow;
  cv: string | null;
  payments: PaymentRow[];
  applications: ApplicationRow[];
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | undefined> {
  if (!isValidObjectId(userId)) return undefined;
  const user = await getUserById(userId);
  if (!user) return undefined;
  const [cv, payments, applications] = await Promise.all([
    getCv(userId),
    getPaymentsByUserId(userId),
    getApplicationsByUserId(userId),
  ]);
  return { user, cv: cv ?? null, payments, applications };
}
