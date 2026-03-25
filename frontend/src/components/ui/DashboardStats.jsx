"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function DashboardStats({ userId }) {
  const { dark } = useDarkMode();
  const accent = dark ? "#ef4444" : "#34D399";

  const [stats, setStats] = useState({
    quizzesCreated: 0,
    flashcardsCreated: 0,
    filesUploaded: 0,
    invitesSent: 0,
  });
  useWebSocket(userId ? `/ws/dashboard/${userId}` : null, {
    onMessage: (lastMessage) => {
      if (lastMessage?.type === "snapshot" || lastMessage?.type === "update") {
        setStats((prev) => ({ ...prev, ...lastMessage }));
      }
    },
  });

  const cards = [
    { label: "Quizzes Created", value: stats.quizzesCreated, icon: "📄" },
    { label: "Flashcards Created", value: stats.flashcardsCreated, icon: "🗂️" },
    { label: "Files Uploaded", value: stats.filesUploaded, icon: "📤" },
    { label: "Invites Sent", value: stats.invitesSent, icon: "✉️" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(({ label, value, icon }) => (
        <div key={label}
          className={`border rounded-2xl p-5 flex flex-col items-center text-center transition-all ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}
        >
          <span className="text-2xl mb-2">{icon}</span>
          <span className="font-patua text-2xl font-bold" style={{ color: accent }}>{value}</span>
          <span className={`font-patua text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}