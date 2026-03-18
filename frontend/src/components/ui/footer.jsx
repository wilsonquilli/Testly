import Link from "next/link";
import { FaTiktok, FaInstagram, FaLinkedin } from "react-icons/fa";
import Jerry_Logo from "../../images/Logo.png";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

function Footer() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-6 md:px-16 lg:px-28 py-14">

      <div className="flex flex-col items-center text-center mb-10 lg:hidden">
        <Image src={Jerry_Logo} alt="Testly Logo" height={36} className="h-10 w-auto mb-2" />
        <span className="font-patua text-xl font-bold text-gray-900">Testly</span>
        <p className="font-patua text-gray-500 text-sm mt-3 max-w-sm">{t.footerTagline}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 text-left">

        <div className="hidden lg:block space-y-4">
          <div className="flex items-center gap-2">
            <Image src={Jerry_Logo} alt="Testly Logo" height={36} className="h-9 w-auto" />
            <span className="font-patua text-xl font-bold text-gray-900">Testly</span>
          </div>
          <p className="font-patua text-gray-500 text-sm leading-relaxed max-w-xs">{t.footerTagline}</p>
        </div>

        <div>
          <h2 className="font-patua text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            {t.footerProduct}
          </h2>
          <ul className="space-y-3 text-gray-500 text-sm">
            {t.navLinks.map((label, i) => {
              const hrefs = ["/", "/#features", "/#pricing", "/#faq"];
              return (
                <li key={label}>
                  <Link href={hrefs[i]} className="group relative hover:text-emerald-500 font-patua">
                    {label}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="font-patua text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            {t.footerResources}
          </h2>
          <ul className="space-y-3 text-gray-500 text-sm">
            <li>
              <Link href="/about" className="group relative hover:text-emerald-500 font-patua">
                {t.footerAbout}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
            <li>
              <Link href="/contact" className="group relative hover:text-emerald-500 font-patua">
                {t.footerContact}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-patua text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            {t.footerLegal}
          </h2>
          <ul className="space-y-3 text-gray-500 text-sm">
            <li>
              <a href="#" className="group relative hover:text-emerald-500 font-patua">
                {t.footerPrivacy}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
            <li>
              <a href="#" className="group relative hover:text-emerald-500 font-patua">
                {t.footerTerms}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-patua text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            {t.footerLanguages}
          </h2>
          <ul className="space-y-3 text-sm">
            <li
              onClick={() => setLanguage("en")}
              className={`cursor-pointer font-patua ${
                language === "en" ? "text-emerald-500 font-medium" : "text-gray-500 hover:text-emerald-500"
              }`}
            >
              English
            </li>
            <li
              onClick={() => setLanguage("es")}
              className={`cursor-pointer font-patua ${
                language === "es" ? "text-emerald-500 font-medium" : "text-gray-500 hover:text-emerald-500"
              }`}
            >
              Español
            </li>
          </ul>
        </div>

        <div className="col-span-2 flex flex-col items-center lg:col-span-5 lg:items-center lg:mt-10">
          <h2 className="font-patua text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {t.footerFollow}
          </h2>
          <div className="flex gap-5 text-gray-500">
            <FaTiktok className="text-lg cursor-pointer transition-all duration-300 hover:scale-125 hover:text-emerald-500 hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <FaInstagram className="text-lg cursor-pointer transition-all duration-300 hover:scale-125 hover:text-emerald-500 hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <a href="https://www.linkedin.com/in/wilson-quilli-8469b4291/" target="_blank">
              <FaLinkedin className="text-lg cursor-pointer transition-all duration-300 hover:scale-125 hover:text-emerald-500 hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-12 pt-6 flex justify-center text-sm text-gray-400">
        <p className="font-patua">{t.footerCopyright}</p>
      </div>
    </footer>
  );
}

export default Footer;