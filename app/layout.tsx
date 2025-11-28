import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Modern sans-serif for headings and body
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional", // Faster LCP - use system font if custom font not ready
  preload: true,
});

// Monospace for code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trysteakhouse.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Preload fonts for faster LCP
  other: {
    "font-display": "optional",
  },
  title: {
    default: "SteakHouse Blog | GEO & AI Content Optimization",
    template: "%s | SteakHouse Blog",
  },
  description:
    "Master Generative Engine Optimization (GEO) and AI-driven content strategy. Expert insights on making your content discoverable by ChatGPT, Claude, and other AI systems.",
  keywords: [
    "GEO",
    "Generative Engine Optimization",
    "AI SEO",
    "AEO",
    "Content Optimization",
    "AI Discovery",
    "ChatGPT SEO",
  ],
  authors: [{ name: "SteakHouse Team" }],
  creator: "SteakHouse",
  publisher: "SteakHouse",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "SteakHouse Blog",
    title: "SteakHouse Blog | GEO & AI Content Optimization",
    description:
      "Master Generative Engine Optimization (GEO) and AI-driven content strategy.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SteakHouse Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SteakHouse Blog | GEO & AI Content Optimization",
    description:
      "Master Generative Engine Optimization (GEO) and AI-driven content strategy.",
    images: ["/og-default.png"],
    creator: "@SteakHousedev",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": [{ url: `${SITE_URL}/feed.xml`, title: "SteakHouse Blog RSS Feed" }],
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = stored || (systemPrefersDark ? 'dark' : 'light');
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Ignore errors (e.g., localStorage disabled)
                }
              })();
            `,
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
