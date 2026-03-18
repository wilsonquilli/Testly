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

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 bg-white">
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left font-patua text-lg text-gray-900 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span
          className="ml-4 text-2xl transition-transform duration-300"
          style={{ color: "#34D399", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-4 font-patua text-gray-500 text-base border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
}

const stepImages = [Jerry_Upload, Jerry_Generation, Jerry_Study, Jerry_Ace];
const stepAlts = [
  "Jerry holding a PDF",
  "Jerry generating",
  "Jerry studying",
  "Jerry acing exam",
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const typingSequence = t.heroTyping.flatMap((text) => [text, 1500]);

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">
      <div className="flex justify-center mt-6 px-4">
        <Navbar />
      </div>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 font-patua text-sm px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          {t.heroBadge}
        </div>

        <h1 className="font-patua text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-950 leading-tight mb-4">
          {t.heroTitle1}{" "}
          <span style={{ color: "#34D399" }}>{t.heroTitleHighlight}</span>
          <br />
          {t.heroTitle2}
        </h1>

        <div className="font-patua text-2xl sm:text-3xl text-gray-700 mb-4 min-h-[2.5rem]">
          <TypeAnimation
            key={language} 
            sequence={typingSequence}
            wrapper="span"
            speed={55}
            repeat={Infinity}
          />
        </div>

        <p className="font-patua text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="font-patua bg-gray-950 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            {t.uploadBtn}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="font-patua border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
          >
            {t.createQuizBtn}
          </button>
        </div>
      </section>

      <section className="py-6 bg-gray-50 border-y border-gray-100">
        <p className="font-patua text-center text-sm text-gray-400 uppercase tracking-widest mb-6">
          {t.carouselLabel}
        </p>
        <Carousel />
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="font-patua text-4xl sm:text-5xl font-bold text-gray-950 mb-3">
            {t.featuresTitle}
          </h2>
          <p className="font-patua text-gray-500 text-lg max-w-xl mx-auto">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.steps.map(({ step, desc }, i) => (
            <div
              key={step}
              className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-5 flex items-center justify-center h-36">
                <Image src={stepImages[i]} alt={stepAlts[i]} width={120} height={120} className="object-contain" />
              </div>
              <h3 className="font-patua text-xl font-bold text-gray-900 mb-2">{step}</h3>
              <p className="font-patua text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-100 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="font-patua text-4xl sm:text-5xl font-bold text-gray-950 mb-3">
            {t.comparisonTitle}
          </h2>
          <p className="font-patua text-gray-500 text-lg">
            {t.comparisonSubtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center text-center shadow-sm opacity-70">
            <div className="mb-5 h-36 flex items-center justify-center">
              <Image src={Without_Jerry} alt="No Testly" width={110} height={110} className="object-contain grayscale" />
            </div>
            <span className="font-patua text-xs tracking-widest text-gray-400 uppercase mb-3">{t.oldMethodLabel}</span>
            <h3 className="font-patua text-2xl font-bold text-gray-700 mb-3">{t.oldMethodTitle}</h3>
            <p className="font-patua text-gray-400 text-sm leading-relaxed">{t.oldMethodDesc}</p>
          </div>

          <div
            className="border-2 rounded-3xl p-10 flex flex-col items-center text-center shadow-lg relative"
            style={{ borderColor: "#34D399", background: "linear-gradient(135deg, #f0fdf4 0%, #fff 60%)" }}
          >
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 font-patua text-xs font-bold tracking-widest px-4 py-1 rounded-full text-white"
              style={{ background: "#34D399" }}
            >
              {t.newMethodLabel}
            </div>
            <div className="mb-5 h-36 flex items-center justify-center">
              <Image src={With_Jerry} alt="With Testly" width={120} height={120} className="object-contain" />
            </div>
            <h3 className="font-patua text-2xl font-bold text-gray-950 mb-3">{t.newMethodTitle}</h3>
            <p className="font-patua text-gray-600 text-sm leading-relaxed">{t.newMethodDesc}</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="font-patua text-4xl sm:text-5xl font-bold text-gray-950 mb-3">
            {t.pricingTitle}
          </h2>
          <p className="font-patua text-gray-500 text-lg">{t.pricingSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col shadow-sm">
            <h3 className="font-patua text-xl font-bold text-gray-900 mb-1">{t.free}</h3>
            <p className="font-patua text-4xl font-bold text-gray-950 mb-6">{t.freePrice}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {t.freeFeatures.map((item) => (
                <li key={item} className="font-patua text-gray-600 flex items-center gap-2 text-sm">
                  <span style={{ color: "#34D399" }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setOpen(true)}
              className="font-patua w-full border-2 border-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors"
            >
              {t.freeBtn}
            </button>
          </div>

          <div
            className="rounded-3xl p-8 flex flex-col shadow-xl relative border-2"
            style={{ borderColor: "#34D399", background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%)" }}
          >
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 font-patua text-xs font-bold tracking-widest px-4 py-1 rounded-full text-white"
              style={{ background: "#34D399" }}
            >
              {t.popular}
            </div>
            <h3 className="font-patua text-xl font-bold mb-1" style={{ color: "#34D399" }}>
              {t.jerryPlan}
            </h3>
            <div className="mb-1">
              <span className="font-patua text-4xl font-bold text-gray-950">{t.jerryPrice}</span>
              <span className="font-patua text-gray-500 text-sm"> {t.jerryPer}</span>
            </div>
            <p className="font-patua text-xs text-emerald-500 mb-6">{t.jerryTagline}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {t.jerryFeatures.map((item) => (
                <li key={item} className="font-patua text-gray-700 flex items-center gap-2 text-sm">
                  <span style={{ color: "#34D399" }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setOpen(true)}
              className="font-patua w-full py-3 rounded-full font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ background: "#34D399" }}
            >
              {t.jerryBtn}
            </button>
          </div>
        </div>

        <p className="font-patua text-center mt-8 text-sm text-gray-400">
          {t.pricingQuestion}{" "}
          <button className="underline hover:text-emerald-500 transition-colors" style={{ color: "#34D399" }}>
            {t.contactUs}
          </button>
        </p>
      </section>

      <section id="faq" className="bg-gray-50 border-t border-gray-100 py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="flex flex-col justify-start lg:pt-2">
            <Image
              src={Jerry_Study}
              alt="Still have questions?"
              width={120}
              height={120}
              className="mb-5 object-contain"
            />
            <h3 className="font-patua text-2xl font-bold text-gray-900 mb-2">{t.faqSideTitle}</h3>
            <p className="font-patua text-gray-500 text-sm leading-relaxed mb-5">{t.faqSideDesc}</p>
            <button className="font-patua inline-flex items-center gap-2 bg-gray-950 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors w-fit">
              {t.contactSupport}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-patua text-3xl sm:text-4xl font-bold text-gray-950 mb-6">
              {t.faqTitle}
            </h2>
            {t.faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <LoginModal open={open} setOpen={setOpen} />
    </main>
  );
}