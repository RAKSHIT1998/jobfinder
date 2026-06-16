"use client";

import { useState, useEffect } from "react";

const sites = ["LinkedIn", "Indeed", "Glassdoor", "Remote.co", "AngelList", "Wellfound"];

export default function AgentStatus() {
  const [currentSite, setCurrentSite] = useState(0);
  const [jobsFound, setJobsFound] = useState(47);

  useEffect(() => {
    const siteInterval = setInterval(() => {
      setCurrentSite((prev) => (prev + 1) % sites.length);
    }, 2000);

    const jobInterval = setInterval(() => {
      setJobsFound((prev) => prev + Math.floor(Math.random() * 3));
    }, 8000);

    return () => {
      clearInterval(siteInterval);
      clearInterval(jobInterval);
    };
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75"></div>
        </div>
        <span className="text-white font-semibold">AI Agent Active</span>
        <span className="ml-auto text-xs text-gray-500">Last scan: 2 mins ago</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Currently scanning</span>
          <span className="text-purple-400 font-medium transition-all duration-500">{sites[currentSite]}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Jobs found today</span>
          <span className="text-green-400 font-bold">{jobsFound}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Sites monitored</span>
          <span className="text-blue-400 font-medium">12 platforms</span>
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Active platforms</div>
          <div className="flex flex-wrap gap-2">
            {["LinkedIn", "Indeed", "Glassdoor", "Remote.co"].map((site) => (
              <span
                key={site}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                  sites[currentSite] === site
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {site}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
