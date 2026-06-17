import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy - JobFinder AI" };

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 17, 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          When you build a CV with us, we collect what you enter into the form: your name, email, phone,
          location, work history, education, skills, and target role. When you pay for access, our payment
          processor (Cashfree) handles your card details directly - we never see or store your full card
          number, only the payment confirmation. If you use the Application Tracker or Interview Prep, we
          store the companies, roles, statuses, and interview details you add.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          Your CV data is used to rank live job postings against your skills, run the Skills Gap and Salary
          Intelligence analysis, and - if you use those features - generate cover letters and interview
          questions tailored to you. We don&apos;t sell your data, and we don&apos;t share it with job boards or
          employers without you choosing to apply.
        </p>
      </section>

      <section>
        <h2>Third parties we send data to</h2>
        <p>
          <strong>Cashfree</strong> processes payments. <strong>Anthropic (Claude API)</strong> receives your CV
          content and the job details you provide only when you use the Cover Letter Generator or AI
          Interview Coach, in order to generate that content. We query public job board APIs (Arbeitnow, The
          Muse, RemoteOK, Jobicy) to fetch live postings - clicking &quot;View Listing&quot; or &quot;Apply&quot; sends
          you to their site directly; we don&apos;t share your CV with them.
        </p>
      </section>

      <section>
        <h2>Where it&apos;s stored</h2>
        <p>
          Your data lives in our database on the server we operate. We don&apos;t use third-party analytics or
          advertising trackers. The only cookie we set is a session cookie for the admin console, which only
          our team can access.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can request a copy of your data or ask us to delete your account and everything tied to it at
          any time - see Contact Us. We&apos;ll act on deletion requests promptly.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>This service is intended for users 18 and older.</p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>If this policy changes, we&apos;ll update the date at the top of this page.</p>
      </section>
    </LegalPage>
  );
}
