"use client";

import { useState } from "react";

const categories = ["Behavioral", "Technical", "Salary Negotiation", "Culture Fit"];

const questions: Record<string, { q: string; answer: string }[]> = {
  Behavioral: [
    { q: "Tell me about a time you faced a major technical challenge.", answer: "Use the STAR method: describe a complex bug or architectural decision. Example: 'At [Company], our monolith was struggling under load. I led a team of 3 to extract the payment service into a microservice, reducing p99 latency by 65% and enabling the team to deploy independently.' Focus on your impact and what you learned." },
    { q: "Describe how you handle disagreements with teammates.", answer: "Show maturity and communication skills. Example: 'I start by understanding their perspective fully — I ask clarifying questions. Then I present data and trade-offs rather than opinions. If we still disagree, I propose a time-boxed experiment or escalate to the team lead with both perspectives documented.'" },
    { q: "Tell me about a project you're most proud of.", answer: "Pick something with clear impact. Quantify results: users, performance, revenue. Structure: context → your specific contribution → measurable outcome → what you learned. Avoid team efforts where your role was unclear." },
  ],
  Technical: [
    { q: "Design a URL shortener like bit.ly.", answer: "Cover: API design (POST /shorten, GET /{code}), storage (SQL for metadata, Redis for caching), encoding (base62 for 6-char codes → 56B combinations), scaling (read-heavy so CDN + cache), analytics (async writes to avoid hot path). Discuss CAP theorem trade-offs and mention 301 vs 302 redirects for caching." },
    { q: "Explain the difference between SQL and NoSQL databases.", answer: "SQL: ACID transactions, relational structure, great for complex queries, scales vertically. NoSQL: flexible schema, horizontal scaling, eventual consistency models. Use SQL for financial data, NoSQL for user activity feeds, sessions, documents. Mention specific examples: PostgreSQL vs MongoDB vs Cassandra vs Redis — each optimized for different access patterns." },
    { q: "How would you optimize a slow API endpoint?", answer: "Systematic approach: 1) Profile first (don't guess) — find the bottleneck via APM/logs. 2) DB queries — add indexes, avoid N+1 with eager loading, use EXPLAIN ANALYZE. 3) Caching — Redis for expensive computations, CDN for static responses. 4) Async processing — move heavy work to queues. 5) Database connection pooling. Always measure before and after." },
  ],
  "Salary Negotiation": [
    { q: "What are your salary expectations?", answer: "Deflect if early stage: 'I'm focused on fit first — can you share the budgeted range?' If pushed, give a range anchored 15-20% above your target: 'Based on my research and experience, I'm targeting $X-Y, but I'm flexible depending on the full comp package.' Never be the first to give a number if you can avoid it." },
    { q: "The offer is lower than expected. How do you negotiate?", answer: "Stay positive and collaborative: 'I'm really excited about this role. Based on my research on Glassdoor and levels.fyi, and considering my [X years / specific skills], I was expecting something closer to $Y. Is there flexibility?' Then be quiet. Always negotiate on total comp — base, equity, bonus, PTO, remote policy all have value." },
  ],
  "Culture Fit": [
    { q: "Why do you want to work here?", answer: "Research specific things: recent product launches, engineering blog posts, team structure. Example: 'I've been following your work on [specific feature/technology]. The way your team handled [problem] showed [value]. I want to work somewhere that [aligns with your genuine goal].'" },
    { q: "Where do you see yourself in 5 years?", answer: "Show ambition without threatening the interviewer. For an IC role: 'I want to grow into a senior engineer who has deep expertise in [domain] and can lead technical direction for complex projects.' For a manager track: adjust accordingly. Always tie it back to how you'll contribute to the company's goals." },
  ],
};

const mockConvo = [
  { role: "ai", text: "Hi! I'm your AI interview coach. I've analyzed your upcoming interviews at Google, Stripe, and Anthropic. Ready to practice? Pick a category above or ask me anything." },
];

export default function AICoach() {
  const [category, setCategory] = useState("Behavioral");
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState(mockConvo);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const aiResponse = {
      role: "ai",
      text: `Great question! For "${input}", here's what I'd recommend: Focus on being specific and quantifiable. Use the STAR method — Situation, Task, Action, Result. Mention the specific impact you had and what you learned. Companies like Google and Anthropic value both technical depth and communication clarity. Would you like me to practice this with you?`,
    };
    setMessages((p) => [...p, userMsg, aiResponse]);
    setInput("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">AI Interview Coach</h1>
        <p className="text-white/40 text-sm mt-1">Personalized prep based on your upcoming interviews at Google, Stripe, and Anthropic.</p>
      </div>

      {/* Mode toggle */}
      <div className="glass rounded-2xl p-1.5 inline-flex gap-1">
        <button
          onClick={() => setChatMode(false)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!chatMode ? "bg-violet-500/25 text-violet-200 border border-violet-500/30" : "text-white/40 hover:text-white/70"}`}
        >
          Practice Questions
        </button>
        <button
          onClick={() => setChatMode(true)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${chatMode ? "bg-violet-500/25 text-violet-200 border border-violet-500/30" : "text-white/40 hover:text-white/70"}`}
        >
          Chat with Coach
        </button>
      </div>

      {!chatMode ? (
        <div className="space-y-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setActiveQ(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  category === c
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-200"
                    : "glass text-white/50 hover:text-white/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {questions[category]?.map((item, i) => (
              <div key={i} className="glass glass-hover rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left p-5 flex items-start justify-between gap-4"
                  onClick={() => setActiveQ(activeQ === i ? null : i)}
                >
                  <p className="text-white font-semibold text-sm">{item.q}</p>
                  <span className={`text-white/40 text-lg shrink-0 transition-transform ${activeQ === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {activeQ === i && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-violet-300 text-xs font-semibold">AI Coach Recommendation</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-violet-500/25 border border-violet-500/30 text-white"
                    : "glass text-white/70"
                }`}>
                  {m.role === "ai" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-cyan-400" />
                      <span className="text-violet-300 text-xs font-semibold">AI Coach</span>
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 flex gap-3">
            <input
              className="input-glass flex-1"
              placeholder="Ask the AI coach anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
