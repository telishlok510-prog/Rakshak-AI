"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-12 border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Emergency helplines are always one tap away */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-danger">
            {t("report.helpline.cyber")}
          </p>
          <a
            href="tel:1930"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3 font-bold text-white"
          >
            📞 Call 1930
          </a>
        </div>

        <p className="text-sm leading-relaxed text-gray-500">
          {t("footer.disclaimer")}
        </p>
        <p className="mt-4 text-xs text-gray-400">
          © {new Date().getFullYear()} {t("app.name")} · {t("app.tagline")}
        </p>
      </div>
    </footer>
  );
}
