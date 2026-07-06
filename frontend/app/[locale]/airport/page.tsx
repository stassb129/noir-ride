import { redirect } from 'next/navigation';

export default async function AirportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/booking?type=airport`);
}
