# ChatAssistant API Key Setup Guide

## Overview
Rakshak AI ChatAssistant now uses a **separate dedicated Gemini API key** to provide enhanced conversational AI capabilities without affecting other features (SMS/URL/UPI analysis, scam alerts).

## Why Separate Key?

### Benefits:
1. **Independent Quota** - ChatAssistant gets its own 15 req/min, 1000 req/day quota
2. **Enhanced Capabilities** - More conversational, context-aware responses
3. **Reliability** - Other features won't fail if chat quota is exhausted
4. **Better UX** - Longer conversations possible without affecting core security checks

## Setup Instructions

### Step 1: Get a New Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the new API key (starts with `AIza...`)

### Step 2: Add to Environment Variables

#### Local Development (.env.local):
```env
# Existing keys for SMS/URL/UPI analysis and alerts
GEMINI_API_KEY_1=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...
GEMINI_API_KEY_3=AIzaSy...

# NEW: Dedicated key for ChatAssistant
GEMINI_CHAT_API_KEY=AIzaSy... (your new key here)
```

#### Production (Vercel):
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add: `GEMINI_CHAT_API_KEY` = `your_new_api_key_here`
4. Deploy

### Step 3: Verify Setup

1. Open Rakshak AI in browser
2. Click the chat button (💬) in bottom-right corner
3. Ask a question like "How does UPI work?"
4. Look for "✨ AI-Powered" badge on the response
5. Check browser console - no errors should appear

## Features

### AI-Powered ChatAssistant Capabilities:

✅ **Conversational AI** - Natural, context-aware responses  
✅ **Financial Literacy** - Banking, UPI, loans, investments  
✅ **Scam Detection** - Explains 8+ common scam types  
✅ **Gujarati Support** - Full bilingual conversation  
✅ **Conversation Memory** - Remembers last 6 messages  
✅ **Smart Fallback** - Uses local knowledge if AI unavailable  

### Automatic Fallback:
If `GEMINI_CHAT_API_KEY` is not set, ChatAssistant automatically falls back to:
1. Regular `GEMINI_API_KEY_1/2/3` keys, OR
2. Local knowledge base (no AI, but still functional)

## Usage Stats & Limits

### Free Tier Limits (per key):
- **Rate Limit:** 15 requests per minute
- **Daily Limit:** 1,000 requests per day
- **Model:** gemini-2.0-flash-exp (latest, fastest)

### Estimated Usage:
- **Typical chat session:** 5-10 messages = 5-10 API calls
- **Daily capacity:** 100-200 chat sessions per day (per key)

## Monitoring

### Check API Usage:
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. View your API keys dashboard
3. Monitor quota usage for each key

### If You Hit Limits:
- ChatAssistant automatically falls back to local knowledge base
- No error messages shown to users
- You'll see console logs: `[ChatAssistant] AI error: 429`

## Troubleshooting

### Problem: No AI responses (only basic text)
**Solution:** Check if `GEMINI_CHAT_API_KEY` is set correctly in environment variables

### Problem: "Service temporarily busy" error
**Solution:** Free tier rate limit hit (15/min). Wait 60 seconds or add more keys

### Problem: Responses in wrong language
**Solution:** Language detection is automatic based on user's UI selection

### Problem: Chat not remembering context
**Solution:** Conversation history limited to last 6 messages to save tokens

## Security Notes

⚠️ **Never commit API keys to Git**  
✅ API keys are server-side only (not exposed to browser)  
✅ All requests go through `/api/chat` route (secure)  
✅ Rate limiting prevents abuse  

## Deployment Checklist

Before deploying to production:

- [ ] Created new Gemini API key for chat
- [ ] Added `GEMINI_CHAT_API_KEY` to Vercel environment variables
- [ ] Kept existing `GEMINI_API_KEY_1/2/3` for other features
- [ ] Tested chat functionality locally
- [ ] Verified fallback works when key is missing
- [ ] Checked Vercel deployment logs for errors

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Test with a fresh API key
4. ChatAssistant will always fall back to local knowledge if AI fails

---

**Status:** ✅ System ready for deployment  
**Fallback:** ✅ Local knowledge base always available  
**Quota:** ℹ️ Separate from other Rakshak AI features
