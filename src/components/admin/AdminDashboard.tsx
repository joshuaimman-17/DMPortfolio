import React, { useState } from 'react';
import Link from 'next/link';
import { usePortfolioData } from '../../context/PortfolioContext';
import { AdminOverview } from './AdminOverview';
import { AdminServices } from './AdminServices';
import { AdminWorks } from './AdminWorks';
import { AdminShowcase } from './AdminShowcase';
import { AdminPosts } from './AdminPosts';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminSettings } from './AdminSettings';
import { AdminInbox } from './AdminInbox';
import { AdminSubscribers } from './AdminSubscribers';

type AdminTab =
  | 'overview'
  | 'services'
  | 'works'
  | 'showcase'
  | 'posts'
  | 'testimonials'
  | 'settings'
  | 'inbox'
  | 'subscribers';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = usePortfolioData();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const navItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'services', label: 'Services', icon: 'room_service' },
    { id: 'works', label: 'Works & Studies', icon: 'work' },
    { id: 'showcase', label: 'Showcase Proof', icon: 'photo_library' },
    { id: 'posts', label: 'Blog Posts', icon: 'article' },
    { id: 'testimonials', label: 'Testimonials', icon: 'star' },
    { id: 'settings', label: 'Site Settings', icon: 'tune' },
    { id: 'inbox', label: 'Inbound Inbox', icon: 'inbox' },
    { id: 'subscribers', label: 'Subscribers', icon: 'mark_email_read' },
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 min-h-[85vh]">
      {/* Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
      <aside className="w-full lg:w-64 bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
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

          {/* Nav Items */}
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
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

      {/* Main Tab Content Panel */}
      <div className="flex-1 min-w-0">
        {activeTab === 'overview' && <AdminOverview onNavigateTab={(t) => setActiveTab(t as AdminTab)} />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'works' && <AdminWorks />}
        {activeTab === 'showcase' && <AdminShowcase />}
        {activeTab === 'posts' && <AdminPosts />}
        {activeTab === 'testimonials' && <AdminTestimonials />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'inbox' && <AdminInbox />}
        {activeTab === 'subscribers' && <AdminSubscribers />}
      </div>
    </div>
  );
};
