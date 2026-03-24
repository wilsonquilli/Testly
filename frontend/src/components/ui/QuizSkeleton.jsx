"use client";

import { useDarkMode } from "@/app/context/DarkModeContext";

function Bone({ className }) {
  const { dark } = useDarkMode();
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: dark ? "#2a2a2a" : "#e5e7eb" }}
    />
  );
}

export default function QuizSkeleton() {
  const { dark } = useDarkMode();

  return (
    <div className={`min-h-screen font-patua transition-colors ${dark ? "bg-gray-950" : "bg-white"}`}>
      <div className={`w-full h-1.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: dark ? "#374151" : "#d1fae5" }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <div className="flex justify-between items-center mb-8">
          <Bone className="h-4 w-24" />
          <Bone className="h-4 w-16" />
        </div>

        <div className="mb-10 space-y-3">
          <Bone className="h-7 w-full" />
          <Bone className="h-7 w-4/5" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-full rounded-2xl border p-4 flex items-center gap-4 animate-pulse ${
                dark ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-gray-50"
              }`}
            >
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{ background: dark ? "#2a2a2a" : "#e5e7eb" }}
              />
              <Bone className={`h-4 ${i % 2 === 0 ? "w-2/3" : "w-1/2"}`} />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Bone className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}