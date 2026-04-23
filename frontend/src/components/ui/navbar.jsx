"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import LoginModal from "./loginmodal";
import Jerry_Logo from "../../images/Logo.png";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useDarkMode } from "@/app/context/DarkModeContext";
import Link from "next/link";
import {
  apiRequest,
  clearAuthSession,
  getStoredUser,
  setAuthSession,
} from "@/utils/api";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { language } = useLanguage();
  const { dark } = useDarkMode();
  const t = translations[language];
  const navHrefs = ["/dashboard", "/#features", "/#pricing", "/#faq"];
  const accentColor = dark ? "#ef4444" : "#10B981";

  useEffect(() => {
    setCurrentUser(getStoredUser());

    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get("access_token");
    const authError = url.searchParams.get("auth_error");

    if (authError) {
      window.alert(`Google login failed: ${authError}`);
      url.searchParams.delete("auth_error");
      window.history.replaceState({}, "", url.toString());
      return;
    }

    if (!accessToken) return;

    const completeGoogleLogin = async () => {
      try {
        const user = await apiRequest("/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAuthSession(accessToken, user);
        setCurrentUser(user);
      } catch (error) {
        clearAuthSession();
        window.alert(error.message || "Unable to finish Google login");
      } finally {
        url.searchParams.delete("access_token");
        window.history.replaceState({}, "", url.toString());
      }
    };

    completeGoogleLogin();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const getUserLabel = () => {
    if (!currentUser) return "";
    return currentUser.name?.trim() || currentUser.email?.split("@")[0] || currentUser.email || "";
  };

  const handleLogin = () => {
    setOpen(true);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setMenuOpen(false);
  };

  const authLabel = currentUser ? getUserLabel() : t.logIn;

  return (
    <>
      <nav className="w-full max-w-5xl mx-auto px-4">
        <div className={`flex items-center justify-between border px-5 py-2.5 rounded-full shadow-sm transition-colors ${
          dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <Link href="/">
            <Image src={Jerry_Logo} alt="Testly Logo" height={36} className="h-9 w-auto cursor-pointer" />
          </Link>

          <ul className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {t.navLinks.map((label, i) => (
              <li key={label}>
                <Link
                  href={navHrefs[i]}
                  className={`font-patua text-sm px-4 py-2 rounded-full transition-colors cursor-pointer ${
                    dark ? "text-gray-400 hover:text-red-400" : "text-gray-600 hover:text-emerald-500"
                  }`}
                  style={{ "--tw-shadow-color": accentColor }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2">
                <span
                  className={`font-patua text-sm px-4 py-2 rounded-full border ${
                    dark ? "border-gray-700 bg-gray-800 text-gray-200" : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                  title={currentUser.email}
                >
                  {authLabel}
                </span>
                <button
                  onClick={handleLogout}
                  className={`hidden md:block font-patua text-sm px-4 py-2 rounded-full cursor-pointer transition-colors ${
                    dark ? "text-gray-300 hover:bg-gray-800 hover:text-red-400" : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                  }`}
                >
                  {t.logOut}
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className={`hidden md:block font-patua text-sm px-4 py-2 rounded-full cursor-pointer transition-colors ${
                  dark ? "text-gray-300 hover:bg-gray-800 hover:text-red-400" : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                }`}
              >
                {authLabel}
              </button>
            )}

            <button
              className={`md:hidden p-2 rounded-full cursor-pointer transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {menuOpen ? (
                  <path d="M2 2l14 14M16 2L2 16" stroke={dark ? "#e5e7eb" : "#111"} strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M2 4h14M2 9h14M2 14h14" stroke={dark ? "#e5e7eb" : "#111"} strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={`md:hidden mt-2 border rounded-2xl shadow-md px-4 py-3 flex flex-col gap-1 transition-colors ${
            dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}>
            {t.navLinks.map((label, i) => (
              <Link
                key={label}
                href={navHrefs[i]}
                className={`font-patua text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  dark ? "text-gray-300 hover:text-red-400" : "text-gray-700 hover:text-emerald-500"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className={`border-t mt-1 pt-2 ${dark ? "border-gray-700" : "border-gray-100"}`}>
              {currentUser ? (
                <div className="space-y-1">
                  <div
                    className={`font-patua w-full text-sm px-4 py-2.5 rounded-xl ${
                      dark ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {authLabel}
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`font-patua w-full text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-colors text-left ${
                      dark ? "text-gray-300 hover:bg-gray-800 hover:text-red-400" : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    }`}
                  >
                    {t.logOut}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { handleLogin(); setMenuOpen(false); }}
                  className={`font-patua w-full text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-colors text-left ${
                    dark ? "text-gray-300 hover:bg-gray-800 hover:text-red-400" : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                  }`}
                >
                  {authLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal open={open} setOpen={setOpen} onAuthSuccess={handleAuthSuccess} />
    </>
  );
};

export default Navbar;
