# Audio Synchronization Issues - Diagnostic & Fix Guide

## Problems Identified

### 1. **Audio File Format Issues**
- Your uploaded files were `.mpeg` format (renamed to `.mp3`)
- Browser audio compatibility issue - `.mpeg` may not play properly in all browsers
- **Solution**: Convert to proper MP3 format using audio converter

### 2. **Pause Point Timing Mismatch**
The pause points in your code are based on the SCRIPT timings, not your ACTUAL audio file timings.

**Current Code Timings (from scamCall.ts):**

| Scenario | Duration | Pause Point 1 | Pause Point 2 |
|----------|----------|---------------|---------------|
| bank-kyc-block-gu.mp3 | 45 sec | 12 sec | 28 sec |
| digital-arrest-gu.mp3 | 60 sec | 18 sec | 42 sec |
| electricity-bill-gu.mp3 | 50 sec | 20 sec | 38 sec |

**What you need to do:**
1. Play your actual audio files
2. Note the REAL timestamps where questions should appear
3. Update the `atSeconds` values in `src/lib/scamCall.ts`

### 3. **Missing Audio Metadata**
The `<audio>` tag needs proper metadata to calculate duration correctly.

---

## Step-by-Step Fix Instructions

### Fix 1: Check Your Actual Audio File Durations

Run this PowerShell command to check audio file properties:

```powershell
Get-ChildItem "e:\Rakshak-AI-main\Rakshak-AI-main\public\audio\scam-calls\*.mp3" | Select-Object Name, Length
```

### Fix 2: Test Audio Files in Browser

Create a test HTML file to verify audio plays:

```html
<!DOCTYPE html>
<html>
<head><title>Audio Test</title></head>
<body>
  <h2>Bank KYC (Gujarati)</h2>
  <audio controls src="/audio/scam-calls/bank-kyc-block-gu.mp3"></audio>
  <p id="duration1"></p>

  <h2>Digital Arrest (Gujarati)</h2>
  <audio controls src="/audio/scam-calls/digital-arrest-gu.mp3"></audio>
  <p id="duration2"></p>

  <h2>Electricity Bill (Gujarati)</h2>
  <audio controls src="/audio/scam-calls/electricity-bill-gu.mp3"></audio>
  <p id="duration3"></p>

  <script>
    document.querySelectorAll('audio').forEach((audio, index) => {
      audio.addEventListener('loadedmetadata', () => {
        document.getElementById(`duration${index+1}`).textContent = 
          `Duration: ${Math.round(audio.duration)} seconds`;
      });
    });
  </script>
</body>
</html>
```

Save this as `public/audio-test.html` and visit `http://localhost:3000/audio-test.html`

### Fix 3: Update Pause Point Timings

Once you know the REAL durations and where questions should appear:

1. **Listen to your audio files carefully**
2. **Note the timestamps** where you want questions to pause
3. **Update `src/lib/scamCall.ts`**

Example for bank-kyc-block-gu.mp3:
```typescript
{
  id: "bank-kyc-block-gu",
  // ... other fields
  durationSeconds: 65, // ← UPDATE THIS with real duration
  pausePoints: [
    {
      atSeconds: 18, // ← UPDATE THIS - when urgency is mentioned
      question: {
        // ...
      }
    },
    {
      atSeconds: 42, // ← UPDATE THIS - when OTP is requested
      question: {
        // ...
      }
    }
  ]
}
```

### Fix 4: Convert Audio Format (if needed)

If audio still doesn't play, convert to proper MP3 format:

**Online Converters:**
- https://cloudconvert.com/mpeg-to-mp3
- https://www.freeconvert.com/mpeg-to-mp3

**Or use FFmpeg (if installed):**
```powershell
ffmpeg -i "bank-kyc-block-gu.mp3" -codec:a libmp3lame -b:a 128k "bank-kyc-block-gu-converted.mp3"
```

### Fix 5: Add Audio Preload Fix

Update the ScamCallSimulation component to handle audio loading better:

In `src/components/practice/ScamCallSimulation.tsx`, add error handling:

```typescript
// Add this useEffect after the audioRef declaration
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleLoadedMetadata = () => {
    console.log("Audio loaded successfully:", audio.duration);
    // Update actual duration if different from expected
    if (Math.abs(audio.duration - scenario.durationSeconds) > 2) {
      console.warn(
        `Duration mismatch! Expected: ${scenario.durationSeconds}s, Actual: ${audio.duration}s`
      );
    }
  };

  const handleError = (e: ErrorEvent) => {
    console.error("Audio loading error:", e);
    alert(`Failed to load audio file: ${scenario.audioUrl}`);
  };

  audio.addEventListener("loadedmetadata", handleLoadedMetadata);
  audio.addEventListener("error", handleError);

  return () => {
    audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    audio.removeEventListener("error", handleError);
  };
}, [scenario.audioUrl, scenario.durationSeconds]);
```

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Audio files are in `/public/audio/scam-calls/` directory
- [ ] Filenames match exactly: `bank-kyc-block-gu.mp3`, `digital-arrest-gu.mp3`, `electricity-bill-gu.mp3`
- [ ] Files are actual MP3 format (not MPEG or other)
- [ ] Audio plays when tested in browser
- [ ] Actual duration matches `durationSeconds` in scamCall.ts (±2 seconds tolerance)
- [ ] Pause point timestamps (`atSeconds`) match actual moments in audio
- [ ] Browser console shows no errors when playing audio
- [ ] Progress bar moves smoothly during playback

---

## Testing After Fix

1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/practice/scam-call`
3. Select a scenario
4. Click "Start Call Recording"
5. **Check:**
   - Audio plays immediately
   - Progress bar moves
   - Questions appear at correct moments
   - Audio pauses when question appears
   - Audio resumes after answering

---

## Common Issues & Solutions

### Issue: "Audio doesn't play at all"
**Solutions:**
- Check browser console for errors
- Verify file path is correct (`/audio/scam-calls/filename.mp3`)
- Test audio file in VLC/Windows Media Player
- Convert to proper MP3 format

### Issue: "Quiz appears at wrong time"
**Solutions:**
- Play audio and note exact timestamps
- Update `atSeconds` values in scamCall.ts
- Ensure `durationSeconds` matches actual audio length

### Issue: "Progress bar doesn't move"
**Solutions:**
- Audio might not be loading metadata
- Add `preload="metadata"` to `<audio>` tag (already present)
- Check if audio duration is being read correctly

### Issue: "Audio plays but never pauses for questions"
**Solutions:**
- Check that `atSeconds` values are LESS than `durationSeconds`
- Verify the time update event is firing (add console.log)
- Ensure audio currentTime is updating

---

## Need to Get Actual Timestamps?

Use this simple tool - add to your page temporarily:

```typescript
// Add this button in ScamCallSimulation component for testing
<button
  onClick={() => {
    if (audioRef.current) {
      console.log("Current time:", audioRef.current.currentTime);
      alert(`Current time: ${audioRef.current.currentTime.toFixed(2)}s`);
    }
  }}
  className="rounded-lg bg-gray-500 px-4 py-2 text-white"
>
  Show Current Time
</button>
```

Play the audio, pause manually where you want questions, click the button to see the exact timestamp!

---

## Final Notes

The main issue is almost certainly **timing mismatch** between your actual audio files and the hardcoded timestamps in the code. 

You need to:
1. ✅ Listen to each audio file
2. ✅ Write down the exact seconds where questions should appear
3. ✅ Update `scamCall.ts` with those exact timestamps
4. ✅ Update `durationSeconds` with actual audio duration

This will fix the synchronization!
