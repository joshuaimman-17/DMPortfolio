import React from 'react';
import { PORTFOLIO_DATA, WorkDetail, ShowcaseItem } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';

interface WorkDetailViewProps {
  slug: string;
  onOpenAudit: () => void;
  onOpenLightboxById: (id: string) => void;
}

export const WorkDetailView: React.FC<WorkDetailViewProps> = ({
  slug,
  onOpenAudit,
  onOpenLightboxById,
}) => {
  const { works, showcase } = usePortfolioData();
  const allWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const allShowcase = showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase;

  const currentIndex = allWorks.findIndex((w: WorkDetail) => w.slug === slug);
  const work = allWorks[currentIndex];

  if (!work) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl p-8 sm:p-14 text-center border-y sm:border-y-0 sm:ring-1 sm:ring-neutral-200/80 mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Case Study Not Found</h2>
        <p className="text-on-surface-variant mb-6 text-sm">
          The requested portfolio case study could not be located.
        </p>
        <a
          href="#/works"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to All Works</span>
        </a>
      </div>
    );
  }

  // Next / Prev Works
  const prevWork =
    currentIndex > 0 ? allWorks[currentIndex - 1] : allWorks[allWorks.length - 1];
  const nextWork =
    currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1] : allWorks[0];

  // Matched proof items from showcase
  const proofItems = allShowcase.filter(
    (sc: ShowcaseItem) => work.proofItemIds?.includes(sc.id) || sc.workSlug === work.slug
  );

  return (
    <div className="flex flex-col w-full">
      {/* 1. TOP BREADCRUMB & HUB LINK */}
      <div className="flex items-center justify-between py-3 mb-3 px-2 sm:px-0">
        <a
          href="#/works"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to full portfolio</span>
        </a>

        <div className="text-xs text-on-surface-variant hidden sm:flex items-center gap-2">
          <a href="#/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <a href="#/works" className="hover:text-primary transition-colors">Works</a>
          <span>/</span>
          <span className="text-on-surface font-semibold">{work.client}</span>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold uppercase tracking-wider">
                {work.industry}
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold border border-neutral-200">
                Duration: {work.duration}
              </span>
            </div>

            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {work.client}
            </span>

            <h1 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-on-surface tracking-tight leading-tight">
              {work.title}
            </h1>

            <div className="flex flex-wrap gap-2 pt-2">
              {work.services.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold border border-neutral-200/80"
                >
                  {srv}
                </span>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAudit}
                className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Book Similar Strategy</span>
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-neutral-200/80 bg-slate-900 relative">
              <img
                src={work.coverImage}
                alt={work.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur text-white text-xs flex items-center justify-between">
                <span>Verified Metric:</span>
                <span className="font-mono font-bold text-secondary text-sm">{work.result}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR RESULT STAT CARDS */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-10 border-y sm:border-y-0 border-neutral-200/60">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {work.stats.map((st, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col justify-between"
            >
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                {st.label}
              </span>
              <div className="my-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-secondary">
                  {st.value}
                </span>
              </div>
              {st.trend && (
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span className="capitalize">{st.trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. GOAL, CHALLENGE & STRATEGY */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goal */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-neutral-200/70">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[22px]">flag</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">The Strategic Goal</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {work.goal}
            </p>
          </div>

          {/* Challenge */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-neutral-200/70">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">The Bottleneck</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {work.challenge}
            </p>
          </div>

          {/* Strategy */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-neutral-200/70">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">The Growth Strategy</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {work.strategy}
            </p>
          </div>
        </div>
      </section>

      {/* 5. EXECUTION TIMELINE */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Implementation Sprints
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Execution Timeline &amp; Milestones
          </h2>
          <p className="text-sm text-on-surface-variant max-w-xl">
            How we moved through technical clean-up, creative testing, and consolidated budget scaling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {work.execution.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-primary block mb-2">
                  {step.step}
                </span>
                <h4 className="font-bold text-base text-on-surface mb-2">{step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-200/50 flex items-center gap-1 text-[11px] font-semibold text-secondary">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Sprint Complete</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PROOF GALLERY (BROWSER FRAME MOCKUPS & LIGHTBOX ZOOM) */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Forensic Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Proof Gallery &amp; Campaign Artifacts
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xl mt-1">
              Click any screenshot or creative to view the full unedited high-resolution proof artifact.
            </p>
          </div>
          <div className="text-xs text-primary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            <span>Click to expand in Lightbox</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(proofItems.length > 0 ? proofItems : PORTFOLIO_DATA.showcase.slice(0, 3)).map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLightboxById(item.id)}
              className="bg-surface-container-low rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
            >
              {/* Browser frame mockup */}
              <div>
                <div className="bg-slate-800 px-3 py-2 flex items-center gap-1.5 border-b border-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  <span className="ml-2 text-[10px] text-slate-300 font-mono truncate">
                    {item.url || 'analytics.google.com'}
                  </span>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1">
                    {item.badge || item.type}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0 text-xs text-on-surface-variant flex items-center justify-between border-t border-neutral-200/50 mt-2">
                <span>{item.client}</span>
                <span className="text-primary font-semibold flex items-center gap-1">
                  <span>Zoom</span>
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TESTIMONIAL & KEY LEARNINGS (2 COLUMNS) */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Testimonial Quote */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary-fixed/30 to-surface-container-low border border-primary/20 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary text-[36px] mb-3">
                format_quote
              </span>
              <p className="text-base sm:text-lg text-on-surface italic font-medium leading-relaxed mb-6">
                "{work.testimonial.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60">
              <div className="w-12 h-12 rounded-full bg-primary-container text-white font-bold flex items-center justify-center font-mono">
                {work.testimonial.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-sm text-on-surface">{work.testimonial.author}</div>
                <div className="text-xs text-on-surface-variant">{work.testimonial.role}</div>
              </div>
            </div>
          </div>

          {/* Key Learnings */}
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              Strategic Takeaways
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-4">Key Growth Learnings</h2>
            <div className="space-y-3">
              {work.learnings.map((learning, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-neutral-200/60"
                >
                  <span className="font-mono text-xs font-bold text-primary mt-0.5">
                    0{idx + 1}.
                  </span>
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed">{learning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEXT / PREVIOUS NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-[40px]">
        <a
          href={`#/works/${prevWork.slug}`}
          className="p-5 rounded-2xl sm:rounded-3xl bg-surface-container-lowest border border-neutral-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <span className="material-symbols-outlined text-primary text-[28px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <div className="truncate">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">
              Previous Case Study
            </span>
            <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate block">
              {prevWork.client}
            </span>
          </div>
        </a>

        <a
          href={`#/works/${nextWork.slug}`}
          className="p-5 rounded-2xl sm:rounded-3xl bg-surface-container-lowest border border-neutral-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-end text-right gap-4 group"
        >
          <div className="truncate">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">
              Next Case Study
            </span>
            <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate block">
              {nextWork.client}
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-[28px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </a>
      </div>

      {/* 9. BOTTOM CTA */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary rounded-none sm:rounded-3xl shadow-none sm:shadow-xl shadow-blue-500/20 p-6 sm:p-10 md:p-14 mb-4 sm:mb-[40px] text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
            Replicate These Results
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Scale Your Brand's Acquisition?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl">
            Let's dissect your current numbers and formulate an aggressive, predictable growth sprint.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenAudit}
              className="px-6 py-3.5 rounded-xl bg-white text-primary font-bold text-sm shadow hover:bg-neutral-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Schedule Growth Diagnostic</span>
            </button>
            <a
              href="#/works"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Case Studies</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
