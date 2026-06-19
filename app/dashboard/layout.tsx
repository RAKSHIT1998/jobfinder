import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getAccessStatus } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { paid, paidAt } = await getAccessStatus(userId);
  if (!paid) redirect(paidAt ? "/checkout?expired=1" : "/checkout");

  return <DashboardShell>{children}</DashboardShell>;
}
