import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'contents/blogs');

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
 * Extract slug from HTML title
 */
function extractSlugFromHtml(html: string): string {
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    const title = h1Match[1].replace(/<[^>]*>/g, '').trim();
    return generateSlug(title);
  }
  return `post-${Date.now()}`;
}

/**
 * POST /api/posts
 * Creates a new blog post from HTML content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Request body is empty. Please provide HTML content.' },
        { status: 400 }
      );
    }

    // Extract slug from HTML title
    const slug = extractSlugFromHtml(body);

    // Generate filename from slug
    const filename = `${slug}.html`;
    const filePath = path.join(postsDirectory, filename);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `A post with slug "${slug}" already exists. Please use a different title.` },
        { status: 409 }
      );
    }

    // Ensure posts directory exists
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }

    // Write the HTML file
    fs.writeFileSync(filePath, body, 'utf8');

    return NextResponse.json(
      {
        success: true,
        message: 'Post created successfully',
        slug,
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

