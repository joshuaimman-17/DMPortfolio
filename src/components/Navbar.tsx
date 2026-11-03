import React, { useState, useEffect } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export type NavRoute = 'home' | 'about' | 'services' | 'works' | 'blog' | 'contact';

interface NavbarProps {
  currentPath: string; // e.g. '/', '/services', '/services/seo', '/works', etc.
  onNavigateRoute: (route: string, targetSectionId?: string) => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigateRoute,
  onOpenAudit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const isHomePage = currentPath === '/' || currentPath === '' || currentPath === '#/';

  // Scroll spy on Home page
  useEffect(() => {
    if (!isHomePage) return;

    const sections = ['home', 'about', 'services', 'works', 'process', 'blog', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // 120px offset for sticky navbar

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            // map process to works or keep active
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

  // Determine which nav link should appear active
  const getIsActive = (navId: NavRoute) => {
    if (isHomePage) {
      if (navId === 'home') return activeSection === 'home';
      if (navId === 'about') return activeSection === 'about';
      if (navId === 'services') return activeSection === 'services';
      if (navId === 'works') return activeSection === 'works';
      if (navId === 'blog') return activeSection === 'blog';
      if (navId === 'contact') return activeSection === 'contact';
      return false;
    } else {
      if (navId === 'services') return currentPath.startsWith('/services');
      if (navId === 'works') return currentPath.startsWith('/works');
      if (navId === 'blog') return currentPath.startsWith('/blog');
      return false;
    }
  };

  const handleNavClick = (navId: NavRoute) => {
    setMobileMenuOpen(false);

    if (isHomePage) {
      // On Home, smooth scroll to the section
      const targetId = navId === 'home' ? 'home' : navId;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On Hub or Detail page
      if (navId === 'home') {
        onNavigateRoute('/');
      } else if (navId === 'about') {
        onNavigateRoute('/', 'about');
      } else if (navId === 'contact') {
        onNavigateRoute('/', 'contact');
      } else if (navId === 'services') {
        onNavigateRoute('/services');
      } else if (navId === 'works') {
        onNavigateRoute('/works');
      } else if (navId === 'blog') {
        onNavigateRoute('/blog');
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fbf9f8]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-neutral-200/70">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Left */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <img
              alt="Alex Rivera Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src={PORTFOLIO_DATA.profile.logo}
            />
            <span className="font-bold text-base sm:text-lg text-on-surface whitespace-nowrap">
              {PORTFOLIO_DATA.profile.title}
            </span>
          </button>

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
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 transition-all text-xs lg:text-sm font-semibold rounded-lg cursor-pointer ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Hire Me + Profile Avatar + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAudit}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all whitespace-nowrap cursor-pointer"
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
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-surface-container-lowest/98 backdrop-blur-2xl flex flex-col justify-between p-6 md:hidden animate-fadeIn">
          <div className="flex flex-col gap-2 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3">
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
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold transition-all text-left cursor-pointer ${
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
                </button>
              );
            })}
          </div>

          {/* Mobile Drawer Bottom: Hire Me Button */}
          <div className="pt-6 border-t border-neutral-200/70 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAudit();
              }}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer"
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
