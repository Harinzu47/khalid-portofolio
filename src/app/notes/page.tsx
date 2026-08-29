import { redirect } from 'next/navigation';

export default function NotesPage() {
  redirect('/system?type=TECH_NOTE');
}
