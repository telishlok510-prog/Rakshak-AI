# Location-Based Scam Alert System - Setup Guide

## Overview

The AI-Powered Location-Based Scam Alert System allows users to:
1. Report scams they encounter
2. AI analyzes the report (category, summary, prevention tip)
3. Push notifications sent to all users in the same district
4. No GPS, no personal data - only district-level, anonymous alerts

---

## Prerequisites

1. **Vercel Deployment** (for serverless functions)
2. **Vercel KV** (Redis database for storing subscriptions & reports)
3. **VAPID Keys** (for web push notifications)
4. **Gemini API Key** (for AI report analysis)

---

## Step 1: Generate VAPID Keys

VAPID keys are required for Web Push Notifications.

### Option A: Using npx (Easiest)
```bash
npx web-push generate-vapid-keys
```

### Option B: Using Node.js
```javascript
const webpush = require('web-push');
console.log(webpush.generateVAPIDKeys());
```

You'll get output like:
```
Public Key:  BAbC...xyz123
Private Key: pQrS...abc789
```

---

## Step 2: Add Vercel KV (Upstash Redis)

1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database** or **Browse Storage**
4. Select **Upstash for Redis** (the red icon)
5. Follow the prompts (free tier available: 10,000 commands/day)

Vercel will automatically add these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

No manual configuration needed!

---

## Step 3: Set Environment Variables

Add to your Vercel project (Settings → Environment Variables):

### Required for Alert System
```env
# VAPID Keys (from Step 1)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BAbC...xyz123
VAPID_PRIVATE_KEY=pQrS...abc789
VAPID_SUBJECT=mailto:youremail@example.com
```

### Required for AI Analysis
```env
# Gemini API Key (existing)
GEMINI_API_KEY=your-gemini-api-key
```

### Optional - Multi-Key Rotation
```env
# For higher rate limits, add multiple keys
GEMINI_API_KEY_1=key-one
GEMINI_API_KEY_2=key-two
GEMINI_API_KEY_3=key-three
```

---

## Step 4: Install Dependencies

Add the required npm packages:

```bash
npm install @vercel/kv web-push
```

Or with package.json:
```json
{
  "dependencies": {
    "@vercel/kv": "^1.0.0",
    "web-push": "^3.6.0"
  }
}
```

---

## Step 5: Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Add location-based scam alert system"

# Push to deploy
git push
```

Vercel will:
- Build the app
- Connect to KV automatically
- Use environment variables
- Deploy serverless functions

---

## Step 6: Test the System

### On Desktop (Chrome/Edge)
1. Visit your deployed site
2. Go to `/report` page
3. Click "Enable Alerts"
4. Select a district
5. Allow notifications when prompted
6. Submit a test scam report
7. You should receive a notification!

### On Android (Chrome)
1. Install the PWA (Add to Home Screen)
2. Open the app
3. Go to Report page
4. Enable alerts + select district
5. Submit a report
6. Check notification tray

### On iOS (Safari)
⚠️ Web Push is **not supported** on iOS Safari
- Users can still submit reports
- Users can still opt-in (saves preference)
- But won't receive notifications (Apple limitation)

---

## How It Works

### User Flow (Submitting Report)
```
1. User visits /report
2. Optionally enables alerts (chooses district)
3. Writes scam description
4. Clicks "Report & Send Alert"
5. API analyzes with Gemini AI
6. Report stored in KV: reports:<district-slug>
7. Notifications sent to all subscribers in that district
8. User sees AI analysis immediately
```

### User Flow (Receiving Alerts)
```
1. User enables alerts on /report
2. Selects district (e.g., "Ahmedabad")
3. Browser requests notification permission
4. Subscription saved to KV: subs:ahmedabad
5. When someone reports a scam in Ahmedabad...
6. Push notification appears: "⚠️ UPI Collect Request Scam reported near you"
7. User taps notification → opens /report page
```

---

## Data Storage (Vercel KV)

### Subscriptions
```
Key:   subs:<district-slug>
Value: Array of PushSubscriptionJSON objects
TTL:   90 days (auto-refresh when user visits)
```

Example:
```javascript
// Key: subs:ahmedabad
[
  {
    endpoint: "https://fcm.googleapis.com/...",
    keys: { p256dh: "...", auth: "..." }
  },
  {
    endpoint: "https://fcm.googleapis.com/...",
    keys: { p256dh: "...", auth: "..." }
  }
]
```

### Reports
```
Key:   reports:<district-slug>
Value: Array of StoredReport objects (last 50)
TTL:   30 days
```

Example:
```javascript
// Key: reports:ahmedabad
[
  {
    category: "UPI Collect Request Scam",
    summary: "Fake prize notification asking to approve collect request",
    preventionTip: "Never approve collect requests. They take money OUT.",
    timestamp: 1691234567890
  },
  // ... up to 50 reports
]
```

---

## AI Analysis

### Categories (Fixed List)
- UPI Collect Request Scam
- Digital Arrest / Fake Police Call
- KYC Phishing SMS
- Loan App Harassment
- Investment / Trading Scam
- Lottery / Prize Scam
- Job Scam
- OTP Sharing Scam
- Other

### Fallback Behavior
If AI analysis fails (all keys rate-limited/error):
- Category: "Other"
- Summary: First 100 chars of report
- Prevention Tip: Generic safety message
- Report still submitted successfully
- Notifications still sent

---

## Push Notification Format

```json
{
  "title": "⚠️ UPI Collect Request Scam reported near you",
  "body": "Never approve collect requests. They take money OUT, not IN. To receive money, just share your UPI ID.",
  "url": "/report"
}
```

Notification appears with:
- Rakshak AI icon (192x192)
- Clickable (opens /report page)
- Auto-dismisses after a while
- Replaces previous notification (tag: "rakshak-alert")

---

## Privacy & Security

### What We Store
- ✅ Push subscription endpoint (browser-generated, anonymous)
- ✅ Selected district (user choice, no GPS)
- ✅ Report text + AI analysis (no names/phones)
- ✅ Timestamp

### What We DON'T Store
- ❌ GPS coordinates
- ❌ User names
- ❌ Phone numbers
- ❌ Email addresses
- ❌ IP addresses
- ❌ Device IDs

### Data Expiry
- Subscriptions: 90 days (refresh on visit)
- Reports: 30 days (auto-delete)
- No permanent storage

---

## Monitoring & Logs

### Vercel Runtime Logs
Check these logs for debugging:
```
[Alerts] New subscription for ahmedabad. Total: 15
[Report] Analyzing report for ahmedabad...
[Report] Analysis complete: UPI Collect Request Scam
[Report] Stored report. Total for ahmedabad: 23
[Report] Sending notifications to 15 subscribers in ahmedabad...
[Report] Sent 14/15 notifications for ahmedabad
[Report] Cleaned up 1 dead subscriptions from ahmedabad
```

### Common Issues
1. **"Subscription failed"** → Check VAPID keys in env vars
2. **"No notifications received"** → Check browser notification permissions
3. **"Analysis failed"** → Check Gemini API key & rate limits
4. **"KV_URL not found"** → Add Vercel KV from dashboard

---

## Rate Limits

### Gemini API (Free Tier)
- 15 requests/minute per key
- 1,000 requests/day per key
- Solution: Add multiple keys (auto-rotates)

### Vercel KV (Upstash Redis Free Tier)
- 10,000 commands/day
- 256 MB storage
- Should handle ~1,000 subscribers easily

### Web Push
- No hard limits
- But clean up dead subscriptions (410/404)
- Implemented in `/api/report` route

---

## Scaling Considerations

### Current Architecture (Good for 1,000-10,000 users)
- Single KV instance
- District-level arrays in memory
- Promise.allSettled for fan-out

### If You Need to Scale (100,000+ users)
1. **Batch Processing**: Queue notifications with Vercel Queue
2. **Sharding**: Split large districts into sub-regions
3. **Pagination**: Don't load all subscriptions at once
4. **Worker Pool**: Parallelize notification sending

But for MVP (rural Gujarat), current architecture is fine.

---

## Testing Checklist

### Desktop Chrome
- [ ] Visit /report page
- [ ] Click "Enable Alerts"
- [ ] Select district
- [ ] Allow notification permission
- [ ] See "Alerts Active" confirmation
- [ ] Submit a test report
- [ ] Receive push notification
- [ ] Click notification → opens /report
- [ ] Unsubscribe works

### Android Chrome
- [ ] Install PWA
- [ ] Enable alerts in app
- [ ] Submit report
- [ ] Receive notification in system tray
- [ ] Tap notification → opens app

### Multiple Districts
- [ ] User A enables alerts for "Ahmedabad"
- [ ] User B enables alerts for "Surat"
- [ ] Report scam in Ahmedabad
- [ ] User A gets notification
- [ ] User B does NOT get notification

### AI Analysis
- [ ] Submit UPI scam → Category: "UPI Collect Request Scam"
- [ ] Submit fake police call → Category: "Digital Arrest / Fake Police Call"
- [ ] Submit vague text → Category: "Other" (fallback)
- [ ] All reports show summary + prevention tip

---

## Troubleshooting

### "Push subscription failed"
**Cause**: VAPID keys not configured or invalid

**Solution**:
1. Generate new VAPID keys: `npx web-push generate-vapid-keys`
2. Add to Vercel env vars (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
3. Redeploy

### "No notifications received"
**Cause**: Browser permissions or subscription state

**Solution**:
1. Check browser notification settings (chrome://settings/content/notifications)
2. Check console for errors
3. Try unsubscribe + resubscribe
4. Test in incognito mode

### "KV_URL not defined"
**Cause**: Vercel KV (Upstash Redis) not connected

**Solution**:
1. Go to Vercel dashboard → Storage → Browse Storage → Upstash for Redis
2. Redeploy (Vercel auto-injects KV env vars)

### "All Gemini keys failed"
**Cause**: API keys rate-limited or invalid

**Solution**:
1. Add multiple keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, ...)
2. Check quotas at https://aistudio.google.com/
3. Fallback still works (generic tip sent)

---

## Future Enhancements

### Already Built (MVP)
- ✅ District-level alerts
- ✅ AI categorization
- ✅ Push notifications
- ✅ Anonymous subscriptions
- ✅ Multi-key rotation
- ✅ Dead subscription cleanup

### Future Ideas
1. **Scam Trends Feed**: Show recent reports on /report page
2. **Alert History**: "Last 10 scams in your area"
3. **Multi-State Support**: Extend beyond Gujarat
4. **SMS Alerts**: For users without smartphones (Twilio)
5. **WhatsApp Alerts**: Via WhatsApp Business API
6. **Admin Dashboard**: Moderate reports, view stats
7. **AI Proactive Scanning**: Scan news/social media for new scams

---

## File Reference

### New Files Created
```
src/lib/alerts.ts                      - Types & utilities
src/components/AlertOptIn.tsx           - UI component
src/app/api/alerts/subscribe/route.ts   - Subscribe endpoint
src/app/api/alerts/unsubscribe/route.ts - Unsubscribe endpoint
src/app/api/report/route.ts             - Report submission + fan-out
```

### Modified Files
```
src/lib/ai.ts              - Added analyzeReportForAlert()
src/lib/types.ts           - Added ScamCategory type
public/sw.js               - Added push handlers
src/app/report/page.tsx    - Integrated AlertOptIn + submission
.env.local.example         - Added VAPID keys docs
```

---

## Support

For issues or questions:
1. Check Vercel runtime logs
2. Check browser console
3. Verify environment variables
4. Test with example reports

**Ready to deploy!** 🚀
