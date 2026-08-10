# Alert System Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "District selection and enabling not working"

This can have several causes. Follow these steps to diagnose:

---

### Step 1: Check Browser Console

Open browser developer tools (F12) and check the Console tab for error messages when you:
1. Select a district
2. Click "Enable Alerts"

Look for messages starting with `[AlertOptIn]` - these will tell you exactly where the process is failing.

---

### Step 2: Verify Environment Variables

The alert system requires VAPID keys to be configured. Check if they're loaded:

#### In Development Mode
You should see a blue "Debug Info" box on the `/report` page showing:
- ✅ Service Worker: Supported
- ✅ Push Manager: Supported  
- ✅ VAPID Key: Configured

If you see ❌ next to "VAPID Key", the environment variable isn't loaded.

#### Fix for Missing VAPID Key:
1. Verify `.env.local` contains `NEXT_PUBLIC_VAPID_PUBLIC_KEY=...`
2. **Restart the dev server** (Ctrl+C, then `npm run dev`)
3. Clear browser cache and refresh

**Important:** Environment variables are only loaded at server startup. Changing `.env.local` requires restarting `npm run dev`.

---

### Step 3: Check Service Worker Registration

In browser DevTools:
1. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Click **Service Workers** in the left sidebar
3. Verify `/sw.js` is registered and **activated**

If service worker is not registered:
- Check console for registration errors
- Try unregistering old service workers and refreshing
- Make sure you're on `http://localhost:3000` or `https://` (not `file://`)

---

### Step 4: Verify Push Notification Support

Push notifications are **not supported** on:
- ❌ iOS Safari (Apple limitation)
- ❌ Firefox Private Browsing
- ❌ Browsers without HTTPS (except localhost)

Supported browsers:
- ✅ Chrome (Desktop & Android)
- ✅ Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Samsung Internet (Android)

---

### Step 5: Check Notification Permission

If the button stays disabled or shows "Permission denied":

1. **Check browser permission:**
   - Click the lock icon in address bar
   - Look for "Notifications" setting
   - Set to "Allow"

2. **Reset permission (if blocked):**
   - Chrome: `chrome://settings/content/notifications`
   - Find your site and remove it
   - Refresh page and try again

3. **Test with a simple notification:**
   ```javascript
   // Run in browser console:
   Notification.requestPermission().then(perm => console.log(perm));
   // Should show "granted", not "denied" or "default"
   ```

---

### Step 6: Verify API Endpoints

After selecting district and enabling alerts, check Network tab for:

#### Request: POST `/api/alerts/subscribe`
**Expected Response (200 OK):**
```json
{
  "success": true,
  "district": "ahmedabad",
  "totalSubscribers": 1
}
```

**Common Errors:**

#### Error: `KV_URL not defined` (500)
**Cause:** Vercel KV (Upstash Redis) not connected

**Solution:**
1. Go to Vercel Dashboard → Storage → Browse Storage
2. Select "Upstash for Redis"
3. Connect to your project
4. Redeploy

#### Error: `Invalid subscription object` (400)
**Cause:** Push subscription failed to create

**Solution:**
- Check VAPID public key is correct
- Verify service worker is active
- Try in incognito mode (clean state)

#### Error: `VAPID public key not configured` (500)
**Cause:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY` environment variable missing

**Solution:**
1. Check `.env.local` has the key with `NEXT_PUBLIC_` prefix
2. Restart dev server
3. Redeploy (for production)

---

### Step 7: Test Push Subscription Creation

Run this in browser console on `/report` page:

```javascript
// Test push subscription
(async () => {
  try {
    const reg = await navigator.serviceWorker.ready;
    console.log("✅ Service worker ready");
    
    const publicKey = "YOUR_VAPID_PUBLIC_KEY_HERE"; // Copy from .env.local
    
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
    
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    
    console.log("✅ Push subscription created:", sub);
  } catch (e) {
    console.error("❌ Failed:", e);
  }
})();
```

If this fails, the error message will tell you exactly what's wrong.

---

### Step 8: Test with cURL (Server-Side)

Test the subscribe endpoint directly:

```bash
curl -X POST http://localhost:3000/api/alerts/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Ahmedabad",
    "subscription": {
      "endpoint": "https://test.example.com/push",
      "keys": {
        "p256dh": "test",
        "auth": "test"
      }
    }
  }'
```

Expected response:
```json
{"success":true,"district":"ahmedabad","totalSubscribers":1}
```

If this fails with `KV_URL not defined`, Vercel KV is not configured.

---

## Quick Fixes

### "Nothing happens when I click Enable Alerts"

1. Open browser console (F12)
2. Look for errors
3. Most common: VAPID key not loaded → **Restart dev server**

### "Button stays disabled"

1. District not selected → Select a district first
2. Permission denied → Reset browser notification permissions
3. Loading state stuck → Check console for errors

### "Subscribed but no notifications"

This is a different issue (notification sending). For testing:
1. Use another browser/device to subscribe
2. Submit a test scam report
3. Check if notification appears

---

## Still Not Working?

### Generate Detailed Debug Report

Run this in browser console and share the output:

```javascript
console.log("=== Alert System Debug Report ===");
console.log("Service Worker:", "serviceWorker" in navigator ? "✅" : "❌");
console.log("Push Manager:", "PushManager" in window ? "✅" : "❌");
console.log("VAPID Key:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✅" : "❌");
console.log("Notification Permission:", Notification.permission);

navigator.serviceWorker.ready
  .then(reg => {
    console.log("SW State:", reg.active?.state || "not active");
    return reg.pushManager.getSubscription();
  })
  .then(sub => {
    console.log("Current Subscription:", sub ? "✅ Active" : "❌ None");
  })
  .catch(e => console.error("Error:", e));
```

---

## Environment Checklist

Before testing, verify:

- [ ] `.env.local` exists in project root
- [ ] Contains `NEXT_PUBLIC_VAPID_PUBLIC_KEY=...`
- [ ] Contains `VAPID_PRIVATE_KEY=...`
- [ ] Contains `VAPID_SUBJECT=mailto:...`
- [ ] Dev server restarted after adding env vars
- [ ] Using supported browser (Chrome/Edge/Firefox)
- [ ] Not in private/incognito mode (or accept that subscriptions won't persist)
- [ ] HTTPS or localhost (not HTTP on remote server)
- [ ] Service worker registered at `/sw.js`
- [ ] Vercel KV connected (for production)

---

## Development vs Production

### Development (localhost)
- Uses `.env.local` for VAPID keys
- Service worker at `http://localhost:3000/sw.js`
- Subscriptions don't persist across browser restarts (expected)
- KV not required for testing UI (but needed for actual alerts)

### Production (Vercel)
- Uses Vercel environment variables
- Service worker at `https://yourdomain.com/sw.js`
- Requires Vercel KV (Upstash Redis) connected
- Subscriptions persist across devices/sessions
- Must be HTTPS

---

## Next Steps

If you're still having issues after following this guide:

1. **Check which step failed** using console logs
2. **Share the error message** from console
3. **Verify environment variable** is loaded (check debug info box)
4. **Try incognito mode** to rule out cached service workers

Most issues are resolved by:
- ✅ Restarting dev server after changing `.env.local`
- ✅ Clearing service worker cache
- ✅ Resetting browser notification permissions
- ✅ Verifying VAPID key is present with `NEXT_PUBLIC_` prefix
