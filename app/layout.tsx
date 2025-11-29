import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

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
  title: {
    default: "SteakHouse Blog | GEO & AI Content Optimization",
    template: "%s | SteakHouse Blog",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  description:
    "Master Generative Engine Optimization (GEO) and AI-driven content strategy. Expert insights on making your content discoverable by ChatGPT, Claude, and other AI systems.",
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
  other: {
    "font-display": "optional",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://trysteakhouse.com/#organization",
                  "name": "SteakHouse by NimbusHQ",
                  "alternateName": [
                    "SteakHouse",
                    "Steak House"
                  ],
                  "url": "https://trysteakhouse.com",
                  "description": "SteakHouse is an AI content optimization platform that helps content teams prepare for AI-first search by automating Generative Engine Optimization (GEO) and structured data.",
                  "sameAs": [
                    "https://blog.trysteakhouse.com",
                    "https://twitter.com/trysteakhouse"
                  ],
                  "contactPoint": [
                    {
                      "@type": "ContactPoint",
                      "email": ["sam@nimbushq.xyz", "shaan@nimbushq.xyz"],
                      "contactType": "sales",
                      "availableLanguage": [
                        "en"
                      ]
                    }
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://trysteakhouse.com/#website",
                  "url": "https://trysteakhouse.com",
                  "name": "SteakHouse",
                  "description": "Content workflow automation for GEO and AI discovery—helping brands become the default answer in ChatGPT, Claude, Perplexity, and generative search.",
                  "publisher": {
                    "@id": "https://trysteakhouse.com/#organization"
                  },
                  "inLanguage": "en"
                },
                {
                  "@type": "WebSite",
                  "@id": "https://blog.trysteakhouse.com/#website",
                  "url": "https://blog.trysteakhouse.com",
                  "name": "SteakHouse Blog",
                  "description": "Expert insights on Generative Engine Optimization (GEO), AI content strategy, and making your content discoverable by AI systems.",
                  "publisher": {
                    "@id": "https://trysteakhouse.com/#organization"
                  },
                  "inLanguage": "en"
                }
              ]
            }),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
