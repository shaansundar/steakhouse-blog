import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

/**
 * Generate a slug from a title string
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Ensure required frontmatter fields exist
 */
function ensureRequiredFields(data: any, content: string): any {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Generate slug from title if missing
  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title);
  } else if (!data.slug) {
    // If no title either, generate a timestamp-based slug
    data.slug = `post-${Date.now()}`;
  }

  // Set default title if missing
  if (!data.title) {
    data.title = 'Untitled Post';
  }

  // Set default description if missing (use first 160 chars of content)
  if (!data.description) {
    const firstParagraph = content.trim().split('\n\n')[0] || '';
    data.description = firstParagraph.substring(0, 160).trim();
  }

  // Set default publishedAt if missing
  if (!data.publishedAt) {
    data.publishedAt = now;
  }

  // Set default updatedAt if missing
  if (!data.updatedAt) {
    data.updatedAt = now;
  }

  // Set default author if missing
  if (!data.author) {
    data.author = {
      name: 'Anonymous',
      url: 'https://steakhouse-test-nimbushq.xyz',
    };
  }

  // Ensure tags is an array
  if (!data.tags) {
    data.tags = [];
  }

  return data;
}

/**
 * POST /api/posts
 * Creates a new blog post from markdown content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Request body is empty. Please provide markdown content.' },
        { status: 400 }
      );
    }

    // Parse the markdown with frontmatter
    let parsed;
    try {
      parsed = matter(body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid markdown format. Could not parse frontmatter.' },
        { status: 400 }
      );
    }

    const { data, content } = parsed;

    // Ensure required fields exist
    const metadata = ensureRequiredFields(data, content);

    // Generate filename from slug
    const filename = `${metadata.slug}.md`;
    const filePath = path.join(postsDirectory, filename);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `A post with slug "${metadata.slug}" already exists. Please use a different slug.` },
        { status: 409 }
      );
    }

    // Ensure posts directory exists
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }

    // Reconstruct the markdown with updated frontmatter
    const frontmatterString = matter.stringify(content, metadata);

    // Write the file
    fs.writeFileSync(filePath, frontmatterString, 'utf8');

    return NextResponse.json(
      {
        success: true,
        message: 'Post created successfully',
        slug: metadata.slug,
        filename,
        path: filePath,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      {
        error: 'Failed to create post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

