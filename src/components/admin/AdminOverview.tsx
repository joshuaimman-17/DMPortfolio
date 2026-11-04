import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { seedDatabaseFromSampleData } from '../../lib/admin-service';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const { user, services, works, blogPosts, refreshData, showToast } = usePortfolioData();
  const [inboxCount, setInboxCount] = useState<number>(0);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [showSeedModal, setShowSeedModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadCounts() {
      try {
        const inboxSnap = await getDocs(query(collection(db, 'submissions'), where('status', '==', 'New')));
        setInboxCount(inboxSnap.size);
      } catch {
        setInboxCount(0);
      }
      try {
        const subsSnap = await getDocs(collection(db, 'subscribers'));
        setSubscribersCount(subsSnap.size);
      } catch {
        setSubscribersCount(0);
      }
    }
    loadCounts();
  }, []);

  const handleSeed = async () => {
    setShowSeedModal(false);
    setIsSeeding(true);
    showToast('Seeding Firestore from portfolio sample data...', 'info');
    const result = await seedDatabaseFromSampleData(user?.email || undefined);
    setIsSeeding(false);
    if (result.success) {
      showToast(result.message, 'success');
      await refreshData();
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Growth Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Signed in as <span className="font-semibold text-neutral-900">{user?.email}</span> (Administrator)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSeedModal(true)}
            disabled={isSeeding}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            <span>{isSeeding ? 'Seeding...' : 'Seed database from sample data'}</span>
          </button>

          <a
            href="/"
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          >
            <span>View Public Site</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Published Works */}
        <div
          onClick={() => onNavigateTab('works')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Case Studies</span>
            <span className="material-symbols-outlined text-primary text-[20px]">work</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900">
            {works.length}
          </div>
          <span className="text-[11px] text-neutral-500 group-hover:text-primary transition-colors block mt-1">
            Manage Works →
          </span>
        </div>

        {/* Published Services */}
        <div
          onClick={() => onNavigateTab('services')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Services</span>
            <span className="material-symbols-outlined text-primary text-[20px]">room_service</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900">
            {services.length}
          </div>
          <span className="text-[11px] text-neutral-500 group-hover:text-primary transition-colors block mt-1">
            Manage Services →
          </span>
        </div>

        {/* Published Posts */}
        <div
          onClick={() => onNavigateTab('posts')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Articles</span>
            <span className="material-symbols-outlined text-primary text-[20px]">article</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900">
            {blogPosts.length}
          </div>
          <span className="text-[11px] text-neutral-500 group-hover:text-primary transition-colors block mt-1">
            Manage Playbooks →
          </span>
        </div>

        {/* New Inbox Items */}
        <div
          onClick={() => onNavigateTab('inbox')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">New Inquiries</span>
            <span className="material-symbols-outlined text-rose-500 text-[20px]">inbox</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-rose-600">
            {inboxCount}
          </div>
          <span className="text-[11px] text-neutral-500 group-hover:text-primary transition-colors block mt-1">
            Open Inbox →
          </span>
        </div>

        {/* Newsletter Subscribers */}
        <div
          onClick={() => onNavigateTab('subscribers')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Subscribers</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">mark_email_read</span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-600">
            {subscribersCount}
          </div>
          <span className="text-[11px] text-neutral-500 group-hover:text-primary transition-colors block mt-1">
            View Emails →
          </span>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">Site Settings &amp; Copy</h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Update hero titles, animated metrics, direct WhatsApp numbers, and footer branding.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Edit Settings
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[22px]">photo_library</span>
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">Visual Proof &amp; Artifacts</h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Manage campaign posters, analytics charts, and verified ranking deliverables for the lightbox.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('showcase')}
            className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Manage Deliverables
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[22px]">star</span>
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">Client Testimonials</h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Add verified quotes, client founder titles, star ratings, and custom company avatars.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('testimonials')}
            className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Manage Testimonials
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Seeding */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Seed Sample Data to Firestore?</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
              This will write all 6 services, 6 case studies, 12 showcase items, 6 blog playbooks, testimonials, site settings, and initial admin records into your Firestore database. It is safe to run multiple times as it uses unique document IDs.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSeedModal(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSeed}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors cursor-pointer"
              >
                Yes, Seed Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
