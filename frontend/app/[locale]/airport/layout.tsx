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
    ? 'Трансфер в аэропорт Москвы — Шереметьево, Домодедово, Внуково'
    : 'Moscow Airport Transfer — Sheremetyevo, Domodedovo, Vnukovo';

  const description = ru
    ? 'Трансфер в аэропорты Москвы на Mercedes и Maybach. Отслеживание рейса, встреча с табличкой в зале прилёта, помощь с багажом, 1 час ожидания бесплатно. Фиксированная цена.'
    : 'Moscow airport transfers in Mercedes and Maybach. Flight tracking, meet & greet at arrivals, luggage help, 1 hour free waiting. Fixed price.';

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

function AirportServiceJsonLd({ locale }: { locale: string }) {
  const ru = locale === 'ru';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: ru ? 'Трансфер в аэропорт Москвы' : 'Moscow Airport Transfer',
    description: ru
      ? 'Трансферы в аэропорты Шереметьево, Домодедово и Внуково на премиальных автомобилях'
      : 'Transfers to Sheremetyevo, Domodedovo and Vnukovo airports in premium vehicles',
    provider: {
      '@type': 'LocalBusiness',
      name: 'NOIR RIDE',
      url: SITE_URL,
    },
    areaServed: { '@type': 'City', name: ru ? 'Москва' : 'Moscow' },
    serviceType: ru ? 'Аэропортовый трансфер' : 'Airport transfer',
    url: `${SITE_URL}/${locale}/airport`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function AirportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <AirportServiceJsonLd locale={locale} />
      {children}
    </>
  );
}
