"use client";

import { LANGUAGES, useI18n } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/types";

/** Global language switch, available on every page (spec section 3). */
export default function LanguageSelector() {
  const { lang, setLang, t } = useI18n();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t("lang.select")}</span>
      <span aria-hidden className="text-lg">🌐</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LanguageCode)}
        className="rounded-lg border-2 border-white/30 bg-primary px-2 py-1 text-sm font-semibold text-white focus:border-white focus:outline-none"
        aria-label={t("lang.select")}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-gray-900">
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
