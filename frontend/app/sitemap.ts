import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

const locales = ['ru', 'en'] as const;

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

// Public, indexable pages with dedicated content.
// /rekvizity is noindex and /account, /admin, /api are disallowed in robots.
const publicPages: Array<{ path: string; priority: number; changeFrequency: ChangeFreq }> = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/routes', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/airport', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/hourly', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/contacts', priority: 0.8, changeFrequency: 'monthly' },
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
