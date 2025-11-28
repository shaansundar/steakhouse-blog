"use client";

interface MarkdownContentProps {
  html: string;
  className?: string;
}

export function MarkdownContent({ html, className }: MarkdownContentProps) {
  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

