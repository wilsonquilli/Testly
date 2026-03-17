"use client";

import { useState } from "react";

export default function NotesInput({ generateQuiz }) {

  const [notes, setNotes] = useState("");

  return (
    <div className="w-full max-w-3xl mx-auto">

      <textarea
        className="w-full h-40 border rounded p-4"
        placeholder="Paste your lecture notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={() => generateQuiz(notes)}
        className="mt-4 bg-black text-white px-6 py-3 rounded"
      >
        Generate Quiz
      </button>

    </div>
  );
}