import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

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
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}

/**
 * Get all post slugs from the content directory
 */
export function getAllPostSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
      .map((fileName) => fileName.replace(/\.(md|mdx)$/, ''));
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
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    // Try .md first, then .mdx
    let fileContents: string;
    try {
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } catch {
      const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
      fileContents = fs.readFileSync(mdxPath, 'utf8');
    }

    const { data, content } = matter(fileContents);

    return {
      metadata: {
        title: data.title,
        description: data.description,
        slug: data.slug || slug,
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt,
        author: data.author,
        tags: data.tags || [],
        faq: data.faq || [],
      },
      content,
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

