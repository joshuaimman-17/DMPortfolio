import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServices, getSiteSettings } from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { AuditButton } from '@/components/common/ActionButtons';
import { HomeFaqAccordion } from '@/components/home/HomeFaqAccordion';

export const metadata: Metadata = {
  title: 'Growth Services & Capabilities | Alex Rivera',
  description:
    'Full-funnel growth services built for scalable revenue. Technical SEO, high-ROAS paid media across Google and Meta, and conversion rate optimization.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function ServicesHubPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ]);

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
    <SiteShell settings={settings}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hub Header */}
        <section className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 md:p-14 border border-neutral-200/90 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Specialized Practice Areas
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
              Full-Funnel Growth Services Built for Scalable Revenue
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Eliminating acquisition guesswork with scientific experimentation, algorithmic search dominance, and margin-protected paid media engines.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-neutral-200/60 mt-2">
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

        {/* Six Service Cards */}
        <section>
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Capabilities Matrix
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Choose Your Growth Track
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xl">
              Each service combines forensic diagnostic audits with rigorous weekly sprint execution. Click any track for full deliverables and case studies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service) => (
              <div
                key={service.slug}
                className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 flex flex-col justify-between border border-neutral-200/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">
                        {service.icon}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-primary px-3 py-1 rounded-full bg-primary-fixed/30 uppercase tracking-wider">
                      {service.tag.split('•')[0] || 'Core'}
                    </span>
                  </div>

                  <h3 className="font-headline-md text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mt-2.5 line-clamp-3">
                    {service.summary}
                  </p>

                  <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Core Deliverables
                    </div>
                    {(service.deliverables || []).slice(0, 3).map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">
                          check
                        </span>
                        <span className="line-clamp-1">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-200/60 flex items-center justify-between">
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Track Details</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <AuditButton className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer">
                    Book Audit
                  </AuditButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
          <div className="max-w-xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Client Advisory FAQ
            </span>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface mt-1">
              Frequently Asked Questions
            </h3>
          </div>
          <HomeFaqAccordion items={hubFaqs} />
        </section>
      </div>
    </SiteShell>
  );
}
