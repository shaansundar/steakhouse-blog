"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface PostFAQProps {
  faqs: FAQ[];
  title?: string;
}

export function PostFAQ({ faqs, title = "Frequently Asked Questions" }: PostFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <Card>
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
                className="w-full text-left py-3 flex items-start justify-between gap-4 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors group"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors flex-1">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </button>
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-2 pb-3 text-sm text-muted-foreground leading-relaxed"
                >
                  {faq.answer}
                </div>
              )}
              {index < faqs.length - 1 && <Separator className="my-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

