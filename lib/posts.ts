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

// Author interface
export interface Author {
  name: string;
  url?: string;
}

// FAQ interface
export interface FAQ {
  question: string;
  answer: string;
  answerHtml?: string; // Processed HTML version of answer
}

// Post metadata interface
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  author: Author | string; // Support both object and string for backward compatibility
  readingTime: string;
  ogImage?: string;
  faq?: FAQ[]; // FAQs from frontmatter
}

// Full post interface including content
export interface Post extends PostMeta {
  content: string;
  rawContent: string;
}

/**
 * Extract slug from filename
 * Filename format: slug.md (no date prefix)
 */
function extractSlugFromFilename(filename: string): string {
  // Remove .md extension
  return filename.replace(/\.md$/, '');
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
 * Normalize date string to ISO format
 * Handles both "YYYY-MM-DD" and ISO string formats
 */
function normalizeDate(dateStr: string | undefined): string {
  if (!dateStr) {
    return new Date().toISOString();
  }
  
  // If already ISO format, return as-is
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    return dateStr;
  }
  
  // If "YYYY-MM-DD" format, convert to ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00Z').toISOString();
  }
  
  // Try to parse as date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * Normalize author to Author object
 * Handles both object and string formats for backward compatibility
 */
function normalizeAuthor(author: any): Author | string {
  if (!author) {
    return 'SteakHouse Team';
  }
  
  // If already an object with name, return as-is
  if (typeof author === 'object' && author.name) {
    return author as Author;
  }
  
  // If string, return as-is (backward compatibility)
  if (typeof author === 'string') {
    return author;
  }
  
  return 'SteakHouse Team';
}

/**
 * Helper function to safely get author name as string
 * Use this when rendering author in React components
 */
export function getAuthorName(author: Author | string): string {
  return typeof author === 'string' ? author : author.name;
}

/**
 * Check if author is a Steakhouse agent/automated author
 */
export function isSteakhouseAgent(author: Author | string): boolean {
  const authorName = getAuthorName(author).toLowerCase();
  return (
    authorName.includes('steakhouse') ||
    authorName.includes('steak house') ||
    authorName === 'steakhouse agent' ||
    authorName === 'steakhouse team'
  );
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
        description: data.description || data.excerpt || '', // Support both description and excerpt
        tags: data.tags || [],
        publishedAt: normalizeDate(data.publishedAt),
        updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
        author: normalizeAuthor(data.author),
        readingTime,
        ogImage: data.ogImage,
        faq: data.faq || undefined, // FAQs from frontmatter
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
  // Check both filename slug and frontmatter slug
  let filename: string | undefined;
  
  for (const name of filenames) {
    if (!name.endsWith('.md')) continue;
    
    // First check if filename slug matches
    const fileSlug = extractSlugFromFilename(name);
    if (fileSlug === slug) {
      filename = name;
      break;
    }
    
    // Also check frontmatter slug
    try {
      const filePath = path.join(postsDirectory, name);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      const frontmatterSlug = data.slug;
      
      if (frontmatterSlug === slug) {
        filename = name;
        break;
      }
    } catch (error) {
      // Skip files that can't be parsed
      continue;
    }
  }
  
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
    description: data.description || data.excerpt || '', // Support both description and excerpt
    tags: data.tags || [],
    publishedAt: normalizeDate(data.publishedAt),
    updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
    author: normalizeAuthor(data.author),
    readingTime,
    ogImage: data.ogImage,
    faq: data.faq || undefined, // FAQs from frontmatter
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
  
  // Wrap TL;DR sections - handle various formats and case variations
  // Format 1: <p><strong>TL;DR:</strong> or <p><strong>Tl;Dr:</strong> etc. followed by content</p>
  // This handles the entire paragraph containing TL;DR
  processed = processed.replace(
    /<p><strong>(Tl?;?Dr?:?\s*:?\s*)<\/strong>([\s\S]*?)<\/p>/gi,
    (match, tldrLabel, content) => {
      // Only wrap if not already wrapped
      if (!match.includes('class="tldr"')) {
        return `<div class="tldr"><p><strong>TL;DR:</strong>${content}</p></div>`;
      }
      return match;
    }
  );
  
  // Format 2: ## TL;DR or ### TL;DR followed by paragraph
  processed = processed.replace(
    /<h[23]>(Tl?;?Dr?:?\s*:?\s*)<\/h[23]>\s*<p>([\s\S]*?)<\/p>/gi,
    '<div class="tldr"><p><strong>TL;DR:</strong> $2</p></div>'
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
  
  // Add IDs to all headings (H2, H3, H4) for anchor links
  // This must match the ID generation logic in extractHeadings()
  const idCounts: Record<string, number> = {};
  
  // Process H2 headings
  processed = processed.replace(
    /<h2([^>]*)>(.+?)<\/h2>/g,
    (match, attrs, content) => {
      // Skip if already has an id attribute
      if (/id\s*=/i.test(attrs)) {
        return match;
      }
      
      // Extract text content (remove HTML tags)
      const textContent = content.replace(/<[^>]+>/g, '').trim();
      let baseId = textContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Handle empty IDs
      if (!baseId) {
        baseId = `heading-${Object.keys(idCounts).length}`;
      }
      
      // Ensure unique IDs by appending a counter if duplicate
      const count = idCounts[baseId] || 0;
      idCounts[baseId] = count + 1;
      const id = count > 0 ? `${baseId}-${count}` : baseId;
      
      return `<h2${attrs} id="${id}">${content}</h2>`;
    }
  );
  
  // Process H3 headings
  processed = processed.replace(
    /<h3([^>]*)>(.+?)<\/h3>/g,
    (match, attrs, content) => {
      // Skip if already has an id attribute
      if (/id\s*=/i.test(attrs)) {
        return match;
      }
      
      // Extract text content (remove HTML tags)
      const textContent = content.replace(/<[^>]+>/g, '').trim();
      let baseId = textContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Handle empty IDs
      if (!baseId) {
        baseId = `heading-${Object.keys(idCounts).length}`;
      }
      
      // Ensure unique IDs by appending a counter if duplicate
      const count = idCounts[baseId] || 0;
      idCounts[baseId] = count + 1;
      const id = count > 0 ? `${baseId}-${count}` : baseId;
      
      return `<h3${attrs} id="${id}">${content}</h3>`;
    }
  );
  
  // Process H4 headings
  processed = processed.replace(
    /<h4([^>]*)>(.+?)<\/h4>/g,
    (match, attrs, content) => {
      // Skip if already has an id attribute
      if (/id\s*=/i.test(attrs)) {
        return match;
      }
      
      // Extract text content (remove HTML tags)
      const textContent = content.replace(/<[^>]+>/g, '').trim();
      let baseId = textContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Handle empty IDs
      if (!baseId) {
        baseId = `heading-${Object.keys(idCounts).length}`;
      }
      
      // Ensure unique IDs by appending a counter if duplicate
      const count = idCounts[baseId] || 0;
      idCounts[baseId] = count + 1;
      const id = count > 0 ? `${baseId}-${count}` : baseId;
      
      return `<h4${attrs} id="${id}">${content}</h4>`;
    }
  );
  
  // Process tables to add shadcn table classes
  processed = processTables(processed);
  
  // Add internal links based on keywords and other posts
  processed = addInternalLinks(processed, currentSlug);
  
  return processed;
}

/**
 * Process HTML tables to add shadcn table styling
 */
function processTables(html: string): string {
  // Match table elements and add shadcn classes
  let processed = html;
  
  // Wrap tables in a container with overflow handling
  processed = processed.replace(
    /<table([^>]*)>/g,
    '<div class="my-6 overflow-x-auto"><table$1 class="w-full caption-bottom text-sm border-collapse">'
  );
  
  // Close the wrapper div after table
  processed = processed.replace(/<\/table>/g, '</table></div>');
  
  // Style table header
  processed = processed.replace(
    /<thead([^>]*)>/g,
    '<thead$1 class="[&_tr]:border-b">'
  );
  
  // Style table body
  processed = processed.replace(
    /<tbody([^>]*)>/g,
    '<tbody$1 class="[&_tr:last-child]:border-0">'
  );
  
  // Style table footer
  processed = processed.replace(
    /<tfoot([^>]*)>/g,
    '<tfoot$1 class="border-t bg-muted/50 font-medium [&>tr]:last:border-b-0">'
  );
  
  // Style table rows
  processed = processed.replace(
    /<tr([^>]*)>/g,
    '<tr$1 class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">'
  );
  
  // Style table header cells
  processed = processed.replace(
    /<th([^>]*)>/g,
    '<th$1 class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">'
  );
  
  // Style table data cells
  processed = processed.replace(
    /<td([^>]*)>/g,
    '<td$1 class="p-4 align-middle [&:has([role=checkbox])]:pr-0">'
  );
  
  return processed;
}

/**
 * Add contextual internal links to HTML content
 * Targets 3-10 links per 1000 words using descriptive anchor text with target keywords
 * Excludes TL;DR sections and other protected content
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
  
  // Extract TL;DR sections and other protected content to exclude from linking
  const tldrSections: Array<{ start: number; end: number; content: string }> = [];
  const tldrRegex = /<div class="tldr">[\s\S]*?<\/div>/gi;
  let tldrMatch;
  while ((tldrMatch = tldrRegex.exec(html)) !== null) {
    tldrSections.push({
      start: tldrMatch.index,
      end: tldrMatch.index + tldrMatch[0].length,
      content: tldrMatch[0],
    });
  }
  
  // Extract heading sections (h1-h6) to exclude from linking
  const headingSections: Array<{ start: number; end: number; content: string }> = [];
  const headingRegex = /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    headingSections.push({
      start: headingMatch.index,
      end: headingMatch.index + headingMatch[0].length,
      content: headingMatch[0],
    });
  }
  
  // Helper to check if a position is inside a TL;DR section
  const isInTldrSection = (pos: number): boolean => {
    return tldrSections.some(section => pos >= section.start && pos <= section.end);
  };
  
  // Helper to check if a position is inside a heading
  const isInHeading = (pos: number): boolean => {
    return headingSections.some(section => pos >= section.start && pos <= section.end);
  };
  
  // Extract text content (without HTML tags) to calculate word count
  // Exclude TL;DR sections and headings from word count
  let textContent = html;
  tldrSections.forEach(section => {
    textContent = textContent.replace(section.content, ' ');
  });
  headingSections.forEach(section => {
    textContent = textContent.replace(section.content, ' ');
  });
  textContent = textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
    // Skip slug-like keywords (long hyphenated patterns) from being matched
    if (keyword.includes('-') && keyword.split('-').length > 3) {
      return; // Skip very long hyphenated keywords that look like slugs
    }
    
    const matchingPosts = otherPosts.filter(post => {
      // Don't match against slugs - they're too specific and cause false matches
      const searchText = `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase();
      const keywordLower = keyword.toLowerCase();
      return searchText.includes(keywordLower);
    });
    
    if (matchingPosts.length > 0) {
      keywordToPosts.set(keyword, matchingPosts);
    }
  });
  
  // Also create a map based on post titles and tags for better matching
  const postMatchMap = new Map<string, PostMeta[]>();
  otherPosts.forEach(post => {
    // Extract key terms from post title and tags (but NOT slugs - they're too specific)
    const titleWords = post.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const tagWords = post.tags.map(t => t.toLowerCase()).filter(t => t.length > 3);
    
    // Only use meaningful words from title, not the full slug
    const allTerms = [...titleWords, ...tagWords];
    allTerms.forEach(term => {
      // Skip slug-like patterns (long hyphenated terms)
      if (term.includes('-') && term.split('-').length > 2) {
        return;
      }
      
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
  
  // Also track TL;DR sections and headings as protected areas
  const protectedSections = [
    ...existingLinks, 
    ...tldrSections.map(s => ({ start: s.start, end: s.end })),
    ...headingSections.map(s => ({ start: s.start, end: s.end }))
  ];
  
  // Helper to check if a position is inside an existing link or protected section
  const isInExistingLink = (pos: number): boolean => {
    return existingLinks.some(link => pos >= link.start && pos <= link.end);
  };
  
  // Helper to check if a position is inside a protected section (link, TL;DR, or heading)
  const isInProtectedSection = (pos: number): boolean => {
    return protectedSections.some(section => pos >= section.start && pos <= section.end);
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
    // Escape special regex characters in keyword
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundaries but handle hyphens in keywords
    const keywordPattern = keyword.includes('-') 
      ? `(?:^|[^\\w-])(${escapedKeyword})(?=[^\\w-]|$)` 
      : `\\b(${escapedKeyword})\\b`;
    const keywordRegex = new RegExp(keywordPattern, 'gi');
    
    // Find all matches
    const matches: Array<{ index: number; length: number; text: string; fullMatch: string }> = [];
    let regexMatch;
    let lastIndex = 0;
    
    // Reset regex lastIndex to avoid infinite loops
    keywordRegex.lastIndex = 0;
    
    while ((regexMatch = keywordRegex.exec(html)) !== null) {
      // Prevent infinite loops
      if (regexMatch.index === lastIndex) {
        break;
      }
      lastIndex = regexMatch.index;
      
      const matchIndex = regexMatch.index + (regexMatch[1] ? regexMatch[0].indexOf(regexMatch[1]) : 0);
      const matchLength = regexMatch[1] ? regexMatch[1].length : regexMatch[0].length;
      const matchedText = regexMatch[1] || regexMatch[0];
      
      // Skip if inside an existing link, HTML tag, TL;DR section, or heading
      if (!isInExistingLink(matchIndex) && !isInTldrSection(matchIndex) && !isInHeading(matchIndex)) {
        // Better check: ensure we're not inside any HTML tag or attribute
        // Get a larger context to properly detect HTML structure
        const contextStart = Math.max(0, matchIndex - 500);
        const contextEnd = Math.min(html.length, matchIndex + matchLength + 500);
        const context = html.substring(contextStart, contextEnd);
        const relativeIndex = matchIndex - contextStart;
        
        // Check if we're inside an HTML tag by finding the last < and > before this position
        const beforeContext = context.substring(0, relativeIndex);
        const lastOpenTag = beforeContext.lastIndexOf('<');
        const lastCloseTag = beforeContext.lastIndexOf('>');
        
        // If there's an unclosed tag before us, we're inside a tag
        if (lastOpenTag > lastCloseTag) {
          // Check if we're inside an attribute (between quotes)
          const tagContent = beforeContext.substring(lastOpenTag);
          const afterOpenTag = tagContent.substring(1);
          
          // Count quotes to see if we're inside an attribute value
          const quoteMatches = afterOpenTag.match(/"/g);
          if (quoteMatches && quoteMatches.length % 2 !== 0) {
            // Odd number of quotes means we're inside an attribute value
            continue;
          }
          
          // We're inside a tag but not in an attribute - still skip
          continue;
        }
        
        // Check if we're immediately after a tag opening (within tag name/attributes)
        const afterContext = context.substring(relativeIndex + matchLength);
        const nextOpenTag = afterContext.indexOf('<');
        const nextCloseTag = afterContext.indexOf('>');
        
        // If there's a > before the next <, we're safe
        // But if < comes before >, we might be inside a tag
        if (nextOpenTag !== -1 && (nextCloseTag === -1 || nextOpenTag < nextCloseTag)) {
          // Check if the < is part of a closing tag or if we're still in an opening tag
          const potentialTag = afterContext.substring(nextOpenTag, Math.min(nextOpenTag + 50, afterContext.length));
          if (!potentialTag.startsWith('</')) {
            // This might be a new opening tag, but let's be safe and check
            // If we're between < and >, skip
            continue;
          }
        }
        
        // Ensure we're matching actual text content, not HTML
        const textBefore = html.substring(Math.max(0, matchIndex - 5), matchIndex);
        const textAfter = html.substring(matchIndex + matchLength, Math.min(html.length, matchIndex + matchLength + 5));
        
        // Skip if immediately preceded or followed by HTML tag characters
        if (textBefore.trim().endsWith('<') || textAfter.trim().startsWith('>') || textAfter.trim().startsWith('=')) {
          continue;
        }
        
        // Skip if the match looks like it's part of a URL or slug (contains hyphens in a slug-like pattern)
        // Only skip if it's a long hyphenated phrase that looks like a slug
        if (matchedText.includes('-') && matchedText.length > 15 && matchedText.split('-').length > 2) {
          // This might be a slug, skip it
          continue;
        }
        
        matches.push({
          index: matchIndex,
          length: matchLength,
          text: matchedText,
          fullMatch: regexMatch[0],
        });
      }
    }
    
    // Add link to first match (avoid over-linking)
    if (matches.length > 0 && !addedLinks.has(linkKey)) {
      const firstMatch = matches[0];
      
      // Double-check we're not inside a tag, link, TL;DR, or heading
      if (isInExistingLink(firstMatch.index) || isInTldrSection(firstMatch.index) || isInHeading(firstMatch.index)) {
        continue;
      }
      
      const beforeLink = html.substring(0, firstMatch.index);
      const matchedText = firstMatch.text;
      const afterLink = html.substring(firstMatch.index + firstMatch.length);
      
      // Create descriptive anchor text using the keyword
      const anchorText = matchedText;
      const linkHtml = `<a href="${linkUrl}" class="internal-link" title="${targetPost.title}">${anchorText}</a>`;
      
      html = beforeLink + linkHtml + afterLink;
      addedLinks.add(linkKey);
      linksAdded++;
      
      // Update existing links and TL;DR positions (shift by link length difference)
      const lengthDiff = linkHtml.length - firstMatch.length;
      for (let i = 0; i < existingLinks.length; i++) {
        if (existingLinks[i].start > firstMatch.index) {
          existingLinks[i].start += lengthDiff;
          existingLinks[i].end += lengthDiff;
        }
      }
      
      // Update TL;DR section positions
      for (let i = 0; i < tldrSections.length; i++) {
        if (tldrSections[i].start > firstMatch.index) {
          tldrSections[i].start += lengthDiff;
          tldrSections[i].end += lengthDiff;
        }
      }
      
      // Update heading section positions
      for (let i = 0; i < headingSections.length; i++) {
        if (headingSections[i].start > firstMatch.index) {
          headingSections[i].start += lengthDiff;
          headingSections[i].end += lengthDiff;
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
        let lastWordIndex = 0;
        wordRegex.lastIndex = 0;
        
        while ((regexMatch = wordRegex.exec(html)) !== null && !found) {
          // Prevent infinite loops
          if (regexMatch.index === lastWordIndex) {
            break;
          }
          lastWordIndex = regexMatch.index;
          
          const matchIndex = regexMatch.index;
          const matchedText = regexMatch[0];
          
          if (!isInExistingLink(matchIndex) && !isInTldrSection(matchIndex) && !isInHeading(matchIndex)) {
            // Check if we're inside an HTML tag or attribute
            const beforeMatch = html.substring(Math.max(0, matchIndex - 200), matchIndex);
            const lastOpenTag = beforeMatch.lastIndexOf('<');
            const lastCloseTag = beforeMatch.lastIndexOf('>');
            const isInsideTag = lastOpenTag > lastCloseTag;
            
            if (isInsideTag) {
              continue;
            }
            
            const beforeLink = html.substring(0, matchIndex);
            const afterLink = html.substring(matchIndex + matchedText.length);
            
            const linkHtml = `<a href="${linkUrl}" class="internal-link" title="${post.title}">${matchedText}</a>`;
            html = beforeLink + linkHtml + afterLink;
            
            addedLinks.add(linkKey);
            linksAdded++;
            found = true;
            
            // Update existing links and TL;DR positions
            const lengthDiff = linkHtml.length - matchedText.length;
            for (let i = 0; i < existingLinks.length; i++) {
              if (existingLinks[i].start > matchIndex) {
                existingLinks[i].start += lengthDiff;
                existingLinks[i].end += lengthDiff;
              }
            }
            
            // Update TL;DR section positions
            for (let i = 0; i < tldrSections.length; i++) {
              if (tldrSections[i].start > matchIndex) {
                tldrSections[i].start += lengthDiff;
                tldrSections[i].end += lengthDiff;
              }
            }
            
            // Update heading section positions
            for (let i = 0; i < headingSections.length; i++) {
              if (headingSections[i].start > matchIndex) {
                headingSections[i].start += lengthDiff;
                headingSections[i].end += lengthDiff;
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
 * Process FAQ answer markdown to HTML
 */
async function processFAQAnswer(markdown: string): Promise<string> {
  try {
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { 
        sanitize: false, // We trust our own content
      })
      .process(markdown);
    
    return processedContent.toString();
  } catch (error) {
    console.error('Error processing FAQ answer markdown:', error);
    return markdown; // Fallback to plain text
  }
}

/**
 * Extract FAQs from markdown content
 * First checks frontmatter faq field, then falls back to content extraction
 * Looks for FAQ sections with H3 headings as questions and following paragraphs as answers
 */
export async function extractFAQs(content: string, frontmatterFaq?: FAQ[]): Promise<FAQ[]> {
  // If FAQs are provided in frontmatter, use those first (more reliable)
  if (frontmatterFaq && frontmatterFaq.length > 0) {
    // Process markdown in FAQ answers
    const processedFAQs = await Promise.all(
      frontmatterFaq.map(async (faq) => ({
        ...faq,
        answerHtml: await processFAQAnswer(faq.answer),
      }))
    );
    return processedFAQs;
  }
  
  const faqs: FAQ[] = [];
  
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
            const answerHtml = await processFAQAnswer(cleanAnswer);
            faqs.push({
              question: currentQuestion,
              answer: cleanAnswer,
              answerHtml,
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
        const answerHtml = await processFAQAnswer(cleanAnswer);
        faqs.push({
          question: currentQuestion,
          answer: cleanAnswer,
          answerHtml,
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

