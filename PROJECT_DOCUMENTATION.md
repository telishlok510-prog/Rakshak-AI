# Rakshak AI — Complete Project Documentation

## AI-Powered Scam Detection & Financial Literacy Platform for Rural India

**Competition:** The Maverick Effect AI Challenge  
**Category:** Cyber Safety & Financial Literacy  
**Problem Statement:** Financial Safety for Rural India  
**Developer:** Solo Developer  
**Live URL:** (Vercel deployment)  
**Repository:** 

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Target Users](#4-target-users)
5. [Core Features](#5-core-features)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [AI/ML Components](#8-aiml-components)
9. [Detection Engine — Technical Deep Dive](#9-detection-engine--technical-deep-dive)
10. [Pages & User Flows](#10-pages--user-flows)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [Security & Privacy](#12-security--privacy)
13. [Accessibility](#13-accessibility)
14. [Project Structure](#14-project-structure)
15. [API Reference](#15-api-reference)
16. [Deployment](#16-deployment)
17. [Innovation & Differentiators](#17-innovation--differentiators)
18. [Scalability & Future Scope](#18-scalability--future-scope)
19. [Disclaimer](#19-disclaimer)

---

## 1. Executive Summary

Rakshak AI is a free, AI-powered web platform that protects first-time digital banking users in rural India from financial fraud. It detects scam calls, fake UPI requests, phishing SMS, fake banking websites, malicious links, QR code scams, and loan fraud — and critically, **explains WHY something is suspicious** in simple Gujarati or English, spoken aloud for low-literacy users.

The platform uses Google's Gemini AI for intelligent classification and a rule-based heuristic engine as a reliable offline fallback, ensuring the product always works regardless of API availability.

**Key metrics:**
- 8+ scam types detected
- 2 languages (English + Gujarati) with voice output
- 0 user data collected
- No login required
- 100% client-side screenshot/QR processing (images never leave the device)
- Free forever (Gemini API free tier + Vercel free hosting)

---

## 2. Problem Statement

India pushed digital payments (UPI, Jan Dhan accounts, mobile banking) into rural areas faster than digital-safety awareness could keep up. Millions of first-time digital banking users are now online, but many cannot recognize scam calls, fake UPI requests, phishing messages, or fraudulent loan apps — especially when warning signs are only explained in English.

**The dangerous gap:** Between digital adoption and awareness, leading to significant financial loss and erosion of trust in digital banking among rural communities.

**Why this matters:**
- UPI and mobile banking rolled out nationwide, but scam-awareness content did not scale at the same pace
- Most cyber-safety education exists in English, excluding large populations who speak regional languages
- First-time users don't know how banking apps normally behave, so they cannot judge what looks "wrong"
- Scammers impersonate bank officials, RBI, or government schemes to build false credibility
- Once money is transferred via UPI, recovery is extremely difficult — prevention matters far more than cure

---

## 3. Solution Overview

Rakshak AI provides:

1. **Real-time AI detection** — identifies scam patterns in SMS, UPI requests, links, screenshots, QR codes, and call recordings
2. **Explainable AI results** — shows exactly WHICH indicators triggered the warning and WHY each is dangerous
3. **Local-language voice output** — reads results aloud in Gujarati for low-literacy users
4. **Financial literacy education** — teaches users to recognize scams independently through interactive lessons and a gamified Scam Simulator
5. **Scam trends awareness** — keeps users informed about new scam patterns currently in circulation
6. **Privacy-first design** — no login, no data collection, screenshots/QR processed on-device only
7. **Direct helpline access** — one-tap connection to National Cyber Crime Helpline (1930) and RBI Sachet portal

---

## 4. Target Users

- First-time UPI / mobile banking users in rural and semi-urban India
- Elderly users unfamiliar with digital fraud tactics
- Low-literacy or low-English-proficiency users
- Users who primarily interact with smartphones via voice rather than typing
- Farmers and small business owners managing payments digitally
- Students and other first-time UPI users

---

## 5. Core Features

### 5.1 SMS / Message Analyzer
- User pastes a suspicious SMS or WhatsApp message
- AI checks for fake bank domains, urgency keywords, OTP/PIN requests, shortened links
- Returns color-coded risk score with highlighted suspicious words

### 5.2 Screenshot Analyzer (OCR)
- User uploads a screenshot of an SMS, WhatsApp message, or UPI notification
- OCR runs **entirely in the browser** using Tesseract.js — image never leaves the device
- Extracted text is analyzed through the same detection pipeline
- Shows extracted text alongside the original image for verification

### 5.3 UPI Payment Request Checker
- Two input modes: "Type the details" or "Scan QR code"
- Detects disguised "collect" requests that take money OUT
- Flags small test amounts (₹1/₹2) used to verify UPI IDs before larger scams
- Deterministic warning: "This will DEDUCT money from your account, not add it!"

### 5.4 QR Code Scanner
- Uses native browser BarcodeDetector API (Chrome/Edge on Android) with jsqr fallback (Safari/Firefox)
- Camera frames decoded entirely on-device — never uploaded
- Parses UPI payment intents (`upi://pay?...`) to extract payee, amount, note
- Deterministic banner showing exactly where money will go if scanned
- Routes decoded content through existing UPI/URL analysis pipeline

### 5.5 Link / URL Analyzer
- Detects typosquatting against official bank domains
- Flags suspicious TLDs (.xyz, .top, .club, etc.)
- Detects URL shorteners that hide real destinations
- Identifies domains that mention bank names but aren't official

### 5.6 Phone Call Checker
- Two input modes: "Describe the call" (type) or "Upload recording"
- **Call Recording mode:** Audio file uploaded → Gemini AI transcribes it automatically → transcript analyzed for scam patterns
- Detects bank/RBI impersonation, OTP requests, digital arrest threats
- Supports Gujarati-language call detection (keywords for બેંક અધિકારી, ખાતું બ્લોક, પોલીસ, ડિજિટલ અરેસ્ટ, etc.)

### 5.7 Voice Output (Text-to-Speech)
- Every result can be read aloud using the browser's Web Speech API
- Auto-plays in Gujarati when language is set to ગુજરાતી
- Sentence-chunked speech queue to avoid Chrome's long-utterance cutoff bug
- Session-based stop mechanism for reliable cancel behavior

### 5.8 AI Chat Assistant
- Floating chatbot available on every page
- Quick action buttons: "Analyze SMS", "Check Website", "Learn About Scams", "Report a Scam"
- "Analyze SMS" and "Check Website" run the REAL detection engine (not canned responses)
- FAQ responses for OTP, UPI, loan, scam, safety questions from local knowledge base
- Works in both English and Gujarati

### 5.9 Scam Simulator (Gamified Learning)
- 8 realistic scenarios per language (phishing SMS, fake UPI, WhatsApp jobs, loan scams, QR code, investment fraud, + 2 genuine safe examples)
- Users choose "Safe" or "Scam" for each
- Instant feedback with explanation and highlighted indicators
- Points, progress bar, Financial Safety Score, completion badge

### 5.10 New Scams in the Market (Trends Feed)
- Curated, expandable cards about currently-circulating scam patterns
- Covers: Digital Arrest video calls, fake trading apps, electricity bill SMS, courier/customs parcel scams
- Each card shows: summary, how it works, red flags to watch for
- Fully bilingual (English + Gujarati)

### 5.11 Safety Score Dashboard
- Personal Financial Safety Score (0-100) calculated on-device
- Tracks: checks run, scams caught, simulator accuracy, lessons read
- Badges earned (First Check, Scam Spotter, Vigilant, Quiz Master, Lifelong Learner)
- Recent checks history
- Stored entirely in localStorage — nothing uploaded, fully private

### 5.12 Report a Scam
- Privacy-first form (data never sent anywhere — assembled locally for the user to copy)
- Direct links to National Cyber Crime Helpline (1930) and RBI Sachet portal
- cybercrime.gov.in link

---

## 6. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                       │
├──────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐  │
│  │Screenshot│  │QR Scanner│  │Tesseract│  │Web Speech │  │
│  │(on-device│  │(on-device│  │.js OCR │  │API (TTS) │  │
│  │only)    │  │only)    │  │        │  │           │  │
│  └────┬────┘  └────┬─────┘  └───┬────┘  └───────────┘  │
│       │            │            │                        │
│       ▼            ▼            ▼                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │          React UI (Next.js App Router)              │  │
│  │   Homepage │ Check │ Learn │ Dashboard │ Report    │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                         │ fetch("/api/analyze")           │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API Routes)            │
├──────────────────────────────────────────────────────────┤
│  POST /api/analyze     POST /api/transcribe              │
│       │                      │                           │
│       ▼                      ▼                           │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │ Heuristic    │     │ Gemini AI    │                  │
│  │ Detection    │     │ (Audio→Text) │                  │
│  │ Engine       │     └──────────────┘                  │
│  │ (always runs)│                                       │
│  └──────┬───────┘                                       │
│         │ signals                                        │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │ Gemini AI    │  ← if GEMINI_API_KEY is set           │
│  │ (Classification                                      │
│  │  + Explanation)                                      │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │ JSON Response│  { risk, confidence, indicators,      │
│  │              │    recommendedActions, highlights }    │
│  └──────────────┘                                       │
└──────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- Heuristic engine always runs first (deterministic, instant) and grounds the AI with structured signals
- Gemini AI provides rich, localized explanations but is never the only defense — heuristic fallback ensures the app always works
- Screenshots and QR codes are processed client-side only (images never leave the device)
- No database, no auth, no session — stateless, privacy-first
- Activity tracking uses localStorage only (dashboard data never uploaded)

---

## 7. Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) + TypeScript | Full-stack in one repo; server API routes hide the API key; excellent DX and scalability |
| Styling | Tailwind CSS 3.4 | Fast, responsive, high-contrast, mobile-first UI with custom design tokens |
| AI Engine | Google Gemini API (gemini-flash-latest) | Free tier, strong multilingual support, handles audio transcription natively |
| Fallback Engine | Custom rule-based heuristic (detection.ts) | Deterministic, explainable, works offline with zero API dependency |
| OCR | Tesseract.js 5.1 | Free, open-source, runs in-browser — images never leave the device |
| QR Decoding | Native BarcodeDetector API + jsqr 1.4 fallback | Native API for speed on Android; JS fallback ensures cross-browser support |
| Voice Output | Web Speech API (browser-native TTS) | Free, on-device, supports gu-IN and en-IN locales |
| UPI Parsing | Custom parser (src/lib/upi.ts) | Parses upi://pay? intents per NPCI spec |
| Deployment | Vercel (free tier) | Zero-config Next.js deployment, serverless functions, auto-deploy from GitHub |
| Version Control | Git + GitHub | Standard, with .gitignore protecting secrets |

**Dependencies (production):**
- `@google/genai` — Google Gemini SDK
- `next` — React framework
- `react` / `react-dom` — UI library
- `tesseract.js` — OCR engine
- `jsqr` — QR code decoder fallback

---

## 8. AI/ML Components

### 8.1 Gemini AI Classification
- **Model:** gemini-flash-latest (thinking model with fast responses)
- **Input:** User text + heuristic signal codes as grounding context
- **Output:** Structured JSON with risk level, confidence, indicators, recommended actions, safety tip, highlight terms
- **Localization:** System prompt instructs Gemini to respond in the user's selected language
- **Fallback:** If API fails or key is missing, heuristic engine provides a complete (if less nuanced) result

### 8.2 Gemini Audio Transcription
- **Input:** Base64-encoded audio file + transcription prompt
- **Output:** Text transcript in the spoken language (Gujarati/Hindi/English)
- **Use case:** Call recording analysis — transcribe → then analyze for scam patterns

### 8.3 Heuristic Detection Engine
- **Pattern matching:** Urgency words, credential requests, loan bait, prize bait, shortened links
- **Domain analysis:** Typosquatting detection against official bank domains, risky TLD flagging
- **UPI-specific:** Collect request detection, small test-amount flagging
- **Call-specific:** Bank/RBI impersonation detection with Gujarati keyword support
- **Scoring:** Weighted signal aggregation → risk classification (safe < 25, suspicious 25-59, scam ≥ 60)

### 8.4 OCR (Tesseract.js)
- Runs entirely in the browser's Web Worker
- Processes uploaded screenshots to extract text
- Extracted text is then fed through the same detection pipeline

### 8.5 QR Code Decoding
- Native BarcodeDetector (hardware-accelerated on Android)
- jsqr fallback for browsers without native support
- UPI intent parsing extracts payee, amount, currency, note from `upi://pay?` URIs

---

## 9. Detection Engine — Technical Deep Dive

### Scam Indicators Detected

| Code | What it catches | Weight |
|------|----------------|--------|
| URGENCY | Pressure language (blocked, expire, act now, તરત, બ્લોક) | 25 |
| CREDENTIALS | OTP/PIN/CVV requests | 45 |
| LOAN | Instant-loan / advance-fee bait | 20 |
| PRIZE | Lottery / reward bait | 25 |
| SHORTENER | bit.ly, tinyurl, etc. | 30 |
| FAKE_DOMAIN | Bank-like domain that isn't official | 40 |
| RISKY_TLD | .xyz, .top, .club, .online, etc. | 20 |
| UPI_COLLECT | Disguised collect request | 45 |
| UPI_SMALL_AMOUNT | ₹1/₹2 test amounts | 15 |
| CALL_IMPERSONATION | Fake official (English + Gujarati keywords) | 30 |

### Scoring Logic
- Each signal has a weight; raw scores are summed and capped at 100
- `score >= 60` → **scam**, `25-59` → **suspicious**, `< 25` → **safe**
- Confidence is calculated separately based on signal strength and risk bucket

### Official Domain Allowlist
SBI, HDFC, ICICI, Axis, PNB, Kotak, Bank of Baroda, RBI, NPCI, Sachet, Cybercrime portal, UIDAI, gov.in

### Risky TLD Blocklist
.xyz, .top, .club, .online, .site, .click, .link, .buzz, .work, .loan, .rest, .cam, .gq, .tk, .ml

---

## 10. Pages & User Flows

| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero with animated demo, trust stats, how-it-works, tools grid, explainability showcase, scam types, privacy section, final CTA |
| `/check` | Core tool — tabbed interface (SMS, UPI, URL, Call, Screenshot) with detection results |
| `/learn` | Scam Trends + Scam Simulator + Lesson cards with mini quizzes |
| `/dashboard` | Personal Safety Score, badges, recent checks, progress tracking |
| `/report` | Helpline links (1930, RBI Sachet) + local-only form helper |
| `/about` | Problem statement, mission, responsible AI, disclaimer |

---

## 11. Internationalization (i18n)

- **Languages:** English (en), Gujarati (gu)
- **Implementation:** Custom React context (`I18nProvider`) with localStorage persistence
- **Coverage:** Every UI string, all detection explanations, all lessons, all simulator scenarios, all trends content
- **Voice:** TTS uses `en-IN` and `gu-IN` BCP47 locales
- **Script handling:** CSS rule `html[lang="gu"] h1,h2,h3 { line-height: 1.5 }` prevents Gujarati matra overlap in headings
- **Dynamic `<html lang>` sync:** Updated on language change for accessibility and CSS targeting

---

## 12. Security & Privacy

### Data handling
- **No login, no accounts, no cookies** — completely stateless
- **No database** — zero user data is ever stored on any server
- **Screenshots processed client-side only** — OCR runs in-browser, images never uploaded
- **QR camera frames decoded on-device** — only the decoded text (a short string) reaches the API
- **Activity data in localStorage only** — dashboard stats never leave the browser
- **API key server-side only** — GEMINI_API_KEY is in environment variables, never exposed to the client

### Input validation
- API validates `kind` against allowlist, rejects invalid values (400)
- Text input length-capped at 5000 characters server-side
- Empty/whitespace-only text rejected (400)
- Invalid JSON body rejected (400)
- Malformed requests handled gracefully (never 500 on bad input)

### XSS prevention
- Zero `dangerouslySetInnerHTML` usage anywhere in the codebase
- All dynamic content rendered via React JSX text interpolation (auto-escaped)
- Highlight terms use regex with `escapeRegExp` to prevent injection

### API security
- API key never sent to client (server-side only in API routes)
- `.env.local` excluded from git via `.gitignore`
- No CORS configuration needed (same-origin API routes)

### Rate limiting
- Gemini API free tier has built-in rate limits (15 RPM, 1000 RPD)
- Retry-once-on-429 mechanism built into the AI module
- Graceful fallback to heuristic engine if rate-limited

---

## 13. Accessibility

- **Large buttons, high contrast** — designed for older users and low-vision users
- **Mobile-first** — responsive design works on all screen sizes
- **No login required** — reduces friction and cognitive load
- **Voice output** — every result can be heard aloud, not just read
- **Auto-play for Gujarati** — results speak automatically for users who prefer listening
- **ARIA attributes** — `role="tablist"`, `aria-selected`, `aria-expanded`, `aria-live="polite"`, `aria-label` used throughout
- **Focus-visible styles** — 3px solid blue outline for keyboard navigation
- **Semantic HTML** — proper heading hierarchy, landmarks, link vs button distinction
- **Gujarati line-height fix** — CSS rule prevents script overlap in headings

---

## 14. Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, providers, Header/Footer/ChatAssistant
│   ├── page.tsx                # Homepage (premium landing page design)
│   ├── globals.css             # Tailwind + custom component classes
│   ├── check/page.tsx          # Core scam-checking tool (tabbed)
│   ├── learn/page.tsx          # Scam Trends + Simulator + Lessons
│   ├── dashboard/page.tsx      # Personal Safety Score dashboard
│   ├── report/page.tsx         # Report a Scam + helplines
│   ├── about/page.tsx          # Problem, mission, disclaimer
│   └── api/
│       ├── analyze/route.ts    # POST /api/analyze — main detection endpoint
│       └── transcribe/route.ts # POST /api/transcribe — audio-to-text
├── components/
│   ├── Header.tsx              # Sticky nav with language switch
│   ├── Footer.tsx              # Disclaimer + emergency helpline
│   ├── ChatAssistant.tsx       # Floating AI chat (real detection + FAQ)
│   ├── LanguageSelector.tsx    # Global language switch
│   ├── VoiceButton.tsx         # TTS with chunked speech + auto-play
│   ├── RiskResult.tsx          # Explainable result card
│   ├── ScamSimulator.tsx       # Gamified scam identification practice
│   ├── ScamTrends.tsx          # New scams feed
│   ├── LessonCard.tsx          # Expandable lesson with quiz
│   └── checkers/
│       ├── TextChecker.tsx     # Shared text-input analyzer (SMS/URL/Call)
│       ├── ScreenshotChecker.tsx # OCR + analysis
│       ├── UpiChecker.tsx      # Text + QR mode toggle
│       ├── QrScanner.tsx       # Camera-based QR decoder
│       ├── CallChecker.tsx     # Text + Recording mode toggle
│       └── CallRecordingChecker.tsx # Upload + AI transcribe + analyze
└── lib/
    ├── types.ts                # Shared TypeScript types
    ├── ai.ts                   # Gemini AI integration + fallback logic
    ├── detection.ts            # Heuristic detection engine
    ├── api.ts                  # Client-side fetch helper
    ├── i18n.tsx                # Internationalization context + dictionaries
    ├── activity.ts             # On-device activity tracker (localStorage)
    ├── lessons.ts              # Financial literacy lesson content
    ├── simulator.ts            # Scam Simulator scenarios
    ├── trends.ts               # New scam trends content
    ├── upi.ts                  # UPI deep-link parser
    ├── upi.selfcheck.ts        # Parser self-test (dev-only)
    └── useInView.ts            # Scroll-triggered animation hook
```

---

## 15. API Reference

### POST /api/analyze

**Purpose:** Classify content as scam/suspicious/safe with explainable indicators.

**Request:**
```json
{
  "kind": "sms" | "upi" | "url" | "call" | "screenshot",
  "text": "content to analyze (max 5000 chars)",
  "language": "en" | "gu"
}
```

**Response (200):**
```json
{
  "risk": "scam" | "suspicious" | "safe",
  "confidence": 93,
  "reason": "This shows strong signs of a scam...",
  "indicators": [
    { "code": "CREDENTIALS", "label": "Asks for OTP / PIN / CVV", "detail": "No genuine bank..." , "matches": ["otp"] }
  ],
  "recommendedActions": ["Do NOT share any OTP...", "Block the sender..."],
  "safetyTip": "Never share your OTP, PIN or CVV...",
  "highlights": ["otp", "sbi-verify.xyz", "blocked"],
  "source": "gemini" | "heuristic"
}
```

**Error responses:** 400 (invalid input), 500 (server error)

### POST /api/transcribe

**Purpose:** Transcribe an audio file to text using Gemini's multimodal capabilities.

**Request:**
```json
{
  "audio": "base64-encoded audio data",
  "mimeType": "audio/mpeg"
}
```

**Response (200):**
```json
{
  "transcript": "The caller said your account will be blocked..."
}
```

**Error responses:** 400 (missing fields), 503 (no API key), 500 (transcription failed)

---

## 16. Deployment

### Platform: Vercel (free tier)
- Zero-config Next.js deployment
- Serverless functions for API routes
- Auto-deploy on every `git push` to `main`
- CDN-delivered static assets globally

### Environment Variables (set in Vercel dashboard)
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No (demo mode without it) | Enables AI-powered explanations and audio transcription |
| `GEMINI_MODEL` | No | Override model (default: `gemini-flash-latest`) |

### Build command
```bash
npm run build   # next build
```

### Local development
```bash
npm install
cp .env.local.example .env.local  # add your Gemini key
npm run dev     # http://localhost:3000
```

---

## 17. Innovation & Differentiators

| What | Why it matters |
|------|---------------|
| **Explainable AI** | Most scam tools just say "scam" — we show exactly which words/links/requests triggered the warning and explain why each is dangerous in plain language |
| **Audio transcription + analysis** | Upload a call recording → AI transcribes → AI analyzes for scam patterns. End-to-end, no manual typing needed |
| **On-device privacy** | Screenshots and QR codes never leave the browser. No login, no data collection. The product proves "AI safety tool" and "privacy" are not contradictions |
| **Gujarati voice-first** | Auto-plays results in Gujarati for low-literacy users who are more comfortable listening than reading |
| **Deterministic + AI hybrid** | The heuristic engine provides instant, always-correct facts ("this will SEND money, not receive it") while the AI adds nuanced explanation. Neither alone would be as good |
| **Gamified learning** | Scam Simulator with real-world scenarios, points, badges, and a Financial Safety Score turns passive awareness into active skill-building |
| **Real detection in the homepage hero** | The animated demo cycles through real scam examples, showing the product working before the user even navigates anywhere |
| **QR scanner with native API** | Uses browser's hardware-accelerated BarcodeDetector where available, with a JS fallback — no native app needed |

---

## 18. Scalability & Future Scope

**Current capacity (free tier):**
- 1,000 AI-powered checks per day (Gemini free tier)
- Unlimited heuristic-only checks
- 100GB bandwidth/month (Vercel free tier)

**Scaling path:**
- Upgrade Gemini to paid tier ($0.10/M tokens) for unlimited API calls
- Add more languages (Hindi, Marathi, Tamil, Bengali) — architecture supports it via i18n dictionaries
- WhatsApp bot integration for lower-friction access
- Partnership with banks/NBFCs for verified scam-pattern data feeds
- Community scam-alert map showing recently reported scams by region
- Browser extension that flags risky bank/UPI websites automatically
- Standalone Android app for offline-friendly access

---

## 19. Disclaimer

Rakshak AI is an independent awareness and detection tool built for educational and protective purposes. It is not affiliated with any bank, the Reserve Bank of India, or any government body. Users experiencing financial fraud should immediately contact the National Cyber Crime Helpline (1930) or file a complaint on the RBI Sachet portal (sachet.rbi.org.in).

---

*Document generated for The Maverick Effect AI Challenge submission.*
*Last updated: July 2026*
