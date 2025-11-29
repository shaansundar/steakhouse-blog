"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  answerHtml?: string;
}

interface PostFAQProps {
  faqs: FAQ[];
  title?: string;
}

export function PostFAQ({ faqs, title = "Frequently Asked Questions" }: PostFAQProps) {
  // Initialize with all FAQs open by default
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    new Set(faqs?.map((_, index) => index) || [])
  );

  const toggleFAQ = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <Card id="frequently-asked-questions">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left py-3 flex items-start justify-between gap-4 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors group scroll-mt-24"
                aria-expanded={openIndexes.has(index)}
                aria-controls={`faq-answer-${index}`}
                id={(() => {
                  const questionSlug = faq.question
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                  return questionSlug || `faq-${index}`;
                })()}
              >
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors flex-1">
                  {faq.question}
                </h3>
                {openIndexes.has(index) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </button>
              {openIndexes.has(index) && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-2 pb-3 text-xs text-muted-foreground leading-relaxed prose prose-xs max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: faq.answerHtml || faq.answer 
                  }}
                />
              )}
              {index < faqs.length - 1 && <Separator className="my-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

