import type { Metadata, Viewport } from 'next';
import { Orbitron, Rajdhani } from 'next/font/google';
import './globals.css';

const display = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});

const body = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_URL = 'https://pixelwebdevelopers.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pixel Web Developers — We Build Digital Experiences That Move',
    template: '%s | Pixel Web Developers',
  },
  description:
    'Pixel Web Developers is a digital agency crafting immersive web experiences, Shopify & WordPress stores, Flutter mobile apps, UI/UX design, AI integration and automation systems. Explore our work in an interactive 3D world.',
  keywords: [
    'web development agency',
    'Shopify development',
    'WordPress development',
    'Flutter mobile apps',
    'UI/UX design',
    'AI integration',
    'automation systems',
    'three.js agency',
    'immersive 3D website',
  ],
  authors: [{ name: 'Pixel Web Developers' }],
  creator: 'Pixel Web Developers',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Pixel Web Developers — We Build Digital Experiences That Move',
    description:
      'Drive through our interactive 3D world to explore web development, e-commerce, mobile apps, design, and AI services.',
    siteName: 'Pixel Web Developers',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pixel Web Developers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Web Developers — We Build Digital Experiences That Move',
    description: 'An immersive 3D driving experience showcasing our digital agency.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: '#05060f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Pixel Web Developers',
  description:
    'Digital agency building immersive web experiences, e-commerce stores, mobile apps, UI/UX design, AI integration and automation systems.',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  serviceType: [
    'Web Development',
    'Shopify Stores',
    'WordPress',
    'Mobile Apps',
    'UI/UX Design',
    'AI Integration',
    'Automation Systems',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
