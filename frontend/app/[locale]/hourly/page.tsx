import type { Metadata } from 'next';
import HourlySection from '@/components/HourlySection/HourlySection';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale.startsWith('ru');

  const title = ru
    ? 'Почасовая аренда с водителем — NOIR RIDE'
    : 'Hourly Chauffeur Rental — NOIR RIDE';
  const description = ru
    ? 'Почасовая аренда Mercedes и Maybach с водителем в Москве: свадьбы, встречи, деловые поездки.'
    : 'Hourly Mercedes and Maybach rental with chauffeur in Moscow for events, meetings and business trips.';

  return {
    title,
    description,
    openGraph: {
      url: `${SITE_URL}/${locale}/hourly`,
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/hourly`,
      languages: {
        ru: `${SITE_URL}/ru/hourly`,
        en: `${SITE_URL}/en/hourly`,
        'x-default': `${SITE_URL}/ru/hourly`,
      },
    },
  };
}

export default function HourlyPage() {
  return <HourlySection />;
}
