"use client";

import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";
import LoginModal from "../components/ui/loginmodal";
import Navbar from "../components/ui/navbar";
import Carousel from "../components/ui/carousel";
import Jerry_Ace from "../images/Ace.png";
import Jerry_Generation from "../images/Jerry_Generation.png";
import Jerry_Study from "../images/Jerry_Study.png";
import Jerry_Upload from "../images/Jerry_Upload.png";
import With_Jerry from "../images/With_Jerry.png";
import Without_Jerry from "../images/No_Jerry.png";
import Footer from "../components/ui/footer";
import { useLanguage } from "./context/LanguageContext";
import { translations } from "@/lib/translations";
import { useDarkMode } from "./context/DarkModeContext";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const { dark } = useDarkMode();
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${dark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
      <button
        className={`w-full flex items-center justify-between px-6 py-5 text-left font-patua text-lg transition-colors ${
          dark ? "text-gray-100 hover:bg-gray-800" : "text-gray-900 hover:bg-gray-50"
        }`}
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span
          className="ml-4 text-2xl transition-transform duration-300"
          style={{ color: dark ? "#ef4444" : "#34D399", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >+</span>
      </button>
      {open && (
        <div className={`px-6 pb-5 pt-4 font-patua text-base border-t ${dark ? "text-gray-400 border-gray-700" : "text-gray-500 border-gray-100"}`}>
          {a}
        </div>
      )}
    </div>
  );
}

const stepImages = [Jerry_Upload, Jerry_Generation, Jerry_Study, Jerry_Ace];
const stepAlts = ["Jerry holding a PDF", "Jerry generating", "Jerry studying", "Jerry acing exam"];

export default function Home() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const { dark } = useDarkMode();
  const t = translations[language];
  const typingSequence = t.heroTyping.flatMap((text) => [text, 1500]);
  const accent = dark ? "#ef4444" : "#34D399";

  return (
    <main className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-gray-950" : "bg-white"}`}>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-1 { animation: heroFadeUp 0.65s ease both; animation-delay: 0ms; }
        .hero-fade-2 { animation: heroFadeUp 0.65s ease both; animation-delay: 120ms; }
        .hero-fade-3 { animation: heroFadeUp 0.65s ease both; animation-delay: 240ms; }
        .hero-fade-4 { animation: heroFadeUp 0.65s ease both; animation-delay: 360ms; }
        .hero-fade-5 { animation: heroFadeUp 0.65s ease both; animation-delay: 480ms; }
      `}</style>

      <div className="flex justify-center mt-6 px-4">
        <Navbar />
      </div>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="hero-fade-1 inline-flex items-center gap-2 font-patua text-sm px-4 py-2 rounded-full mb-8 border"
          style={{
            background: dark ? "rgba(239,68,68,0.08)" : "#f0fdf4",
            borderColor: dark ? "rgba(239,68,68,0.3)" : "#a7f3d0",
            color: accent,
          }}
        >
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: accent }} />
          {t.heroBadge}
        </div>

        <h1 className={`hero-fade-2 font-patua text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-4 ${dark ? "text-gray-50" : "text-gray-950"}`}>
          {t.heroTitle1}{" "}
          <span style={{ color: accent }}>{t.heroTitleHighlight}</span>
          <br />{t.heroTitle2}
        </h1>

        <div className={`hero-fade-3 font-patua text-2xl sm:text-3xl mb-4 min-h-[2.5rem] ${dark ? "text-gray-300" : "text-gray-700"}`}>
          <TypeAnimation key={language} sequence={typingSequence} wrapper="span" speed={55} repeat={Infinity} />
        </div>

        <p className={`hero-fade-4 font-patua text-lg mb-10 max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {t.heroSubtitle}
        </p>

        <div className="hero-fade-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => setOpen(true)}
            className={`font-patua px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-colors ${
              dark ? "bg-gray-100 text-gray-900 hover:bg-white" : "bg-gray-950 text-white hover:bg-gray-800"
            }`}>
            {t.uploadBtn}
          </button>
          <button onClick={() => setOpen(true)}
            className={`font-patua border-2 px-8 py-4 rounded-full text-lg font-semibold transition-colors ${
              dark ? "border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400"
                   : "border-gray-200 text-gray-900 hover:border-emerald-400 hover:text-emerald-600"
            }`}>
            {t.createQuizBtn}
          </button>
        </div>
      </section>

      <section className={`py-6 border-y transition-colors ${dark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
        <p className={`font-patua text-center text-sm uppercase tracking-widest mb-6 ${dark ? "text-gray-500" : "text-gray-400"}`}>
          {t.carouselLabel}
        </p>
        <Carousel />
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <Reveal className="text-center mb-14">
          <h2 className={`font-patua text-4xl sm:text-5xl font-bold mb-3 ${dark ? "text-gray-50" : "text-gray-950"}`}>
            {t.featuresTitle}
          </h2>
          <p className={`font-patua text-lg max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t.featuresSubtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.steps.map(({ step, desc }, i) => (
            <Reveal key={step} delay={i * 80}>
              <div className={`border rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
                dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
              }`}>
                <div className="mb-5 flex items-center justify-center h-36">
                  <Image src={stepImages[i]} alt={stepAlts[i]} width={120} height={120} className="object-contain" />
                </div>
                <h3 className={`font-patua text-xl font-bold mb-2 ${dark ? "text-gray-100" : "text-gray-900"}`}>{step}</h3>
                <p className={`font-patua text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`border-y py-24 px-6 transition-colors ${dark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
        <Reveal className="max-w-4xl mx-auto text-center mb-14">
          <h2 className={`font-patua text-4xl sm:text-5xl font-bold mb-3 ${dark ? "text-gray-50" : "text-gray-950"}`}>
            {t.comparisonTitle}
          </h2>
          <p className={`font-patua text-lg ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.comparisonSubtitle}</p>
        </Reveal>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal delay={0}>
            <div className={`border rounded-3xl p-10 flex flex-col items-center text-center shadow-sm opacity-70 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="mb-5 h-36 flex items-center justify-center">
                <Image src={Without_Jerry} alt="No Testly" width={110} height={110} className="object-contain grayscale" />
              </div>
              <span className={`font-patua text-xs tracking-widest uppercase mb-3 ${dark ? "text-gray-500" : "text-gray-400"}`}>{t.oldMethodLabel}</span>
              <h3 className={`font-patua text-2xl font-bold mb-3 ${dark ? "text-gray-300" : "text-gray-700"}`}>{t.oldMethodTitle}</h3>
              <p className={`font-patua text-sm leading-relaxed ${dark ? "text-gray-500" : "text-gray-400"}`}>{t.oldMethodDesc}</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="border-2 rounded-3xl p-10 flex flex-col items-center text-center shadow-lg relative"
              style={{
                borderColor: accent,
                background: dark ? "linear-gradient(135deg,rgba(239,68,68,0.08) 0%,#111827 60%)" : "linear-gradient(135deg,#f0fdf4 0%,#fff 60%)",
              }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-patua text-xs font-bold tracking-widest px-4 py-1 rounded-full text-white" style={{ background: accent }}>
                {t.newMethodLabel}
              </div>
              <div className="mb-5 h-36 flex items-center justify-center">
                <Image src={With_Jerry} alt="With Testly" width={120} height={120} className="object-contain" />
              </div>
              <h3 className={`font-patua text-2xl font-bold mb-3 ${dark ? "text-gray-50" : "text-gray-950"}`}>{t.newMethodTitle}</h3>
              <p className={`font-patua text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-600"}`}>{t.newMethodDesc}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <Reveal className="text-center mb-14">
          <h2 className={`font-patua text-4xl sm:text-5xl font-bold mb-3 ${dark ? "text-gray-50" : "text-gray-950"}`}>
            {t.pricingTitle}
          </h2>
          <p className={`font-patua text-lg ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.pricingSubtitle}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Reveal delay={0}>
            <div className={`border rounded-3xl p-8 flex flex-col shadow-sm h-full ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <h3 className={`font-patua text-xl font-bold mb-1 ${dark ? "text-gray-100" : "text-gray-900"}`}>{t.free}</h3>
              <p className={`font-patua text-4xl font-bold mb-6 ${dark ? "text-gray-50" : "text-gray-950"}`}>{t.freePrice}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {t.freeFeatures.map((item) => (
                  <li key={item} className={`font-patua flex items-center gap-2 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                    <span style={{ color: accent }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setOpen(true)}
                className={`font-patua w-full border-2 py-3 rounded-full font-semibold transition-colors ${
                  dark ? "border-gray-600 text-gray-200 hover:border-gray-400" : "border-gray-200 text-gray-800 hover:border-gray-400"
                }`}>
                {t.freeBtn}
              </button>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-3xl p-8 flex flex-col shadow-xl relative border-2 h-full"
              style={{
                borderColor: accent,
                background: dark ? "linear-gradient(135deg,rgba(239,68,68,0.08) 0%,#111827 60%)" : "linear-gradient(135deg,#f0fdf4 0%,#ffffff 60%)",
              }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-patua text-xs font-bold tracking-widest px-4 py-1 rounded-full text-white" style={{ background: accent }}>
                {t.popular}
              </div>
              <h3 className="font-patua text-xl font-bold mb-1" style={{ color: accent }}>{t.jerryPlan}</h3>
              <div className="mb-1">
                <span className={`font-patua text-4xl font-bold ${dark ? "text-gray-50" : "text-gray-950"}`}>{t.jerryPrice}</span>
                <span className={`font-patua text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}> {t.jerryPer}</span>
              </div>
              <p className="font-patua text-xs mb-6" style={{ color: accent }}>{t.jerryTagline}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {t.jerryFeatures.map((item) => (
                  <li key={item} className={`font-patua flex items-center gap-2 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
                    <span style={{ color: accent }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setOpen(true)}
                className="font-patua w-full py-3 rounded-full font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
                style={{ background: accent }}>
                {t.jerryBtn}
              </button>
            </div>
          </Reveal>
        </div>

        <p className={`font-patua text-center mt-8 text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>
          {t.pricingQuestion}{" "}
          <button className="underline hover:opacity-80 transition-opacity" style={{ color: accent }}>{t.contactUs}</button>
        </p>
      </section>

      <section id="faq" className={`border-t py-24 px-6 transition-colors ${dark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <Reveal>
            <div className="flex flex-col justify-start lg:pt-2">
              <Image src={Jerry_Study} alt="Still have questions?" width={120} height={120} className="mb-5 object-contain" />
              <h3 className={`font-patua text-2xl font-bold mb-2 ${dark ? "text-gray-100" : "text-gray-900"}`}>{t.faqSideTitle}</h3>
              <p className={`font-patua text-sm leading-relaxed mb-5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.faqSideDesc}</p>
              <button className={`font-patua inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors w-fit ${
                dark ? "bg-gray-100 text-gray-900 hover:bg-white" : "bg-gray-950 text-white hover:bg-gray-800"
              }`}>{t.contactSupport}</button>
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-2 space-y-3">
            <h2 className={`font-patua text-3xl sm:text-4xl font-bold mb-6 ${dark ? "text-gray-50" : "text-gray-950"}`}>
              {t.faqTitle}
            </h2>
            {t.faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </Reveal>
        </div>
      </section>
      <Footer />
      <LoginModal open={open} setOpen={setOpen} />
      <DarkModeToggle />
    </main>
  );
}