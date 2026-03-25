"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function LiveScoreBanner({ quizId, userId }) {
  const { dark } = useDarkMode();
  const accent = dark ? "#ef4444" : "#34D399";
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(null);

  useWebSocket(quizId ? `/ws/quiz/${quizId}` : null, {
    onMessage: (lastMessage) => {
      if (lastMessage?.type === "score_update" && lastMessage.userId === userId) {
        setScore(lastMessage.score);
        setFlash(lastMessage.correct ? "correct" : "wrong");
        setTimeout(() => setFlash(null), 900);
      }
    },
  });

  const flashBg = flash === "correct"
    ? "rgba(52,211,153,0.15)"
    : flash === "wrong"
    ? "rgba(239,68,68,0.15)"
    : "transparent";

  if (!quizId || !userId) return null;

  return (
    <div
      className={`rounded-2xl px-6 py-4 border flex items-center justify-between transition-colors duration-300 ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}
      style={{ background: flashBg }}
    >
      <span className={`font-patua text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Live Score</span>
      <span className="font-patua text-3xl font-bold" style={{ color: accent }}>{score}</span>
      {flash && (
        <span className={`font-patua text-sm font-semibold ${flash === "correct" ? "text-emerald-400" : "text-red-400"}`}>
          {flash === "correct" ? "+10 ✓" : "✗"}
        </span>
      )}
    </div>
  );
}