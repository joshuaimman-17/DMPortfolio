/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ServicesHubView } from './components/ServicesHubView';
import { ServiceDetailView } from './components/ServiceDetailView';
import { WorksHubView } from './components/WorksHubView';
import { WorkDetailView } from './components/WorkDetailView';
import { BlogHubView } from './components/BlogHubView';
import { BlogDetailView } from './components/BlogDetailView';
import { NotFoundView } from './components/NotFoundView';
import { LightboxModal, LightboxItem } from './components/LightboxModal';
import { AuditBookingModal } from './components/AuditBookingModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { PortfolioProvider, usePortfolioData } from './context/PortfolioContext';
import { PORTFOLIO_DATA } from './data/portfolioData';

// Parse hash path into structured route
function parseHash(hash: string): { path: string; slug?: string } {
  // Strip leading '#' and clean
  let cleaned = hash.replace(/^#/, '').trim();
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }
  // Remove trailing slash if longer than '/'
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }

  // Handle Home
  if (cleaned === '' || cleaned === '/') {
    return { path: '/' };
  }

  // Handle Admin
  if (cleaned === '/admin' || cleaned === '/admin/login') {
    return { path: cleaned };
  }

  // Handle /services and /services/:slug
  if (cleaned.startsWith('/services')) {
    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length === 1) return { path: '/services' };
    return { path: '/services/:slug', slug: parts[1] };
  }

  // Handle /works and /works/:slug
  if (cleaned.startsWith('/works')) {
    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length === 1) return { path: '/works' };
    return { path: '/works/:slug', slug: parts[1] };
  }

  // Handle /blog and /blog/:slug
  if (cleaned.startsWith('/blog')) {
    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length === 1) return { path: '/blog' };
    return { path: '/blog/:slug', slug: parts[1] };
  }

  // Handle direct anchor links to home sections (e.g. #about, #contact)
  const homeSectionIds = ['home', 'about', 'services', 'works', 'process', 'blog', 'contact'];
  const segment = cleaned.replace(/^\//, '');
  if (homeSectionIds.includes(segment)) {
    return { path: '/', slug: segment };
  }

  // Fallback 404
  return { path: '/404' };
}

function MainApp() {
  const { services, works, showcase, blogPosts, isAdmin, toast } = usePortfolioData();
  const [currentRoute, setCurrentRoute] = useState(() => parseHash(window.location.hash));
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Store Home scroll position for scroll restoration
  const homeScrollY = useRef(0);
  const prevPathRef = useRef<string>(currentRoute.path);

  // Lightbox items prepared from showcase
  const activeShowcase = showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase;
  const lightboxItems: LightboxItem[] = activeShowcase.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.image,
    badge: s.badge || s.type,
    subtitle: s.client,
    client: s.client,
    highlight: s.highlight,
    caption: s.title,
  }));

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);

      // If we are currently on Home and leaving Home, save scroll position
      if (prevPathRef.current === '/' && parsed.path !== '/') {
        homeScrollY.current = window.scrollY;
      }

      setCurrentRoute(parsed);

      // Scroll handling
      if (parsed.path === '/') {
        if (parsed.slug) {
          // Target anchor section requested
          setTimeout(() => {
            const el = document.getElementById(parsed.slug!);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 80);
        } else if (prevPathRef.current !== '/') {
          // Returning to Home from another page: restore scroll position
          setTimeout(() => {
            window.scrollTo({ top: homeScrollY.current, behavior: 'instant' });
          }, 50);
        }
      } else {
        // Navigating between other pages: scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      prevPathRef.current = parsed.path;
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update document title dynamically
  useEffect(() => {
    if (currentRoute.path === '/') {
      document.title = 'Alex Rivera | Performance Marketing & SEO Growth Portfolio';
    } else if (currentRoute.path === '/admin' || currentRoute.path === '/admin/login') {
      document.title = 'Admin Console | Alex Rivera Growth Portfolio';
    } else if (currentRoute.path === '/services') {
      document.title = 'Growth Services & Capabilities | Alex Rivera';
    } else if (currentRoute.path === '/services/:slug' && currentRoute.slug) {
      const srvList = services.length > 0 ? services : PORTFOLIO_DATA.services;
      const srv = srvList.find((s) => s.slug === currentRoute.slug);
      document.title = srv
        ? `${srv.title} | Services | Alex Rivera`
        : 'Service | Alex Rivera';
    } else if (currentRoute.path === '/works') {
      document.title = 'Proof of Work & Case Studies | Alex Rivera';
    } else if (currentRoute.path === '/works/:slug' && currentRoute.slug) {
      const wrkList = works.length > 0 ? works : PORTFOLIO_DATA.works;
      const wrk = wrkList.find((w) => w.slug === currentRoute.slug);
      document.title = wrk
        ? `${wrk.title} | Case Study | Alex Rivera`
        : 'Case Study | Alex Rivera';
    } else if (currentRoute.path === '/blog') {
      document.title = 'Growth Playbooks & Field Notes | Alex Rivera';
    } else if (currentRoute.path === '/blog/:slug' && currentRoute.slug) {
      const blgList = blogPosts.length > 0 ? blogPosts : PORTFOLIO_DATA.blogPosts;
      const blg = blgList.find((b) => b.slug === currentRoute.slug);
      document.title = blg
        ? `${blg.title} | Field Notes | Alex Rivera`
        : 'Article | Alex Rivera';
    } else {
      document.title = 'Page Not Found | Alex Rivera';
    }
  }, [currentRoute, services, works, blogPosts]);

  // Programmatic route navigation helper
  const handleNavigateRoute = (route: string, targetSectionId?: string) => {
    if (route === '/' && targetSectionId) {
      window.location.hash = `#${targetSectionId}`;
    } else {
      window.location.hash = `#${route}`;
    }
  };

  const handleOpenLightboxById = (id: string) => {
    const idx = lightboxItems.findIndex((item) => item.id === id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const isAdminRoute = currentRoute.path === '/admin' || currentRoute.path === '/admin/login';

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-base text-on-surface selection:bg-primary-fixed selection:text-primary">
      {/* If on Admin route, render dedicated admin container */}
      {isAdminRoute ? (
        <div className="min-h-screen bg-neutral-100 flex flex-col">
          {/* Admin Minimal Header */}
          <header className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                AR
              </div>
              <div>
                <span className="font-bold text-sm text-neutral-900 block leading-tight">
                  Alex Rivera Portfolio
                </span>
                <span className="text-[10px] text-neutral-500 font-medium">
                  Firebase Administration Console
                </span>
              </div>
            </div>
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>View Public Portfolio</span>
            </a>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
            {isAdmin ? <AdminDashboard /> : <AdminLogin />}
          </main>
        </div>
      ) : (
        <>
          {/* Sticky Navbar for Public Site */}
          <Navbar
            currentPath={
              currentRoute.path === '/services/:slug'
                ? `/services/${currentRoute.slug}`
                : currentRoute.path === '/works/:slug'
                ? `/works/${currentRoute.slug}`
                : currentRoute.path === '/blog/:slug'
                ? `/blog/${currentRoute.slug}`
                : currentRoute.path
            }
            onNavigateRoute={handleNavigateRoute}
            onOpenAudit={() => setIsAuditModalOpen(true)}
          />

          {/* Main Content View Container */}
          <main className="w-full pt-20 bg-surface flex-1">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 md:py-10">
              {/* 1. HOME VIEW (Single-Page with all 13 sections) */}
              {currentRoute.path === '/' && (
                <HomeView
                  onOpenAudit={() => setIsAuditModalOpen(true)}
                  onOpenLightboxById={handleOpenLightboxById}
                />
              )}

              {/* 2. SERVICES HUB */}
              {currentRoute.path === '/services' && (
                <ServicesHubView
                  onOpenAudit={() => setIsAuditModalOpen(true)}
                  onNavigateWork={(slug) => handleNavigateRoute(`/works/${slug}`)}
                />
              )}

              {/* 3. SERVICE DETAIL */}
              {currentRoute.path === '/services/:slug' && (
                <ServiceDetailView
                  slug={currentRoute.slug || ''}
                  onOpenAudit={() => setIsAuditModalOpen(true)}
                  onSelectWork={(slug) => handleNavigateRoute(`/works/${slug}`)}
                />
              )}

              {/* 4. WORKS HUB */}
              {currentRoute.path === '/works' && (
                <WorksHubView
                  onOpenAudit={() => setIsAuditModalOpen(true)}
                  onOpenLightboxById={handleOpenLightboxById}
                />
              )}

              {/* 5. WORK DETAIL */}
              {currentRoute.path === '/works/:slug' && (
                <WorkDetailView
                  slug={currentRoute.slug || ''}
                  onOpenAudit={() => setIsAuditModalOpen(true)}
                  onOpenLightboxById={handleOpenLightboxById}
                />
              )}

              {/* 6. BLOG HUB */}
              {currentRoute.path === '/blog' && (
                <BlogHubView onOpenAudit={() => setIsAuditModalOpen(true)} />
              )}

              {/* 7. BLOG DETAIL */}
              {currentRoute.path === '/blog/:slug' && (
                <BlogDetailView
                  slug={currentRoute.slug || ''}
                  onOpenAudit={() => setIsAuditModalOpen(true)}
                />
              )}

              {/* 8. 404 NOT FOUND */}
              {currentRoute.path === '/404' && <NotFoundView />}
            </div>
          </main>

          {/* 13. Dark Footer with Newsletter Capture */}
          <Footer
            onOpenAudit={() => setIsAuditModalOpen(true)}
            onNavigateRoute={handleNavigateRoute}
          />

          {/* Global Interactive 3-Step Growth Audit Modal */}
          <AuditBookingModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
          />

          {/* Global Full Proof Lightbox Modal */}
          <LightboxModal
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            items={lightboxItems}
            currentIndex={lightboxIndex}
            onNavigate={(newIdx) => setLightboxIndex(newIdx)}
          />
        </>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-none transition-all">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-950 text-white border-rose-600/50 shadow-rose-950/30'
                : 'bg-slate-900 text-white border-neutral-700'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                toast.type === 'success'
                  ? 'text-emerald-400'
                  : toast.type === 'error'
                  ? 'text-rose-400'
                  : 'text-primary'
              }`}
            >
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <MainApp />
    </PortfolioProvider>
  );
}
