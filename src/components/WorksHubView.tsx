import React, { useState, useMemo } from 'react';
import { PORTFOLIO_DATA, WorkDetail, ShowcaseItem, RankedSite } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';

interface WorksHubViewProps {
  onOpenAudit: () => void;
  onOpenLightboxById: (id: string) => void;
}

type FilterChip =
  | 'all'
  | 'case-studies'
  | 'posters'
  | 'analytics'
  | 'seo-sites'
  | 'social'
  | 'ads'
  | 'email';

export const WorksHubView: React.FC<WorksHubViewProps> = ({
  onOpenAudit,
  onOpenLightboxById,
}) => {
  const { works, showcase } = usePortfolioData();
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const displayWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const displayShowcase = showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase;

  const filterChips: { id: FilterChip; label: string; count?: number }[] = [
    { id: 'all', label: 'All Work' },
    { id: 'case-studies', label: 'Case Studies', count: displayWorks.length },
    { id: 'posters', label: 'Posters', count: displayShowcase.filter(s => s.type === 'poster').length },
    { id: 'analytics', label: 'Analytics', count: displayShowcase.filter(s => s.type === 'analytics').length },
    { id: 'seo-sites', label: 'SEO Sites', count: displayShowcase.filter(s => s.type === 'seo-site').length },
    { id: 'social', label: 'Social Media', count: displayShowcase.filter(s => s.type === 'social').length },
    { id: 'ads', label: 'Ads', count: displayShowcase.filter(s => s.type === 'ad').length },
    { id: 'email', label: 'Email', count: displayShowcase.filter(s => s.type === 'email').length },
  ];

  // Combine works and showcase items with a unified item format for gallery
  type UnifiedGalleryItem =
    | { kind: 'work'; data: WorkDetail }
    | { kind: 'showcase'; data: ShowcaseItem };

  const allItems = useMemo<UnifiedGalleryItem[]>(() => {
    const list: UnifiedGalleryItem[] = [];

    // Add works
    displayWorks.forEach((w) => list.push({ kind: 'work', data: w }));

    // Add showcase items
    displayShowcase.forEach((s) => list.push({ kind: 'showcase', data: s }));

    return list;
  }, [displayWorks, displayShowcase]);

  const filteredItems = useMemo<UnifiedGalleryItem[]>(() => {
    if (activeFilter === 'all') return allItems;
    if (activeFilter === 'case-studies') return allItems.filter((item) => item.kind === 'work');
    if (activeFilter === 'posters') return allItems.filter((item) => item.kind === 'showcase' && item.data.type === 'poster');
    if (activeFilter === 'analytics') return allItems.filter((item) => item.kind === 'showcase' && item.data.type === 'analytics');
    if (activeFilter === 'seo-sites') return allItems.filter((item) => item.kind === 'showcase' && item.data.type === 'seo-site');
    if (activeFilter === 'social') return allItems.filter((item) => item.kind === 'showcase' && item.data.type === 'social');
    if (activeFilter === 'ads') return allItems.filter((item) => item.kind === 'showcase' && item.data.type === 'ad');
    if (activeFilter === 'email') return allItems.filter((item) => item.kind === 'showcase' && item.data.type === 'email');
    return allItems;
  }, [activeFilter, allItems]);

  const displayedItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="flex flex-col w-full">
      {/* 1. HEADER */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl relative z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/40 text-secondary font-label-sm text-xs font-semibold uppercase tracking-wider w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Forensic Portfolio &amp; Deliverables
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Proof of Work: Real Revenue &amp; Scalable Ranking
          </h1>

          <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Every case study below represents real ad accounts, unedited Search Console logs, high-converting ad creative scripts, and programmatic search architecture.
          </p>
        </div>
      </section>

      {/* 2. FILTER CHIPS (HORIZONTALLY SCROLLABLE ON MOBILE) */}
      <div className="w-full mb-6 px-1 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setActiveFilter(chip.id);
                  setVisibleCount(9);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-neutral-200/70'
                }`}
              >
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MASONRY / RESPONSIVE GALLERY */}
      <section className="w-full mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item, idx) => {
            if (item.kind === 'work') {
              const work = item.data;
              return (
                <div
                  key={`work-${work.slug}`}
                  className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image */}
                    <a href={`#/works/${work.slug}`} className="block relative w-full h-52 overflow-hidden bg-slate-900">
                      <img
                        src={work.coverImage}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 text-xs font-bold shadow-sm">
                          {work.industry}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                          Case Study
                        </span>
                      </div>
                    </a>

                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold mb-2">
                        <span>{work.client}</span>
                        <span>{work.duration}</span>
                      </div>

                      <a href={`#/works/${work.slug}`}>
                        <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-3">
                          {work.title}
                        </h3>
                      </a>

                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                        {work.goal}
                      </p>

                      {/* Stat Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200/60">
                        {work.stats.slice(0, 2).map((st, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-surface-container-low border border-neutral-200/40">
                            <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">
                              {st.label}
                            </span>
                            <span className="font-mono font-bold text-sm text-secondary">
                              {st.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <a
                      href={`#/works/${work.slug}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-neutral-200/70"
                    >
                      <span>Read Full Forensic Breakdown</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
              );
            } else {
              // Showcase item
              const sc = item.data;
              return (
                <div
                  key={`showcase-${sc.id}`}
                  onClick={() => onOpenLightboxById(sc.id)}
                  className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Media Container */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={sc.image}
                        alt={sc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[11px] font-semibold border border-white/20 capitalize">
                          {sc.badge || sc.type}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                        {sc.client}
                      </span>
                      <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors mb-2">
                        {sc.title}
                      </h4>

                      {/* Optional metrics / before-after */}
                      {sc.metrics && sc.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-200/50">
                          {sc.metrics.slice(0, 2).map((m, mi) => (
                            <div key={mi} className="text-xs">
                              <span className="text-[10px] text-on-surface-variant block">{m.label}</span>
                              <span className="font-mono font-bold text-primary">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {sc.before && sc.after && (
                        <div className="flex items-center gap-2 mt-3 pt-2 text-xs">
                          <span className="text-on-surface-variant">Traffic:</span>
                          <span className="line-through text-neutral-400">{sc.before}</span>
                          <span className="material-symbols-outlined text-[14px] text-secondary">trending_up</span>
                          <span className="font-bold text-secondary font-mono">{sc.after}</span>
                        </div>
                      )}

                      {sc.highlight && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-container/40 text-secondary text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>{sc.highlight}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-0 flex items-center justify-between text-xs text-primary font-semibold border-t border-neutral-200/40 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                      <span>Click to view proof artifact</span>
                    </span>
                    {sc.workSlug && (
                      <a
                        href={`#/works/${sc.workSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-on-surface-variant hover:text-primary underline"
                      >
                        Case Study →
                      </a>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredItems.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-8 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm border border-neutral-200/80 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Load More Deliverables</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. SITES I'VE RANKED #1 TO #3 STRIP */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              Organic Search Proof
            </div>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Sites I've Ranked #1 to #3
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1">
              Commercial intent keywords held across major algorithmic Core Updates.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-container/30 text-secondary text-xs font-semibold border border-secondary/20">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Zero Toxic PBNs • 100% White-Hat</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PORTFOLIO_DATA.rankedSites.map((site: RankedSite, idx: number) => (
            <div
              key={idx}
              className="bg-surface-container-low rounded-2xl overflow-hidden border border-neutral-200/70 flex flex-col justify-between hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="w-full h-36 relative overflow-hidden bg-slate-100">
                  <img
                    alt={site.domain}
                    className="w-full h-full object-cover"
                    src={site.image}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold text-slate-800 shadow-sm">
                      {site.industry}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="font-mono font-bold text-sm text-on-surface">{site.domain}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{site.description}</div>
                  <div className="mt-3 pt-2.5 border-t border-neutral-200/50">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Target Keyword</span>
                    <span className="text-xs font-semibold text-on-surface">"{site.keyword}"</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-secondary-container/40 text-secondary text-xs font-semibold">
                  <span>Google Rank</span>
                  <span className="font-bold font-mono">{site.rankBadge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA CARD */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary rounded-none sm:rounded-3xl shadow-none sm:shadow-xl shadow-blue-500/20 p-6 sm:p-10 md:p-14 mb-4 sm:mb-[40px] text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
            Let's Talk Numbers
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Have a Specific Growth Target in Mind?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl">
            Schedule a diagnostic call to model your customer acquisition unit economics, payback schedule, and organic expansion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenAudit}
              className="px-6 py-3.5 rounded-xl bg-white text-primary font-bold text-sm shadow hover:bg-neutral-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Book Growth Diagnostic</span>
            </button>
            <a
              href="#/"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span>Back to Home</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
