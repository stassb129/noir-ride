import type { Metadata } from 'next';
import IntercitySection from '@/components/IntercitySection/IntercitySection';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale.startsWith('ru');

  const title = ru
    ? 'Межгород с водителем — NOIR RIDE'
    : 'Intercity Chauffeur Service — NOIR RIDE';
  const description = ru
    ? 'Междугородние поездки на Mercedes и Maybach: фиксированные тарифы, комфорт и профессиональные водители.'
    : 'Intercity rides in Mercedes and Maybach with fixed pricing, premium comfort and professional chauffeurs.';

  return {
    title,
    description,
    openGraph: {
      url: `${SITE_URL}/${locale}/routes`,
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/routes`,
      languages: {
        ru: `${SITE_URL}/ru/routes`,
        en: `${SITE_URL}/en/routes`,
        'x-default': `${SITE_URL}/ru/routes`,
      },
    },
  };
}

export default function RoutesPage() {
  return <IntercitySection />;
}
