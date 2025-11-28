export type BlogContent = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    url: string;
  };
  tags: string[];
  ogImage?: string;
  faq: {
    question: string;
    answer: string;
  }[];
  content: string;
};