import React from 'react';
import type { Metadata } from 'next';
import { getPosts, getSiteSettings } from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { BlogListClient } from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Growth Playbooks & Field Notes | Alex Rivera',
  description:
    'Field notes on technical SEO, ad script testing frameworks, and server-side conversion tracking by Alex Rivera.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

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
