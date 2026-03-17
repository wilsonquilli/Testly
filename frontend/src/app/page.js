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

const faqs = [
  {
    q: "How does the AI work?",
    a: "We use advanced language models to analyze your study material and extract key concepts as questions, answers, and flashcards. It's like having a private tutor who reads your notes in seconds.",
  },
  {
    q: "What file types are accepted?",
    a: "Testly supports PDFs, plain text, and direct text paste. Support for images and handwritten notes is coming soon.",
  },
  {
    q: "Can I share my quizzes with friends?",
    a: "Sharing is on our roadmap! For now, you can export your quizzes and send them manually.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your uploaded content is processed securely and never shared with third parties.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from your account settings. No questions asked.",
  },
  {
    q: "How accurate are the generated quizzes?",
    a: "Our AI is trained to produce high-quality, relevant questions. You can always edit or regenerate any question that doesn't meet your standards.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: "#fff" }}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left font-patua text-lg text-gray-900 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span
          className="ml-4 flex-shrink-0 text-2xl transition-transform duration-300"
          style={{
            color: "#34D399",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 font-patua text-gray-500 text-base leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">
      <div className="flex justify-center mt-6 px-4">
        <Navbar />
      </div>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 font-patua text-sm px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          The FREE AI study assistant for every student
        </div>

        <h1 className="font-patua text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-950 leading-tight mb-4">
          Testly — Your{" "}
          <span style={{ color: "#34D399" }}>AI Study</span>
          <br />
          Assistant
        </h1>

        <div className="font-patua text-2xl sm:text-3xl text-gray-700 mb-4 min-h-[2.5rem]">
          <TypeAnimation
            sequence={[
              "Turn Your Notes Into Multiple Choice Quizzes",
              1500,
              "Turn Your Notes Into Flashcards",
              1500,
              "Study Smarter, Not Harder",
              1500,
            ]}
            wrapper="span"
            speed={55}
            repeat={Infinity}
          />
        </div>

        <p className="font-patua text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Simplify your study sessions with AI-powered quizzes and flashcards.
          Upload. Generate. Ace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="font-patua bg-gray-950 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            📄 Upload My Notes
          </button>
          <button
            onClick={() => setOpen(true)}
            className="font-patua border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
          >
            ＋ Create a Quiz
          </button>
        </div>
      </section>

      <section className="py-6 bg-gray-50 border-y border-gray-100">
        <p className="font-patua text-center text-sm text-gray-400 uppercase tracking-widest mb-6">
          Designed for All Students &amp; Majors
        </p>
        <Carousel />
      </section>

          <section id="features" className="max-w-6xl mx-auto px-6 py-24">        <div className="text-center mb-14">
          <h2 className="font-patua text-4xl sm:text-5xl font-bold text-gray-950 mb-3">
            From PDFs to Mastering Your Subjects
          </h2>
          <p className="font-patua text-gray-500 text-lg max-w-xl mx-auto">
            A simple 4-step process to maximize your retention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              img: Jerry_Upload,
              alt: "Jerry holding a PDF",
              step: "1. Upload or Paste",
              desc: "Upload your PDF, notes, or paste text directly.",
            },
            {
              img: Jerry_Generation,
              alt: "Jerry generating",
              step: "2. Generation",
              desc: "Our AI generates personalized quizzes and flashcards instantly.",
            },
            {
              img: Jerry_Study,
              alt: "Jerry studying",
              step: "3. Study",
              desc: "Answer quizzes and review flashcards to reinforce your learning.",
            },
            {
              img: Jerry_Ace,
              alt: "Jerry acing exam",
              step: "4. Ace Those Exams",
              desc: "Walk into every exam fully prepared, thanks to Testly.",
            },
          ].map(({ img, alt, step, desc }) => (
            <div
              key={step}
              className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-5 flex items-center justify-center h-36">
                <Image src={img} alt={alt} width={120} height={120} className="object-contain" />
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
            Stop rereading your notes
          </h2>
          <p className="font-patua text-gray-500 text-lg">
            Don't spend all day summarizing a course when Testly can do it in seconds.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center text-center shadow-sm opacity-70">
            <div className="mb-5 h-36 flex items-center justify-center">
              <Image src={Without_Jerry} alt="No Testly" width={110} height={110} className="object-contain grayscale" />
            </div>
            <span className="font-patua text-xs tracking-widest text-gray-400 uppercase mb-3">The Old Method</span>
            <h3 className="font-patua text-2xl font-bold text-gray-700 mb-3">3 hours of preparation</h3>
            <p className="font-patua text-gray-400 text-sm leading-relaxed">
              Spending all evening summarizing your course. You're exhausted before you even start learning.
            </p>
          </div>

          <div
            className="border-2 rounded-3xl p-10 flex flex-col items-center text-center shadow-lg relative"
            style={{ borderColor: "#34D399", background: "linear-gradient(135deg, #f0fdf4 0%, #fff 60%)" }}
          >
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 font-patua text-xs font-bold tracking-widest px-4 py-1 rounded-full text-white"
              style={{ background: "#34D399" }}
            >
              THE TESTLY METHOD
            </div>
            <div className="mb-5 h-36 flex items-center justify-center">
              <Image src={With_Jerry} alt="With Testly" width={120} height={120} className="object-contain" />
            </div>
            <h3 className="font-patua text-2xl font-bold text-gray-950 mb-3">Ready in 5 seconds</h3>
            <p className="font-patua text-gray-600 text-sm leading-relaxed">
              AI generates everything instantly. You spend 100% of your time actually learning the material.
            </p>
          </div>
        </div>
      </section>

          <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">        <div className="text-center mb-14">
          <h2 className="font-patua text-4xl sm:text-5xl font-bold text-gray-950 mb-3">
            Pricing for Your Student Budget
          </h2>
          <p className="font-patua text-gray-500 text-lg">Start for free, upgrade when you're ready.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col shadow-sm">
            <h3 className="font-patua text-xl font-bold text-gray-900 mb-1">Free</h3>
            <p className="font-patua text-4xl font-bold text-gray-950 mb-6">$0</p>
            <ul className="space-y-3 mb-8 flex-1">
              {["10 Quizzes / month", "20 Flashcards / month", "10 File Uploads / month"].map((item) => (
                <li key={item} className="font-patua text-gray-600 flex items-center gap-2 text-sm">
                  <span style={{ color: "#34D399" }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setOpen(true)}
              className="font-patua w-full border-2 border-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors"
            >
              Get Started Free
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
              POPULAR
            </div>
            <h3 className="font-patua text-xl font-bold mb-1" style={{ color: "#34D399" }}>
              Jerry Plan
            </h3>
            <div className="mb-1">
              <span className="font-patua text-4xl font-bold text-gray-950">$3.99</span>
              <span className="font-patua text-gray-500 text-sm"> / month</span>
            </div>
            <p className="font-patua text-xs text-emerald-500 mb-6">Best value for serious students</p>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Unlimited Quizzes",
                "Unlimited Flashcards",
                "Unlimited File Uploads",
                "Priority AI generation",
              ].map((item) => (
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
              ✦ Go Jerry Plan
            </button>
          </div>
        </div>

        <p className="font-patua text-center mt-8 text-sm text-gray-400">
          Questions?{" "}
          <button
            className="underline hover:text-emerald-500 transition-colors"
            style={{ color: "#34D399" }}
          >
            Contact Us
          </button>
        </p>
      </section>

          <section id="faq" className="bg-gray-50 border-t border-gray-100 py-24 px-6">        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="flex flex-col justify-start lg:pt-2">
            <Image
              src={Jerry_Study}
              alt="Still have questions?"
              width={120}
              height={120}
              className="mb-5 object-contain"
            />
            <h3 className="font-patua text-2xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="font-patua text-gray-500 text-sm leading-relaxed mb-5">
              We're here to help. Send us a message and we'll reply faster than your professor.
            </p>
            <button className="font-patua inline-flex items-center gap-2 bg-gray-950 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors w-fit">
              ✉ Contact Support
            </button>
          </div>

          {/* FAQ list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-patua text-3xl sm:text-4xl font-bold text-gray-950 mb-6">
              Frequently Asked Questions
            </h2>
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <p className="font-patua text-gray-400 text-sm">
          © {new Date().getFullYear()} Testly. Built for students, by students.
        </p>
      </footer>

      <LoginModal open={open} setOpen={setOpen} />
    </main>
  );
}