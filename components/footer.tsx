import Link from "next/link";
import { Flame } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  product: [
    { href: "https://trysteakhouse.com", label: "SteakHouse Platform" },
    { href: "/blog", label: "Blog" },
    { href: "#", label: "Documentation" },
    { href: "#", label: "Changelog" },
  ],
  resources: [
    { href: "/blog/what-is-generative-engine-optimization", label: "What is GEO?" },
    { href: "/blog/semantic-html-for-ai-crawlers", label: "Semantic HTML Guide" },
    { href: "/blog/structured-data-for-ai-discoverability", label: "Structured Data" },
  ],
  company: [
    { href: "#about", label: "About" },
    { href: "#", label: "Contact" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex flex-col items-estart justify-center group leading-tight mb-4">
              <span className="text-2xl font-bold">
                🥩 SteakHouse
              </span>
              <span className="text-xs text-muted-foreground">
                by NimbusHQ
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Optimize your content for AI discovery. Master GEO, AEO, and make 
              your content visible to ChatGPT, Claude, and other AI systems.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SteakHouse. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/SteakHousedev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com/SteakHouse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

