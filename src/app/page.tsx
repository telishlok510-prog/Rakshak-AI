"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";
import { useI18n } from "@/lib/i18n";

/**
 * Rakshak AI homepage — a premium landing page that explains the product,
 * builds trust, and drives visitors into the scam checker. All copy is
 * localized via the shared i18n system (English + Gujarati).
 */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: "opacity 700ms ease, transform 700ms ease",
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
      }}
    >
      {children}
    </div>
  );
}

/* Animated hero demo: cycles through a few real scam verdicts */
function HeroDemo() {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "result">("typing");

  const DEMO = [
    { msgKey: "h.demo.msg1", reasonKey: "h.demo.reason1", scam: true },
    { msgKey: "h.demo.msg2", reasonKey: "h.demo.reason2", scam: true },
    { msgKey: "h.demo.msg3", reasonKey: "h.demo.reason3", scam: false },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("result"), 1400);
    const t2 = setTimeout(() => {
      setPhase("typing");
      setIdx((i) => (i + 1) % DEMO.length);
    }, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const d = DEMO[idx];
  const color = d.scam ? "#D32F2F" : "#2E7D32";

  return (
    <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-2 text-xs font-medium text-white/60">{t("h.demo.title")}</span>
      </div>

      <div className="rounded-2xl bg-white p-4 text-gray-800">
        <p className="text-sm leading-relaxed">{t(d.msgKey)}</p>
      </div>

      <div className="mt-3 min-h-[86px]">
        {phase === "typing" ? (
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-white/70">
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "300ms" }} />
            </span>
            <span className="text-sm">{t("h.demo.analyzing")}</span>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4" style={{ borderLeft: `6px solid ${color}` }}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold" style={{ color }}>
                {d.scam ? t("h.demo.scam") : t("h.demo.safe")}
              </span>
              <span className="text-sm font-semibold" style={{ color }}>
                {d.scam ? "94%" : "96%"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{t(d.reasonKey)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();

  const TOOLS = [
    { icon: "✉️", nameKey: "h.tool.sms", descKey: "h.tool.sms.desc", href: "/check?tab=sms" },
    { icon: "🖼️", nameKey: "h.tool.screenshot", descKey: "h.tool.screenshot.desc", href: "/check?tab=screenshot" },
    { icon: "💸", nameKey: "h.tool.upi", descKey: "h.tool.upi.desc", href: "/check?tab=upi" },
    { icon: "🔗", nameKey: "h.tool.link", descKey: "h.tool.link.desc", href: "/check?tab=url" },
    { icon: "📞", nameKey: "h.tool.call", descKey: "h.tool.call.desc", href: "/check?tab=call" },
    { icon: "📷", nameKey: "h.tool.qr", descKey: "h.tool.qr.desc", href: "/check?tab=upi" },
  ];

  const STEPS = [
    { n: 1, titleKey: "h.step1.title", descKey: "h.step1.desc" },
    { n: 2, titleKey: "h.step2.title", descKey: "h.step2.desc" },
    { n: 3, titleKey: "h.step3.title", descKey: "h.step3.desc" },
  ];

  const STATS = [
    { big: "8+", key: "h.stat.types" },
    { big: "2", key: "h.stat.langs" },
    { big: "0", key: "h.stat.data" },
    { bigKey: "h.stat.freeBig", key: "h.stat.free" },
  ];

  const SCAM_TYPES = [
    "h.scam.phishing", "h.scam.upi", "h.scam.loan", "h.scam.qr",
    "h.scam.kyc", "h.scam.whatsapp", "h.scam.fakesite", "h.scam.investment",
  ];

  return (
    <div className="overflow-hidden bg-canvas">
      {/* ===== HERO ===== */}
      <section className="relative bg-primary text-white">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-safe/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold">
              {t("h.hero.badge")}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              {t("h.hero.title")}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">{t("h.hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/check"
                className="rounded-xl bg-accent px-7 py-4 text-lg font-bold text-primary shadow-lg transition hover:brightness-95 active:scale-[0.99]"
              >
                {t("h.hero.cta1")}
              </Link>
              <Link
                href="/learn"
                className="rounded-xl border-2 border-white/30 px-7 py-4 text-lg font-bold text-white transition hover:bg-white/10"
              >
                {t("h.hero.cta2")}
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/60">{t("h.hero.trust")}</p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDemo />
          </div>
        </div>

        <div className="h-10 bg-canvas" style={{ borderTopLeftRadius: "50% 100%", borderTopRightRadius: "50% 100%" }} />
      </section>

      {/* ===== TRUST STATS ===== */}
      <section className="mx-auto -mt-4 max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-black/5 bg-white p-6 shadow-lg sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.key} className="text-center">
              <p className="text-3xl font-extrabold text-primary">
                {s.bigKey ? t(s.bigKey) : s.big}
              </p>
              <p className="mt-1 text-sm text-gray-500">{t(s.key)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">{t("h.problem.title")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {t("h.problem.body")}{" "}
            <strong className="text-primary">{t("h.problem.emph")}</strong>
          </p>
        </Reveal>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-accent">{t("h.how.kicker")}</p>
            <h2 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">{t("h.how.title")}</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-extrabold text-white shadow-lg">
                  {s.n}
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{t(s.titleKey)}</h3>
                <p className="mt-2 text-gray-600">{t(s.descKey)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOOLS ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-accent">{t("h.tools.kicker")}</p>
          <h2 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">{t("h.tools.title")}</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.nameKey} delay={i * 70}>
              <Link
                href={tool.href}
                className="group block h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                  {tool.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{t(tool.nameKey)}</h3>
                <p className="mt-1 text-sm text-gray-600">{t(tool.descKey)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== EXPLAINABLE AI ===== */}
      <section className="bg-primary py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wider text-accent">{t("h.diff.kicker")}</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("h.diff.title")}</h2>
            <p className="mt-4 text-lg text-white/80">{t("h.diff.body")}</p>
            <Link
              href="/check"
              className="mt-8 inline-block rounded-xl bg-accent px-6 py-3 font-bold text-primary transition hover:brightness-95"
            >
              {t("h.diff.cta")}
            </Link>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
              <div className="rounded-2xl bg-white p-5 text-gray-800" style={{ borderLeft: "6px solid #D32F2F" }}>
                <p className="text-lg font-extrabold text-danger">{t("h.diff.verdict")}</p>
                <p className="mt-2 text-sm">{t("h.diff.found")}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="rounded-lg bg-canvas p-2">{t("h.diff.i1")}</li>
                  <li className="rounded-lg bg-canvas p-2">{t("h.diff.i2")}</li>
                  <li className="rounded-lg bg-canvas p-2">{t("h.diff.i3")}</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== SCAM TYPES ===== */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Reveal>
          <h2 className="text-2xl font-bold text-primary">{t("h.protect.title")}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {SCAM_TYPES.map((key) => (
              <span
                key={key}
                className="rounded-full border-2 border-primary/15 bg-white px-5 py-2 font-semibold text-primary shadow-sm"
              >
                {t(key)}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== PRIVACY ===== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <span className="text-5xl">🔒</span>
            <h2 className="mt-4 text-3xl font-extrabold text-primary">{t("h.privacy.title")}</h2>
            <p className="mt-3 text-lg text-gray-600">{t("h.privacy.body")}</p>
          </Reveal>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-safe/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t("h.final.title")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">{t("h.final.body")}</p>
            <Link
              href="/check"
              className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-primary shadow-lg transition hover:brightness-95 active:scale-[0.99]"
            >
              {t("h.final.cta")}
            </Link>
            <p className="mt-6 text-sm text-white/60">
              {t("h.final.lostPre")}
              <a href="tel:1930" className="font-bold underline">1930</a>
              {t("h.final.lostPost")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
