"use client";

import { useEffect, useState, useRef } from "react";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function QuizQuestion({ question, questionIndex, total, select, timerSeconds }) {
  const { dark } = useDarkMode();
  const accent = dark ? "#ef4444" : "#059669";
  const accentLight = dark ? "rgba(239,68,68,0.1)" : "rgba(5,150,105,0.08)";

  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timerSeconds || null);
  const intervalRef = useRef(null);
  const hasAnswered = selected !== null;

  useEffect(() => {
    setSelected(null);
    setTimeLeft(timerSeconds || null);
  }, [questionIndex, timerSeconds]);

  useEffect(() => {
    if (!timerSeconds || hasAnswered) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setTimeout(() => select(-1), 400);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [questionIndex, timerSeconds, hasAnswered]);

  const handleSelect = (index) => {
    if (hasAnswered) return;
    clearInterval(intervalRef.current);
    setSelected(index);
    setTimeout(() => select(index), 700);
  };

  const progress = ((questionIndex) / total) * 100;
  const timerPct = timerSeconds ? (timeLeft / timerSeconds) * 100 : 100;
  const timerColor = timerPct > 50 ? accent : timerPct > 25 ? "#f59e0b" : "#ef4444";

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className={`min-h-screen transition-colors ${dark ? "bg-gray-950" : "bg-white"}`}>
      <div className={`w-full h-1.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: accent }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-20 font-patua">
        <div className="flex items-center justify-between mb-8">
          <span className={`text-sm font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Question <span style={{ color: accent }}>{questionIndex + 1}</span> of {total}
          </span>

          {timerSeconds && (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="13" fill="none" stroke={dark ? "#374151" : "#e5e7eb"} strokeWidth="3" />
                  <circle
                    cx="16" cy="16" r="13"
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 13}`}
                    strokeDashoffset={`${2 * Math.PI * 13 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: timerColor }}
                >
                  {timeLeft}
                </span>
              </div>
            </div>
          )}
        </div>

        <h2 className={`text-2xl md:text-3xl font-bold leading-snug mb-10 ${dark ? "text-gray-50" : "text-gray-900"}`}>
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt, index) => {
            const isSelected = selected === index;
            const isCorrect = index === question.answer;
            const showResult = hasAnswered;

            let borderColor = dark ? "#374151" : "#e5e7eb";
            let bgColor = dark ? "#111827" : "#ffffff";
            let textColor = dark ? "#d1d5db" : "#374151";
            let labelBg = dark ? "#1f2937" : "#f9fafb";

            if (showResult) {
              if (isCorrect) {
                borderColor = "#10b981";
                bgColor = dark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)";
                textColor = dark ? "#6ee7b7" : "#065f46";
                labelBg = "rgba(16,185,129,0.15)";
              } else if (isSelected && !isCorrect) {
                borderColor = "#ef4444";
                bgColor = dark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)";
                textColor = dark ? "#fca5a5" : "#991b1b";
                labelBg = "rgba(239,68,68,0.15)";
              }
            } else if (isSelected) {
              borderColor = accent;
              bgColor = accentLight;
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={hasAnswered}
                className="w-full rounded-2xl border-2 p-4 flex items-center gap-4 text-left transition-all duration-200 hover:scale-[1.01] disabled:cursor-default disabled:hover:scale-100"
                style={{ borderColor, background: bgColor }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                  style={{ background: labelBg, color: textColor }}
                >
                  {showResult && isCorrect ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : showResult && isSelected && !isCorrect ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    optionLabels[index]
                  )}
                </span>
                <span className="text-sm font-medium" style={{ color: textColor }}>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}