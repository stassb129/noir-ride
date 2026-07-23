import type { Metadata } from 'next';
import AirportSection from '@/components/AirportSection/AirportSection';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale.startsWith('ru');

  const title = ru
    ? 'Трансфер в аэропорт — NOIR RIDE'
    : 'Airport Transfer Service — NOIR RIDE';
  const description = ru
    ? 'Трансфер в SVO, DME, VKO: отслеживание рейса, встреча с табличкой и фиксированная цена.'
    : 'Airport transfer to SVO, DME and VKO with flight tracking, meet & greet and fixed pricing.';

  return {
    title,
    description,
    openGraph: {
      url: `${SITE_URL}/${locale}/airport`,
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/airport`,
      languages: {
        ru: `${SITE_URL}/ru/airport`,
        en: `${SITE_URL}/en/airport`,
        'x-default': `${SITE_URL}/ru/airport`,
      },
    },
  };
}

export default function AirportPage() {
  return <AirportSection />;
}
