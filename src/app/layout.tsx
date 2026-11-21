import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getSiteUrl } from '@/lib/site-url';
import { getPageMetadata } from '@/lib/data';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Site-wide default metadata comes from the homepage doc (pages_metadata/route_home), so pages without
// their own generateMetadata (e.g. /admin, a client component) inherit it. Canonical/url are intentionally
// omitted so inheriting pages never claim the homepage URL.
export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMetadata('route_home', {
    title: 'Alex Rivera | Growth Marketer - Performance Portfolio',
    description:
      'Performance marketing portfolio and client acquisition platform for senior digital marketing expert. Featuring full-funnel case studies, verified organic SERP rankings, and growth audit booking.',
    path: '/',
  });

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      title: pageMeta.openGraph.title,
      description: pageMeta.openGraph.description,
      siteName: pageMeta.openGraph.siteName,
      locale: pageMeta.openGraph.locale,
      type: pageMeta.openGraph.type,
      images: pageMeta.openGraph.images.map((img) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
      })),
    },
    twitter: {
      card: pageMeta.twitter.card,
      title: pageMeta.twitter.title,
      description: pageMeta.twitter.description,
      images: pageMeta.twitter.images,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-[#fbf9f8] text-[#1b1c1c] antialiased min-h-screen flex flex-col font-body-base selection:bg-primary-fixed selection:text-primary">
        {children}
      </body>
    </html>
  );
}
