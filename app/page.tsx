import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover articles about Generative AI Engine Optimization (GEO), SEO, and AI discovery strategies.",
};

export default function HomePage() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <section className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to the GEO Optimized Blog
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore cutting-edge strategies for making your products and content discoverable
          by generative AI engines like ChatGPT, Claude, and Gemini. Learn how to optimize
          for both traditional search engines and the new era of AI-powered discovery.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Latest Articles</h2>
        
        {latestPosts.length === 0 ? (
          <p className="text-gray-600">No posts yet. Check back soon!</p>
        ) : (
          <ul className="space-y-8" role="list">
            {latestPosts.map((post) => (
              <li key={post.metadata.slug}>
                <article className="border-b border-gray-200 pb-8">
                  <h3 className="text-2xl font-semibold mb-2">
                    <Link
                      href={`/blog/${post.metadata.slug}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {post.metadata.title}
                    </Link>
                  </h3>
                  
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

        {posts.length > 5 && (
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View All Articles
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

