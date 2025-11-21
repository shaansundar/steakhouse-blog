import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";
import {
  generateBlogPostingSchema,
  generateFAQSchema,
  generateBreadcrumbListSchema,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steakhouse-test.nimbushq.xyz';
  const defaultImage = `${siteUrl}/og-image.jpg`;
  const imageUrl = metadata.image 
    ? (metadata.image.startsWith('http') ? metadata.image : `${siteUrl}${metadata.image}`)
    : defaultImage;

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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [imageUrl],
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
  const breadcrumbSchema = generateBreadcrumbListSchema(metadata);
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-gray-900 hover:underline transition-colors">
                Home
              </Link>
              <span aria-hidden="true" className="mx-2">/</span>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gray-900 hover:underline transition-colors">
                Blog
              </Link>
              <span aria-hidden="true" className="mx-2">/</span>
            </li>
            <li aria-current="page" className="font-medium text-gray-900">
              {metadata.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4" itemProp="headline">
            {metadata.title}
          </h1>

          {/* Explicit definition paragraph for LLMs - appears immediately after h1 */}
          {/* This helps LLMs extract the core concept quickly */}
          {metadata.definition ? (
            <p className="text-xl text-gray-700 mb-4 leading-relaxed font-medium" itemProp="abstract">
              {metadata.definition}
            </p>
          ) : (
            <p className="text-xl text-gray-700 mb-4 leading-relaxed font-medium" itemProp="abstract">
              {metadata.description}
            </p>
          )}

          {/* Show description separately only if definition exists, otherwise it's already shown above */}
          {metadata.definition && (
            <p className="text-xl text-gray-700 mb-6 leading-relaxed" itemProp="description">
              {metadata.description}
            </p>
          )}

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
            <ul className="flex flex-wrap gap-2 mt-4" aria-label="Topics">
              {metadata.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        {/* TL;DR Section */}
        <section aria-labelledby="tldr" className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 id="tldr" className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-2">
            TL;DR
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {(metadata as any).tldr ?? metadata.description}
          </p>
        </section>

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

        {/* References Section with Authoritative Links */}
        <section className="border-t border-gray-200 pt-8 mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">References & Resources</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <ul className="space-y-2 text-gray-700">
              <li>
                <a 
                  href="https://schema.org/BlogPosting" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Schema.org BlogPosting Documentation
                </a>
                <span className="text-gray-500 text-sm ml-2">— Official structured data specification</span>
              </li>
              <li>
                <a 
                  href="https://schema.org/BreadcrumbList" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Schema.org BreadcrumbList Documentation
                </a>
                <span className="text-gray-500 text-sm ml-2">— Navigation breadcrumb schema</span>
              </li>
              <li>
                <a 
                  href="https://ogp.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Open Graph Protocol
                </a>
                <span className="text-gray-500 text-sm ml-2">— Social media metadata standard</span>
              </li>
            </ul>
          </div>
        </section>
      </article>
    </>
  );
}

