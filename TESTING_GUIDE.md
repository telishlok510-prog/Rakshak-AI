# Alert System Testing Guide

## 🎯 Two Testing Modes

### Mode 1: Local Development (WITHOUT Vercel KV)
- **What works:** UI, district selection, VAPID key validation, browser permissions, AI analysis
- **What's simulated:** Database operations log to console instead of storing
- **Use for:** Testing UI/UX, push subscription flow, AI analysis
- **Deployment needed:** No

### Mode 2: Production (WITH Vercel KV)
- **What works:** Everything including actual database storage and notifications
- **Use for:** End-to-end testing with real notifications between users
- **Deployment needed:** Yes (Vercel with KV connected)

---

## 🧪 Local Testing (No Database Required)

### Step 1: Verify Dev Server is Running

```bash
npm run dev
```

**Check console output:**
```
✓ Ready in 3s
- Local: http://localhost:3000
- Environments: .env.local
```

### Step 2: Test District Selection & VAPID Key

1. Open: **http://localhost:3000/report**
2. Open browser DevTools (F12) → **Console** tab
3. Scroll to "Get Scam Alerts for Your Area" section

**You should see:**
- Blue "Debug Info" box showing:
  - ✅ Service Worker: Supported
  - ✅ Push Manager: Supported
  - ✅ VAPID Key: Configured (BAE4DPw3...)
- District dropdown with 32 Gujarat districts
- "Enable Alerts" button (disabled until you select a district)

**If VAPID Key shows ❌:**
```bash
# Stop dev server (Ctrl+C)
# Verify .env.local has NEXT_PUBLIC_VAPID_PUBLIC_KEY
# Restart:
npm run dev
```

### Step 3: Test Push Subscription Flow

1. **Select a district** (e.g., "Ahmedabad")
2. **Click "Enable Alerts"**
3. **Allow notifications** when browser prompts

**Console logs you should see:**
```
[AlertOptIn] Subscribe clicked, district: Ahmedabad
[AlertOptIn] Requesting notification permission...
[AlertOptIn] Permission result: granted
[AlertOptIn] Getting service worker registration...
[AlertOptIn] Service worker ready
[AlertOptIn] VAPID check - isConfigured: true
[AlertOptIn] VAPID check - key length: 87
[AlertOptIn] VAPID check - key preview: BAE4DPw3NUfWjt7fQbqT
[AlertOptIn] VAPID public key retrieved successfully
[AlertOptIn] Subscribing to push manager...
[AlertOptIn] Push subscription created
[AlertOptIn] Saving to server...
```

**Server terminal logs:**
```
=================================
[Alerts] DEV MODE - No KV configured
[Alerts] Would subscribe to: ahmedabad
[Alerts] Subscription endpoint: https://fcm.googleapis.com/...
=================================
```

**On success:**
- Green "Alerts Active" box appears
- Shows: "You'll receive scam alerts for Ahmedabad..."
- Console shows no errors

### Step 4: Test Report Submission & AI Analysis

1. Scroll to "Report a Scam" section
2. Write a test scam report (e.g., "Received fake UPI collect request asking for ₹50,000")
3. **Click "Report & Send Alert"**

**Console logs:**
```
[Report] Analyzing report for ahmedabad...
[Report] Analysis complete: UPI Collect Request Scam
```

**Server terminal logs:**
```
[Report] Analyzing report for ahmedabad...
[RakshakAI][Report] Calling Gemini with key #1...
[Report] Analysis complete: UPI Collect Request Scam
=================================
[Report] DEV MODE - No KV configured
[Report] District: ahmedabad
[Report] Category: UPI Collect Request Scam
[Report] Summary: Fake UPI collect request for large amount
[Report] Prevention Tip: Never approve collect requests. They take money OUT.
=================================
```

**On page:**
- Shows analysis results with category, summary, and prevention tip
- Message: "Development mode: report analyzed but not saved"

---

## ✅ What to Verify in Local Testing

### UI/UX Checks
- [ ] District dropdown works and shows 32 districts
- [ ] "Enable Alerts" button disabled when no district selected
- [ ] Button enables after selecting district
- [ ] Button shows loading state when clicked
- [ ] Permission prompt appears (browser native dialog)
- [ ] Green success box appears after granting permission
- [ ] Unsubscribe button visible in success box
- [ ] Debug info box shows correct status (dev mode)

### Console Checks
- [ ] No JavaScript errors (red text)
- [ ] `[AlertOptIn]` logs show complete flow
- [ ] VAPID key detected (length 87)
- [ ] Push subscription created successfully
- [ ] API responds with `devMode: true`

### Server Checks (Terminal)
- [ ] "DEV MODE" messages appear
- [ ] Subscription logged with endpoint
- [ ] Report analysis completes
- [ ] AI categories match fixed list
- [ ] No KV connection errors

---

## 🚀 Production Testing (With Vercel KV)

### Prerequisites

1. **Deploy to Vercel**
   ```bash
   git push
   ```

2. **Connect Vercel KV (Upstash Redis)**
   - Vercel Dashboard → Storage → Browse Storage
   - Click "Upstash for Redis"
   - Select your project
   - Choose "Production, Preview" environments
   - Click "Connect Project"

3. **Add Environment Variables** (if not already done)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

4. **Redeploy** (Vercel auto-redeploys when KV connected)

### Testing on Production

#### Test 1: Single User Subscription

1. Visit your deployed site: `https://your-project.vercel.app/report`
2. Select district (e.g., "Ahmedabad")
3. Click "Enable Alerts"
4. Grant permission

**Check Vercel Logs:**
```
[Alerts] New subscription for ahmedabad. Total: 1
```

**Check Vercel KV Dashboard:**
- Key: `subs:ahmedabad`
- Value: Array with 1 subscription object

#### Test 2: Multi-User Notifications

1. **Device A:** Subscribe to "Ahmedabad"
2. **Device B:** Subscribe to "Ahmedabad"
3. **Device A:** Submit a scam report
4. **Device B:** Should receive push notification

**Notification should show:**
- Title: "⚠️ [Category] reported near you"
- Body: [Prevention tip from AI]
- Click opens /report page

#### Test 3: District Isolation

1. **User A:** Subscribe to "Ahmedabad"
2. **User B:** Subscribe to "Surat"
3. **User A:** Submit report
4. **User A:** Gets notification ✅
5. **User B:** Does NOT get notification ✅

#### Test 4: Dead Subscription Cleanup

1. Subscribe on Device A
2. Clear browser data / uninstall PWA
3. Subscribe on Device B (same district)
4. Submit report from Device C
5. Check Vercel logs:
   ```
   [Report] Notification failed for [endpoint]: ...
   [Report] Cleaned up 1 dead subscriptions from ahmedabad
   ```

---

## 🐛 Common Issues & Solutions

### Issue: "VAPID Key: ❌ Missing"

**Cause:** Environment variable not loaded

**Solution:**
```bash
# Local development:
1. Check .env.local has NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
2. Restart dev server (Ctrl+C, then npm run dev)

# Production:
1. Check Vercel env vars have NEXT_PUBLIC_VAPID_PUBLIC_KEY
2. Redeploy
```

### Issue: "Enable Alerts" button disabled

**Cause:** District not selected

**Solution:** Select a district from dropdown first

### Issue: Permission denied / blocked

**Cause:** Browser permissions

**Solution:**
1. Click lock icon in address bar
2. Find "Notifications" → Set to "Allow"
3. Refresh page
4. Or test in incognito mode (clean state)

### Issue: "KV_URL not defined" in production

**Cause:** Vercel KV not connected

**Solution:**
1. Go to Vercel Dashboard → Storage
2. Select existing KV or create new one
3. Click "Connect to Project"
4. Redeploy

### Issue: Notifications not received

**Possible causes:**
1. User not subscribed → Check `devMode: false` in API response
2. Different districts → Verify both use same district
3. Service worker not active → Check Application tab in DevTools
4. Browser doesn't support push → iOS Safari not supported
5. Dead subscription → Check Vercel logs for 410/404 cleanup

---

## 📊 Verification Checklist

### Local Development Mode
- [ ] Dev server starts without errors
- [ ] .env.local loaded (check console output)
- [ ] /report page loads
- [ ] Debug info shows all ✅
- [ ] District dropdown populated
- [ ] Enable alerts button works
- [ ] Browser permission prompt appears
- [ ] Green success box appears
- [ ] Console logs show complete flow
- [ ] Server logs show "DEV MODE" messages
- [ ] No errors in browser console
- [ ] AI analysis works (report submission)
- [ ] Analysis results display on page

### Production Mode
- [ ] Deployed to Vercel successfully
- [ ] Vercel KV connected
- [ ] Environment variables set
- [ ] /report page loads on production
- [ ] Can subscribe from browser
- [ ] Subscription saved in KV (check dashboard)
- [ ] Can submit report
- [ ] Notifications received on other devices
- [ ] District isolation works
- [ ] Dead subscriptions cleaned up
- [ ] Vercel logs show success messages

---

## 🎓 Quick Test Script

### For Developers

Run this in browser console on `/report` page:

```javascript
// Test 1: Check environment
console.log("=== Environment Check ===");
console.log("Service Worker:", "serviceWorker" in navigator);
console.log("Push Manager:", "PushManager" in window);
console.log("Notification Permission:", Notification.permission);

// Test 2: Check service worker registration
navigator.serviceWorker.ready.then(reg => {
  console.log("SW State:", reg.active?.state);
  return reg.pushManager.getSubscription();
}).then(sub => {
  console.log("Current Subscription:", sub ? "Active" : "None");
  if (sub) console.log("Endpoint:", sub.endpoint.substring(0, 50) + "...");
});

// Test 3: Manual subscription test (replace YOUR_KEY with your VAPID public key)
async function testSubscription() {
  const reg = await navigator.serviceWorker.ready;
  const publicKey = "YOUR_VAPID_PUBLIC_KEY_HERE";
  
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    console.log("✅ Test subscription successful:", sub);
  } catch (e) {
    console.error("❌ Test failed:", e);
  }
}

// Uncomment to run manual test:
// testSubscription();
```

---

## 📝 Test Report Template

Use this to document your testing:

```
## Alert System Test Report

**Date:** [Date]
**Environment:** [Local / Production]
**Tester:** [Your Name]

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| District selection | ✅ / ❌ | |
| Enable alerts button | ✅ / ❌ | |
| Browser permission | ✅ / ❌ | |
| Push subscription | ✅ / ❌ | |
| AI analysis | ✅ / ❌ | |
| Report submission | ✅ / ❌ | |
| Notification received | ✅ / ❌ | |
| District isolation | ✅ / ❌ | |

### Issues Found

1. [Issue description]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Console errors:

### Browser/Device Info

- Browser: [Chrome 120 / Firefox 121 / etc]
- OS: [Windows 11 / macOS / Android]
- Device: [Desktop / Mobile]

### Console Logs

```
[Paste relevant console logs here]
```

### Server Logs

```
[Paste relevant server/Vercel logs here]
```
```

---

## 🎯 Next Steps

1. **Start with Local Testing:** Test UI without database
2. **Deploy to Vercel:** Push code to trigger deployment
3. **Connect Vercel KV:** Add Upstash Redis from dashboard
4. **Production Testing:** Test with real notifications
5. **Monitor Logs:** Check Vercel logs for issues
6. **Iterate:** Fix issues and redeploy

---

**Ready to test!** Start with local mode to verify the UI works, then deploy to Vercel for full testing.
