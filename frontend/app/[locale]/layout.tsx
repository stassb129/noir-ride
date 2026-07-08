import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ConditionalLayout from '@/components/ConditionalLayout';
import YandexMetrika from '@/components/YandexMetrika/YandexMetrika';
import '@/styles/globals.scss';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale === 'ru';

  const title = ru
    ? 'NOIR RIDE — Премиальный трансфер в Москве'
    : 'NOIR RIDE — Premium Chauffeur Service in Moscow';

  const description = ru
    ? 'Премиальные трансферы и аренда автомобиля с водителем в Москве: аэропорты, межгород, почасовая аренда. Парк Mercedes, Maybach. Фиксированные цены.'
    : 'Premium chauffeur service in Moscow: airport transfers, intercity rides, hourly rentals. Fleet of Mercedes and Maybach. Fixed prices, no compromise.';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | NOIR RIDE',
    },
    description,
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    robots: { index: true, follow: true },
    verification: {
      yandex: 'd7abdb2582f8cf00',
    },
    openGraph: {
      type: 'website',
      locale: ru ? 'ru_RU' : 'en_US',
      alternateLocale: ru ? 'en_US' : 'ru_RU',
      siteName: 'NOIR RIDE',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    // NOTE: canonical/hreflang and openGraph.url are intentionally set per-page
    // (see each page's generateMetadata) so sub-pages don't inherit the
    // homepage canonical.
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </NextIntlClientProvider>
        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>
      </body>
    </html>
  );
}
