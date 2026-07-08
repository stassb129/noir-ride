import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

const locales = ['ru', 'en'] as const;

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

// Only real, indexable pages that return HTTP 200.
// Note: /routes, /airport and /hourly are server-side redirects to /booking,
// so they are intentionally excluded — the service content itself lives in the
// anchored sections of the homepage (#routes, #airport, #hourly).
// /rekvizity is noindex and /account, /admin, /api are disallowed in robots.
const publicPages: Array<{ path: string; priority: number; changeFrequency: ChangeFreq }> = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/booking', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/oferta', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const { path, priority, changeFrequency } of publicPages) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ru: `${SITE_URL}/ru${path}`,
            en: `${SITE_URL}/en${path}`,
          },
        },
      });
    }
  }

  return entries;
}
