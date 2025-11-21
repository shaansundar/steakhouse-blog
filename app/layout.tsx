import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { generateWebsiteSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: {
    default: "GEO Optimized Blog",
    template: "%s | GEO Optimized Blog",
  },
  description: "A blog optimized for Generative AI Engine Optimization (GEO) and classic SEO",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://steakhouse-test.nimbushq.xyz'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GEO Optimized Blog",
    title: "GEO Optimized Blog",
    description: "A blog optimized for Generative AI Engine Optimization (GEO) and classic SEO",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEO Optimized Blog",
    description: "A blog optimized for Generative AI Engine Optimization (GEO) and classic SEO",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-200 bg-white" role="banner">
          <nav className="max-w-4xl mx-auto px-4 py-6" aria-label="Main navigation" role="navigation">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                aria-label="Go to homepage"
              >
                🥩 Steakhouse
              </Link>
              <ul className="flex gap-6" role="list">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        <main className="flex-grow" role="main">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-gray-50 mt-16" role="contentinfo">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                © {new Date().getFullYear()} GEO Optimized Blog. Built for discoverability by humans and AI.
              </p>
              <p className="text-sm">
                Optimized for{" "}
                <span className="font-semibold">Generative AI Engine Optimization (GEO)</span>
                {" "}and traditional SEO.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

