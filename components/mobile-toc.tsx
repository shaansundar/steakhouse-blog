"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTree } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface MobileTOCProps {
  headings: Heading[];
}

export function MobileTOC({ headings }: MobileTOCProps) {
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tocRef.current) return;

    // Find the first TL;DR section in the article
    const proseElement = document.querySelector(".prose");
    if (!proseElement) return;

    const tldrElement = proseElement.querySelector(".tldr");
    if (!tldrElement) {
      // If no TL;DR found, insert TOC at the beginning of the article body
      proseElement.insertBefore(tocRef.current, proseElement.firstChild);
      return;
    }

    // Insert TOC right after the TL;DR section
    const tldrParent = tldrElement.parentElement;
    if (tldrParent) {
      // Find the next sibling after TL;DR (could be a paragraph, heading, etc.)
      const nextSibling = tldrElement.nextElementSibling;
      if (nextSibling) {
        tldrParent.insertBefore(tocRef.current, nextSibling);
      } else {
        tldrParent.appendChild(tocRef.current);
      }
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <div ref={tocRef} className="lg:hidden my-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTree className="h-5 w-5 text-primary" />
            Table of Contents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <nav aria-label="Table of contents">
            <ul className="space-y-2 text-sm">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{
                    paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                  }}
                >
                  <a
                    href={`#${heading.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors block py-1"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}

