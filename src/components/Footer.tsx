'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { subscribeNewsletter } from '@/lib/client-api';
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings';

interface FooterProps {
  settings?: SiteSettings;
  onOpenAudit?: () => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  settings = DEFAULT_SETTINGS,
  onOpenAudit,
  isAdmin = false,
}) => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribing(true);
    try {
      const subs = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      subs.push({ email, date: new Date().toISOString() });
      localStorage.setItem('newsletter_subscribers', JSON.stringify(subs));
    } catch {
      // ignore
    }

    try {
      await subscribeNewsletter(email, honeypot);
    } catch (err) {
      console.warn('Newsletter fallback applied:', err);
    } finally {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#0F172A] text-slate-300 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Bio & Branding */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                alt="Alex Rivera Logo"
                className="h-8 w-auto object-contain brightness-0 invert"
                src={PORTFOLIO_DATA.profile.logo}
              />
              <span className="text-xl text-white font-bold tracking-tight">
                {settings?.name || 'Alex Rivera'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Helping high-growth B2B SaaS and D2C brands scale with quantitative SEO, performance marketing, and server-side tracking integrity.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors font-bold text-xs"
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                in
              </a>
              <a
                aria-label="X / Twitter"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors font-bold text-xs"
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
              >
                𝕏
              </a>
              <a
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <h3 className="text-xs text-white uppercase tracking-wider mb-2 font-bold">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors text-left"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-slate-400 hover:text-white transition-colors text-left"
                >
                  About Alex
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-slate-400 hover:text-white transition-colors text-left"
                >
                  Services Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/works"
                  className="text-slate-400 hover:text-white transition-colors text-left"
                >
                  Works &amp; Case Studies
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 hover:text-white transition-colors text-left"
                >
                  Growth Playbooks
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-slate-400 hover:text-white transition-colors text-left"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services Links */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <h3 className="text-xs text-white uppercase tracking-wider mb-2 font-bold">
              Practice Areas
            </h3>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              {PORTFOLIO_DATA.services.slice(0, 5).map((srv) => (
                <li key={srv.slug}>
                  <Link
                    href={`/services/${srv.slug}`}
                    className="text-slate-400 hover:text-white transition-colors text-left"
                  >
                    {srv.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter Capture */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs text-white uppercase tracking-wider font-bold">
              Dispatch Newsletter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bi-weekly growth architecture playbooks, ad script frameworks, and server-side tracking notes.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-1">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-xs w-full border border-slate-700"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-all text-xs whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-emerald-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            )}

            {onOpenAudit && (
              <button
                onClick={onOpenAudit}
                className="mt-2 text-xs text-primary-fixed hover:underline font-semibold flex items-center gap-1 cursor-pointer text-left"
              >
                <span>Book a Free Growth Diagnostic →</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Legal / Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{settings?.footer?.copyright || `© ${new Date().getFullYear()} Alex Rivera. All rights reserved.`}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 sm:gap-6">
            <Link
              href="/#contact"
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Engagement
            </Link>
            <Link
              href="/#contact"
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors font-mono text-[11px] text-slate-400"
              title="LLM & AI discoverability file (llms.txt standard)"
            >
              llms.txt
            </a>
            {onOpenAudit && (
              <button
                onClick={onOpenAudit}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Schedule Strategy Call
              </button>
            )}
            <Link
              href="/admin"
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold border-l border-slate-700 pl-4"
              title="Open Firebase Admin Dashboard"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
