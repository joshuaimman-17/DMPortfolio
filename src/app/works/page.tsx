import React from 'react';
import type { Metadata } from 'next';
import { WorksGallery } from '@/components/works/WorksGallery';
import { getWorks, getShowcase, getSiteSettings, getPageMetadata } from '@/lib/data';
import { SiteShell } from '@/context/ModalContext';
import { AuditButton } from '@/components/common/ActionButtons';
import { LightboxItem } from '@/components/LightboxModal';

export const revalidate = false;

// The only filter values that get their own canonical URL (hardcoded: must match the chip ids in
// components/works/WorksGallery.tsx). Anything else (unknown ?type=, tracking params, ...) canonicalizes to /works.
const FILTER_TYPES = ['case-studies', 'poster', 'analytics', 'seo-site', 'social', 'ad', 'email'];

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // Each known filter view self-canonicalizes (/works?type=poster -> itself) and is indexable.
  // Reading searchParams makes this route dynamic; next.config.ts sets htmlLimitedBots so the tags still
  // render inside <head> for every crawler instead of being streamed into <body>.
  const { type } = await searchParams;
  const filter = typeof type === 'string' && FILTER_TYPES.includes(type) ? type : null;
  const pageMeta = await getPageMetadata('route_works', {
    title: 'Proof of Work & Case Studies',
    description:
      'Forensic case studies, unedited Google Search Console curves, and high-converting ad creative assets across B2B SaaS and D2C brands.',
    path: filter ? `/works?type=${filter}` : '/works',
  });

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: pageMeta.alternates.canonical,
    },
    openGraph: {
      title: pageMeta.openGraph.title,
      description: pageMeta.openGraph.description,
      url: pageMeta.openGraph.url,
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

export default async function WorksHubPage() {
  const [works, showcase, settings] = await Promise.all([
    getWorks(),
    getShowcase(),
    getSiteSettings(),
  ]);

  const lightboxItems: LightboxItem[] = showcase.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.image,
    badge: s.badge || s.type,
    subtitle: s.client,
    client: s.client,
    highlight: s.highlight,
    caption: s.title,
  }));

  return (
    <SiteShell settings={settings} defaultLightboxItems={lightboxItems}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <section className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 md:p-14 border border-neutral-200/90 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/40 text-secondary text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Forensic Portfolio &amp; Deliverables
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
              Proof of Work: Real Revenue &amp; Scalable Ranking
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Every case study below represents real ad accounts, unedited Search Console logs, high-converting ad creative scripts, and programmatic search architecture.
            </p>
          </div>
        </section>

        <WorksGallery works={works} showcase={showcase} lightboxItems={lightboxItems} />

        {/* Bottom CTA */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 border border-neutral-200 text-center max-w-3xl mx-auto shadow-sm space-y-4">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">
            Need Similar Multi-Channel Growth Results?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            I diagnose pixel discrepancies, ad creative drop-offs, and organic keyword cannibalization on a direct 30-minute diagnostic session.
          </p>
          <div className="pt-2">
            <AuditButton className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md inline-flex items-center gap-2 cursor-pointer">
              <span>Book a Complimentary Growth Diagnostic</span>
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            </AuditButton>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
