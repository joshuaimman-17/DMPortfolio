'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { SiteSettings } from '@/types/settings';

export type NavRoute = 'home' | 'about' | 'services' | 'works' | 'blog' | 'contact';

interface NavbarProps {
  onOpenAudit: () => void;
  settings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAudit, settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const pathname = usePathname();

  const isHomePage = pathname === '/' || pathname === '';

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Scroll spy on Home page
  useEffect(() => {
    if (!isHomePage) return;

    const sections = ['home', 'about', 'services', 'works', 'process', 'blog', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140; // 140px offset for sticky navbar

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            if (id === 'process') {
              setActiveSection('services');
            } else {
              setActiveSection(id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Determine active nav item
  const getIsActive = (navId: NavRoute) => {
    if (isHomePage) {
      return activeSection === navId;
    } else {
      if (navId === 'services') return pathname.startsWith('/services');
      if (navId === 'works') return pathname.startsWith('/works');
      if (navId === 'blog') return pathname.startsWith('/blog');
      return false;
    }
  };

  const getHref = (navId: NavRoute) => {
    if (isHomePage) {
      return `#${navId}`;
    }
    if (navId === 'home') return '/';
    if (navId === 'about') return '/#about';
    if (navId === 'contact') return '/#contact';
    if (navId === 'services') return '/services';
    if (navId === 'works') return '/works';
    if (navId === 'blog') return '/blog';
    return '/';
  };

  const handleLinkClick = (navId: NavRoute, e?: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (isHomePage) {
      e?.preventDefault();
      const el = document.getElementById(navId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fbf9f8]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-neutral-200/70">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Left */}
          <Link
            href="/"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group cursor-pointer min-w-0"
          >
            <img
              alt="Alex Rivera Logo"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
              src={PORTFOLIO_DATA.profile.logo}
            />
            <span className="font-bold text-sm sm:text-base md:text-lg text-on-surface truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none">
              {settings?.name || PORTFOLIO_DATA.profile.name || 'Alex Rivera'}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'home' as NavRoute, label: 'Home' },
              { id: 'about' as NavRoute, label: 'About' },
              { id: 'services' as NavRoute, label: 'Services' },
              { id: 'works' as NavRoute, label: 'Works' },
              { id: 'blog' as NavRoute, label: 'Blog' },
              { id: 'contact' as NavRoute, label: 'Contact' },
            ].map((item) => {
              const active = getIsActive(item.id);
              const href = getHref(item.id);
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={(e) => handleLinkClick(item.id, e)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 transition-all text-xs lg:text-sm font-semibold rounded-lg cursor-pointer ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Hire Me + Profile Avatar + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenAudit}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all whitespace-nowrap cursor-pointer"
            >
              Hire Me
            </button>

            <img
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 hidden sm:inline-block"
              src={PORTFOLIO_DATA.profile.avatar}
            />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-200/70 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 sm:top-20 z-40 bg-surface-container-lowest/98 backdrop-blur-2xl flex flex-col justify-between p-5 sm:p-6 md:hidden animate-fadeIn overflow-y-auto max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)]">
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-1">
              Menu Navigation
            </span>
            {[
              { id: 'home' as NavRoute, label: 'Home', icon: 'home' },
              { id: 'about' as NavRoute, label: 'About Alex', icon: 'person' },
              { id: 'services' as NavRoute, label: 'Services & Practice Areas', icon: 'room_service' },
              { id: 'works' as NavRoute, label: 'Works & Case Studies', icon: 'work' },
              { id: 'blog' as NavRoute, label: 'Blog & Playbooks', icon: 'article' },
              { id: 'contact' as NavRoute, label: 'Contact & Advisory', icon: 'mail' },
            ].map((item) => {
              const active = getIsActive(item.id);
              const href = getHref(item.id);
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={(e) => handleLinkClick(item.id, e)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm sm:text-base font-bold transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-primary text-white shadow-md'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Drawer Bottom: Hire Me Button */}
          <div className="pt-5 mt-4 border-t border-neutral-200/70 space-y-3 pb-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAudit();
              }}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              <span>Hire Me / Book Strategy Call</span>
            </button>

            <div className="text-center text-xs text-on-surface-variant font-medium">
              Direct Advisory with Alex Rivera
            </div>
          </div>
        </div>
      )}
    </>
  );
};
