"use client";

const meetings = [
  {
    company: "Google",
    role: "Senior Software Engineer",
    date: "Wednesday, Jun 18, 2024",
    time: "10:00 AM PST",
    duration: "45 min",
    type: "Video",
    status: "Confirmed",
    interviewer: "Sarah Kim, Engineering Manager",
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    company: "Stripe",
    role: "Full Stack Developer",
    date: "Friday, Jun 20, 2024",
    time: "2:00 PM PST",
    duration: "30 min",
    type: "Phone",
    status: "Confirmed",
    interviewer: "Mike Chen, Tech Recruiter",
    link: null,
  },
  {
    company: "Anthropic",
    role: "AI Engineer",
    date: "Monday, Jun 23, 2024",
    time: "11:00 AM PST",
    duration: "60 min",
    type: "Video",
    status: "Pending",
    interviewer: "TBD",
    link: null,
  },
  {
    company: "Vercel",
    role: "Frontend Engineer",
    date: "Tuesday, Jun 24, 2024",
    time: "9:00 AM PST",
    duration: "45 min",
    type: "Video",
    status: "Pending",
    interviewer: "TBD",
    link: null,
  },
];

const prepTips = [
  { icon: "🔍", tip: "Research the company's recent news, products, and engineering blog" },
  { icon: "💻", tip: "Review common system design patterns and data structures" },
  { icon: "🎯", tip: "Prepare 3-4 STAR format stories about past accomplishments" },
  { icon: "❓", tip: "Prepare thoughtful questions to ask your interviewer" },
  { icon: "🕐", tip: "Test your video setup and internet connection 10 minutes before" },
  { icon: "📝", tip: "Have a copy of your resume and notes ready for reference" },
];

export default function Meetings() {
  const confirmed = meetings.filter((m) => m.status === "Confirmed");
  const pending = meetings.filter((m) => m.status === "Pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scheduled Interviews</h1>
        <p className="text-gray-400 text-sm mt-1">
          {confirmed.length} confirmed · {pending.length} pending confirmation
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-green-400">{confirmed.length}</div>
          <div className="text-xs text-gray-500 mt-1">Confirmed</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-yellow-400">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">Pending</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-blue-400">{meetings.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Interview Schedule</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
          <div className="space-y-6">
            {meetings.map((m, i) => (
              <div key={i} className="flex gap-6 pl-4">
                {/* Timeline dot */}
                <div className={`relative w-4 h-4 rounded-full border-2 mt-2 shrink-0 -ml-6 ${
                  m.status === "Confirmed"
                    ? "border-green-400 bg-green-400/20"
                    : "border-yellow-400 bg-yellow-400/20"
                }`} />

                {/* Card */}
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{m.role}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.status === "Confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{m.company}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      m.type === "Video"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-purple-500/20 text-purple-300"
                    }`}>
                      {m.type === "Video" ? "📹" : "📞"} {m.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Date</span>
                      <p className="text-gray-300">{m.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Time</span>
                      <p className="text-gray-300">{m.time}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Duration</span>
                      <p className="text-gray-300">{m.duration}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Interviewer</span>
                      <p className="text-gray-300 truncate">{m.interviewer}</p>
                    </div>
                  </div>

                  {m.link && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <a
                        href={m.link}
                        className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        📹 Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prep Tips */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Interview Prep Tips</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-4">
            Our AI has analyzed your upcoming interviews and prepared these tips:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prepTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                <span className="text-lg shrink-0">{tip.icon}</span>
                <p className="text-gray-300 text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
