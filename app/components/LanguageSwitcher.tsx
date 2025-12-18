"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);
  const lastApplied = useRef<string | null>(null);

  useEffect(() => {
    if (
      !pendingLocale ||
      pendingLocale === locale ||
      lastApplied.current === pendingLocale
    ) {
      return;
    }

    document.cookie = `NEXT_LOCALE=${pendingLocale}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
    lastApplied.current = pendingLocale;
  }, [pendingLocale, locale, router, startTransition]);

  const handleChange = (nextLocale: string) => {
    if (nextLocale === locale) return;
    setPendingLocale(nextLocale);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-0.5 shadow-sm">
      {LOCALES.map(({ code, label }) => {
        const active = code === locale;
        return (
          <button
            key={code}
            onClick={() => handleChange(code)}
            disabled={isPending && !active}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
