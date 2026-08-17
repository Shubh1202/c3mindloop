import type { Metadata } from 'next';
import { BlogPage } from '@/app/views/BlogPage';
import { guidesMetadata } from '@/app/config/guides-i18n';

export const metadata: Metadata = guidesMetadata('en');

export default function Page() {
  return <BlogPage variant="guides" />;
}
