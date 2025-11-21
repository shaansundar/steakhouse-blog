import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag, getTagDisplayName } from "@/lib/posts";
import type { Metadata } from "next";

interface PageProps {
  params: {
    tag: string;
  };
}

// Generate static paths for all tags
export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tagDisplayName = getTagDisplayName(params.tag);

  if (!tagDisplayName) {
    return {
      title: "Tag Not Found",
    };
  }

  const posts = getPostsByTag(params.tag);
  const description = `Articles about ${tagDisplayName} on the GEO Optimized Blog. Discover content related to Generative AI Engine Optimization, SEO, and AI discovery.`;

  return {
    title: tagDisplayName,
    description,
    alternates: {
      canonical: `/tags/${params.tag}`,
    },
    openGraph: {
      title: `${tagDisplayName} | GEO Optimized Blog`,
      description,
      type: "website",
      url: `/tags/${params.tag}`,
    },
  };
}

export default function TagPage({ params }: PageProps) {
  const tagDisplayName = getTagDisplayName(params.tag);
  const posts = getPostsByTag(params.tag);

  if (!tagDisplayName) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
            {tagDisplayName}
          </li>
        </ol>
      </nav>

      <header className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Articles tagged: {tagDisplayName}
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          {posts.length} {posts.length === 1 ? "article" : "articles"} about {tagDisplayName}
        </p>
      </header>

      <section>
        {posts.length === 0 ? (
          <p className="text-gray-600">No articles found for this tag.</p>
        ) : (
          <ul className="space-y-8" role="list">
            {posts.map((post) => (
              <li key={post.metadata.slug}>
                <article className="border-b border-gray-200 pb-8">
                  <h2 className="text-2xl font-semibold mb-2">
                    <Link
                      href={`/blog/${post.metadata.slug}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {post.metadata.title}
                    </Link>
                  </h2>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <time dateTime={post.metadata.publishedAt}>
                      {new Date(post.metadata.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>•</span>
                    <span>By {post.metadata.author.name}</span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {post.metadata.description}
                  </p>

                  {post.metadata.tags && post.metadata.tags.length > 0 && (
                    <ul className="flex flex-wrap gap-2 mt-2" aria-label="Topics">
                      {post.metadata.tags.map((tag) => (
                        <li key={tag}>
                          <Link
                            href={`/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                            className={`inline-block text-sm px-3 py-1 rounded-full transition-colors ${
                              tag.toLowerCase().replace(/\s+/g, '-') === params.tag
                                ? 'bg-blue-100 text-blue-800 font-medium'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

