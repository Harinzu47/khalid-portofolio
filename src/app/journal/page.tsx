import type { Metadata } from 'next';
import { getAllJournalPosts } from '@/data/journal';
import JournalListingClient from './JournalListingClient';

export const metadata: Metadata = {
  title: 'Journal | hzcode',
  description:
    'Personal logs, ops notes, and fixes from hzcode — covering Infrastructure, Networking, Web Dev, and AI.',
};

/**
 * /journal — journal listing page (server component)
 */
export default function JournalPage() {
  const posts = getAllJournalPosts();
  return (
    <main className="min-h-screen bg-terminal-bg pt-20">
      <JournalListingClient posts={posts} />
    </main>
  );
}
