import dynamic from 'next/dynamic';
import { SeoContent } from '@/components/ui/SeoContent';

// The whole 3D app is client-only; load it without SSR to avoid WebGL on server.
const PixelWorld = dynamic(() => import('@/components/PixelWorld'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-full w-full">
      {/* Interactive 3D experience (client only) */}
      <PixelWorld />

      {/* SEO / no-JS fallback content — visually hidden, crawler-readable */}
      <SeoContent />
    </main>
  );
}
