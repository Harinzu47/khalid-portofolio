import { redirect } from 'next/navigation';

export default function ArticlesPage() {
  redirect('/system?type=ARTICLE');
}
