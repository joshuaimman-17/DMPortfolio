'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WorkDetail, ShowcaseItem } from '@/types/content';
import { LightboxTrigger } from '@/components/common/ActionButtons';
import { DriveImage } from '@/components/common/DriveImage';
import { LightboxItem } from '@/components/LightboxModal';

type GalleryProps = {
  works: WorkDetail[];
  showcase: ShowcaseItem[];
  lightboxItems: LightboxItem[];
};

type UnifiedItem =
  | { kind: 'work'; data: WorkDetail }
  | { kind: 'showcase'; data: ShowcaseItem; originalIndex: number };

/**
 * Chip row + grid for /works. Filtering is client-side (?type=...), so the /works route itself
 * stays static and its metadata renders inside <head>. Filtered URLs are kept out of the index
 * by the X-Robots-Tag rule in src/lib/indexing.ts, not by per-page metadata.
 */
function GalleryView({ works, showcase, lightboxItems, activeType }: GalleryProps & { activeType: string }) {
  const filterChips = [
    { id: 'all', label: 'All Work' },
    { id: 'case-studies', label: 'Case Studies', count: works.length },
    { id: 'poster', label: 'Posters', count: showcase.filter((s) => s.type === 'poster').length },
    { id: 'analytics', label: 'Analytics', count: showcase.filter((s) => s.type === 'analytics').length },
    { id: 'seo-site', label: 'SEO Sites', count: showcase.filter((s) => s.type === 'seo-site').length },
    { id: 'social', label: 'Social Media', count: showcase.filter((s) => s.type === 'social').length },
    { id: 'ad', label: 'Ads', count: showcase.filter((s) => s.type === 'ad').length },
    { id: 'email', label: 'Email', count: showcase.filter((s) => s.type === 'email').length },
  ];

  const allItems: UnifiedItem[] = [];
  works.forEach((w) => allItems.push({ kind: 'work', data: w }));
  showcase.forEach((s, idx) => allItems.push({ kind: 'showcase', data: s, originalIndex: idx }));

  const filteredItems = allItems.filter((item) => {
    if (activeType === 'all') return true;
    if (activeType === 'case-studies') return item.kind === 'work';
    if (item.kind === 'showcase') {
      return item.data.type === activeType;
    }
    return false;
  });

  return (
    <>
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
        {filteredItems.map((item) => {
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
          }

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
                    <p className="text-xs text-secondary font-semibold mt-1 line-clamp-1">{sc.highlight}</p>
                  )}
                </div>
              </div>
            </LightboxTrigger>
          );
        })}
      </section>
    </>
  );
}

function FilteredGallery(props: GalleryProps) {
  const rawType = useSearchParams().get('type');
  const activeType = rawType ? rawType.toLowerCase() : 'all';
  return <GalleryView {...props} activeType={activeType} />;
}

export function WorksGallery(props: GalleryProps) {
  // useSearchParams() needs a Suspense boundary so the page can be prerendered statically.
  // The fallback is the unfiltered ("all") gallery, so crawlers get the full grid in the HTML.
  return (
    <Suspense fallback={<GalleryView {...props} activeType="all" />}>
      <FilteredGallery {...props} />
    </Suspense>
  );
}
