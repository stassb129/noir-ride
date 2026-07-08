import type { Metadata } from 'next';
import Hero from '@/components/Hero/Hero';
import Services from '@/components/Services/Services';
import IntercitySection from '@/components/IntercitySection/IntercitySection';
import AirportSection from '@/components/AirportSection/AirportSection';
import HourlySection from '@/components/HourlySection/HourlySection';
import Benefits from '@/components/Benefits/Benefits';
import Stats from '@/components/Stats/Stats';
import Fleet from '@/components/Fleet/Fleet';
import Guarantees from '@/components/Guarantees/Guarantees';
import ContactSection from '@/components/ContactSection/ContactSection';
import LeadFormSection from '@/components/LeadFormSection/LeadFormSection';
import Steps from '@/components/Steps/Steps';
import Experience from '@/components/Experience/Experience';
import CtaBanner from '@/components/CtaBanner/CtaBanner';
import { SITE_CONTACTS } from '@/lib/site-contacts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale === 'ru';

  const title = ru
    ? 'NOIR RIDE — Премиальный трансфер без компромиссов в Москве'
    : 'NOIR RIDE — Premium Chauffeur Service in Moscow, No Compromise';

  const description = ru
    ? 'Аренда автомобиля с водителем в Москве: трансфер в аэропорт, межгородские поездки, почасовая аренда. Mercedes E/S-Class, Maybach, G-Class. Фиксированные цены, профессиональные водители.'
    : 'Chauffeur service in Moscow: airport transfers, intercity trips, hourly rental. Mercedes E/S-Class, Maybach, G-Class. Fixed prices, professional drivers.';

  return {
    title,
    description,
    openGraph: {
      url: `${SITE_URL}/${locale}`,
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ru: `${SITE_URL}/ru`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/ru`,
      },
    },
  };
}

function LocalBusinessJsonLd({ locale }: { locale: string }) {
  const ru = locale === 'ru';
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#organization`,
        name: 'NOIR RIDE',
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        image: `${SITE_URL}/icon.png`,
        description: ru
          ? 'Премиальный трансфер и аренда автомобиля с водителем в Москве'
          : 'Premium chauffeur service and car rental in Moscow',
        telephone: SITE_CONTACTS.phone,
        email: SITE_CONTACTS.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: ru ? 'Москва' : 'Moscow',
          addressCountry: 'RU',
        },
        areaServed: [
          { '@type': 'City', name: ru ? 'Москва' : 'Moscow' },
          { '@type': 'Country', name: ru ? 'Россия' : 'Russia' },
        ],
        priceRange: '₽₽₽',
        currenciesAccepted: 'RUB',
        paymentAccepted: ru ? 'Банковская карта, онлайн-оплата' : 'Credit Card, Online Payment',
        sameAs: [
          SITE_CONTACTS.telegram,
          SITE_CONTACTS.instagram,
          SITE_CONTACTS.vk,
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: ru ? 'Услуги трансфера' : 'Transfer services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: ru ? 'Трансфер в аэропорт' : 'Airport transfer',
                url: `${SITE_URL}/${locale}#airport`,
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: ru ? 'Межгородские поездки' : 'Intercity trips',
                url: `${SITE_URL}/${locale}#routes`,
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: ru ? 'Почасовая аренда' : 'Hourly rental',
                url: `${SITE_URL}/${locale}#hourly`,
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'NOIR RIDE',
        inLanguage: [ru ? 'ru-RU' : 'en-US', ru ? 'en-US' : 'ru-RU'],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <LocalBusinessJsonLd locale={locale} />
      <Hero />
      <Services />
      <Steps />
      <Experience />
      <Fleet />
      <IntercitySection />
      <AirportSection />
      <HourlySection />
      <CtaBanner />
      <Benefits />
      <Stats />
      <Guarantees />
      <ContactSection />
      <LeadFormSection />
    </>
  );
}
