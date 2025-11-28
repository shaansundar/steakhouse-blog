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
import keywordsData from './keywords.json';

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
  htmlContent = postProcessHtml(htmlContent, slug);
  
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
function postProcessHtml(html: string, currentSlug: string): string {
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
  
  // Add internal links based on keywords and other posts
  processed = addInternalLinks(processed, currentSlug);
  
  return processed;
}

/**
 * Add contextual internal links to HTML content
 * Targets 3-10 links per 1000 words using descriptive anchor text with target keywords
 */
function addInternalLinks(html: string, currentSlug: string): string {
  // Get all posts for linking opportunities
  const allPosts = getAllPosts();
  if (allPosts.length < 2) {
    return html; // Need at least 2 posts to link
  }
  
  // Filter out current post
  const otherPosts = allPosts.filter(post => post.slug !== currentSlug);
  if (otherPosts.length === 0) {
    return html;
  }
  
  // Extract text content (without HTML tags) to calculate word count
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(/\s+/).length;
  
  // Calculate target number of links (3-10 per 1000 words)
  const targetLinksPer1000 = 6; // Aim for middle of range
  const targetLinks = Math.max(3, Math.min(10, Math.floor((wordCount / 1000) * targetLinksPer1000)));
  
  // Build keyword map from keywords.json
  const allKeywords: string[] = [
    ...keywordsData.primary,
    ...keywordsData.secondary,
    ...keywordsData.technical,
    ...keywordsData.concepts,
    ...keywordsData.phrases,
  ];
  
  // Create a map of keywords to potential posts
  // Match keywords to posts based on title, tags, and slug
  const keywordToPosts = new Map<string, PostMeta[]>();
  
  allKeywords.forEach(keyword => {
    const matchingPosts = otherPosts.filter(post => {
      const searchText = `${post.title} ${post.excerpt} ${post.tags.join(' ')} ${post.slug}`.toLowerCase();
      return searchText.includes(keyword.toLowerCase());
    });
    
    if (matchingPosts.length > 0) {
      keywordToPosts.set(keyword, matchingPosts);
    }
  });
  
  // Also create a map based on post titles and tags for better matching
  const postMatchMap = new Map<string, PostMeta[]>();
  otherPosts.forEach(post => {
    // Extract key terms from post title and tags
    const titleWords = post.title.toLowerCase().split(/\s+/);
    const tagWords = post.tags.map(t => t.toLowerCase());
    const slugWords = post.slug.split('-');
    
    const allTerms = [...titleWords, ...tagWords, ...slugWords];
    allTerms.forEach(term => {
      if (term.length > 3) { // Only meaningful terms
        if (!postMatchMap.has(term)) {
          postMatchMap.set(term, []);
        }
        postMatchMap.get(term)!.push(post);
      }
    });
  });
  
  // Track links added to avoid duplicates
  const addedLinks = new Set<string>();
  let linksAdded = 0;
  
  // Find opportunities to add links in text content
  // Look for keyword mentions that aren't already links
  const linkPattern = /<a\s+[^>]*href[^>]*>[\s\S]*?<\/a>/gi;
  const existingLinks: Array<{ start: number; end: number }> = [];
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    existingLinks.push({ start: match.index, end: match.index + match[0].length });
  }
  
  // Helper to check if a position is inside an existing link
  const isInExistingLink = (pos: number): boolean => {
    return existingLinks.some(link => pos >= link.start && pos <= link.end);
  };
  
  // Sort keywords by relevance (longer phrases first, then by frequency)
  const sortedKeywords = Array.from(keywordToPosts.keys()).sort((a, b) => {
    const aPosts = keywordToPosts.get(a) || [];
    const bPosts = keywordToPosts.get(b) || [];
    if (a.length !== b.length) {
      return b.length - a.length; // Longer keywords first
    }
    return bPosts.length - aPosts.length; // More matches first
  });
  
  // Try to add links for keywords
  for (const keyword of sortedKeywords) {
    if (linksAdded >= targetLinks) break;
    
    const posts = keywordToPosts.get(keyword);
    if (!posts || posts.length === 0) continue;
    
    // Use the first matching post (could be enhanced to pick best match)
    const targetPost = posts[0];
    const linkUrl = `/blog/${targetPost.slug}`;
    const linkKey = `${keyword}:${linkUrl}`;
    
    if (addedLinks.has(linkKey)) continue;
    
    // Create a case-insensitive regex for the keyword
    // Match whole words/phrases, avoiding HTML tags and existing links
    const keywordRegex = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
    
    // Find all matches
    const matches: Array<{ index: number; length: number; text: string }> = [];
    let regexMatch;
    while ((regexMatch = keywordRegex.exec(html)) !== null) {
      const matchIndex = regexMatch.index;
      const matchLength = regexMatch[0].length;
      
      // Skip if inside an existing link or HTML tag
      if (!isInExistingLink(matchIndex)) {
        // Check if not inside an HTML tag
        const beforeMatch = html.substring(Math.max(0, matchIndex - 50), matchIndex);
        const afterMatch = html.substring(matchIndex + matchLength, Math.min(html.length, matchIndex + matchLength + 50));
        
        // Simple check: if there's a < before and > after, might be in a tag
        const lastOpenTag = beforeMatch.lastIndexOf('<');
        const lastCloseTag = beforeMatch.lastIndexOf('>');
        const nextOpenTag = afterMatch.indexOf('<');
        const nextCloseTag = afterMatch.indexOf('>');
        
        // If there's an unclosed tag before, skip
        if (lastOpenTag > lastCloseTag) {
          continue;
        }
        
        matches.push({
          index: matchIndex,
          length: matchLength,
          text: regexMatch[0],
        });
      }
    }
    
    // Add link to first match (avoid over-linking)
    if (matches.length > 0 && !addedLinks.has(linkKey)) {
      const firstMatch = matches[0];
      const beforeLink = html.substring(0, firstMatch.index);
      const matchedText = html.substring(firstMatch.index, firstMatch.index + firstMatch.length);
      const afterLink = html.substring(firstMatch.index + firstMatch.length);
      
      // Create descriptive anchor text using the keyword
      const anchorText = matchedText;
      const linkHtml = `<a href="${linkUrl}" class="internal-link" title="${targetPost.title}">${anchorText}</a>`;
      
      html = beforeLink + linkHtml + afterLink;
      addedLinks.add(linkKey);
      linksAdded++;
      
      // Update existing links positions (shift by link length difference)
      const lengthDiff = linkHtml.length - firstMatch.length;
      for (let i = 0; i < existingLinks.length; i++) {
        if (existingLinks[i].start > firstMatch.index) {
          existingLinks[i].start += lengthDiff;
          existingLinks[i].end += lengthDiff;
        }
      }
    }
  }
  
  // If we haven't reached target links, try matching based on post titles/tags
  if (linksAdded < targetLinks) {
    // Extract text nodes and look for post title/tag mentions
    for (const post of otherPosts.slice(0, Math.min(5, otherPosts.length))) {
      if (linksAdded >= targetLinks) break;
      
      // Look for key terms from post title
      const titleWords = post.title.split(/\s+/).filter(w => w.length > 4);
      for (const word of titleWords.slice(0, 2)) { // Use first 2 meaningful words
        if (linksAdded >= targetLinks) break;
        
        const wordLower = word.toLowerCase();
        const wordRegex = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
        const linkUrl = `/blog/${post.slug}`;
        const linkKey = `${wordLower}:${linkUrl}`;
        
        if (addedLinks.has(linkKey)) continue;
        
        let regexMatch;
        let found = false;
        while ((regexMatch = wordRegex.exec(html)) !== null && !found) {
          const matchIndex = regexMatch.index;
          
          if (!isInExistingLink(matchIndex)) {
            const matchedText = regexMatch[0];
            const beforeLink = html.substring(0, matchIndex);
            const afterLink = html.substring(matchIndex + matchedText.length);
            
            const linkHtml = `<a href="${linkUrl}" class="internal-link" title="${post.title}">${matchedText}</a>`;
            html = beforeLink + linkHtml + afterLink;
            
            addedLinks.add(linkKey);
            linksAdded++;
            found = true;
            
            // Update existing links positions
            const lengthDiff = linkHtml.length - matchedText.length;
            for (let i = 0; i < existingLinks.length; i++) {
              if (existingLinks[i].start > matchIndex) {
                existingLinks[i].start += lengthDiff;
                existingLinks[i].end += lengthDiff;
              }
            }
          }
        }
      }
    }
  }
  
  return html;
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

/**
 * Generate an SEO-optimized slug from a title, incorporating keywords
 * Uses keywords.json to enhance slug with target keywords
 */
export function generateSlugFromTitle(title: string): string {
  // Convert title to lowercase and split into words
  const words = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .trim()
    .split(/\s+/);
  
  // Get all keywords for matching
  const allKeywords: string[] = [
    ...keywordsData.primary,
    ...keywordsData.secondary,
    ...keywordsData.technical,
    ...keywordsData.concepts,
    ...keywordsData.phrases,
  ];
  
  // Check if any keywords match words in the title
  const matchedKeywords: string[] = [];
  const titleLower = title.toLowerCase();
  
  // Sort keywords by length (longer first) to match phrases first
  const sortedKeywords = allKeywords.sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    const keywordLower = keyword.toLowerCase();
    // Check if keyword appears in title (as whole word/phrase)
    const keywordWords = keywordLower.split('-');
    const keywordPattern = keywordWords.join('[\\s-]+');
    const regex = new RegExp(`\\b${keywordPattern}\\b`, 'i');
    
    if (regex.test(titleLower) && !matchedKeywords.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }
  
  // Build slug: use matched keywords first, then remaining title words
  const slugParts: string[] = [];
  
  // Add matched keywords (prioritize primary keywords)
  const primaryKeywords = matchedKeywords.filter(k => keywordsData.primary.includes(k));
  const secondaryKeywords = matchedKeywords.filter(k => !primaryKeywords.includes(k));
  
  slugParts.push(...primaryKeywords.slice(0, 2)); // Max 2 primary keywords
  slugParts.push(...secondaryKeywords.slice(0, 1)); // Max 1 secondary keyword
  
  // Add remaining title words that aren't already covered by keywords
  const usedWords = new Set<string>();
  matchedKeywords.forEach(kw => {
    kw.split('-').forEach(w => usedWords.add(w));
  });
  
  words.forEach(word => {
    if (!usedWords.has(word) && word.length > 2) { // Skip very short words
      slugParts.push(word);
    }
  });
  
  // Join with hyphens and limit length
  let slug = slugParts.join('-');
  
  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Limit to reasonable length (50-60 chars for SEO)
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-+$/, ''); // Remove trailing hyphen if cut mid-word
  }
  
  return slug;
}

