import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-ride.ru';

const locales = ['ru', 'en'] as const;

const publicPages = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/airport', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/hourly', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/routes', priority: 0.9, changeFrequency: 'monthly' },
] as const;

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
      });
    }
  }

  return entries;
}
