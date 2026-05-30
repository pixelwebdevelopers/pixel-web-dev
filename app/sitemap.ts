import type { MetadataRoute } from 'next';
import { STATIONS } from '@/utils/config';

const SITE_URL = 'https://pixelwebdevelopers.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...STATIONS.filter((s) => s.id !== 'hero').map((s) => ({
      url: `${SITE_URL}/#${s.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
