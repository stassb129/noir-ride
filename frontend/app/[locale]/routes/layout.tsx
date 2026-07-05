import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale === 'ru';

  const title = ru
    ? 'Межгородские поездки с водителем из Москвы — Фиксированные тарифы'
    : 'Intercity Chauffeur Trips from Moscow — Fixed Rates';

  const description = ru
    ? 'Поездки между городами на автомобиле с водителем: Москва — Санкт-Петербург, Нижний Новгород, Ярославль и другие направления. Фиксированный тариф, комфортные Mercedes и Maybach.'
    : 'Intercity trips with a chauffeur: Moscow to St Petersburg, Nizhny Novgorod, Yaroslavl and more. Fixed rates, comfortable Mercedes and Maybach.';

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

function IntercityServiceJsonLd({ locale }: { locale: string }) {
  const ru = locale === 'ru';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: ru ? 'Межгородские поездки с водителем' : 'Intercity Chauffeur Trips',
    description: ru
      ? 'Поездки между городами на премиальных автомобилях с профессиональным водителем'
      : 'Intercity trips in premium vehicles with a professional chauffeur',
    provider: {
      '@type': 'LocalBusiness',
      name: 'NOIR RIDE',
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: ru ? 'Россия' : 'Russia' },
    serviceType: ru ? 'Межгородской трансфер' : 'Intercity transfer',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      description: ru ? 'Фиксированный тариф за километр' : 'Fixed per-kilometre rate',
    },
    url: `${SITE_URL}/${locale}/routes`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function RoutesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <IntercityServiceJsonLd locale={locale} />
      {children}
    </>
  );
}
