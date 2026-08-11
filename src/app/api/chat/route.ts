import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { LanguageCode } from "@/lib/types";

/**
 * POST /api/chat
 *
 * Dedicated endpoint for ChatAssistant with enhanced AI capabilities
 * Uses a separate Gemini API key to avoid quota conflicts with other features
 *
 * Body: { message: string, language: LanguageCode, conversationHistory?: Message[] }
 */

export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const VALID_LANGS: LanguageCode[] = ["en", "gu"];
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10; // Keep last 10 messages for context

/**
 * Get the dedicated ChatAssistant API key
 * Falls back to regular keys if not configured
 */
function getChatApiKey(): string | null {
  // Priority 1: Dedicated chat key
  if (process.env.GEMINI_CHAT_API_KEY) {
    return process.env.GEMINI_CHAT_API_KEY;
  }

  // Fallback to regular keys (for backward compatibility)
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) return key;
  }

  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  return null;
}

/**
 * Build enhanced system prompt for ChatAssistant
 * Optimized for conversational financial literacy and scam awareness
 */
function buildChatSystemPrompt(language: LanguageCode): string {
  const langName = language === "gu" ? "Gujarati" : "English";

  return `You are Rakshak AI, an expert financial literacy and cybersecurity assistant for Indian users, especially senior citizens and rural communities.

LANGUAGE: Respond in ${langName}. Use simple, clear language without technical jargon.

YOUR CAPABILITIES:
- Banking basics: accounts, KYC, IFSC, NEFT, IMPS, CIBIL scores
- UPI safety: collect requests, QR codes, PIN security, common mistakes
- Loan guidance: spotting fake loan apps, understanding terms, RBI registration
- Investment basics: FD, RD, mutual funds, Ponzi schemes, SEBI regulations
- Scam awareness: KYC phishing, digital arrest, lottery scams, job scams
- Emergency response: reporting procedures (1930, cybercrime.gov.in)

SCAM CATEGORIES TO DETECT:
1. UPI Collect Request Scam
2. Digital Arrest / Fake Police Call
3. KYC Phishing SMS
4. Loan App Harassment
5. Investment / Trading Scam
6. Lottery / Prize Scam
7. Job Scam
8. OTP Sharing Scam

SAFETY PRINCIPLES:
- Banks NEVER ask for OTP/PIN/CVV over phone/SMS
- UPI collect requests = sending money OUT (not receiving)
- QR scan + PIN = payment going out
- No advance fees for legitimate loans
- Guaranteed returns = red flag
- Jobs requiring registration fees = scam

RESPONSE STYLE:
- Empathetic and patient (many users are elderly)
- Use examples and analogies
- Break complex concepts into simple steps
- Use emojis sparingly for clarity (✅ ⚠️ 🚫)
- Provide actionable advice
- Encourage reporting suspicious activity

CONVERSATION GUIDELINES:
- Ask clarifying questions if the user's concern is vague
- Provide specific, practical solutions
- Reference Rakshak AI's other features when relevant:
  * "Check" page for analyzing SMS/URLs/UPI/Calls
  * "Learn" page for detailed lessons
  * "Practice" page for safe simulations
  * "Report" page for submitting scam reports
- End responses with a helpful follow-up question when appropriate

CRITICAL: If user describes an active scam or has already lost money, prioritize:
1. Stop further loss (block cards, freeze accounts)
2. Report immediately (1930 helpline, cybercrime.gov.in)
3. Preserve evidence (screenshots, messages, transaction IDs)`;
}

/**
 * Build conversation context from history
 */
function buildConversationHistory(messages: Message[]): string {
  if (!messages || messages.length === 0) return "";

  return (
    "\n\nCONVERSATION HISTORY:\n" +
    messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n")
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { message, language, conversationHistory } = (body ?? {}) as {
    message?: string;
    language?: string;
    conversationHistory?: Message[];
  };

  // Validation
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "'message' is required." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const lang: LanguageCode = VALID_LANGS.includes(language as LanguageCode)
    ? (language as LanguageCode)
    : "en";

  // Get API key
  const apiKey = getChatApiKey();
  if (!apiKey) {
    console.error("[ChatAssistant] No Gemini API key configured");
    return NextResponse.json(
      {
        error: "AI service not configured. Using local knowledge base.",
        fallback: true,
      },
      { status: 503 }
    );
  }

  try {
    const genai = new GoogleGenAI({ apiKey });

    // Build prompt with conversation history
    const historyContext = buildConversationHistory(conversationHistory || []);
    const fullPrompt = `${historyContext}\n\nUser: ${message.trim()}`;

    const response = await genai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: buildChatSystemPrompt(lang),
        maxOutputTokens: 2048,
      },
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI");
    }

    const responseText = response.text.trim();

    return NextResponse.json({
      success: true,
      response: responseText,
      model: "gemini-1.5-flash",
    });
  } catch (err: any) {
    console.error("[ChatAssistant] AI error:", err);

    // Handle rate limiting
    if (err?.message?.includes("429") || err?.message?.includes("quota")) {
      return NextResponse.json(
        {
          error: "Service temporarily busy. Please try again in a few seconds.",
          fallback: true,
        },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "AI service error. Using local knowledge base.",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
