"use client";

import { useState, useRef, useCallback } from "react";
import QuizQuestion from "@/components/ui/quizquestion";
import Results from "@/components/ui/results";
import QuizSkeleton from "@/components/ui/QuizSkeleton";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { useDarkMode } from "@/app/context/DarkModeContext";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "@/lib/translations";

const HISTORY_KEY = "testly_recent_uploads";
const MAX_HISTORY = 5;

function TimerModal({ onConfirm, onSkip, dark, copy }) {
  const [seconds, setSeconds] = useState(30);
  const accent = dark ? "#ef4444" : "#059669";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className={`w-full max-w-sm rounded-3xl p-7 shadow-2xl border ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className={`font-patua text-xl font-bold mb-1 ${dark ? "text-gray-50" : "text-gray-900"}`}>{copy.timerTitle}</h3>
        <p className={`font-patua text-sm mb-6 ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {copy.timerDescription}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSeconds(Math.max(5, seconds - 5))}
            className={`w-10 h-10 rounded-full border text-lg font-bold flex items-center justify-center transition-colors ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >−</button>
          <div className="flex-1 text-center">
            <span className="font-patua text-4xl font-bold" style={{ color: accent }}>{seconds}</span>
            <span className={`font-patua text-sm ml-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{copy.secondsLabel}</span>
          </div>
          <button
            onClick={() => setSeconds(Math.min(300, seconds + 5))}
            className={`w-10 h-10 rounded-full border text-lg font-bold flex items-center justify-center transition-colors ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >+</button>
        </div>

        <div className="flex gap-2 mb-7 flex-wrap">
          {[15, 30, 60, 90].map((s) => (
            <button
              key={s}
              onClick={() => setSeconds(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                seconds === s
                  ? "text-white border-transparent"
                  : dark ? "border-gray-600 text-gray-400 hover:border-gray-500" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
              style={seconds === s ? { background: accent } : {}}
            >
              {s}s
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-colors ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            {copy.noTimer}
          </button>
          <button
            onClick={() => onConfirm(seconds)}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: accent }}
          >
            {copy.startQuiz}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderDashboardTitle(language, accent) {
  if (language === "es") {
    return (
      <>
        Convierte tus notas en un <span style={{ color: accent }}>cuestionario</span>
      </>
    );
  }

  return (
    <>
      Turn your notes into a <span style={{ color: accent }}>quiz</span>
    </>
  );
}

export default function Dashboard() {
  const { dark } = useDarkMode();
  const accent = dark ? "#ef4444" : "#059669";

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { language } = useLanguage();
  const t = translations[language] ?? translations.en;
  const dashboardCopy = language === "es"
    ? {
        timerTitle: "¿Configurar un temporizador?",
        timerDescription: "Elige cuántos segundos por pregunta, o sáltalo para no usar temporizador.",
        secondsLabel: "seg",
        noTimer: "Sin temporizador",
        startQuiz: "Comenzar cuestionario",
        dropHere: "Suéltalo aquí",
        browse: "Examinar",
        recentUploads: "Cargas recientes",
        remove: "Eliminar",
      }
    : {
        timerTitle: "Set a timer?",
        timerDescription: "Choose how many seconds per question, or skip for no timer.",
        secondsLabel: "sec",
        noTimer: "No timer",
        startQuiz: "Start quiz",
        dropHere: "Drop it here",
        browse: "browse",
        recentUploads: "Recent uploads",
        remove: "Remove",
      };
  const fileInputRef = useRef(null);

  const saveToHistory = (text, name) => {
    const entry = {
      id: Date.now(),
      label: name || text.slice(0, 40) + (text.length > 40 ? "…" : ""),
      content: text,
      fileName: name || null,
      date: new Date().toLocaleDateString(),
    };
    setHistory((prev) => {
      const next = [entry, ...prev.filter((h) => h.label !== entry.label)].slice(0, MAX_HISTORY);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const loadFromHistory = (entry) => {
    setNotes(entry.content || "");
    setFileName(entry.fileName || null);
    setInputMode(entry.fileName ? "file" : "text");
  };

  const removeFromHistory = (id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleGenerateClick = () => {
    if (!notes.trim() && !fileName) return;
    setShowTimerModal(true);
  };

  const startGeneration = async (seconds) => {
    setShowTimerModal(false);
    setTimerSeconds(seconds);
    setIsGenerating(true);

    if (notes.trim()) saveToHistory(notes, null);
    else if (fileName) saveToHistory("", fileName);

    await new Promise((r) => setTimeout(r, 1800));

    const sampleQuiz = [
      { text: "What is photosynthesis?", options: ["Plant energy process", "Animal digestion", "Protein synthesis", "Cell division"], answer: 0 },
      { text: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
      { text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: 2 },
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
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const selectAnswer = (index) => {
    setAnswers((prev) => [...prev, index]);
    if (index === quiz[current].answer) setScore((s) => s + 1);
    setCurrent((c) => c + 1);
  };

  const reset = () => {
    setQuiz(null); setCurrent(0); setScore(0); setAnswers([]);
    setNotes(""); setFileName(null); setInputMode("text"); setTimerSeconds(null);
  };

  if (isGenerating) return <><Navbar /><QuizSkeleton /></>;

  if (quiz && current < quiz.length) {
    return (
      <>
        <Navbar />
        <QuizQuestion
          question={quiz[current]}
          questionIndex={current}
          total={quiz.length}
          select={selectAnswer}
          timerSeconds={timerSeconds}
        />
        <DarkModeToggle />
      </>
    );
  }

  if (quiz && current >= quiz.length) {
    return (
      <>
        <Navbar />
        <Results score={score} total={quiz.length} answers={answers} quiz={quiz} onReset={reset} />
        <DarkModeToggle />
      </>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : "bg-white"}`}>
      <Navbar />

      {showTimerModal && (
        <TimerModal
          dark={dark}
          copy={dashboardCopy}
          onConfirm={startGeneration}
          onSkip={() => startGeneration(null)}
        />
      )}

      <main className="font-patua">
        <div className="flex flex-col items-center text-center px-6 pt-16 pb-10">
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-3 ${dark ? "text-gray-50" : "text-gray-900"}`}>
            {renderDashboardTitle(language, accent)}
          </h1>
          <p className={`text-base ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t.dashboardSubHeader}
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-6 pb-24">
          {/* Mode toggle */}
          <div className="flex justify-center mb-6">
            <div className={`flex gap-1 rounded-full p-1 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
              {["text", "file"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    inputMode === mode
                      ? dark ? "bg-gray-700 text-gray-100 shadow-sm" : "bg-white text-gray-900 shadow-sm"
                      : dark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {mode === "text" ? t.dashboardButton1 : t.dashboardButton2}
                </button>
              ))}
            </div>
          </div>

          {/* Input card */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
            dark
              ? "bg-gray-900 border-gray-700 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-900"
              : "bg-white border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100"
          }`}>
            {inputMode === "text" ? (
              <>
                <textarea
                  className={`w-full min-h-52 px-5 py-5 bg-transparent border-none outline-none resize-none text-sm leading-relaxed ${
                    dark ? "text-gray-200 placeholder-gray-600" : "text-gray-800 placeholder-gray-400"
                  }`}
                  placeholder={t.dashboardTextField}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className={`flex items-center justify-between px-4 py-3 border-t ${dark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"}`}>
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                      dark ? "border-gray-600 bg-gray-700 text-gray-400 hover:text-gray-200" : "border-gray-200 bg-white text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    {t.dashboardAttachPDF}
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: accent }}
                    onClick={handleGenerateClick}
                    disabled={!notes.trim()}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    {t.dashboardGenerateQuiz}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`min-h-52 flex flex-col items-center justify-center gap-3 px-8 py-10 cursor-pointer rounded-xl m-1 transition-colors ${
                    isDragging
                      ? dark ? "bg-red-950" : "bg-emerald-50"
                      : dark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  }`}
                  onDrop={onDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => !fileName && fileInputRef.current?.click()}
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${dark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                    </svg>
                  </div>
                  <p className={`text-sm font-medium ${dark ? "text-gray-200" : "text-gray-700"}`}>
                    {isDragging ? dashboardCopy.dropHere : t.dashboardDragandDrop}
                  </p>
                  <p className={`text-xs text-center ${dark ? "text-gray-500" : "text-gray-400"}`}>
                    {t.dashboardsubDandD.replace(/\s*Examinar$|\s*browse$/i, "")}{" "}
                    <span className="underline underline-offset-2 cursor-pointer" style={{ color: accent }}
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      {dashboardCopy.browse}
                    </span>
                  </p>
                </div>

                {fileName && (
                  <div className={`flex items-center gap-2 mx-4 mb-3 px-3 py-2 border rounded-lg text-sm ${dark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                    <svg className="shrink-0" style={{ color: accent }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span className="flex-1 truncate">{fileName}</span>
                    <button className={`transition-colors ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`} onClick={() => setFileName(null)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                )}

                <div className={`flex items-center justify-end px-4 py-3 border-t ${dark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"}`}>
                  <button
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: accent }}
                    onClick={handleGenerateClick}
                    disabled={!fileName}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    {t.dashboardGenerateQuiz}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Recent uploads */}
          {history.length > 0 && (
            <div className="mt-8">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                {dashboardCopy.recentUploads}
              </p>
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border group cursor-pointer transition-all ${
                      dark ? "border-gray-800 bg-gray-900 hover:border-gray-700" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                    onClick={() => loadFromHistory(entry)}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dark ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                      {entry.fileName ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${dark ? "text-gray-300" : "text-gray-700"}`}>{entry.label}</p>
                      <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>{entry.date}</p>
                    </div>
                    <button
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${dark ? "hover:bg-gray-700 text-gray-500" : "hover:bg-gray-200 text-gray-400"}`}
                      onClick={(e) => { e.stopPropagation(); removeFromHistory(entry.id); }}
                      aria-label={dashboardCopy.remove}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      </main>

      <Footer />
      <DarkModeToggle />
    </div>
  );
}
