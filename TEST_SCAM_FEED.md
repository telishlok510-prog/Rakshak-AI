# Test Plan: Scam Feed Feature

## ✅ End-to-End Testing

### Pre-requisites
- Dev server running: `npm run dev`
- Redis credentials in `.env.local`
- Browser open at `http://localhost:3000`

---

## Test 1: Navigation
1. Open `http://localhost:3000`
2. Check Header navigation
3. **Expected:** "Market Scams" link visible between "Practice" and "Dashboard"
4. Click "Market Scams"
5. **Expected:** Navigate to `/scams` page

**Status:** ✅ Pass / ❌ Fail

---

## Test 2: Empty State
1. Go to `/scams`
2. Clear all Redis data (if any)
3. **Expected:** 
   - "No scams found" message
   - "New scams will appear here as they are reported"

**Status:** ✅ Pass / ❌ Fail

---

## Test 3: Create District Report
1. Go to `/report` page
2. Select district: "Ahmedabad"
3. Enter report text (min 10 chars):
   ```
   I received a fake KYC SMS from SBI asking to click link and enter OTP
   ```
4. Submit report
5. **Expected:** Success message with AI category

**Status:** ✅ Pass / ❌ Fail

---

## Test 4: View District Report in Feed
1. Go to `/scams` page
2. Click "Refresh" button
3. **Expected:**
   - See 1 district report card
   - Blue badge: "📍 DISTRICT REPORT"
   - District name: "Ahmedabad"
   - Category badge (e.g., "📱 KYC Phishing SMS")
   - Summary text
   - Prevention tip in green box
   - Timestamp (e.g., "Just now")

**Status:** ✅ Pass / ❌ Fail

---

## Test 5: Create Market Alert (Admin)
1. Go to `/admin/market-alerts`
2. Login with password: `rakshak2024`
3. Fill form:
   - **Scam Description:** "New lottery scam via WhatsApp claiming you won ₹25 lakh. Asks for registration fee."
   - **Source:** "Social Media"
   - **Target:** "All users"
   - **Language:** English
4. Click "Send Alert"
5. **Expected:** Success message with alert ID

**Status:** ✅ Pass / ❌ Fail

---

## Test 6: View Market Alert in Feed
1. Go to `/scams` page
2. Click "Refresh"
3. **Expected:**
   - See 2 items in feed (1 district + 1 market)
   - Orange badge: "🌐 MARKET ALERT"
   - Source: "Social Media"
   - Category: "🎰 Lottery / Prize Scam"
   - Full description visible
   - Prevention tip

**Status:** ✅ Pass / ❌ Fail

---

## Test 7: Filter by Type
1. On `/scams` page
2. Click "District Reports" filter
3. **Expected:** Only district reports visible (1 item)
4. Click "Market Alerts" filter
5. **Expected:** Only market alerts visible (1 item)
6. Click "All" filter
7. **Expected:** Both types visible (2 items)

**Status:** ✅ Pass / ❌ Fail

---

## Test 8: Gujarati Translation
1. Click language toggle in header
2. Select "ગુજરાતી"
3. Check `/scams` page
4. **Expected:**
   - Title: "બજારમાં નવી છેતરપિંડી"
   - Filter buttons: "બધી", "જિલ્લા રિપોર્ટ્સ", "બજાર ચેતવણીઓ"
   - Badges: "જિલ્લા રિપોર્ટ", "બજાર ચેતવણી"
   - "રક્ષણ ટિપ" label
   - Timestamp: "હમણાં જ" / "X કલાક પહેલાં"

**Status:** ✅ Pass / ❌ Fail

---

## Test 9: Multiple Reports Grouping
1. Submit 3 more reports from "Ahmedabad" with same category
2. Go to `/scams` page
3. **Expected:**
   - Reports grouped together
   - Report count shown: "⚠️ 4 people reported this"
   - Latest timestamp

**Status:** ✅ Pass / ❌ Fail

---

## Test 10: Timestamp Formatting
1. Wait 1 minute after creating report
2. Refresh `/scams` page
3. **Expected:** "1m ago" / "1 મિનિટ પહેલાં"
4. Check older reports
5. **Expected:** 
   - Hours: "2h ago" / "2 કલાક પહેલાં"
   - Days: "3d ago" / "3 દિવસ પહેલાં"

**Status:** ✅ Pass / ❌ Fail

---

## Test 11: Category Colors & Emojis
Check all 9 categories display correctly:

| Category | Color | Emoji |
|----------|-------|-------|
| UPI Collect Request Scam | Red | 💸 |
| Digital Arrest / Fake Police Call | Orange | 🚨 |
| KYC Phishing SMS | Yellow | 📱 |
| Loan App Harassment | Purple | 🏦 |
| Investment / Trading Scam | Blue | 📈 |
| Lottery / Prize Scam | Pink | 🎰 |
| Job Scam | Indigo | 💼 |
| OTP Sharing Scam | Red | 🔐 |
| Other | Gray | ⚠️ |

**Status:** ✅ Pass / ❌ Fail

---

## Test 12: Mobile Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Check `/scams` page
5. **Expected:**
   - Cards stack vertically
   - Filter buttons wrap properly
   - Text readable without zooming
   - Badges don't overflow
   - Touch-friendly button sizes

**Status:** ✅ Pass / ❌ Fail

---

## Test 13: Loading State
1. Go to `/scams` page
2. Before data loads
3. **Expected:**
   - 3 skeleton loader cards
   - Pulsing animation
   - No flash of empty state

**Status:** ✅ Pass / ❌ Fail

---

## Test 14: Error Handling
1. Stop Redis (or use invalid credentials)
2. Go to `/scams` page
3. **Expected:**
   - Graceful error handling
   - No crash
   - User-friendly message or empty state

**Status:** ✅ Pass / ❌ Fail

---

## Test 15: API Response Format
1. Open browser DevTools → Network tab
2. Go to `/scams` page
3. Check API calls:
   - `/api/scams/feed?type=district`
   - `/api/scams/feed?type=market`
4. **Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "reports": [{
    "type": "district",
    "id": "district-1234567890",
    "district": "Ahmedabad",
    "category": "KYC Phishing SMS",
    "summary": "...",
    "preventionTip": "...",
    "timestamp": 1234567890,
    "reportCount": 1
  }],
  "alerts": []
}
```

**Status:** ✅ Pass / ❌ Fail

---

## Test 16: Refresh Functionality
1. On `/scams` page with existing data
2. Submit a new report from another browser/tab
3. Click "Refresh" button
4. **Expected:**
   - New report appears
   - Feed re-sorted by timestamp
   - Count updated in filter buttons

**Status:** ✅ Pass / ❌ Fail

---

## Test 17: District-Specific Reports
1. Submit reports from different districts:
   - Ahmedabad: KYC Scam
   - Surat: UPI Scam
   - Vadodara: Loan Scam
2. Check `/scams` feed
3. **Expected:**
   - All 3 districts shown separately
   - Each with correct district name
   - Independent grouping per district

**Status:** ✅ Pass / ❌ Fail

---

## Test 18: Market Alert to All vs Specific Districts
1. Create market alert for "All users"
2. Create market alert for "Specific districts" → Select "Ahmedabad, Surat"
3. Check `/scams` feed
4. **Expected:**
   - Both alerts visible in feed
   - No filtering by district (market alerts are global)

**Status:** ✅ Pass / ❌ Fail

---

## Common Issues & Fixes

### Issue 1: Empty Feed Always
**Symptom:** No data shows even after submitting reports

**Check:**
- Redis connection working?
- Check Redis keys: `reports:*` and `market-alert-*`
- Check browser console for API errors
- Verify `.env.local` has correct Redis credentials

**Fix:**
```bash
# Test Redis connection
curl http://localhost:3000/api/scams/feed?type=all
```

---

### Issue 2: Categories Not Matching
**Symptom:** Category shows "Other" for everything

**Check:**
- AI analysis working in `/api/report`?
- Check Gemini API key quota
- Check AI response format

**Fix:** Check `/api/report` logs for AI errors

---

### Issue 3: Timestamps Wrong
**Symptom:** Shows "50 years ago" or invalid time

**Check:**
- Timestamp stored as milliseconds?
- Server time correct?

**Fix:** Ensure `timestamp: Date.now()` in report storage

---

### Issue 4: Gujarati Text Broken
**Symptom:** Gujarati shows as boxes or question marks

**Check:**
- Font loaded correctly?
- UTF-8 encoding?

**Fix:** Add Gujarati font to `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati&display=swap');
```

---

### Issue 5: Filter Buttons Not Working
**Symptom:** Clicking filter does nothing

**Check:**
- React state updating?
- Check browser console for errors

**Fix:** Verify `filter` state is connected to filtered array

---

## Production Deployment Checklist

Before deploying to Vercel:

- [ ] All 18 tests passed locally
- [ ] Redis credentials in Vercel env vars
- [ ] No console errors in browser
- [ ] Mobile responsive verified
- [ ] Gujarati translation complete
- [ ] API endpoints respond < 5 seconds
- [ ] Build successful: `npm run build`
- [ ] Git committed and pushed
- [ ] Vercel deployment triggered
- [ ] Post-deploy: Test `/scams` on production URL

---

## Quick Test Script

Run this to quickly test the feed:

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, test API
curl http://localhost:3000/api/scams/feed?type=all

# 3. Open browser
start http://localhost:3000/scams

# 4. Check network tab for API calls
# 5. Verify feed loads without errors
```

---

**Test Date:** _______________  
**Tester:** _______________  
**Result:** ✅ All Pass / ❌ Some Failed  
**Notes:** _______________

