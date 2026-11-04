import React from 'react';
import type { Metadata } from 'next';
import { getPosts, getSiteSettings, getPageMetadata } from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { BlogListClient } from '@/components/blog/BlogListClient';

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMetadata('route_blog', {
    title: 'Growth Playbooks & Field Notes',
    description:
      'Field notes on technical SEO, ad script testing frameworks, and server-side conversion tracking.',
    path: '/blog',
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

export default async function BlogHubPage() {
  const [posts, settings] = await Promise.all([
    getPosts(),
    getSiteSettings(),
  ]);

  const allPosts = posts.length > 0 ? posts : PORTFOLIO_DATA.blogPosts;

  return (
    <SiteShell settings={settings}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <section className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 md:p-14 border border-neutral-200/90 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Growth Architecture Playbooks
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
              Field Notes on Technical SEO, Meta Ads &amp; Attribution
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Uncensored breakdowns of what is actually driving top-of-funnel customer acquisition, core algorithm recovery, and server-side tracking integrity.
            </p>
          </div>
        </section>

        {/* Client Search and Articles List */}
        <BlogListClient allPosts={allPosts} />
      </div>
    </SiteShell>
  );
}
