/**
 * Posts Library
 * 
 * Handles reading and parsing Markdown blog posts from the filesystem.
 * Posts are stored in content/posts with frontmatter metadata.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { calculateReadingTime } from './reading-time';

// Directory containing markdown posts
const postsDirectory = path.join(process.cwd(), 'content/posts');

// Post metadata interface
export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  author: string;
  readingTime: string;
  ogImage?: string;
}

// Full post interface including content
export interface Post extends PostMeta {
  content: string;
  rawContent: string;
}

/**
 * Extract slug from filename
 * Filename format: YYYY-MM-DD--slug.md
 */
function extractSlugFromFilename(filename: string): string {
  // Remove .md extension
  const withoutExt = filename.replace(/\.md$/, '');
  
  // Check for YYYY-MM-DD-- prefix and extract slug
  const match = withoutExt.match(/^\d{4}-\d{2}-\d{2}--(.+)$/);
  if (match) {
    return match[1];
  }
  
  // Fallback to full filename without extension
  return withoutExt;
}

/**
 * Get all post slugs for routing
 */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const filenames = fs.readdirSync(postsDirectory);
  return filenames
    .filter((name) => name.endsWith('.md'))
    .map((name) => extractSlugFromFilename(name));
}

/**
 * Get all posts with metadata, sorted by publishedAt descending
 */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const filenames = fs.readdirSync(postsDirectory);
  
  const posts = filenames
    .filter((name) => name.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Derive slug from frontmatter or filename
      const slug = data.slug || extractSlugFromFilename(filename);
      
      // Calculate reading time if not provided
      const readingTime = data.readingTime || calculateReadingTime(content);
      
      return {
        slug,
        title: data.title || 'Untitled',
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        author: data.author || 'SteakHouse Team',
        readingTime,
        ogImage: data.ogImage,
      } as PostMeta;
    })
    // Sort by publishedAt descending (newest first)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return posts;
}

/**
 * Get a single post by slug with full content rendered as HTML
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }
  
  const filenames = fs.readdirSync(postsDirectory);
  
  // Find the file that matches this slug
  const filename = filenames.find((name) => {
    if (!name.endsWith('.md')) return false;
    const fileSlug = extractSlugFromFilename(name);
    return fileSlug === slug;
  });
  
  if (!filename) {
    return null;
  }
  
  const filePath = path.join(postsDirectory, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Process markdown to HTML with GitHub-flavored markdown support
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { 
      sanitize: false, // We trust our own content
    })
    .process(content);
  
  let htmlContent = processedContent.toString();
  
  // Post-process HTML to add classes and attributes
  htmlContent = postProcessHtml(htmlContent);
  
  // Calculate reading time if not provided
  const readingTime = data.readingTime || calculateReadingTime(content);
  
  return {
    slug: data.slug || slug,
    title: data.title || 'Untitled',
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    publishedAt: data.publishedAt || new Date().toISOString(),
    updatedAt: data.updatedAt,
    author: data.author || 'SteakHouse Team',
    readingTime,
    ogImage: data.ogImage,
    content: htmlContent,
    rawContent: content,
  };
}

/**
 * Post-process HTML to enhance semantics and SEO
 */
function postProcessHtml(html: string): string {
  let processed = html;
  
  // Remove H1 tags from content (page component renders H1 separately to avoid duplicates)
  // This is important for SEO: only one H1 per page
  processed = processed.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/gi, '');
  
  // Add target="_blank" and rel="noopener noreferrer" to external links
  processed = processed.replace(
    /<a href="(https?:\/\/[^"]+)">/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">'
  );
  
  // Wrap TL;DR sections
  processed = processed.replace(
    /<p><strong>TL;DR:?<\/strong>(.+?)<\/p>/gi,
    '<div class="tldr"><p><strong>TL;DR:</strong>$1</p></div>'
  );
  
  // Alternative TL;DR format: ## TL;DR or ### TL;DR
  processed = processed.replace(
    /<h[23]>TL;DR:?<\/h[23]>\s*<p>(.+?)<\/p>/gi,
    '<div class="tldr"><p><strong>TL;DR:</strong> $1</p></div>'
  );
  
  // Add semantic markup to FAQ sections
  // Wrap FAQ section (H2 "Frequently Asked Questions" and following content) in a section
  processed = processed.replace(
    /(<h2[^>]*>Frequently\s+Asked\s+Questions[^<]*<\/h2>)([\s\S]*?)(?=<h2|$)/gi,
    (match, h2Tag, content) => {
      // Add id to the H2 for aria-labelledby
      const h2WithId = h2Tag.replace(/<h2([^>]*)>/, '<h2$1 id="faq-heading">');
      return `<section aria-labelledby="faq-heading">${h2WithId}${content}</section>`;
    }
  );
  
  // Ensure FAQ headings have proper IDs for anchor links
  processed = processed.replace(
    /<h3[^>]*>(.+?)<\/h3>/g,
    (match, content) => {
      const id = content
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return `<h3 id="${id}">${content}</h3>`;
    }
  );
  
  return processed;
}

/**
 * Extract FAQs from markdown content
 * Looks for FAQ sections with H3 headings as questions and following paragraphs as answers
 */
export function extractFAQs(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  
  // Look for FAQ section - typically after "Frequently Asked Questions" or "FAQ" heading
  // Find the FAQ section start index
  const faqHeadingPattern = /##\s+(?:Frequently\s+Asked\s+Questions|FAQ|Questions?)/i;
  const faqHeadingIndex = content.search(faqHeadingPattern);
  
  if (faqHeadingIndex === -1) {
    return faqs;
  }
  
  // Extract content from after the FAQ heading until next H2 or end of file
  const afterHeading = content.substring(faqHeadingIndex);
  // Find the end of the heading line
  const headingEndIndex = afterHeading.indexOf('\n');
  const faqStartIndex = faqHeadingIndex + headingEndIndex + 1;
  
  // Find next H2 heading (but not H3 which is ###)
  const remainingContent = content.substring(faqStartIndex);
  const nextH2Pattern = /\n##\s+[^#]/; // H2 that's not followed by another #
  const nextH2Match = remainingContent.match(nextH2Pattern);
  
  const faqContent = nextH2Match && nextH2Match.index !== undefined
    ? remainingContent.substring(0, nextH2Match.index).trim()
    : remainingContent.trim();
  
  // Extract H3 headings (questions) followed by content (answers)
  // Pattern: ### Question\n\nAnswer content (until next ###, ##, or end)
  // Use a simpler approach: split by H3 headings
  const lines = faqContent.split('\n');
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h3Match = line.match(/^###\s+(.+)$/);
    
    if (h3Match) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswerLines.length > 0) {
        const answer = currentAnswerLines.join(' ').trim();
        if (answer.length > 10) {
          // Clean up answer
          const cleanAnswer = answer
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          if (cleanAnswer.length > 10) {
            faqs.push({
              question: currentQuestion,
              answer: cleanAnswer,
            });
          }
        }
      }
      
      // Start new question
      currentQuestion = h3Match[1].trim();
      currentAnswerLines = [];
    } else if (currentQuestion && line.trim()) {
      // This is part of the answer (skip empty lines)
      const trimmedLine = line.trim();
      if (trimmedLine) {
        currentAnswerLines.push(trimmedLine);
      }
    }
  }
  
  // Don't forget the last Q&A pair
  if (currentQuestion && currentAnswerLines.length > 0) {
    const answer = currentAnswerLines.join(' ').trim();
    if (answer.length > 10) {
      const cleanAnswer = answer
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanAnswer.length > 10) {
        faqs.push({
          question: currentQuestion,
          answer: cleanAnswer,
        });
      }
    }
  }
  
  return faqs;
}

/**
 * Extract headings from markdown content for table of contents
 */
export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  const idCounts: Record<string, number> = {};
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    let baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Handle empty IDs (e.g., headings with only special characters)
    if (!baseId) {
      baseId = `heading-${headings.length}`;
    }
    
    // Ensure unique IDs by appending a counter if duplicate
    const count = idCounts[baseId] || 0;
    idCounts[baseId] = count + 1;
    const id = count > 0 ? `${baseId}-${count}` : baseId;
    
    headings.push({ level, text, id });
  }
  
  return headings;
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): PostMeta[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => 
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

