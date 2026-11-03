import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getWorks, getShowcase, getSiteSettings } from '@/lib/data';
import { PORTFOLIO_DATA, WorkDetail, ShowcaseItem } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { LightboxTrigger, AuditButton } from '@/components/common/ActionButtons';
import { DriveImage } from '@/components/common/DriveImage';
import { LightboxItem } from '@/components/LightboxModal';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'Proof of Work & Case Studies | Alex Rivera',
  description:
    'Forensic case studies, unedited Google Search Console curves, and high-converting ad creative assets across B2B SaaS and D2C brands.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function WorksHubPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const rawType = resolvedSearchParams.type;
  const activeType = typeof rawType === 'string' ? rawType.toLowerCase() : 'all';

  const [works, showcase, settings] = await Promise.all([
    getWorks(),
    getShowcase(),
    getSiteSettings(),
  ]);

  const displayWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const displayShowcase = showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase;

  const lightboxItems: LightboxItem[] = displayShowcase.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.image,
    badge: s.badge || s.type,
    subtitle: s.client,
    client: s.client,
    highlight: s.highlight,
    caption: s.title,
  }));

  const filterChips = [
    { id: 'all', label: 'All Work' },
    { id: 'case-studies', label: 'Case Studies', count: displayWorks.length },
    { id: 'poster', label: 'Posters', count: displayShowcase.filter((s) => s.type === 'poster').length },
    { id: 'analytics', label: 'Analytics', count: displayShowcase.filter((s) => s.type === 'analytics').length },
    { id: 'seo-site', label: 'SEO Sites', count: displayShowcase.filter((s) => s.type === 'seo-site').length },
    { id: 'social', label: 'Social Media', count: displayShowcase.filter((s) => s.type === 'social').length },
    { id: 'ad', label: 'Ads', count: displayShowcase.filter((s) => s.type === 'ad').length },
    { id: 'email', label: 'Email', count: displayShowcase.filter((s) => s.type === 'email').length },
  ];

  type UnifiedItem =
    | { kind: 'work'; data: WorkDetail }
    | { kind: 'showcase'; data: ShowcaseItem; originalIndex: number };

  const allItems: UnifiedItem[] = [];
  displayWorks.forEach((w) => allItems.push({ kind: 'work', data: w }));
  displayShowcase.forEach((s, idx) =>
    allItems.push({ kind: 'showcase', data: s, originalIndex: idx })
  );

  const filteredItems = allItems.filter((item) => {
    if (activeType === 'all') return true;
    if (activeType === 'case-studies') return item.kind === 'work';
    if (item.kind === 'showcase') {
      return item.data.type === activeType;
    }
    return false;
  });

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

        {/* Filter Chips in URL */}
        <div className="w-full">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterChips.map((chip) => {
              const isActive = activeType === chip.id;
              const href = chip.id === 'all' ? '/works' : `/works?type=${chip.id}`;
              return (
                <Link
                  key={chip.id}
                  href={href}
                  scroll={false}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-lowest text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>{chip.label}</span>
                  {chip.count !== undefined && (
                    <span className={`ml-1.5 text-[10px] ${isActive ? 'text-blue-100' : 'text-neutral-400'}`}>
                      ({chip.count})
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Unified Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => {
            if (item.kind === 'work') {
              const wrk = item.data;
              return (
                <div
                  key={`work-${wrk.slug}`}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-neutral-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={wrk.coverImage}
                        alt={wrk.title}
                        title={wrk.title}
                        frameType="work"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold">
                          {wrk.industry}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-lg bg-secondary text-white font-mono font-bold text-xs shadow">
                          {wrk.result}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                        {wrk.client} · {wrk.duration}
                      </div>
                      <h3 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {wrk.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                        {wrk.challenge}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between">
                    <Link
                      href={`/works/${wrk.slug}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Deep Teardown</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            } else {
              const sc = item.data;
              return (
                <LightboxTrigger
                  key={`showcase-${sc.id}`}
                  index={item.originalIndex}
                  items={lightboxItems}
                  className="group"
                >
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col justify-between">
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      <DriveImage
                        src={sc.image}
                        alt={sc.title}
                        title={sc.title}
                        frameType={sc.type}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[10px] font-bold uppercase tracking-wider">
                          {sc.badge || sc.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        {sc.client}
                      </div>
                      <h4 className="font-bold text-sm text-on-surface mt-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {sc.title}
                      </h4>
                      {sc.highlight && (
                        <p className="text-xs text-secondary font-semibold mt-1 line-clamp-1">
                          {sc.highlight}
                        </p>
                      )}
                    </div>
                  </div>
                </LightboxTrigger>
              );
            }
          })}
        </section>

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
