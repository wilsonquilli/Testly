"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { API_BASE_URL, apiRequest, setAuthSession } from "@/utils/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export default function LoginModal({ open, setOpen, onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dark } = useDarkMode();
  const { language } = useLanguage();
  const t = translations[language] ?? translations.en;

  const title = useMemo(
    () => (mode === "login" ? t.authLoginTitle : t.authSignupTitle),
    [mode, t]
  );

  const submitLabel = mode === "login" ? t.authLoginTab : t.authSignupTab;
  const accentBorder = dark ? "focus:border-red-500" : "focus:border-emerald-500";

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetState = () => {
    setError("");
    setForm(initialForm);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) resetState();
    setOpen(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const data = await apiRequest(
        mode === "login" ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setAuthSession(data.access_token, data.user);
      onAuthSuccess?.(data.user);
      handleOpenChange(false);
    } catch (submitError) {
      setError(submitError.message || t.authGenericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectTo = window.location.pathname || "/";
    window.location.href = `${API_BASE_URL}/auth/google/login?redirect_to=${encodeURIComponent(
      redirectTo
    )}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`font-patua sm:max-w-md ${dark ? "bg-gray-900 text-gray-100 ring-gray-700/80" : ""}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className={`flex rounded-full p-1 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
          {[
            { key: "login", label: t.authLoginTab },
            { key: "signup", label: t.authSignupTab },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setMode(option.key);
                setError("");
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                mode === option.key
                  ? dark
                    ? "bg-gray-700 text-gray-100 shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : dark
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              value={form.name}
              onChange={handleChange("name")}
              placeholder={t.authName}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                dark
                  ? `border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 ${accentBorder}`
                  : `border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 ${accentBorder}`
              }`}
            />
          )}

          <input
            value={form.email}
            onChange={handleChange("email")}
            placeholder={t.authEmail}
            type="email"
            autoComplete="email"
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
              dark
                ? `border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 ${accentBorder}`
                : `border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 ${accentBorder}`
            }`}
            required
          />

          <input
            value={form.password}
            onChange={handleChange("password")}
            placeholder={t.authPassword}
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
              dark
                ? `border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 ${accentBorder}`
                : `border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 ${accentBorder}`
            }`}
            minLength={8}
            required
          />

          {error && (
            <p className={`rounded-xl px-3 py-2 text-sm ${dark ? "bg-red-950/50 text-red-300" : "bg-red-50 text-red-600"}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-xl px-4 py-3 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
              dark ? "bg-red-600" : "bg-black"
            }`}
          >
            {isSubmitting ? t.authPleaseWait : submitLabel}
          </button>
        </form>

        <div className={`flex items-center gap-3 text-xs uppercase tracking-[0.2em] ${dark ? "text-gray-500" : "text-gray-400"}`}>
          <div className={`h-px flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
          <span>{t.authOr}</span>
          <div className={`h-px flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
            dark
              ? "border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
              : "border-gray-200 text-gray-800 hover:bg-gray-50"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-1 ${
              dark
                ? "bg-gray-900 text-gray-200 ring-gray-600"
                : "bg-white text-gray-700 ring-gray-200"
            }`}
          >
            G
          </span>
          {t.authGoogle}
        </button>
      </DialogContent>
    </Dialog>
  );
}