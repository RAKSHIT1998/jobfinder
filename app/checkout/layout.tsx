import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getAccessStatus } from "@/lib/db";

// A referred friend lands here straight out of the CV builder already holding
// 3 bonus days from the invite they signed up with - paying again would be a
// broken (and money-losing-for-them) experience. Anyone who already has active
// access, whether from a real payment or referral bonus days, skips straight
// to the dashboard instead of seeing a payment form.
export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (userId) {
    const { paid } = await getAccessStatus(userId);
    if (paid) redirect("/dashboard");
  }

  return <>{children}</>;
}
