import { getAllJournalPosts, getJournalPostBySlug } from '@/lib/content';
import { JournalPost } from '@/types';

export const journalPosts: JournalPost[] = getAllJournalPosts();
export { getAllJournalPosts, getJournalPostBySlug };
