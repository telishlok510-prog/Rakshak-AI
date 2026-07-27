import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getRotatedKeys } from "@/lib/ai";

/**
 * POST /api/transcribe
 *
 * Accepts an audio file (base64-encoded) and returns a text transcript using
 * Gemini's multimodal capabilities. Uses the same multi-key rotation as
 * lib/ai.ts — if one key is rate-limited, it automatically tries the next.
 *
 * Body: { audio: string (base64), mimeType: string }
 * Returns: { transcript: string }
 */

export const runtime = "nodejs";

async function transcribeOnce(
  apiKey: string,
  model: string,
  audio: string,
  mimeType: string
): Promise<string> {
  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: audio,
            },
          },
          {
            text: "Transcribe this audio recording exactly as spoken. If the audio is in Gujarati or Hindi, transcribe it in that language. Output ONLY the transcript text, nothing else.",
          },
        ],
      },
    ],
    config: {
      maxOutputTokens: 4096,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const transcript = (parts as any[])
    .filter((p) => typeof p.text === "string" && !p.thought)
    .map((p) => p.text as string)
    .join("");

  return transcript.trim();
}

export async function POST(request: Request) {
  const keys = getRotatedKeys();
  if (keys.length === 0) {
    return NextResponse.json(
      { error: "Transcription requires a Gemini API key." },
      { status: 503 }
    );
  }

  let body: { audio?: string; mimeType?: string };
  try {
    body = (await request.json()) as { audio?: string; mimeType?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { audio, mimeType } = body;
  if (!audio || !mimeType) {
    return NextResponse.json(
      { error: "Missing 'audio' (base64) or 'mimeType'." },
      { status: 400 }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  let lastErr: unknown;

  // Try each key in rotated order, same pattern as analyzeWithAI in lib/ai.ts.
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[RakshakAI][transcribe][DEBUG] Trying key #${i + 1} of ${keys.length}...`);
    try {
      const transcript = await transcribeOnce(apiKey, model, audio, mimeType);
      console.log(`[RakshakAI][transcribe][DEBUG] Key #${i + 1} succeeded.`);
      return NextResponse.json({ transcript });
    } catch (e: unknown) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      const message = e instanceof Error ? e.message : String(e);
      console.error(
        `[RakshakAI][transcribe][DEBUG] Key #${i + 1} FAILED. status=${status} message=${message}`
      );

      if (status === 429) {
        console.warn(`[RakshakAI] transcribe key #${i + 1} rate-limited, trying next key...`);
        continue;
      }

      // Non-rate-limit error — stop trying remaining keys.
      break;
    }
  }

  console.error("[RakshakAI] Transcription failed on all keys:", lastErr);
  return NextResponse.json(
    { error: "Transcription failed. Please try again or type manually." },
    { status: 500 }
  );
}