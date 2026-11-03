import React, { useState } from 'react';
import { PORTFOLIO_DATA, BlogPostDetail } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';
import { subscribeNewsletter } from '../lib/portfolioService';
import { DriveImage } from './common/DriveImage';

interface BlogDetailViewProps {
  slug: string;
  onOpenAudit: () => void;
}

export const BlogDetailView: React.FC<BlogDetailViewProps> = ({ slug, onOpenAudit }) => {
  const { blogPosts, findPost } = usePortfolioData();
  const [copiedLink, setCopiedLink] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const allPosts = (blogPosts.length > 0 ? blogPosts : PORTFOLIO_DATA.blogPosts) as BlogPostDetail[];
  const post = findPost(slug) || allPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl p-8 sm:p-14 text-center border-y sm:border-y-0 sm:ring-1 sm:ring-neutral-200/80 mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Article Not Found</h2>
        <p className="text-on-surface-variant mb-6 text-sm">
          The requested article could not be located.
        </p>
        <a
          href="#/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to All Articles</span>
        </a>
      </div>
    );
  }

  // Related posts
  const relatedPosts = allPosts.filter(
    (p) => post.relatedSlugs?.includes(p.slug) || (p.slug !== post.slug && p.category === post.category)
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${post.title}" by @AlexRiveraGrowth:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setIsSubscribing(true);
    try {
      const subs = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      subs.push({ email: newsletterEmail, date: new Date().toISOString() });
      localStorage.setItem('newsletter_subscribers', JSON.stringify(subs));
    } catch {
      // ignore
    }

    try {
      await subscribeNewsletter(newsletterEmail, honeypot);
    } catch (err) {
      console.warn('Newsletter fallback applied:', err);
    } finally {
      setIsSubscribing(false);
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. TOP BREADCRUMB & HUB LINK */}
      <div className="flex items-center justify-between py-3 mb-3 px-2 sm:px-0">
        <a
          href="#/blog"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to all articles</span>
        </a>

        <div className="text-xs text-on-surface-variant hidden sm:flex items-center gap-2">
          <a href="#/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <a href="#/blog" className="hover:text-primary transition-colors">Blog</a>
          <span>/</span>
          <span className="text-on-surface font-semibold truncate max-w-[200px]">{post.title}</span>
        </div>
      </div>

      {/* 2. MAIN READING CONTAINER (WITH STICKY TOC ON DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Main Content Column (720px max-w centered/padded) */}
        <article className="lg:col-span-8 bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 p-4 sm:p-8 md:p-12 border-y sm:border-y-0 border-neutral-200/60 w-full">
          {/* Header Info */}
          <div className="max-w-[720px] mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                {post.readTime}
              </span>
              <span className="text-xs text-on-surface-variant">• {post.date}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight mb-4">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed mb-6 font-medium">
              {post.excerpt}
            </p>

            {/* Author Byline */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200/60">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {post.author.name}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {post.author.role}
                  </span>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleShareTwitter}
                  title="Share on X / Twitter"
                  className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-neutral-200 text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold">𝕏</span>
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  title="Share on LinkedIn"
                  className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-neutral-200 text-blue-600 flex items-center justify-center transition-colors cursor-pointer font-bold text-xs"
                >
                  in
                </button>
                <button
                  onClick={handleCopyLink}
                  title="Copy Link"
                  className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-neutral-200 text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedLink ? 'check' : 'link'}
                  </span>
                </button>
              </div>
            </div>

            {/* Cover Image */}
            <div className="w-full rounded-2xl overflow-hidden mb-8 bg-slate-900 shadow-md">
              <DriveImage
                src={post.coverImage}
                alt={post.title}
                width={1600}
                frameType="post"
                title={post.title}
                aspectRatioClass="aspect-[16/9] w-full"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content Blocks */}
            <div className="space-y-8 text-on-surface leading-relaxed text-sm sm:text-base">
              {post.contentBlocks.map((block, idx) => (
                <section
                  key={idx}
                  id={post.toc[idx]?.id || `section-${idx}`}
                  className="scroll-mt-28"
                >
                  {block.heading && (
                    <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-3 tracking-tight">
                      {block.heading}
                    </h2>
                  )}

                  <div className="space-y-4 text-on-surface-variant">
                    {block.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {block.pullQuote && (
                    <div className="my-6 p-5 sm:p-6 rounded-2xl bg-primary-fixed/20 border-l-4 border-primary text-on-surface italic font-medium text-base sm:text-lg">
                      "{block.pullQuote}"
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Author Bio Box */}
            <div className="mt-12 p-6 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                  Written by
                </span>
                <h4 className="font-bold text-base text-on-surface">{post.author.name}</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Alex is a growth marketing architect and technical SEO practitioner who has scaled 30+ B2B SaaS and high-growth D2C brands. He writes regularly on data-driven marketing, ad economics, and organic crawl optimization.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar Column: Sticky TOC on Desktop, Hidden on Mobile */}
        <aside className="lg:col-span-4 hidden lg:block sticky top-28 space-y-6">
          {/* Table of Contents Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-neutral-200/80 shadow-md">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              <span>Table of Contents</span>
            </div>

            <nav className="space-y-2">
              {post.toc.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block text-xs text-on-surface-variant hover:text-primary hover:translate-x-1 transition-all py-1 border-l-2 border-transparent hover:border-primary pl-2.5 font-medium"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Audit Card */}
          <div className="bg-gradient-to-br from-primary-container to-primary text-white p-6 rounded-3xl shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-fixed block mb-1">
              Need Direct Advisory?
            </span>
            <h4 className="font-bold text-base mb-2">Book a Growth Diagnostic</h4>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              Get an expert teardown of your ad accounts, landing page funnels, and organic search architecture.
            </p>
            <button
              onClick={onOpenAudit}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-primary text-xs font-bold hover:bg-neutral-100 transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Schedule Strategy Call</span>
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 3. RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface">Related Articles</h3>
            <a
              href="#/blog"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>All Articles</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.slice(0, 3).map((rp) => (
              <a
                key={rp.slug}
                href={`#/blog/${rp.slug}`}
                className="bg-surface-container-low rounded-2xl overflow-hidden border border-neutral-200/70 hover:-translate-y-1 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-36 overflow-hidden bg-slate-900">
                    <DriveImage
                      src={rp.coverImage}
                      alt={rp.title}
                      width={600}
                      frameType="post"
                      title={rp.title}
                      aspectRatioClass="h-36 w-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                      {rp.category}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {rp.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {rp.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 text-[11px] text-on-surface-variant flex items-center justify-between border-t border-neutral-200/50 mt-2">
                  <span>{rp.readTime}</span>
                  <span className="text-primary font-bold">Read →</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 4. NEWSLETTER CAPTURE */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-6 sm:p-10 md:p-12 border-y sm:border-y-0 border-neutral-200/60 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Newsletter
          </span>
          <h3 className="text-2xl font-bold text-on-surface">
            Get Every New Growth Breakdown
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
            Bi-weekly tactical teardowns without any marketing fluff. Delivered straight to your inbox.
          </p>

          {newsletterSubscribed ? (
            <div className="p-3.5 rounded-xl bg-secondary-container/40 text-secondary text-xs sm:text-sm font-semibold flex items-center gap-2 border border-secondary/30 mt-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Subscribed successfully! Thank you.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md mt-2">
              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter work email..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low border border-neutral-200 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors shadow cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary rounded-none sm:rounded-3xl shadow-none sm:shadow-xl shadow-blue-500/20 p-6 sm:p-10 md:p-14 mb-4 sm:mb-[40px] text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
            Let's Collaborate
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Put These Growth Playbooks to Work
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl">
            Book an intro session with Alex to review your current acquisition metrics and identify scalable revenue levers.
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
              href="#/blog"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Articles</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
