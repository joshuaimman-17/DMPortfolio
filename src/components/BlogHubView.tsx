import React, { useState, useMemo } from 'react';
import { PORTFOLIO_DATA, BlogPostDetail } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';
import { subscribeNewsletter } from '../lib/portfolioService';
import { DriveImage } from './common/DriveImage';

interface BlogHubViewProps {
  onOpenAudit: () => void;
}

export const BlogHubView: React.FC<BlogHubViewProps> = ({ onOpenAudit }) => {
  const { blogPosts } = usePortfolioData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const categories = ['All', 'SEO & Architecture', 'Paid Media', 'Analytics & CRO', 'Retention'];

  const allPosts = (blogPosts.length > 0 ? blogPosts : PORTFOLIO_DATA.blogPosts) as BlogPostDetail[];
  const featuredPost = allPosts[0];

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        post.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'SEO & Architecture' && post.category.includes('SEO')) ||
        (selectedCategory === 'Paid Media' && post.category.includes('Paid')) ||
        (selectedCategory === 'Analytics & CRO' && post.category.includes('Analytics'));

      return matchesSearch && matchesCategory;
    });
  }, [allPosts, searchQuery, selectedCategory]);

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
      {/* 1. HEADER */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl relative z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary font-label-sm text-xs font-semibold uppercase tracking-wider w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Growth Architecture Playbooks
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Field Notes on Technical SEO, Meta Ads &amp; Attribution
          </h1>

          <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Deconstructive teardowns, algorithmic post-mortems, and actionable acquisition frameworks written directly from client battlegrounds.
          </p>
        </div>
      </section>

      {/* 2. LARGE FEATURED POST */}
      {featuredPost && (
        <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] overflow-hidden border-y sm:border-y-0 border-neutral-200/60 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
            <div className="lg:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold uppercase tracking-wider">
                    Featured Deep Dive
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {featuredPost.readTime}
                  </span>
                </div>

                <a href={`#/blog/${featuredPost.slug}`}>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight leading-tight mb-4">
                    {featuredPost.title}
                  </h2>
                </a>

                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-6 border-t border-neutral-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      {featuredPost.author.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {featuredPost.date}
                    </span>
                  </div>
                </div>

                <a
                  href={`#/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <span>Read Article</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden bg-slate-900">
              <DriveImage
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                width={800}
                frameType="post"
                title={featuredPost.title}
                aspectRatioClass="h-full w-full"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </section>
      )}

      {/* 3. SEARCH & CATEGORY CHIPS */}
      <div className="w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 sm:px-0">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-neutral-200/70'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px] md:w-72">
          <span className="material-symbols-outlined text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles & topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-neutral-200/80 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. POST GRID */}
      <section className="w-full mb-8">
        {filteredPosts.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-neutral-200/80">
            <span className="material-symbols-outlined text-[36px] text-neutral-400 mb-2">
              search_off
            </span>
            <h3 className="font-bold text-base text-on-surface mb-1">No articles found</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Try searching with another keyword or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <a
                key={post.slug}
                href={`#/blog/${post.slug}`}
                className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full h-48 overflow-hidden bg-slate-900 relative">
                    <DriveImage
                      src={post.coverImage}
                      alt={post.title}
                      width={600}
                      frameType="post"
                      title={post.title}
                      aspectRatioClass="h-48 w-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-900 text-[11px] font-bold shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-neutral-200/50 mt-2 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Read full breakdown</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* 5. NEWSLETTER CARD */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-6 sm:p-10 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            The Algorithmic Growth Dispatch
          </h3>

          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-lg">
            Join 4,200+ founders and Heads of Growth receiving our bi-weekly breakdown of algorithm updates, Meta ad scripts, and server-side tracking recipes. Zero fluff, ever.
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 rounded-xl bg-secondary-container/30 text-secondary text-sm font-semibold flex items-center gap-2 border border-secondary/30 mt-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Thank you for subscribing! Check your inbox for the Growth Playbook PDF.</span>
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
                placeholder="Enter your work email..."
                className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low border border-neutral-200 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors shadow cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Join Dispatch'}
              </button>
            </form>
          )}

          <span className="text-[11px] text-neutral-400">
            Unsubscribe anytime with 1 click. No sponsored spam.
          </span>
        </div>
      </section>
    </div>
  );
};
