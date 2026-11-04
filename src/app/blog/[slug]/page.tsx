import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts, getSiteSettings, getPageMetadata } from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { SiteShell } from '@/context/ModalContext';
import { DriveImage } from '@/components/common/DriveImage';
import { AuditButton } from '@/components/common/ActionButtons';
import { getArticleJsonLd } from '@/lib/jsonld';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested growth architecture article could not be located.',
    };
  }

  const pageMeta = await getPageMetadata(`route_post_${slug}`, {
    title: `${post.title} | Field Notes`,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.coverImage,
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

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts, settings] = await Promise.all([
    getPostBySlug(slug),
    getPosts(),
    getSiteSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const postsList = allPosts.length > 0 ? allPosts : PORTFOLIO_DATA.blogPosts;
  const relatedPosts = postsList.filter(
    (p) => post.relatedSlugs?.includes(p.slug) || (p.slug !== post.slug && p.category === post.category)
  );

  const jsonLd = getArticleJsonLd(post);

  return (
    <SiteShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to all field notes</span>
          </Link>

          <div className="text-xs text-on-surface-variant hidden sm:flex items-center gap-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-on-surface font-semibold line-clamp-1 max-w-[200px]">
              {post.title}
            </span>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-on-surface-variant font-medium">{post.readTime}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-on-surface-variant font-medium">{post.date}</span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author Lockup */}
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
              <div className="w-11 h-11 rounded-full overflow-hidden relative bg-neutral-200">
                <DriveImage
                  src={post.author.avatar}
                  alt={post.author.name}
                  title={post.author.name}
                  frameType="avatar"
                  priority
                />
              </div>
              <div>
                <div className="text-xs font-bold text-on-surface">{post.author.name}</div>
                <div className="text-[11px] text-on-surface-variant">{post.author.role}</div>
              </div>
            </div>
          </div>

          {/* Mobile Table of Contents */}
          {post.toc && post.toc.length > 0 && (
            <div className="lg:hidden p-4 rounded-2xl bg-surface-container-lowest border border-neutral-200">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Table of Contents ({post.toc.length} sections)</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <nav className="flex flex-col gap-2 mt-3 pt-3 border-t border-neutral-100">
                  {post.toc.map((item) => (
                    <a
                      key={item.id}
                      href={'#' + item.id}
                      className="text-xs text-neutral-600 hover:text-primary transition-colors py-1"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </details>
            </div>
          )}

          {/* Cover Image */}
          <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-xl relative aspect-[16/9]">
            <DriveImage
              src={post.coverImage}
              alt={post.title}
              title={post.title}
              frameType="post"
              priority
            />
          </div>

          {/* Article Layout with Sidebar Table of Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* TOC Sidebar */}
            {post.toc && post.toc.length > 0 && (
              <aside className="lg:col-span-4 hidden lg:block">
                <div className="sticky top-28 bg-surface-container-lowest p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    Table of Contents
                  </div>
                  <nav className="flex flex-col gap-2">
                    {post.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="text-xs text-neutral-600 hover:text-primary transition-colors text-left font-medium"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>

                  <div className="pt-4 border-t border-neutral-100">
                    <AuditButton className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                      Book Audit with Alex
                    </AuditButton>
                  </div>
                </div>
              </aside>
            )}

            {/* Article Content Blocks */}
            <div className={`${post.toc && post.toc.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8 text-on-surface leading-relaxed`}>
              {(post.contentBlocks || []).map((block, idx) => (
                <section
                  key={idx}
                  id={post.toc?.[idx]?.id}
                  className="space-y-4 scroll-mt-28"
                >
                  {block.heading && (
                    <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface pt-2">
                      {block.heading}
                    </h2>
                  )}

                  {block.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base text-on-surface leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {block.pullQuote && (
                    <blockquote className="my-6 p-5 rounded-2xl bg-surface-container-low border-l-4 border-primary text-sm sm:text-base italic text-on-surface">
                      &ldquo;{block.pullQuote}&rdquo;
                    </blockquote>
                  )}
                </section>
              ))}
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="pt-10 border-t border-neutral-200">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Further Study
              </span>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                Related Growth Playbooks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((rPost) => (
                <div
                  key={rPost.slug}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={rPost.coverImage}
                        alt={rPost.title}
                        title={rPost.title}
                        frameType="post"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                        {rPost.category}
                      </span>
                      <h4 className="font-bold text-sm text-on-surface mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {rPost.title}
                      </h4>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <Link
                      href={`/blog/${rPost.slug}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Playbook</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
