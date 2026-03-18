"use client";
import Image from "next/image";
import { useState } from "react";
import LoginModal from "./loginmodal";
import Jerry_Logo from "../../images/Logo.png";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import Link from "next/link";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { language } = useLanguage();
  const t = translations[language];

  const navHrefs = ["/dashboard", "/#features", "/#pricing", "/#faq"];
  return (
    <>
      <nav className="w-full max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between bg-white border border-gray-200 px-5 py-2.5 rounded-full shadow-sm">

         <Link href="/">
          <Image
            src = {Jerry_Logo}
            alt = "Testly Logo"
            height = {36}
            className = "h-9 w-auto cursor-pointer"
          />
        </Link>

          <ul className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {t.navLinks.map((label, i) => (
              <li key={label}>
                <Link
                  href={navHrefs[i]}
                  className="font-patua text-sm text-gray-600 px-4 py-2 rounded-full transition-colors hover:text-emerald-500 hover:shadow-[0_0_8px_#10B981] cursor-pointer"
                >
                {label}
              </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="hidden md:block font-patua text-sm text-gray-600 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              {t.logIn}
            </button>

            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {menuOpen ? (
                  <path d="M2 2l14 14M16 2L2 16" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M2 4h14M2 9h14M2 14h14" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-2 bg-white border border-gray-200 rounded-2xl shadow-md px-4 py-3 flex flex-col gap-1">
            {t.navLinks.map((label, i) => (
              <Link
                href={navHrefs[i]}
                className="font-patua text-sm text-gray-700 px-4 py-2.5 rounded-xl transition-colors hover:text-emerald-500 hover:shadow-[0_0_8px_#10B981]"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-2">
              <button
                onClick={() => { setOpen(true); setMenuOpen(false); }}
                className="font-patua w-full text-sm text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                {t.logIn}
              </button>
            </div>
          </div>
        )}
      </nav>

      <LoginModal open={open} setOpen={setOpen} />
    </>
  );
};

export default Navbar;