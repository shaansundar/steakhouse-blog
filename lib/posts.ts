import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'contents/blogs');

export interface Author {
  name: string;
  url: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PostMetadata {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  author: Author;
  tags: string[];
  faq?: FAQ[];
  image?: string; // Optional OpenGraph/Twitter image URL
  definition?: string; // Optional explicit definition paragraph after h1
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}

/**
 * Extract metadata from HTML content
 */
function extractMetadataFromHtml(html: string, slug: string): PostMetadata {
  // Extract title from first h1 tag
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : 'Untitled Post';

  // Extract description from first paragraph (preferably one with Tl;Dr)
  let description = '';
  const tldrMatch = html.match(/<p[^>]*>.*?<b[^>]*>Tl;Dr:?<\/b>.*?<\/p>/i);
  if (tldrMatch) {
    description = tldrMatch[0].replace(/<[^>]*>/g, '').replace(/Tl;Dr:?\s*/i, '').trim();
  } else {
    // Fallback to first paragraph
    const firstPMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
    if (firstPMatch) {
      description = firstPMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 160);
    }
  }

  // Use current date as default
  const now = new Date().toISOString().split('T')[0];

  return {
    title,
    description: description || 'No description available',
    slug,
    publishedAt: now,
    updatedAt: now,
    author: {
      name: 'Anonymous',
      url: 'https://steakhouse-test.nimbushq.xyz',
    },
    tags: [],
  };
}

/**
 * Get all post slugs from the content directory
 */
export function getAllPostSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((fileName) => fileName.endsWith('.html'))
      .map((fileName) => fileName.replace(/\.html$/, ''));
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.html`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Extract metadata from HTML
    const metadata = extractMetadataFromHtml(fileContents, slug);

    return {
      metadata,
      content: fileContents, // Return HTML content as-is
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all posts sorted by publication date (newest first)
 */
export function getAllPosts(): Post[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.metadata.publishedAt);
      const dateB = new Date(b.metadata.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

  return posts;
}

/**
 * Get related posts by tag overlap
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): Post[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllPosts();
  const currentTags = currentPost.metadata.tags;

  // Score posts by number of matching tags
  const scoredPosts = allPosts
    .filter((post) => post.metadata.slug !== currentSlug)
    .map((post) => {
      const matchingTags = post.metadata.tags.filter((tag) =>
        currentTags.includes(tag)
      );
      return {
        post,
        score: matchingTags.length,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredPosts.map((item) => item.post);
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  
  posts.forEach((post) => {
    post.metadata.tags.forEach((tag) => {
      tagSet.add(tag.toLowerCase().replace(/\s+/g, '-'));
    });
  });
  
  return Array.from(tagSet).sort();
}

/**
 * Get posts by tag (normalized tag slug)
 */
export function getPostsByTag(tagSlug: string): Post[] {
  const allPosts = getAllPosts();
  const normalizedTagSlug = tagSlug.toLowerCase().replace(/\s+/g, '-');
  
  return allPosts.filter((post) =>
    post.metadata.tags.some(
      (tag) => tag.toLowerCase().replace(/\s+/g, '-') === normalizedTagSlug
    )
  );
}

/**
 * Get tag display name from slug
 */
export function getTagDisplayName(tagSlug: string): string | null {
  const posts = getAllPosts();
  const normalizedTagSlug = tagSlug.toLowerCase().replace(/\s+/g, '-');
  
  for (const post of posts) {
    const matchingTag = post.metadata.tags.find(
      (tag) => tag.toLowerCase().replace(/\s+/g, '-') === normalizedTagSlug
    );
    if (matchingTag) {
      return matchingTag;
    }
  }
  
  return null;
}

