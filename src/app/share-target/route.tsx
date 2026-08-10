export const runtime = "nodejs";

/**
 * POST /share-target
 *
 * Handles everything Android's Share sheet can send us:
 *  - Shared text (SMS/WhatsApp message) -> title/text/url form fields
 *  - Shared photo (screenshot from Gallery) -> "photo" file field
 *  - Shared audio (call recording from Files/Google Files) -> "recording" file field
 *
 * Files can't be handed to the browser via a normal redirect (too big for a
 * URL), so for files we return a tiny HTML page that stores the file as a
 * base64 data URL in sessionStorage, then does a client-side redirect into
 * /check. The check page picks it up from sessionStorage on load.
 *
 * NOTE: Vercel serverless functions have a request body size limit
 * (~4.5MB on the Hobby plan). Screenshots are almost always fine; very
 * long call recordings could hit this limit — if that happens in testing,
 * we can add compression or a duration cap.
 */

function buildRedirectPage(sessionKey: string, dataUrl: string, target: string): string {
  const safeKey = JSON.stringify(sessionKey);
  const safeData = JSON.stringify(dataUrl);
  const safeTarget = JSON.stringify(target);
  return `<!DOCTYPE html>
<html>
  <body style="background:#0b0b0f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
    <p>Opening Rakshak AI...</p>
    <script>
      try { sessionStorage.setItem(${safeKey}, ${safeData}); } catch (e) {}
      window.location.replace(${safeTarget});
    </script>
  </body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const text = formData.get("text");
    const url = formData.get("url");
    const photo = formData.get("photo") as File | null;
    const recording = formData.get("recording") as File | null;

    // Case 1: a screenshot was shared from Gallery
    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const dataUrl = `data:${photo.type};base64,${buffer.toString("base64")}`;
      const html = buildRedirectPage(
        "rakshak_shared_photo",
        dataUrl,
        "/check?tab=screenshot&fromShare=1"
      );
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    // Case 2: a call recording was shared from Files/Google Files
    if (recording && recording.size > 0) {
      const buffer = Buffer.from(await recording.arrayBuffer());
      const dataUrl = `data:${recording.type};base64,${buffer.toString("base64")}`;
      const html = buildRedirectPage(
        "rakshak_shared_recording",
        dataUrl,
        "/check?tab=call&mode=recording&fromShare=1"
      );
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    // Case 3: plain text was shared (SMS/WhatsApp message) — same as before
    const combined = [title, text, url].filter(Boolean).join("\n").trim();
    const target = combined
      ? `/check?message=${encodeURIComponent(String(combined))}&autofill=1`
      : "/check";
    return Response.redirect(new URL(target, request.url), 303);
  } catch (err) {
    console.error("[RakshakAI] share-target POST failed:", err);
    return Response.redirect(new URL("/check", request.url), 303);
  }
}