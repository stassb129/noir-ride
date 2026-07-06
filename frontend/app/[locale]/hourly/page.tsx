import { redirect } from 'next/navigation';

export default async function HourlyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/booking?type=hourly`);
}
