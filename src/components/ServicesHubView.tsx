import React, { useState } from 'react';
import { PORTFOLIO_DATA, ServiceDetail } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';

interface ServicesHubViewProps {
  onOpenAudit: () => void;
  onNavigateWork: (slug: string) => void;
}

export const ServicesHubView: React.FC<ServicesHubViewProps> = ({
  onOpenAudit,
  onNavigateWork,
}) => {
  const { services } = usePortfolioData();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const displayServices = services.length > 0 ? services : PORTFOLIO_DATA.services;

  const hubFaqs = [
    {
      q: 'How are client engagements structured?',
      a: 'Engagements typically operate on a flexible monthly advisory retainer with clear milestone deliverables, or sprint-based standalone diagnostics (such as a 14-day technical SEO crawl or an ad account audit). We never require long-term lock-ins.',
    },
    {
      q: 'Do you execute hands-on or advise internal teams?',
      a: 'Both. For early-to-mid stage startups, I handle full hands-on campaign architecture, pixel setups, and landing page CRO. For larger enterprise teams, I provide strategic playbooks, creative briefs, and weekly executive coaching.',
    },
    {
      q: 'What is your typical onboarding timeline?',
      a: 'Initial diagnostic audits and telemetry access take 48-72 hours. First optimization sprints and initial test campaigns launch within 7 to 10 business days.',
    },
    {
      q: 'How do you measure success and attribution?',
      a: 'We build server-side GTM tracking with GA4 and custom Looker Studio dashboards, measuring blended MER (Marketing Efficiency Ratio), CAC payback period, and net incremental revenue rather than channel vanity metrics.',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. HUB HEADER */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl relative z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary font-label-sm text-xs font-semibold uppercase tracking-wider w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Specialized Practice Areas
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl text-on-surface tracking-tight font-bold">
            Full-Funnel Growth Services Built for Scalable Revenue
          </h1>

          <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Eliminating acquisition guesswork with scientific experimentation, algorithmic search dominance, and margin-protected paid media engines.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-neutral-200/60 mt-2">
            <div>
              <div className="font-mono font-bold text-2xl text-secondary">+120%</div>
              <div className="text-xs text-on-surface-variant">Avg. Organic Uplift</div>
            </div>
            <div>
              <div className="font-mono font-bold text-2xl text-primary-container">4.5x</div>
              <div className="text-xs text-on-surface-variant">Blended ROAS</div>
            </div>
            <div>
              <div className="font-mono font-bold text-2xl text-on-surface">₹50L+</div>
              <div className="text-xs text-on-surface-variant">Managed Spend</div>
            </div>
            <div>
              <div className="font-mono font-bold text-2xl text-secondary">30+</div>
              <div className="text-xs text-on-surface-variant">Brands Scaled</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIX SERVICE CARDS */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Capabilities Matrix
          </span>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
            Choose Your Growth Track
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-xl">
            Each service combines forensic diagnostic audits with rigorous weekly sprint execution. Click any track for full deliverables and case studies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service: ServiceDetail) => (
            <div
              key={service.slug}
              className="bg-surface-container-low rounded-2xl p-6 sm:p-7 flex flex-col justify-between border border-neutral-200/70 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-neutral-200">
                    {service.tag.split('•')[0]?.trim() || 'Growth'}
                  </span>
                </div>

                <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed mb-5">
                  {service.summary}
                </p>

                {/* 3 Deliverables Checklist */}
                <div className="space-y-2 pt-3 border-t border-neutral-200/50 mb-6">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Core Deliverables:
                  </span>
                  {service.deliverables.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
                <a
                  href={`#/services/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-700 transition-colors group-hover:translate-x-1"
                >
                  <span>Learn more &amp; view proof</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROCESS STRIP */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
            Execution Protocol
          </span>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
            How Every Service Engages
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant mt-2">
            A repeatable 5-stage cadence that avoids speculative spending and validates unit economics from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {PORTFOLIO_DATA.methodologySteps.map((step) => (
            <div
              key={step.number}
              className="bg-surface-container-low p-5 rounded-xl border border-neutral-200/70 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-2xl font-bold text-primary-container block mb-2">
                  {step.number}
                </span>
                <h4 className="font-bold text-base text-on-surface mb-1">{step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-200/50 flex items-center gap-1.5 text-xs font-semibold text-secondary">
                <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                <span>{step.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Common Questions
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {hubFaqs.map((faq, index) => {
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

      {/* 5. CTA CARD */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary rounded-none sm:rounded-3xl shadow-none sm:shadow-xl shadow-blue-500/20 p-6 sm:p-10 md:p-14 mb-4 sm:mb-[40px] text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
            Next Steps
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Not Sure Which Track Fits Your Stage?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl">
            Book a 30-minute forensic growth diagnostic. We will review your current ad accounts, organic rankings, and unit economics at zero obligation.
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
              href="#/works"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span>Explore Case Studies</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
