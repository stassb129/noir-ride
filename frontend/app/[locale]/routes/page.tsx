import { redirect } from 'next/navigation';

export default async function RoutesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/booking?type=route`);
}
