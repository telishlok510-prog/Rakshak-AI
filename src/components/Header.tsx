"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import LanguageSelector from "./LanguageSelector";

const NAV = [
  { href: "/", key: "nav.home" },
  { href: "/check", key: "nav.check" },
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/learn", key: "nav.learn" },
  { href: "/report", key: "nav.report" },
  { href: "/about", key: "nav.about" },
];

export default function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-primary text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span aria-hidden className="text-2xl">🛡️</span>
          <span className="text-xl font-extrabold tracking-tight">
            {t("app.name")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button
            className="rounded-lg p-2 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="text-2xl" aria-hidden>
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-white/10 bg-primary px-4 pb-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 text-base font-semibold ${
                pathname === item.href ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
