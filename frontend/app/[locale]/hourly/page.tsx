import { permanentRedirect } from 'next/navigation';

export default async function HourlyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/booking?type=hourly`);
}
