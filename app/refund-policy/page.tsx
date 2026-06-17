import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Refund Policy — JobFinder AI" };

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund Policy" updated="June 17, 2026">
      <section>
        <h2>30-day money-back guarantee</h2>
        <p>
          If you&apos;re not happy with JobFinder AI for any reason, email us within 30 days of your payment and
          we&apos;ll refund it — no questions asked, even if your 7-day access period has already ended.
        </p>
      </section>

      <section>
        <h2>How to request one</h2>
        <p>
          Use the <a href="/contact" className="text-violet-400 hover:text-violet-300">Contact Us</a> page with
          the email address you paid with. We process refunds back to your original payment method through
          Stripe — it typically takes 5-10 business days to appear, depending on your bank.
        </p>
      </section>

      <section>
        <h2>After 30 days</h2>
        <p>
          Past the 30-day window, payments aren&apos;t refundable, since access is a flat $10 for 7 days rather
          than a recurring subscription you&apos;d need to cancel.
        </p>
      </section>
    </LegalPage>
  );
}
