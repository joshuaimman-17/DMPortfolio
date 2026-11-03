import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceBySlug, getWorks, getSiteSettings, getServices } from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { AuditButton } from '@/components/common/ActionButtons';
import { DriveImage } from '@/components/common/DriveImage';
import { HomeFaqAccordion } from '@/components/home/HomeFaqAccordion';
import { getServiceJsonLd } from '@/lib/jsonld';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: 'Service Not Found | Alex Rivera',
      description: 'The requested growth marketing service could not be located.',
    };
  }

  return {
    title: `${service.title} | Growth Practice Area | Alex Rivera`,
    description: service.summary,
    openGraph: {
      title: `${service.title} | Growth Practice Area | Alex Rivera`,
      description: service.summary,
    },
  };
}

export const revalidate = 300;

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, allWorks, settings] = await Promise.all([
    getServiceBySlug(slug),
    getWorks(),
    getSiteSettings(),
  ]);

  if (!service) {
    notFound();
  }

  const relatedWorks = (allWorks.length > 0 ? allWorks : PORTFOLIO_DATA.works).filter(
    (w) => (service.relatedWorkSlugs || []).includes(w.slug)
  );

  const jsonLd = getServiceJsonLd(service);

  return (
    <SiteShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb & Hub Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to all practice areas</span>
          </Link>

          <div className="text-xs text-on-surface-variant hidden sm:flex items-center gap-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary">Services</Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">{service.title}</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 md:p-14 border border-neutral-200/90 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">{service.icon}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold uppercase tracking-wider">
                {service.tag}
              </span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
              {service.title}
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed">
              {service.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <AuditButton className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all inline-flex items-center gap-2 cursor-pointer">
                <span>Book Diagnostic for This Service</span>
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </AuditButton>

              <a
                href="#pricing"
                className="px-6 py-3.5 rounded-xl bg-surface-container-low text-on-surface font-semibold text-sm hover:bg-neutral-200/80 transition-all inline-flex items-center gap-2 border border-neutral-200"
              >
                <span>Pricing &amp; Engagements</span>
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </a>
            </div>
          </div>
        </section>

        {/* Deliverables & Who It's For Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Deliverables */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[24px]">task_alt</span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                Concrete Deliverables
              </h2>
            </div>
            <ul className="space-y-3">
              {service.deliverables.map((del, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-on-surface">
                  <span className="w-5 h-5 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </span>
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who It's For */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[24px]">target</span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                Ideal Company Profile
              </h2>
            </div>
            <ul className="space-y-3">
              {service.whoItsFor.map((target, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-on-surface">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    →
                  </span>
                  <span>{target}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process Phases */}
        <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Step-by-Step Playbook
            </span>
            <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mt-1">
              Engagement Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/80 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                    {step.phase}
                  </span>
                  <h3 className="font-headline-md text-base font-bold text-on-surface mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Approach */}
        <section id="pricing" className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm scroll-mt-28">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Investment Model
            </span>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mt-1 mb-3">
              Pricing &amp; Retainer Structure
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              {service.pricingApproach}
            </p>
            <AuditButton className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow inline-flex items-center gap-2 cursor-pointer">
              <span>Request Custom Engagement Proposal</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </AuditButton>
          </div>
        </section>

        {/* Related Case Studies */}
        {relatedWorks.length > 0 && (
          <section>
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Verified Proof
              </span>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                Case Studies for This Track
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedWorks.map((w) => (
                <div
                  key={w.slug}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={w.coverImage}
                        alt={w.title}
                        title={w.title}
                        frameType="work"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-bold">
                          {w.industry}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {w.client}
                      </div>
                      <h3 className="font-bold text-sm text-on-surface mt-1 line-clamp-2">
                        {w.title}
                      </h3>
                      <div className="font-mono font-bold text-secondary text-xs mt-2">
                        {w.result}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <Link
                      href={`/works/${w.slug}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Case Study</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-6">
              Service Questions &amp; Answers
            </h2>
            <HomeFaqAccordion items={service.faqs} />
          </section>
        )}
      </div>
    </SiteShell>
  );
}
