"use client";
import Image from "next/image";
import { useState } from "react";
import LoginModal from "./loginmodal";
import Jerry_Logo from "../../images/Logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = ["Dashboard", "Features", "Pricing", "FAQ"];

  return (
    <>
      <nav className="w-full max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-3 items-center bg-white border border-gray-200 px-5 py-2.5 rounded-full shadow-sm">
          
          <div className="flex justify-start">
            <Image
              src={Jerry_Logo}
              alt="Testly Logo"
              height={36}
              className="h-9 w-auto cursor-pointer"
            />
          </div>

          <ul className="hidden md:flex justify-center items-center gap-2">
            {links.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="font-patua text-sm text-gray-600 px-4 py-2 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex justify-end items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="hidden md:block font-patua text-sm text-gray-600 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              Log in
            </button>

            <button
              className="md:hidden ml-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
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
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="font-patua text-sm text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-2">
              <button
                onClick={() => { setOpen(true); setMenuOpen(false); }}
                className="font-patua w-full text-sm text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                Log in
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