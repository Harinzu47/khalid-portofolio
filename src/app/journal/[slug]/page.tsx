import type { Metadata } from 'next';
import { journalPosts, getJournalPostBySlug } from '@/data/journal';
import JournalPostClient from './JournalPostClient';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate metadata for journal post pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found | hzcode' };
  }

  return {
    title: `${post.title} | hzcode journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

/**
 * Generate static params for all journal posts
 */
export async function generateStaticParams() {
  return journalPosts.map((post) => ({ slug: post.slug }));
}

/**
 * Journal post detail page — server component wrapper
 */
export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getJournalPostBySlug(slug);

  if (!post) notFound();

  // Find prev/next posts
  const sortedPosts = [...journalPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const idx       = sortedPosts.findIndex((p) => p.slug === slug);
  const prevPost  = idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null;
  const nextPost  = idx > 0 ? sortedPosts[idx - 1] : null;

  return <JournalPostClient post={post} prevPost={prevPost} nextPost={nextPost} />;
}
