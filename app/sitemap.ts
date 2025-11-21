import { MetadataRoute } from 'next';
import { getAllPosts, getAllTags, getPostsByTag } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steakhouse-test.nimbushq.xyz';
  const posts = getAllPosts();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.metadata.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Tag pages
  const tags = getAllTags();
  const tagPages: MetadataRoute.Sitemap = tags.map((tagSlug) => {
    const tagPosts = getPostsByTag(tagSlug);
    // Use the most recent post's update date as the tag page's lastModified
    const mostRecentPost = tagPosts.sort((a, b) => 
      new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
    )[0];
    
    return {
      url: `${baseUrl}/tags/${tagSlug}`,
      lastModified: mostRecentPost ? new Date(mostRecentPost.metadata.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...blogPages, ...tagPages];
}

