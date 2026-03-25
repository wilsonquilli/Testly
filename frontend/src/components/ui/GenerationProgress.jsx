"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function GenerationProgress({ sessionId, onDone }) {
  const { dark } = useDarkMode();
  const accent = dark ? "#ef4444" : "#34D399";
  const [state, setState] = useState({ label: "Starting…", pct: 0, status: "reading" });
  useWebSocket(sessionId ? `/ws/generation/${sessionId}` : null, {
    onMessage: (lastMessage) => {
      if (lastMessage?.type !== "progress") return;
      setState({ label: lastMessage.label, pct: lastMessage.pct, status: lastMessage.status });
      if (lastMessage.status === "done") onDone?.();
    },
  });

  return (
    <div className={`rounded-2xl p-6 border ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`font-patua text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>
          {state.label}
        </span>
        <span className="font-patua text-sm font-bold" style={{ color: accent }}>
          {state.pct}%
        </span>
      </div>

      <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${state.pct}%`, background: accent }}
        />
      </div>

      <div className="flex justify-between mt-4">
        {["reading","analyzing","generating","refining","done"].map((s) => (
          <span
            key={s}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              background: ["reading","analyzing","generating","refining","done"]
                .indexOf(s) <= ["reading","analyzing","generating","refining","done"].indexOf(state.status)
                ? accent
                : dark ? "#374151" : "#e5e7eb"
            }}
          />
        ))}
      </div>
    </div>
  );
}