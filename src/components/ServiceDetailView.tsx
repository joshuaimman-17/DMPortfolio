import React, { useState } from 'react';
import { PORTFOLIO_DATA, ServiceDetail, WorkDetail } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';

interface ServiceDetailViewProps {
  slug: string;
  onOpenAudit: () => void;
  onSelectWork: (slug: string) => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  slug,
  onOpenAudit,
  onSelectWork,
}) => {
  const { findService, works } = usePortfolioData();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const service = findService(slug) || PORTFOLIO_DATA.services.find((s: ServiceDetail) => s.slug === slug);

  if (!service) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl p-8 sm:p-14 text-center border-y sm:border-y-0 sm:ring-1 sm:ring-neutral-200/80 mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Service Not Found</h2>
        <p className="text-on-surface-variant mb-6 text-sm">
          The requested service practice area could not be located.
        </p>
        <a
          href="#/services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to All Services</span>
        </a>
      </div>
    );
  }

  // Find related works
  const allWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const relatedWorks = allWorks.filter((w: WorkDetail) =>
    (service.relatedWorkSlugs || []).includes(w.slug)
  );

  return (
    <div className="flex flex-col w-full">
      {/* 1. TOP NAVIGATION / BREADCRUMB */}
      <div className="flex items-center justify-between py-3 mb-3 px-2 sm:px-0">
        <a
          href="#/services"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to all services</span>
        </a>

        <div className="text-xs text-on-surface-variant hidden sm:flex items-center gap-2">
          <a href="#/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <a href="#/services" className="hover:text-primary transition-colors">Services</a>
          <span>/</span>
          <span className="text-on-surface font-semibold">{service.title}</span>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl relative z-10 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">{service.icon}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold uppercase tracking-wider">
              {service.tag}
            </span>
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            {service.title}
          </h1>

          <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-3xl">
            {service.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={onOpenAudit}
              className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get a Quote / Book Audit</span>
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </button>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing-approach')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-xl bg-surface-container-low text-on-surface font-semibold text-sm border border-neutral-200/80 hover:bg-surface-container transition-all"
            >
              Pricing Model
            </a>
          </div>
        </div>
      </section>

      {/* 3. WHAT'S INCLUDED & WHO IT'S FOR (2-COL) */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* What's Included */}
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              Deliverables &amp; Outputs
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-4">What’s Included</h2>
            <div className="space-y-3.5">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-neutral-200/60"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-on-surface">{item}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Fully documented, implemented directly in your environment, and verified with telemetry.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who It's For */}
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">target</span>
              Ideal Profile
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-4">Who This Is For</h2>
            <div className="space-y-3.5">
              {service.whoItsFor.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-neutral-200/60"
                >
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                    arrow_forward
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-on-surface">{item}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Designed to bypass internal headcount delays and deliver immediate compounding ROI.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROCESS ROADMAP */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Execution Phases
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
            How We Execute This Practice
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-xl">
            A battle-tested progression turning chaotic acquisition experiments into automated, margin-friendly revenue engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {service.process.map((step, idx) => (
            <div
              key={idx}
              className="bg-surface-container-low p-6 rounded-2xl border border-neutral-200/70 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-primary block mb-2">
                  {step.phase}
                </span>
                <h4 className="font-bold text-base text-on-surface mb-2">{step.title}</h4>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-200/40 text-[11px] font-semibold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                <span>Verified Milestones</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRICING APPROACH */}
      <section
        id="pricing-approach"
        className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        <div className="max-w-3xl">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
            Engagement Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">
            Pricing &amp; Terms
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
            {service.pricingApproach}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-200/60">
            <div className="p-4 rounded-xl bg-surface-container-low border border-neutral-200/60">
              <span className="text-xs text-on-surface-variant font-medium block">Contract Terms</span>
              <span className="font-bold text-sm text-on-surface mt-1 block">Month-to-Month</span>
              <span className="text-[11px] text-secondary font-medium">Cancel anytime</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-neutral-200/60">
              <span className="text-xs text-on-surface-variant font-medium block">Response SLA</span>
              <span className="font-bold text-sm text-on-surface mt-1 block">&lt; 4 Hours</span>
              <span className="text-[11px] text-on-surface-variant">Slack &amp; WhatsApp</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-neutral-200/60">
              <span className="text-xs text-on-surface-variant font-medium block">Access Required</span>
              <span className="font-bold text-sm text-on-surface mt-1 block">Standard Read/Admin</span>
              <span className="text-[11px] text-on-surface-variant">100% Client Ownership</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RELATED CASE STUDIES */}
      {relatedWorks.length > 0 && (
        <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                Documented Outcomes
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Related Case Studies
              </h2>
            </div>
            <a
              href="#/works"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700"
            >
              <span>View all portfolio works</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedWorks.slice(0, 3).map((work: WorkDetail) => (
              <a
                key={work.slug}
                href={`#/works/${work.slug}`}
                className="bg-surface-container-low rounded-2xl overflow-hidden border border-neutral-200/70 hover:-translate-y-1 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-44 overflow-hidden bg-slate-900 relative">
                    <img
                      src={work.coverImage}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-900 text-[11px] font-bold shadow-sm">
                        {work.industry}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-primary block mb-1">{work.client}</span>
                    <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {work.title}
                    </h4>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-neutral-200/50 mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary font-mono">{work.result}</span>
                  <span className="material-symbols-outlined text-[18px] text-primary group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 7. FAQ ACCORDION */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Frequently Asked
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                {service.title} FAQs
              </h2>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-neutral-200/80 bg-surface-container-low overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-on-surface text-sm sm:text-base cursor-pointer hover:text-primary transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform ${
                          isOpen ? 'rotate-180 text-primary' : 'text-neutral-500'
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-neutral-200/40 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. BOTTOM CTA CARD */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary rounded-none sm:rounded-3xl shadow-none sm:shadow-xl shadow-blue-500/20 p-6 sm:p-10 md:p-14 mb-4 sm:mb-[40px] text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
            Sprint Availability
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Deploy {service.title}?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl">
            Book an introductory diagnostic session to review your current telemetry, identify bottlenecks, and calibrate your acquisition playbook.
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
              href="#/services"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Services</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
