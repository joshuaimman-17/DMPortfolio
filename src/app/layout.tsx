import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Alex Rivera | Growth Marketer - Performance Portfolio',
  description:
    'Performance marketing portfolio and client acquisition platform for senior digital marketing expert Alex Rivera. Featuring full-funnel case studies, verified organic SERP rankings, interactive ROAS calculator, and growth audit booking.',
  metadataBase: new URL('https://alexriveragrowth.com'),
  openGraph: {
    title: 'Alex Rivera | Growth Marketer - Performance Portfolio',
    description:
      'Performance marketing portfolio and client acquisition platform for senior digital marketing expert Alex Rivera.',
    url: 'https://alexriveragrowth.com',
    siteName: 'Alex Rivera Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alex Rivera | Growth Marketer - Performance Portfolio',
    description:
      'Performance marketing portfolio and client acquisition platform for senior digital marketing expert Alex Rivera.',
  },
};

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
