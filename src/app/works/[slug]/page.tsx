import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkBySlug, getWorks, getShowcase, getSiteSettings, getPageMetadata } from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { AuditButton, LightboxTrigger } from '@/components/common/ActionButtons';
import { DriveImage } from '@/components/common/DriveImage';
import { LightboxItem } from '@/components/LightboxModal';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((w) => ({
    slug: w.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) {
    return {
      title: 'Case Study Not Found',
      description: 'The requested growth marketing case study could not be located.',
    };
  }

  const pageMeta = await getPageMetadata(`route_work_${slug}`, {
    title: `${work.title} | Case Study`,
    description: work.challenge || work.goal,
    path: `/works/${slug}`,
    image: work.coverImage,
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

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const [work, allWorks, showcase, settings] = await Promise.all([
    getWorkBySlug(slug),
    getWorks(),
    getShowcase(),
    getSiteSettings(),
  ]);

  if (!work) {
    notFound();
  }

  const worksList = allWorks.length > 0 ? allWorks : PORTFOLIO_DATA.works;
  const showcaseList = showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase;

  const currentIndex = worksList.findIndex((w) => w.slug === slug);
  const prevWork =
    currentIndex > 0 ? worksList[currentIndex - 1] : worksList[worksList.length - 1];
  const nextWork =
    currentIndex < worksList.length - 1 ? worksList[currentIndex + 1] : worksList[0];

  const proofItems = showcaseList.filter(
    (sc) => work.proofItemIds?.includes(sc.id) || sc.workSlug === work.slug
  );

  const lightboxItems: LightboxItem[] = proofItems.map((sc) => ({
    id: sc.id,
    title: sc.title,
    image: sc.image,
    badge: sc.badge || sc.type,
    subtitle: sc.client,
    client: sc.client,
    highlight: sc.highlight,
    caption: sc.title,
  }));

  return (
    <SiteShell settings={settings} defaultLightboxItems={lightboxItems}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb & Hub Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/works"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to full portfolio</span>
          </Link>

          <div className="text-xs text-on-surface-variant hidden sm:flex items-center gap-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/works" className="hover:text-primary">Works</Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">{work.client}</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 md:p-14 border border-neutral-200/90 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold uppercase tracking-wider">
                  {work.industry}
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {work.duration}
                </span>
              </div>

              <div className="text-xs font-bold text-primary uppercase tracking-wider">
                {work.client}
              </div>

              <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">
                {work.title}
              </h1>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-container/50 text-secondary font-mono font-bold text-sm w-fit">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{work.result}</span>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-200/70 mt-2">
                {(work.stats || []).map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-neutral-200/80">
                    <div className="font-mono font-extrabold text-lg sm:text-xl text-on-surface">
                      {st.value}
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">{st.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-lg relative aspect-[16/11]">
                <DriveImage
                  src={work.coverImage}
                  alt={work.title}
                  title={work.title}
                  frameType="work"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Narrative: Goal, Challenge, Strategy */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
              01. The Objective
            </span>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-3">
              Growth Milestone
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {work.goal}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-2">
              02. The Friction Point
            </span>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-3">
              Core Challenge
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {work.challenge}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-2">
              03. The Protocol
            </span>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-3">
              Engineering Strategy
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {work.strategy}
            </p>
          </div>
        </section>

        {/* Step-by-Step Execution */}
        {work.execution && work.execution.length > 0 && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
            <div className="max-w-xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Implementation Timeline
              </span>
              <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                Execution Phases
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {work.execution.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/80 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-bold text-primary uppercase block mb-1">
                      {step.step}
                    </span>
                    <h4 className="font-bold text-sm text-on-surface mb-2">{step.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Proof Deliverables */}
        {proofItems.length > 0 && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Artifact Verification
                </span>
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mt-1">
                  Deliverables &amp; SERP Curves
                </h3>
              </div>
              <span className="text-xs text-on-surface-variant">Click to expand preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {proofItems.map((sc, idx) => (
                <LightboxTrigger
                  key={sc.id}
                  index={idx}
                  items={lightboxItems}
                  className="group"
                >
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                    <div className="relative aspect-[16/10]">
                      <DriveImage
                        src={sc.image}
                        alt={sc.title}
                        title={sc.title}
                        frameType={sc.type}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 bg-surface-container-low">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {sc.badge || sc.type}
                      </div>
                      <div className="font-bold text-xs text-on-surface mt-1 line-clamp-1">
                        {sc.title}
                      </div>
                    </div>
                  </div>
                </LightboxTrigger>
              ))}
            </div>
          </section>
        )}

        {/* Client Testimonial & Learnings */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {work.testimonial && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-on-surface italic leading-relaxed mb-6">
                  &ldquo;{work.testimonial.quote}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                  {work.testimonial.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">{work.testimonial.author}</div>
                  <div className="text-[11px] text-on-surface-variant">{work.testimonial.role}</div>
                </div>
              </div>
            </div>
          )}

          {work.learnings && work.learnings.length > 0 && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-3">
                Strategic Takeaways
              </span>
              <ul className="space-y-3">
                {work.learnings.map((lrn, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                      lightbulb
                    </span>
                    <span>{lrn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Next / Prev Navigation */}
        <section className="pt-6 border-t border-neutral-200/80 flex items-center justify-between">
          {prevWork ? (
            <Link
              href={`/works/${prevWork.slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Previous: {prevWork.client}</span>
            </Link>
          ) : (
            <div />
          )}

          <AuditButton className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow cursor-pointer">
            Inquire About Similar Growth
          </AuditButton>

          {nextWork ? (
            <Link
              href={`/works/${nextWork.slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <span>Next: {nextWork.client}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          ) : (
            <div />
          )}
        </section>
      </div>
    </SiteShell>
  );
}
