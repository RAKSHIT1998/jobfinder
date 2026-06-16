import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "🤖",
    title: "AI Job Scraping",
    description: "Our AI agent scrapes 12+ job boards 24/7, finding opportunities matching your exact profile.",
  },
  {
    icon: "📄",
    title: "Smart CV Builder",
    description: "Build a professional CV optimized for ATS systems and tailored to your target roles.",
  },
  {
    icon: "📅",
    title: "Auto Interview Scheduling",
    description: "AI automatically schedules interviews on your behalf, coordinating with recruiters.",
  },
  {
    icon: "🎯",
    title: "Match Scoring",
    description: "Every job gets a match score based on your skills, experience, and preferences.",
  },
  {
    icon: "🔔",
    title: "Real-time Alerts",
    description: "Get notified instantly when a high-match job is found or an interview is scheduled.",
  },
  {
    icon: "📊",
    title: "Application Tracking",
    description: "Track all your applications, interviews, and offers in one clean dashboard.",
  },
];

const steps = [
  {
    number: "01",
    title: "Build Your CV",
    description: "Fill out our smart form. Takes 5 minutes. We extract your skills, experience, and job preferences.",
  },
  {
    number: "02",
    title: "AI Finds Jobs",
    description: "Our agent searches 12+ job boards around the clock, scoring each job against your profile.",
  },
  {
    number: "03",
    title: "Get Interviews",
    description: "We auto-schedule interviews for top matches. You just show up and impress.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    avatar: "SC",
    text: "I got 3 interviews in the first week. The AI found jobs I would have never found on my own. Landed my dream role at Google!",
  },
  {
    name: "Marcus Johnson",
    role: "Full Stack Dev at Stripe",
    avatar: "MJ",
    text: "Paid the $10 on a Tuesday, had my first interview by Thursday. The match scores are incredibly accurate.",
  },
  {
    name: "Priya Patel",
    role: "Frontend Engineer at Vercel",
    avatar: "PP",
    text: "The auto-scheduling feature is mind-blowing. I didn't have to send a single cold email. Everything was handled for me.",
  },
];

export default function Home() {
  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            AI Agent is running — 47 jobs found today
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Your AI Job Hunter,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Working 24/7
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Build your CV once. Our AI agent scrapes every major job board, matches you to perfect roles,
            and schedules interviews — all while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create-cv"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-purple-500/25"
            >
              Start Finding Jobs — $10
            </Link>
            <Link
              href="#how-it-works"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">12+</div>
              <div className="text-sm text-gray-500">Job boards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-500">AI hunting</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">91%</div>
              <div className="text-sm text-gray-500">Match accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three steps to your next dream job</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 relative z-10">
                  <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg">Powerful AI features to supercharge your job search</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-lg mb-12">One price. No subscriptions. No surprises.</p>

          <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-purple-500/50 rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/20 blur-2xl" />

            <div className="relative">
              <div className="inline-block bg-purple-500/20 text-purple-300 text-sm font-medium px-3 py-1 rounded-full border border-purple-500/30 mb-6">
                Lifetime Access
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-6xl font-black text-white">$10</span>
              </div>
              <p className="text-gray-400 mb-8">One-time payment. Lifetime access.</p>

              <ul className="text-left space-y-4 mb-10">
                {[
                  "AI agent running 24/7 for life",
                  "CV builder with ATS optimization",
                  "Unlimited job searches across 12+ boards",
                  "Automatic interview scheduling",
                  "Real-time match scoring",
                  "Dashboard with all matches & meetings",
                  "Email notifications for new matches",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/create-cv"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-xl text-lg font-semibold transition-all text-center"
              >
                Get Started for $10
              </Link>
              <p className="text-gray-500 text-sm mt-4">No hidden fees. 30-day money back guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Job Seekers</h2>
            <p className="text-gray-400 text-lg">Join thousands who found their dream jobs with JobFinder AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">&quot;{t.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Let AI Find Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dream Job?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of developers who stopped manually searching and let AI do the work.
          </p>
          <Link
            href="/create-cv"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-purple-500/25"
          >
            Build Your CV — Get Started for $10
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
