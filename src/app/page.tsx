import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getServices,
  getWorks,
  getShowcase,
  getPosts,
  getTestimonials,
  getSiteSettings,
  getPageMetadata,
} from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { AuditButton, LightboxTrigger } from '@/components/common/ActionButtons';
import { DriveImage } from '@/components/common/DriveImage';
import { HomeMetricsBar } from '@/components/home/HomeMetricsBar';
import { HomeRoasWrapper } from '@/components/home/HomeRoasWrapper';
import { HomeContactForm } from '@/components/home/HomeContactForm';
import { HomeFaqAccordion } from '@/components/home/HomeFaqAccordion';
import { MotionReveal } from '@/components/common/MotionWrapper';
import { getPersonJsonLd } from '@/lib/jsonld';
import { LightboxItem } from '@/components/LightboxModal';

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMetadata('route_home', {
    title: 'Alex Rivera | Growth Marketer - Performance Portfolio',
    description:
      'Performance marketing portfolio and client acquisition platform for senior digital marketing expert. Featuring full-funnel case studies, verified organic SERP rankings, interactive ROAS calculator, and growth audit booking.',
    path: '/',
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

export default async function HomePage() {
  const [services, works, showcase, posts, testimonials, settings] = await Promise.all([
    getServices(),
    getWorks(),
    getShowcase(),
    getPosts(),
    getTestimonials(),
    getSiteSettings(),
  ]);

  const activeShowcase = showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase;
  const activeServices = services.length > 0 ? services : PORTFOLIO_DATA.services;
  const activeWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const activePosts = posts.length > 0 ? posts : PORTFOLIO_DATA.blogPosts;
  const activeTestimonials = testimonials.length > 0 ? testimonials : PORTFOLIO_DATA.testimonials;

  const lightboxItems: LightboxItem[] = activeShowcase.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.image,
    badge: s.badge || s.type,
    subtitle: s.client,
    client: s.client,
    highlight: s.highlight,
    caption: s.title,
  }));

  const homeFaqs = [
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
    {
      q: 'What spend level makes the most sense for an engagement?',
      a: 'Clients usually invest between ₹3L/month to ₹30L+/month ($4k to $40k+/month) in paid acquisition or have at least 50k+ monthly organic visitors seeking algorithmic monetization and technical CRO.',
    },
    {
      q: 'Do you work with venture-backed SaaS or D2C eCommerce?',
      a: 'Both. I specialize in high-ticket B2B SaaS acquisition funnels as well as high-velocity D2C eCommerce brands where creative iteration speed and retention economics dictate profitability.',
    },
  ];

  const jsonLd = getPersonJsonLd();

  const heroAvatar =
    settings.hero.avatar ||
    settings.hero.image ||
    PORTFOLIO_DATA.profile.avatar;

  return (
    <SiteShell settings={settings} defaultLightboxItems={lightboxItems}>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16 sm:space-y-24">
        {/* =========================================================================
            SECTION 1: #home (HERO + METRICS)
           ========================================================================= */}
        <section id="home" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest border border-neutral-200/90 shadow-xl p-6 sm:p-10 md:p-12 lg:p-14">
              {/* Subtle background ambient blurs */}
              <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
                {/* Left Content Column */}
                <div className="lg:col-span-7 flex flex-col items-start gap-6">
                  {/* Eyebrow Tag */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed/50 text-primary text-xs font-semibold uppercase tracking-wider w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>{settings.hero.roleTag || PORTFOLIO_DATA.profile.roleTag}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-headline-xl text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-on-surface tracking-tight leading-[1.12]">
                    {settings.hero.headline}
                  </h1>

                  {/* Subtext */}
                  <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                    {settings.hero.subtext || PORTFOLIO_DATA.profile.subtext}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
                    <AuditButton className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all inline-flex items-center gap-2 cursor-pointer">
                      <span>Book a Free Growth Diagnostic</span>
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    </AuditButton>

                    <a
                      href="#works"
                      className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-surface-container-low text-on-surface font-semibold text-sm hover:bg-neutral-200/80 transition-all inline-flex items-center gap-2 border border-neutral-200"
                    >
                      <span>Explore Case Studies</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                    </a>
                  </div>

                  {/* Trust Rating & Social Proof */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-on-surface-variant text-xs font-semibold">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                    <span>Trusted by 30+ Growth-Stage Startups &amp; Enterprise Brands</span>
                  </div>
                </div>

                {/* Right Visual Column with Alex Rivera Portrait & Floating Metrics */}
                <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
                  <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-surface-container-low ring-1 ring-neutral-200/80 group">
                    <DriveImage
                      src={heroAvatar}
                      alt={`${settings.name || PORTFOLIO_DATA.profile.name} - Senior Growth Marketer`}
                      frameType="avatar"
                      aspectRatioClass="aspect-square"
                      width={800}
                      priority
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
                  </div>

                  {/* Badge 1: Traffic Growth */}
                  <div className="absolute bottom-2 left-2 sm:-bottom-4 sm:left-2 bg-surface-container-lowest/95 backdrop-blur-md p-2 sm:p-3.5 rounded-xl shadow-lg flex items-center gap-2 sm:gap-3 border border-neutral-200/70 z-20 max-w-[calc(100%-1rem)]">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[22px]">trending_up</span>
                    </div>
                    <div>
                      <div className="font-headline-md text-base text-secondary font-bold font-mono">
                        {settings.hero.badge1?.split(' ')[0] || '+120%'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-medium">
                        {settings.hero.badge1?.split(' ').slice(1).join(' ') || 'Organic Traffic Growth'}
                      </div>
                    </div>
                  </div>

                  {/* Badge 2: 4.5x ROAS */}
                  <div className="absolute top-2 right-2 sm:-top-3 sm:-right-2 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg flex items-center gap-2 sm:gap-2.5 border border-neutral-200/70 z-20">
                    <span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span>
                    <div>
                      <div className="text-xs text-on-surface font-bold">
                        {settings.hero.badge2?.split(' ').slice(0, 3).join(' ') || '4.5x Average ROAS'}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        {settings.hero.badge2?.split(' ').slice(3).join(' ') || 'Blended Acquisition'}
                      </div>
                    </div>
                  </div>

                  {/* Badge 3: Verified Partner */}
                  <div className="hidden sm:flex absolute top-1/2 -right-6 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg items-center gap-2 border border-neutral-200/70 z-20">
                    <span
                      className="material-symbols-outlined text-primary text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    <span className="text-xs text-on-surface font-semibold">
                      {settings.hero.badge3 || 'Meta & Google Partner'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>

          {/* Metrics Strip */}
          <div className="mt-8">
            <HomeMetricsBar />
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: #about (ABOUT ALEX + TOOLS + CERTIFICATIONS)
           ========================================================================= */}
        <section id="about" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="rounded-3xl bg-surface-container-lowest border border-neutral-200/90 shadow-xl p-6 sm:p-10 md:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Text */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    About The Marketer
                  </span>
                  <h2 className="font-headline-xl text-2xl sm:text-4xl font-bold text-on-surface tracking-tight">
                    Engineer’s Mindset. Marketer’s Growth Instincts.
                  </h2>
                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    With over 8 years navigating high-stakes customer acquisition, I merge data engineering rigor with relentless creative testing. Having managed over ₹50L+ in advertising capital across Google, Meta, and LinkedIn, I eliminate guesswork by diagnosing hidden funnel friction.
                  </p>
                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    Unlike traditional agencies that prioritize billable hours and vanity impressions, my methodology anchors strictly on cashflow-positive metrics: Blended MER, First-Party LTV, and Unshakable Organic Dominance.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low border border-neutral-200">
                      <div className="text-xs text-on-surface-variant font-medium">Headquarters</div>
                      <div className="text-sm font-bold text-on-surface mt-0.5">{PORTFOLIO_DATA.profile.location}</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low border border-neutral-200">
                      <div className="text-xs text-on-surface-variant font-medium">Direct Line</div>
                      <div className="text-sm font-bold text-on-surface mt-0.5 break-all">{PORTFOLIO_DATA.profile.email}</div>
                    </div>
                  </div>
                </div>

                {/* Right Profile Photo */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl relative aspect-square">
                    <Image
                      src={PORTFOLIO_DATA.profile.avatar}
                      alt={`${settings.name || 'Alex Rivera'} - Growth Marketer`}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-sm font-bold text-on-surface block">{settings.name || 'Alex Rivera'}</span>
                    <span className="text-xs text-on-surface-variant">{settings.hero.roleTag || 'Senior Performance Marketer & SEO Architect'}</span>
                  </div>
                </div>
              </div>

              {/* Tools & Certifications Matrix */}
              <div className="mt-12 pt-10 border-t border-neutral-200/80">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                      Arsenal &amp; Infrastructure
                    </span>
                    <h3 className="font-headline-md text-xl font-bold text-on-surface mt-1">
                      Measurement &amp; Attribution Stack
                    </h3>
                  </div>
                  <span className="text-xs text-on-surface-variant">Daily production deployment</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {PORTFOLIO_DATA.tools.map((t) => (
                    <div
                      key={t.name}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-neutral-200/70 hover:border-primary/40 transition-all flex flex-col justify-between"
                    >
                      <span className={`material-symbols-outlined text-[24px] ${t.color}`}>
                        {t.icon}
                      </span>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-on-surface">{t.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{t.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 3: #services (GROWTH PRACTICE AREAS)
           ========================================================================= */}
        <section id="services" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Capabilities &amp; Retainers
                </span>
                <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                  Full-Funnel Growth Practice Areas
                </h2>
                <p className="text-sm text-on-surface-variant max-w-xl mt-1">
                  Systematic growth protocols engineered for high-growth venture-backed SaaS and modern D2C eCommerce brands.
                </p>
              </div>

              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-blue-700 transition-colors whitespace-nowrap"
              >
                <span>View All 6 Growth Capabilities</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeServices.map((srv) => (
                <div
                  key={srv.slug}
                  className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 flex flex-col justify-between border border-neutral-200/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">{srv.icon}</span>
                      </div>
                      <span className="text-[11px] font-bold text-primary px-2.5 py-1 rounded-full bg-primary-fixed/30 uppercase tracking-wider">
                        {srv.tag.split('•')[0] || 'Strategic'}
                      </span>
                    </div>

                    <h3 className="font-headline-md text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {srv.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant leading-relaxed mt-2 line-clamp-3">
                      {srv.summary}
                    </p>

                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Core Deliverables
                      </div>
                      {(srv.deliverables || []).slice(0, 3).map((d, i) => (
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
                      href={`/services/${srv.slug}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Explore Practice Area</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                    <AuditButton className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer">
                      Inquire
                    </AuditButton>
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 4: #works (PROOF OF WORK & CASE STUDIES)
           ========================================================================= */}
        <section id="works" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Documented Proof
                </span>
                <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                  Selected Growth Case Studies
                </h2>
                <p className="text-sm text-on-surface-variant max-w-xl mt-1">
                  Real numbers, verified Search Console curves, and margin-protected ad scale across B2B SaaS and D2C brands.
                </p>
              </div>

              <Link
                href="/works"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline whitespace-nowrap"
              >
                <span>Browse Full Case Study Hub &amp; Deliverables</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Case Studies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {activeWorks.slice(0, 4).map((wrk) => (
                <div
                  key={wrk.slug}
                  className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-neutral-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={wrk.coverImage}
                        alt={wrk.title}
                        title={wrk.title}
                        frameType="work"
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold">
                          {wrk.industry}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 z-20">
                        <span className="px-3 py-1.5 rounded-xl bg-secondary text-white font-mono font-extrabold text-sm shadow-md">
                          {wrk.result}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        {wrk.client} · {wrk.duration}
                      </div>
                      <h3 className="font-headline-md text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                        {wrk.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant mt-2 line-clamp-2">
                        {wrk.strategy}
                      </p>

                      {/* Stat Strip */}
                      <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-4 sm:mt-5 p-2 sm:p-3 rounded-xl bg-surface-container-low border border-neutral-200/70">
                        {(wrk.stats || []).slice(0, 3).map((st, idx) => (
                          <div key={idx} className="text-center">
                            <div className="font-mono font-bold text-xs sm:text-sm text-on-surface">
                              {st.value}
                            </div>
                            <div className="text-[10px] text-on-surface-variant truncate">
                              {st.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex items-center justify-between">
                    <Link
                      href={`/works/${wrk.slug}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Deep Teardown</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                    <AuditButton className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer">
                      Request Similar Audit
                    </AuditButton>
                  </div>
                </div>
              ))}
            </div>

            {/* Showcase Deliverables Strip */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 md:p-10 border border-neutral-200/80 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Visual Deliverable Archive
                  </span>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface mt-1">
                    Verified SERP Rank Previews &amp; Ad Creative Assets
                  </h3>
                </div>
                <span className="text-xs text-on-surface-variant">Click any thumbnail for full-resolution inspection</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {activeShowcase.slice(0, 12).map((item, idx) => (
                  <LightboxTrigger
                    key={item.id}
                    index={idx}
                    items={lightboxItems}
                    className="group"
                  >
                    <div className="rounded-xl overflow-hidden border border-neutral-200 hover:border-primary transition-all shadow-sm hover:shadow-md aspect-square relative bg-neutral-100">
                      <DriveImage
                        src={item.image}
                        alt={item.title}
                        title={item.title}
                        frameType={item.type}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                          {item.badge || item.type}
                        </span>
                        <span className="text-xs font-semibold line-clamp-1">{item.title}</span>
                      </div>
                    </div>
                  </LightboxTrigger>
                ))}
              </div>
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 5: #process (4-STEP ICE GROWTH PROTOCOL)
           ========================================================================= */}
        <section id="process" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="rounded-3xl bg-surface-container-lowest border border-neutral-200/90 shadow-xl p-6 sm:p-10 md:p-14">
              <div className="max-w-2xl mb-10">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Execution Methodology
                </span>
                <h2 className="font-headline-xl text-2xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                  The 4-Step ICE Growth Protocol
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
                  How every engagement operates from day zero. Eliminating subjective opinions in favor of structured experimentation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Deep Audit & Hygiene',
                    timeframe: 'Days 1-7',
                    icon: 'verified',
                    desc: 'Auditing pixel triggers, server-side data logs, crawl index coverage, and ad spend inefficiencies.',
                  },
                  {
                    step: '02',
                    title: 'Growth Hypothesis',
                    timeframe: 'Days 8-14',
                    icon: 'tune',
                    desc: 'Constructing an ICE-prioritized experimentation backlog and multi-touch channel acquisition matrix.',
                  },
                  {
                    step: '03',
                    title: 'Rapid Sprint Execution',
                    timeframe: 'Days 15-45',
                    icon: 'bolt',
                    desc: 'Launching high-velocity creative hook tests, schema rollouts, and landing page progressive conversion sprints.',
                  },
                  {
                    step: '04',
                    title: 'Scale & Moat Building',
                    timeframe: 'Day 45+',
                    icon: 'rocket_launch',
                    desc: 'Scaling profitable ad spend, programmatic search authority, and first-party retention automation.',
                  },
                ].map((p) => (
                  <div
                    key={p.step}
                    className="p-6 rounded-2xl bg-surface-container-low border border-neutral-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-neutral-400 mb-4">
                        <span className="font-mono text-2xl font-black text-primary">{p.step}</span>
                        <span className="material-symbols-outlined text-primary text-[24px]">
                          {p.icon}
                        </span>
                      </div>
                      <h3 className="font-headline-md text-base font-bold text-on-surface">
                        {p.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-secondary block mt-0.5 mb-2">
                        {p.timeframe}
                      </span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 6: ROAS CALCULATOR
           ========================================================================= */}
        <section id="calculator" className="scroll-mt-28">
          <MotionReveal direction="up">
            <HomeRoasWrapper />
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 7: TESTIMONIALS
           ========================================================================= */}
        <section id="testimonials" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Executive Endorsements
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                Trusted by Founders &amp; Marketing Leaders
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeTestimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-surface-container-lowest border border-neutral-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]">
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface leading-relaxed italic mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {t.avatarInitials || t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">{t.name}</div>
                      <div className="text-[11px] text-on-surface-variant truncate">
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 8: FAQ ACCORDION
           ========================================================================= */}
        <section id="faq" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="rounded-3xl bg-surface-container-lowest border border-neutral-200/90 shadow-xl p-6 sm:p-10 md:p-14">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Common Inquiries
                </span>
                <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                  Everything you need to know about working models, timelines, attribution, and pricing.
                </p>
              </div>

              <HomeFaqAccordion items={homeFaqs} />
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 9: #blog (GROWTH FIELD NOTES & PLAYBOOKS)
           ========================================================================= */}
        <section id="blog" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Field Notes &amp; Playbooks
                </span>
                <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                  Growth Architecture Articles
                </h2>
                <p className="text-sm text-on-surface-variant max-w-xl mt-1">
                  Uncensored playbooks on technical SEO, ad script testing frameworks, and server-side conversion tracking.
                </p>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-blue-700 transition-colors whitespace-nowrap"
              >
                <span>Browse All Articles</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activePosts.slice(0, 3).map((post) => (
                <div
                  key={post.slug}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-neutral-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={post.coverImage}
                        alt={post.title}
                        title={post.title}
                        frameType="post"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mb-2">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Playbook</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        </section>

        {/* =========================================================================
            SECTION 10: #contact (DIRECT INQUIRY & CONTACT)
           ========================================================================= */}
        <section id="contact" className="scroll-mt-28">
          <MotionReveal direction="up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Direct Info */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Start a Conversation
                  </span>
                  <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                    Let’s Engineer Your Next Growth Inflection
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                    Whether you need a dedicated 14-day technical crawl, an ad account restructure, or an ongoing CMO growth advisory, reach out directly.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-neutral-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <div>
                      <div className="text-[11px] text-on-surface-variant font-medium">Direct Email</div>
                      <a href={`mailto:${settings.contact.email}`} className="text-xs font-bold text-on-surface hover:text-primary">
                        {settings.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-neutral-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </div>
                    <div>
                      <div className="text-[11px] text-on-surface-variant font-medium">WhatsApp / Mobile</div>
                      <div className="text-xs font-bold text-on-surface">
                        {settings.contact.whatsapp || settings.contact.phone}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-neutral-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                    </div>
                    <div>
                      <div className="text-[11px] text-on-surface-variant font-medium">Base Locations</div>
                      <div className="text-xs font-bold text-on-surface">{settings.contact.location}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-primary text-white shadow-lg space-y-3">
                  <div className="font-bold text-sm">Need a 30-Minute Priority Audit?</div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Skip the email thread and schedule directly on my calendar with custom intake questions.
                  </p>
                  <AuditButton className="px-4 py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-neutral-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                    <span>Schedule 30-Min Diagnostic</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </AuditButton>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:col-span-7">
                <HomeContactForm />
              </div>
            </div>
          </MotionReveal>
        </section>
      </div>
    </SiteShell>
  );
}
