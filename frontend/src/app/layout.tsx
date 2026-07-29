import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { MouseGlow } from "@/components/ui/MouseGlow";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://onlygoats-ff.com"),
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  title: {
    default: "Only Goats FF — Free Fire Tournament",
    template: "%s | Only Goats FF",
  },
  description:
    "Compete in the most prestigious Free Fire tournament. Battle, survive, and become the champion. Register your squad now and win cash prizes.",
  keywords: [
    "Free Fire tournament",
    "FF tournament",
    "esports",
    "gaming tournament",
    "Free Fire competition",
    "squad battle",
    "cash prize tournament",
    "Only Goats FF",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://onlygoats-ff.com",
    siteName: "Only Goats FF",
    title: "Only Goats FF — Free Fire Tournament",
    description:
      "Compete in the most prestigious Free Fire tournament. Battle, survive, and become the champion.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Only Goats FF Tournament",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Only Goats FF — Free Fire Tournament",
    description: "Register your squad and compete for ₹1000 prize pool.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Iceland&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsEvent",
              name: "Only Goats FF Tournament",
              description:
                "Elite Free Fire tournament with ₹1000 prize pool. Battle, survive, become the champion.",
              sport: "Free Fire",
              organizer: {
                "@type": "Organization",
                name: "Only Goats FF",
                url: "https://onlygoats-ff.com",
              },
              offers: {
                "@type": "Offer",
                price: "100",
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          <LoadingScreen />
          <CustomCursor />
          <MouseGlow />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#111",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 18px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              },
              success: {
                iconTheme: { primary: "#e50914", secondary: "#fff" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
