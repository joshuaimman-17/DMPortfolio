'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BlogPostDetail } from '@/data/portfolioData';
import { DriveImage } from '@/components/common/DriveImage';
import { subscribeNewsletter } from '@/lib/client-api';

export function BlogListClient({ allPosts }: { allPosts: BlogPostDetail[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const categories = ['All', 'SEO & Architecture', 'Paid Media', 'Analytics & CRO', 'Retention'];

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

  const featured = allPosts[0];

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search playbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-neutral-200 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">
            search
          </span>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-lowest text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Article (when on All and no search) */}
      {selectedCategory === 'All' && !searchQuery && featured && (
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 group">
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[280px]">
            <DriveImage
              src={featured.coverImage}
              alt={featured.title}
              title={featured.title}
              frameType="post"
              className="group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-[10px] font-bold uppercase tracking-wider">
                  Featured Playbook
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs text-on-surface-variant">{featured.readTime}</span>
              </div>
              <h2 className="font-headline-lg text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
                {featured.excerpt}
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
              <div className="text-xs font-medium text-on-surface-variant">
                Published {featured.date}
              </div>
              <Link
                href={`/blog/${featured.slug}`}
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Read Full Guide</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.slug}
            className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
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
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold">
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
                <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
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

      {/* Newsletter Signup Box */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-4">
        <span className="text-[11px] font-mono uppercase tracking-wider text-primary-fixed">
          The Growth Dispatch
        </span>
        <h3 className="font-headline-md text-2xl font-bold text-white">
          Receive Bi-Weekly Architectural Playbooks
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          No generic advice. Real ad creative scripts, negative keyword hierarchies, and GA4 event debugging notes sent directly to 3,200+ founders.
        </p>

        {!newsletterSubscribed ? (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
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
              placeholder="Your work email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-xs flex-1 border border-slate-700"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors text-xs whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {isSubscribing ? 'Subscribing...' : 'Join 3,200+ Marketers'}
            </button>
          </form>
        ) : (
          <div className="p-3 bg-slate-800 rounded-xl text-emerald-400 text-xs font-semibold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Subscribed! Check your inbox soon for the next edition.</span>
          </div>
        )}
      </div>
    </div>
  );
}
