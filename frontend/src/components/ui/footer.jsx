import Link from "next/link";
import { FaTiktok, FaInstagram, FaLinkedin } from "react-icons/fa";
import Jerry_Logo from "../../images/Logo.png";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useDarkMode } from "@/app/context/DarkModeContext";

function Footer() {
  const { language, setLanguage } = useLanguage();
  const { dark } = useDarkMode();
  const t = translations[language];
  const accent = dark ? "#ef4444" : "#10b981";
  const accentClass = dark ? "hover:text-red-400" : "hover:text-emerald-500";
  const accentBg = dark ? "bg-red-500" : "bg-emerald-500";

  return (
    <footer className={`border-t px-6 md:px-16 lg:px-28 py-14 transition-colors ${
      dark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
    }`}>
      <div className="flex flex-col items-center text-center mb-10 lg:hidden">
        <Image src={Jerry_Logo} alt="Testly Logo" height={36} className="h-10 w-auto mb-2" />
        <span className={`font-patua text-xl font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>Testly</span>
        <p className={`font-patua text-sm mt-3 max-w-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.footerTagline}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 text-left">
        <div className="hidden lg:block space-y-4">
          <div className="flex items-center gap-2">
            <Image src={Jerry_Logo} alt="Testly Logo" height={36} className="h-9 w-auto" />
            <span className={`font-patua text-xl font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>Testly</span>
          </div>
          <p className={`font-patua text-sm leading-relaxed max-w-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.footerTagline}</p>
        </div>

        <div>
          <h2 className={`font-patua text-sm font-semibold mb-4 uppercase tracking-wide ${dark ? "text-gray-200" : "text-gray-900"}`}>
            {t.footerProduct}
          </h2>
          <ul className={`space-y-3 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t.navLinks.map((label, i) => {
              const navHrefs = ["/dashboard", "/#features", "/#pricing", "/#faq"];
              return (
                <li key={label}>
                  <Link href={navHrefs[i]} className={`group relative font-patua ${accentClass}`}>
                    {label}
                    <span className={`absolute left-0 -bottom-1 w-0 h-[2px] ${accentBg} transition-all duration-300 group-hover:w-full`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h2 className={`font-patua text-sm font-semibold mb-4 uppercase tracking-wide ${dark ? "text-gray-200" : "text-gray-900"}`}>
            {t.footerResources}
          </h2>
          <ul className={`space-y-3 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {[{ label: t.footerAbout, href: "/about" }, { label: t.footerContact, href: "mailto:soufyaneking90@gmail.com" }].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className={`group relative font-patua ${accentClass}`}>
                  {label}
                  <span className={`absolute left-0 -bottom-1 w-0 h-[2px] ${accentBg} transition-all duration-300 group-hover:w-full`} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h2 className={`font-patua text-sm font-semibold mb-4 uppercase tracking-wide ${dark ? "text-gray-200" : "text-gray-900"}`}>
            {t.footerLegal}
          </h2>
          <ul className={`space-y-3 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {[t.footerPrivacy, t.footerTerms].map((label) => (
              <li key={label}>
                <a href="#" className={`group relative font-patua ${accentClass}`}>
                  {label}
                  <span className={`absolute left-0 -bottom-1 w-0 h-[2px] ${accentBg} transition-all duration-300 group-hover:w-full`} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={`font-patua text-sm font-semibold mb-4 uppercase tracking-wide ${dark ? "text-gray-200" : "text-gray-900"}`}>
            {t.footerLanguages}
          </h2>
          <ul className="space-y-3 text-sm">
            {[["en", "English"], ["es", "Español"]].map(([code, label]) => (
              <li
                key={code}
                onClick={() => setLanguage(code)}
                className={`cursor-pointer font-patua transition-colors ${
                  language === code
                    ? dark ? "text-red-400 font-medium" : "text-emerald-500 font-medium"
                    : dark ? `text-gray-400 ${accentClass}` : `text-gray-500 ${accentClass}`
                }`}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div className={`col-span-2 flex flex-col items-center lg:col-span-5 lg:items-center lg:mt-10`}>
          <h2 className={`font-patua text-sm font-semibold mb-3 uppercase tracking-wide ${dark ? "text-gray-200" : "text-gray-900"}`}>
            {t.footerFollow}
          </h2>
          <div className={`flex gap-5 ${dark ? "text-gray-500" : "text-gray-500"}`}>
            {[FaTiktok, FaInstagram].map((Icon, i) => (
              <Icon
                key={i}
                className={`text-lg cursor-pointer transition-all duration-300 hover:scale-125 ${
                  dark ? "hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" : "hover:text-emerald-500 hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                }`}
              />
            ))}
            <a href="https://www.linkedin.com/in/wilson-quilli-8469b4291/" target="_blank">
              <FaLinkedin className={`text-lg cursor-pointer transition-all duration-300 hover:scale-125 ${
                dark ? "hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" : "hover:text-emerald-500 hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]"
              }`} />
            </a>
          </div>
        </div>
      </div>

      <div className={`border-t mt-12 pt-6 flex justify-center text-sm ${dark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"}`}>
        <p className="font-patua">{t.footerCopyright}</p>
      </div>
    </footer>
  );
}

export default Footer;