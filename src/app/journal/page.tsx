import { redirect } from 'next/navigation';

export default function JournalPage() {
  redirect('/system?type=JOURNAL_ENTRY');
}
