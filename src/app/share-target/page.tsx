import { redirect } from "next/navigation";

/**
 * GET /share-target?title=...&text=...&url=...
 *
 * Android calls this URL when the user taps "Rakshak AI" in the native
 * Share sheet (from WhatsApp, SMS, Gmail, etc). We take whatever text was
 * shared and redirect into the existing /check page, pre-filled and ready
 * to analyze — matching how these scam messages actually arrive in real life.
 *
 * NOTE: some apps share the message in `text`, others put a link in `url`,
 * and some (like WhatsApp forwarding a plain message) put everything in
 * `title`. We combine all three to make sure nothing gets lost.
 */

export default function ShareTargetPage({
  searchParams,
}: {
  searchParams: { title?: string; text?: string; url?: string };
}) {
  const combined = [searchParams.title, searchParams.text, searchParams.url]
    .filter(Boolean)
    .join("\n")
    .trim();

  // Adjust "/check" and the query param name ("message") to match whatever
  // your existing check page actually expects.
  const target = combined
    ? `/check?message=${encodeURIComponent(combined)}&autofill=1`
    : "/check";

  redirect(target);
}