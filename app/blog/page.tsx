import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "All articles about Generative AI Engine Optimization (GEO), SEO, and AI-powered discovery.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          All articles about making your products and content discoverable in the age of
          generative AI and traditional search engines.
        </p>
      </header>

      <section>
        {posts.length === 0 ? (
          <p className="text-gray-600">No posts available yet. Check back soon!</p>
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
                      {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <span>•</span>
                    <span>By {post.metadata.author.name}</span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {post.metadata.description}
                  </p>

                  {post.metadata.tags && post.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.metadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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

