import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ConditionalLayout from '@/components/ConditionalLayout';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'NOIR RIDE - Premium Chauffeur Service',
  description: 'Premium rides without compromise',
};

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
      </body>
    </html>
  );
}
