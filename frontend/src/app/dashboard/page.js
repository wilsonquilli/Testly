"use client";

import { useState, useRef, useCallback } from "react";
import NotesInput from "@/components/ui/notesinput";
import QuizQuestion from "@/components/ui/quizquestion";
import Results from "@/components/ui/results";
import Navbar from "..//../components/ui/navbar";
import Footer from "..//../components/ui/footer";

export default function Dashboard() {
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const fileInputRef = useRef(null);

  const generateQuiz = async () => {
    if (!notes.trim() && !fileName) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    const sampleQuiz = [
      {
        text: "What is photosynthesis?",
        options: [
          "Plant energy process",
          "Animal digestion",
          "Protein synthesis",
          "Cell division",
        ],
        answer: 0,
      },
    ];
    setQuiz(sampleQuiz);
    setIsGenerating(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.type === "application/pdf" || file.type.startsWith("text/")) {
      setFileName(file.name);
      setInputMode("file");
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const selectAnswer = (index) => {
    if (index === quiz[current].answer) setScore(score + 1);
    setCurrent(current + 1);
  };

  const reset = () => {
    setQuiz(null);
    setCurrent(0);
    setScore(0);
    setNotes("");
    setFileName(null);
    setInputMode("text");
  };

  return (
    <>
      <Navbar />

      {!quiz && (
        <main className="min-h-screen bg-white font-patua">
          <div className="flex flex-col items-center text-center px-6 pt-16 pb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              Turn your notes into a{" "}
              <span className="text-emerald-600">quiz</span>
            </h1>
            <p className="text-gray-500 text-base">
              Paste text or upload a PDF — we'll handle the rest
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-6 pb-20">
            <div className="flex justify-center mb-6">
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setInputMode("text")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    inputMode === "text"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Paste notes
                </button>
                <button
                  onClick={() => setInputMode("file")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    inputMode === "file"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Upload file
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              {inputMode === "text" ? (
                <>
                  <textarea
                    className="w-full min-h-52 px-5 py-5 bg-transparent border-none outline-none resize-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed"
                    placeholder="Paste your notes, lecture slides, or any study material here…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 text-xs hover:border-gray-300 hover:text-gray-700 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                        </svg>
                        Attach PDF
                      </button>
                      {notes.length > 0 && (
                        <span className="text-xs text-gray-400">{notes.length.toLocaleString()} chars</span>
                      )}
                    </div>
                    <button
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all hover:-translate-y-px"
                      onClick={generateQuiz}
                      disabled={!notes.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                          </svg>
                          Generating…
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                          </svg>
                          Generate quiz
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`min-h-52 flex flex-col items-center justify-center gap-3 px-8 py-10 cursor-pointer rounded-xl m-1 transition-colors ${
                      isDragging ? "bg-emerald-50" : "hover:bg-gray-50"
                    }`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => !fileName && fileInputRef.current?.click()}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/>
                        <line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {isDragging ? "Drop it here" : "Drag & drop your file"}
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      PDF or TXT · up to 10 MB ·{" "}
                      <span
                        className="text-emerald-600 underline underline-offset-2 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        browse
                      </span>
                    </p>
                  </div>

                  {fileName && (
                    <div className="flex items-center gap-2 mx-4 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      <svg className="text-emerald-600 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="flex-1 truncate">{fileName}</span>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setFileName(null)}
                        aria-label="Remove file"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-end px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all hover:-translate-y-px"
                      onClick={generateQuiz}
                      disabled={!fileName || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                          </svg>
                          Generating…
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                          </svg>
                          Generate quiz
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </main>
      )}

      {quiz && current < quiz.length && (
        <QuizQuestion question={quiz[current]} select={selectAnswer} />
      )}

      {quiz && current >= quiz.length && (
        <Results score={score} total={quiz.length} onReset={reset} />
      )}

      <Footer />
    </>
  );
}