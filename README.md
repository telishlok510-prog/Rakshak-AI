# 🛡️ SuRakshaPay

**AI-Powered Scam Detection & Financial Literacy Platform for Rural India**

SuRakshaPay helps first-time digital-banking users detect scam calls, fake UPI
requests, phishing SMS, fake banking websites, malicious links and loan scams —
and, crucially, **explains *why* something is suspicious** in the user's own
language. Built around Explainable AI, accessibility, and trust.

> Independent educational tool. Not affiliated with any bank, the RBI, or any
> government body. If you have lost money, call **1930** immediately.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| **SMS / Message Analyzer** | Paste a suspicious SMS/WhatsApp message; get a risk verdict, scam probability, highlighted suspicious words, and a plain-language reason. |
| **Screenshot Analyzer (OCR)** | Upload a screenshot; text is extracted **on-device** with Tesseract.js and run through the same detection pipeline. |
| **UPI Request Checker** | Flags disguised "collect" requests that *deduct* money, tiny ₹1/₹2 test amounts, and mismatched payees. |
| **URL / Link Analyzer** | Detects look-alike bank domains (typosquatting), risky TLDs, and shortened links that hide the real destination. |
| **Call Checker** | Analyzes descriptions of suspicious calls (bank/RBI impersonation, OTP requests). |
| **Explainable AI Results** | Every result lists the exact indicators detected, why each matters, a scam-probability meter, and recommended actions. |
| **Voice Output (TTS)** | "Listen" button reads the result aloud in Gujarati / English via the Web Speech API. |
| **Learn (Literacy Hub)** | Short local-language lessons with a mini quiz on how each scam works. |
| **Report a Scam** | Privacy-first helper that directs users to the Cyber Crime Helpline (1930) and RBI Sachet portal. |
| **Multi-language** | Global language switch (English, Gujarati) on every page. |

---

## 🧱 Tech Stack & Why

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | **Next.js 14 (App Router) + TypeScript** | Full-stack in one repo; server API routes keep the AI key off the client; great DX and scalability. |
| Styling | **Tailwind CSS** | Fast, responsive, high-contrast, large-button mobile-first UI. |
| AI Engine | **Anthropic Claude API** | Strong multilingual reasoning for explainable classification. |
| Fallback | **Rule-based heuristic engine** | Deterministic, explainable, and works with **no API key** (demo mode). |
| OCR | **Tesseract.js** | Free, open-source, runs in-browser — images never leave the device. |
| Voice | **Web Speech API** | Native, free, on-device Text-to-Speech with Indian-language locales. |

---

## 🏗️ Architecture

```
User input (SMS / UPI / URL / Call / Screenshot)
        │
        ▼
[ Screenshot ] ──OCR (Tesseract.js, client)──► extracted text
        │
        ▼
POST /api/analyze  (Next.js server route — hides API key)
        │
        ▼
Detection engine (src/lib/claude.ts)
   ├─ heuristic signals (src/lib/detection.ts)  ← grounding + fallback
   └─ Claude API classification + explanation
        │
        ▼
AnalysisResult { risk, confidence, indicators[], recommendedActions[], safetyTip, highlights[] }
        │
        ▼
Color-coded, explainable UI  +  Text-to-Speech output
```

### Folder structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout, providers, header/footer
│   ├── page.tsx              # Home (3 large action buttons)
│   ├── check/page.tsx        # Core tool: tabbed analyzers
│   ├── learn/page.tsx        # Financial-literacy hub
│   ├── report/page.tsx       # Report a scam + helplines
│   ├── about/page.tsx        # Problem, mission, disclaimer
│   └── api/analyze/route.ts  # Server-side analysis endpoint
├── components/
│   ├── Header.tsx, Footer.tsx, LanguageSelector.tsx
│   ├── RiskResult.tsx        # Explainable result card
│   ├── VoiceButton.tsx       # Text-to-Speech
│   ├── LessonCard.tsx
│   └── checkers/
│       ├── TextChecker.tsx       # SMS / UPI / URL / Call
│       └── ScreenshotChecker.tsx # OCR flow
└── lib/
    ├── types.ts              # Shared types
    ├── detection.ts          # Heuristic engine (explainable + i18n)
    ├── claude.ts             # Claude integration + graceful fallback
    ├── api.ts                # Client fetch helper
    ├── i18n.tsx              # Language context + dictionaries
    └── lessons.ts            # Literacy-hub content
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) enable AI explanations
copy .env.local.example .env.local   # Windows
#   then add your ANTHROPIC_API_KEY
# Without a key the app runs in DEMO MODE using the heuristic engine.

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No (demo mode without it) | Enables Claude-powered explanations. |
| `ANTHROPIC_MODEL` | No | Override the model (default: `claude-3-5-haiku-latest`). |

---

## 🔐 Security & Privacy

- The Claude API key lives **only** on the server (`/api/analyze`), never in the browser.
- OCR is performed **client-side**; screenshots are not uploaded anywhere.
- No login and **no report storage** — the app never persists personal data.
- Input is length-capped and validated on the server.

---

## 📈 Scalability & Roadmap

- Stateless API route → deploy on Vercel/edge and scale horizontally.
- Add languages by extending `src/lib/i18n.tsx` and `lessons.ts`.
- Future: WhatsApp bot, verified RBI scam-pattern feeds, community scam-alert
  map, QR scanner, offline Android app, browser extension.

---

## ⚖️ Disclaimer

SuRakshaPay is an independent awareness and detection tool for educational and
protective purposes. It is not affiliated with any bank, the Reserve Bank of
India, or any government body. Users experiencing financial fraud should
immediately contact the **National Cyber Crime Helpline (1930)** or file a
complaint on the **RBI Sachet portal**.
