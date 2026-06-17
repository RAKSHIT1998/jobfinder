import { Cashfree, CFEnvironment } from "cashfree-pg";

let cashfreeClient: Cashfree | undefined;

function getEnvironment(): CFEnvironment {
  return process.env.CASHFREE_ENV === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
}

export function getCashfree(): Cashfree {
  if (!cashfreeClient) {
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      throw new Error("Cashfree is not configured");
    }

    cashfreeClient = new Cashfree(getEnvironment(), appId, secretKey);
  }

  return cashfreeClient;
}

export function createCashfreeOrderId(): string {
  return `jobfinder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
