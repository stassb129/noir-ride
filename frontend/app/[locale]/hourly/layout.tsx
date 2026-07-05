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
    ? 'Почасовая аренда Mercedes с водителем в Москве'
    : 'Hourly Mercedes Chauffeur Rental in Moscow';

  const description = ru
    ? 'Аренда автомобиля с водителем по часам в Москве: от 3 часов. Свадьбы, деловые встречи, торжества, экскурсии. Mercedes E/S-Class, Maybach. Водитель остаётся с вами.'
    : 'Hourly chauffeur rental in Moscow: 3+ hours. Weddings, business meetings, celebrations, city tours. Mercedes E/S-Class, Maybach. Driver stays with you.';

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

function HourlyServiceJsonLd({ locale }: { locale: string }) {
  const ru = locale === 'ru';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: ru ? 'Почасовая аренда автомобиля с водителем' : 'Hourly Chauffeur Car Rental',
    description: ru
      ? 'Аренда автомобиля с водителем по часам в Москве: от 3 часов для любых мероприятий'
      : 'Hourly chauffeur rental in Moscow: 3+ hours for any occasion',
    provider: {
      '@type': 'LocalBusiness',
      name: 'NOIR RIDE',
      url: SITE_URL,
    },
    areaServed: { '@type': 'City', name: ru ? 'Москва' : 'Moscow' },
    serviceType: ru ? 'Почасовая аренда с водителем' : 'Hourly chauffeur rental',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      description: ru ? 'Тариф фиксируется при бронировании, минимум 3 часа' : 'Rate fixed at booking, minimum 3 hours',
    },
    url: `${SITE_URL}/${locale}/hourly`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function HourlyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <HourlyServiceJsonLd locale={locale} />
      {children}
    </>
  );
}
