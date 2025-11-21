import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";
import {
  generateBlogPostingSchema,
  generateFAQSchema,
} from "@/lib/structured-data";
import type { Metadata } from "next";

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const { metadata } = post;
  const url = `/blog/${metadata.slug}`;

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "article",
      publishedTime: metadata.publishedAt,
      modifiedTime: metadata.updatedAt,
      authors: [metadata.author.name],
      url,
      tags: metadata.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { metadata, content } = post;
  const htmlContent = markdownToHtml(content);
  const relatedPosts = getRelatedPosts(params.slug);

  // Generate JSON-LD schemas
  const blogPostingSchema = generateBlogPostingSchema(metadata);
  const faqSchema = metadata.faq && metadata.faq.length > 0 
    ? generateFAQSchema(metadata.faq) 
    : null;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article
        className="max-w-4xl mx-auto px-4 py-12"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        {/* Article Header */}
        <header className="mb-12">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label="Back to blog index"
          >
            ← Back to Blog
          </Link>

          <h1 className="text-5xl font-bold text-gray-900 mb-4" itemProp="headline">
            {metadata.title}
          </h1>

          <p className="text-xl text-gray-700 mb-6 leading-relaxed" itemProp="description">
            {metadata.description}
          </p>

          <div className="flex items-center gap-4 text-gray-600 border-t border-b border-gray-200 py-4">
            <div itemProp="author" itemScope itemType="https://schema.org/Person">
              <span className="font-medium">
                By{" "}
                <a
                  href={metadata.author.url}
                  itemProp="url"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <span itemProp="name">{metadata.author.name}</span>
                </a>
              </span>
            </div>
            <span>•</span>
            <time dateTime={metadata.publishedAt} itemProp="datePublished">
              Published{" "}
              {new Date(metadata.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {metadata.updatedAt !== metadata.publishedAt && (
              <>
                <span>•</span>
                <time dateTime={metadata.updatedAt} itemProp="dateModified">
                  Updated{" "}
                  {new Date(metadata.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            )}
          </div>

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4" itemProp="keywords">
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Main Content */}
        <section
          className="prose prose-lg max-w-none mb-12"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* FAQ Section */}
        {metadata.faq && metadata.faq.length > 0 && (
          <section className="mb-12 bg-gray-50 rounded-lg p-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {metadata.faq.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Author Bio */}
        <section className="border-t border-gray-200 pt-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">About the Author</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700">
              <strong>{metadata.author.name}</strong> writes about Generative AI Engine
              Optimization and strategies for making products discoverable in the age of AI.
            </p>
            <a
              href={metadata.author.url}
              className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
            >
              Learn more →
            </a>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Articles</h2>
            <ul className="space-y-4" role="list">
              {relatedPosts.map((relatedPost) => (
                <li key={relatedPost.metadata.slug}>
                  <Link
                    href={`/blog/${relatedPost.metadata.slug}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {relatedPost.metadata.title}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {relatedPost.metadata.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}

