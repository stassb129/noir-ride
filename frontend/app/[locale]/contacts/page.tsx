import type { Metadata } from 'next';
import ContactSection from '@/components/ContactSection/ContactSection';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale.startsWith('ru');

  const title = ru ? 'Контакты — NOIR RIDE' : 'Contact — NOIR RIDE';
  const description = ru
    ? 'Свяжитесь с NOIR RIDE: телефон, Telegram, email. Ответим быстро и поможем с бронированием.'
    : 'Contact NOIR RIDE via phone, Telegram or email. Quick response and booking assistance.';

  return {
    title,
    description,
    openGraph: {
      url: `${SITE_URL}/${locale}/contacts`,
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/contacts`,
      languages: {
        ru: `${SITE_URL}/ru/contacts`,
        en: `${SITE_URL}/en/contacts`,
        'x-default': `${SITE_URL}/ru/contacts`,
      },
    },
  };
}

export default function ContactsPage() {
  return <ContactSection />;
}

