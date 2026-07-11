import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/ChatAssistant";

export const metadata: Metadata = {
  title: "Rakshak AI — Financial Safety for Rural India",
  description:
    "Free, AI-powered scam detection and financial-literacy platform. Check suspicious SMS, UPI requests, links and calls in your own language.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A3C6E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang starts as "en"; I18nProvider updates document.documentElement.lang
    // client-side once the saved language preference loads (see lib/i18n.tsx).
    <html lang="en">
      <body className="min-h-screen bg-canvas antialiased">
        <I18nProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatAssistant />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
