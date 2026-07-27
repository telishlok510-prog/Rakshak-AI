import { NextResponse } from "next/server";
import { analyzeWithAI } from "@/lib/ai";
import type { CheckKind, LanguageCode } from "@/lib/types";

/**
 * POST /api/analyze
 *
 * Single entry point for all analyzers (SMS / UPI / URL / Call / Screenshot).
 * Body: { kind, text, language }
 *
 * Runs server-side so the API key is never exposed to the browser.
 */

export const runtime = "nodejs";

const VALID_KINDS: CheckKind[] = ["sms", "upi", "url", "call", "screenshot"];
const VALID_LANGS: LanguageCode[] = ["en", "gu"];

const MAX_LEN = 5000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { kind, text, language } = (body ?? {}) as {
    kind?: string;
    text?: string;
    language?: string;
  };

  if (!kind || !VALID_KINDS.includes(kind as CheckKind)) {
    return NextResponse.json({ error: "Invalid 'kind'." }, { status: 400 });
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "'text' is required." }, { status: 400 });
  }
  const lang: LanguageCode = VALID_LANGS.includes(language as LanguageCode)
    ? (language as LanguageCode)
    : "en";

  try {
    const result = await analyzeWithAI(
      kind as CheckKind,
      text.slice(0, MAX_LEN),
      lang
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("[RakshakAI] /api/analyze error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
