"use client";

import { useDarkMode } from "@/app/context/DarkModeContext";
import Confetti from "./Confetti";

export default function Results({ score, total, answers, quiz, onReset }) {
  const { dark } = useDarkMode();
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 80;
  const accent = dark ? "#ef4444" : "#059669";

  const grade =
    pct >= 90 ? { label: "Excellent!", color: "#10b981" } :
    pct >= 80 ? { label: "Great job!", color: "#10b981" } :
    pct >= 60 ? { label: "Not bad!", color: "#f59e0b" } :
    { label: "Keep studying", color: "#ef4444" };

  return (
    <div className={`min-h-screen font-patua transition-colors ${dark ? "bg-gray-950" : "bg-white"}`}>
      <Confetti active={passed} />

      <div className={`w-full h-1.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="h-full w-full rounded-full" style={{ background: accent }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-24">
        <div className={`rounded-3xl border p-8 text-center mb-10 ${dark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
          <div className="relative w-28 h-28 mx-auto mb-5">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" fill="none" stroke={dark ? "#1f2937" : "#e5e7eb"} strokeWidth="8" />
              <circle
                cx="56" cy="56" r="48"
                fill="none"
                stroke={grade.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - pct / 100)}`}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${dark ? "text-gray-50" : "text-gray-900"}`}>{pct}%</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ color: grade.color }}>{grade.label}</h2>
          <p className={`text-sm mb-6 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            You got <span className="font-bold" style={{ color: accent }}>{score}</span> out of <span className="font-bold">{total}</span> correct
          </p>

          <button
            onClick={onReset}
            className="px-8 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: accent }}
          >
            Take another quiz
          </button>
        </div>

        <h3 className={`text-lg font-bold mb-4 ${dark ? "text-gray-200" : "text-gray-800"}`}>
          Answer Review
        </h3>

        <div className="space-y-4">
          {quiz.map((q, qi) => {
            const userAnswer = answers[qi];
            const correct = userAnswer === q.answer;
            const timedOut = userAnswer === -1;

            return (
              <div
                key={qi}
                className={`rounded-2xl border-2 p-5 transition-colors ${
                  correct
                    ? dark ? "border-emerald-800 bg-emerald-950/40" : "border-emerald-200 bg-emerald-50"
                    : dark ? "border-red-900 bg-red-950/30" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: correct ? "#10b981" : "#ef4444" }}
                  >
                    {correct ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </span>
                  <p className={`text-sm font-semibold leading-snug ${dark ? "text-gray-200" : "text-gray-800"}`}>
                    {q.text}
                  </p>
                </div>

                <div className="pl-9 space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = oi === q.answer;
                    const isUserOpt = oi === userAnswer;

                    let style = {};
                    let label = null;

                    if (isCorrectOpt) {
                      style = {
                        background: dark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                        color: dark ? "#6ee7b7" : "#065f46",
                        border: "1px solid rgba(16,185,129,0.4)",
                      };
                      label = "Correct";
                    } else if (isUserOpt && !isCorrectOpt) {
                      style = {
                        background: dark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
                        color: dark ? "#fca5a5" : "#991b1b",
                        border: "1px solid rgba(239,68,68,0.35)",
                      };
                      label = timedOut ? "Timed out" : "Your answer";
                    } else {
                      style = {
                        background: "transparent",
                        color: dark ? "#6b7280" : "#9ca3af",
                        border: "1px solid transparent",
                      };
                    }

                    return (
                      <div
                        key={oi}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium"
                        style={style}
                      >
                        <span>{opt}</span>
                        {label && (
                          <span className="ml-2 shrink-0 text-xs font-semibold opacity-70">{label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}