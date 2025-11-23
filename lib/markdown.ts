import { addExternalLinks } from './external-links';

/**
 * Process HTML content for blog posts
 * Adds IDs to step headings for deep linking and processes external links
 */
export function processHtml(html: string, addCitations: boolean = true): string {
  let processedHtml = html;

  // Add IDs to step headings for deep linking (h3 and h4 with "Step X:" pattern)
  let stepCounter = 0;
  
  // Process h3 headings
  processedHtml = processedHtml.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (match, text) => {
    const stepMatch = text.match(/^Step\s+(\d+)[:\s]+(.+)$/i);
    if (stepMatch) {
      stepCounter++;
      const stepId = `step-${stepCounter}`;
      return `<h3 id="${stepId}">${text}</h3>`;
    }
    return match;
  });

  // Process h4 headings
  processedHtml = processedHtml.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (match, text) => {
    const stepMatch = text.match(/^Step\s+(\d+)[:\s]+(.+)$/i);
    if (stepMatch) {
      stepCounter++;
      const stepId = `step-${stepCounter}`;
      return `<h4 id="${stepId}">${text}</h4>`;
    }
    return match;
  });

  // Add external links for citations (if enabled)
  if (addCitations) {
    processedHtml = addExternalLinks(processedHtml);
  }

  return processedHtml;
}

/**
 * @deprecated Use processHtml instead. This function is kept for backward compatibility.
 */
export function markdownToHtml(markdown: string, addCitations: boolean = true): string {
  return processHtml(markdown, addCitations);
}

