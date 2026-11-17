import React, { useState } from 'react';
import Link from 'next/link';
import { usePortfolioData } from '../../context/PortfolioContext';
import { AdminServices } from './AdminServices';
import { AdminWorks } from './AdminWorks';
import { AdminShowcase } from './AdminShowcase';
import { AdminPosts } from './AdminPosts';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminSettings } from './AdminSettings';
import { AdminHome } from './AdminHome';
import { AdminMetadata } from './AdminMetadata';
import { AdminInbox } from './AdminInbox';
import { AdminSubscribers } from './AdminSubscribers';
import { AdminEmailTemplates } from './AdminEmailTemplates';

type PageId = 'home' | 'services' | 'works' | 'blog' | 'contact';

interface Section {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

interface PageDef {
  id: PageId;
  label: string;
  icon: string;
  sections: Section[];
}

// Each public page opens its own edit form(s): content editors plus that page's SEO metadata.
const PAGES: PageDef[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    sections: [
      { id: 'content', label: 'Home Page', render: () => <AdminHome /> },
      { id: 'testimonials', label: 'Testimonials', render: () => <AdminTestimonials /> },
      { id: 'seo', label: 'SEO', render: () => <AdminMetadata routeId="route_home" /> },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'room_service',
    sections: [
      { id: 'content', label: 'Services', render: () => <AdminServices /> },
      { id: 'seo', label: 'SEO', render: () => <AdminMetadata routeId="route_services" /> },
    ],
  },
  {
    id: 'works',
    label: 'Works',
    icon: 'work',
    sections: [
      { id: 'content', label: 'Case Studies', render: () => <AdminWorks /> },
      { id: 'showcase', label: 'Showcase Proof', render: () => <AdminShowcase /> },
      { id: 'seo', label: 'SEO', render: () => <AdminMetadata routeId="route_works" /> },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: 'article',
    sections: [
      { id: 'content', label: 'Posts', render: () => <AdminPosts /> },
      { id: 'seo', label: 'SEO', render: () => <AdminMetadata routeId="route_blog" /> },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: 'mail',
    sections: [
      { id: 'content', label: 'Channels & Social Links', render: () => <AdminSettings scope="contact" /> },
      { id: 'inbox', label: 'Inbound Inbox', render: () => <AdminInbox /> },
      { id: 'subscribers', label: 'Subscribers', render: () => <AdminSubscribers /> },
      { id: 'emails', label: 'Email Templates', render: () => <AdminEmailTemplates /> },
    ],
  },
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = usePortfolioData();
  const [pagesOpen, setPagesOpen] = useState(true);
  const [activePage, setActivePage] = useState<PageId>('home');
  const [activeSection, setActiveSection] = useState<string>('content');

  const page = PAGES.find((p) => p.id === activePage) || PAGES[0];
  const section = page.sections.find((s) => s.id === activeSection) || page.sections[0];

  const openPage = (id: PageId) => {
    setActivePage(id);
    setActiveSection('content');
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <aside className="w-full lg:w-64 lg:h-full lg:overflow-y-auto bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm shrink-0 flex flex-col justify-between">
        <div>
          <div className="lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-neutral-200/80">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Public Site</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>

          <div className="flex items-center justify-between pb-4 mb-3 border-b border-neutral-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block leading-tight">Admin Console</span>
                <span className="text-[11px] text-neutral-500 truncate max-w-[130px] block">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible "Pages" collection */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setPagesOpen((o) => !o)}
              aria-expanded={pagesOpen}
              className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">web</span>
                <span>Pages</span>
              </span>
              <span
                className={`material-symbols-outlined text-[20px] transition-transform ${
                  pagesOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {pagesOpen && (
              <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:ml-3 lg:pl-2 lg:border-l border-neutral-200 no-scrollbar">
                {PAGES.map((p) => {
                  const isActive = activePage === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => openPage(p.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer text-left ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        <div className="pt-4 mt-4 border-t border-neutral-200/80 hidden lg:flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span>View Public Site</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        {/* Page header + section tabs */}
        <div className="shrink-0 bg-white rounded-3xl px-5 py-4 border border-neutral-200/80 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>Pages</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-bold text-neutral-900">{page.label}</span>
          </div>
          {page.sections.length > 1 && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {page.sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    section.id === s.id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div key={`${page.id}-${section.id}`} className="flex-1 min-h-0 overflow-y-auto pr-1 pb-6">
          {section.render()}
        </div>
      </div>
    </div>
  );
};
