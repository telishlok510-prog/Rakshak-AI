import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/**
 * POST /api/transcribe
 *
 * Accepts an audio file (base64-encoded) and returns a text transcript using
 * Gemini's multimodal capabilities. The same GEMINI_API_KEY is used — no
 * additional service required.
 *
 * Body: { audio: string (base64), mimeType: string }
 * Returns: { transcript: string }
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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

  try {
    const client = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

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

    return NextResponse.json({ transcript: transcript.trim() });
  } catch (err) {
    console.error("[RakshakAI] Transcription failed:", err);
    return NextResponse.json(
      { error: "Transcription failed. Please try again or type manually." },
      { status: 500 }
    );
  }
}
