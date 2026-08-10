import { NextResponse } from "next/server";
import { analyzeWithAI, analyzeImageWithAI } from "@/lib/ai";
import type { CheckKind, LanguageCode } from "@/lib/types";

/**
 * POST /api/analyze
 *
 * Single entry point for all analyzers (SMS / UPI / URL / Call / Screenshot).
 * Body: { kind, text, language, image?, useAI? }
 *
 * For screenshot image analysis (multimodal):
 *   - image: base64-encoded image (with or without data: prefix)
 *   - useAI: true  → sends image to Gemini for visual analysis
 *   - useAI: false / missing → text-only heuristic analysis (default, private)
 *
 * Runs server-side so the API key is never exposed to the browser.
 */

export const runtime = "nodejs";

const VALID_KINDS: CheckKind[] = ["sms", "upi", "url", "call", "screenshot"];
const VALID_LANGS: LanguageCode[] = ["en", "gu"];

const MAX_LEN = 5000;
const MAX_IMAGE_SIZE_MB = 4; // Gemini free tier limit safety margin

/** Extract mimeType and raw base64 from a data URL or raw base64 string. */
function parseImageData(
  imageInput: string
): { mimeType: string; base64: string } | null {
  if (!imageInput || typeof imageInput !== "string") return null;

  // Data URL format: data:image/png;base64,iVBORw0KGgo...
  const dataUrlMatch = imageInput.match(/^data:([a-zA-Z0-9+/\-]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      base64: dataUrlMatch[2],
    };
  }

  // Raw base64 without prefix — assume JPEG (most common for screenshots)
  // Client should ideally send with prefix, but we handle both.
  if (/^[A-Za-z0-9+/=]+$/.test(imageInput.trim())) {
    return {
      mimeType: "image/jpeg",
      base64: imageInput.trim(),
    };
  }

  return null;
}

/** Rough size check: base64 length * 0.75 ≈ bytes. */
function isImageTooLarge(base64: string): boolean {
  const bytes = (base64.length * 3) / 4;
  return bytes > MAX_IMAGE_SIZE_MB * 1024 * 1024;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { kind, text, language, image, useAI } = (body ?? {}) as {
    kind?: string;
    text?: string;
    language?: string;
    image?: string;
    useAI?: boolean;
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

  // -------------------------------------------------------------------------
  // Screenshot + AI Image Analysis (multimodal)
  // -------------------------------------------------------------------------
  if (kind === "screenshot" && useAI === true) {
    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "'image' is required when useAI is true for screenshot analysis." },
        { status: 400 }
      );
    }

    const parsed = parseImageData(image);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid image format. Expected base64-encoded image." },
        { status: 400 }
      );
    }

    if (isImageTooLarge(parsed.base64)) {
      return NextResponse.json(
        { error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    try {
      const result = await analyzeImageWithAI(
        kind as CheckKind,
        text.slice(0, MAX_LEN),
        parsed.base64,
        parsed.mimeType,
        lang
      );
      return NextResponse.json(result);
    } catch (err) {
      console.error("[RakshakAI] /api/analyze image error:", err);
      return NextResponse.json(
        { error: "Image analysis failed. Please try again." },
        { status: 500 }
      );
    }
  }

  // -------------------------------------------------------------------------
  // Standard text-only analysis (all kinds including screenshot without useAI)
  // -------------------------------------------------------------------------
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