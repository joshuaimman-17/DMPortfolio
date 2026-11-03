'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { PortfolioProvider, usePortfolioData } from '@/context/PortfolioContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';

function AdminContent() {
  const { isAdmin, authLoading } = usePortfolioData();

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/70 flex flex-col">
      <header className="bg-white border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
            AR
          </div>
          <div>
            <span className="font-bold text-sm text-neutral-900 block leading-tight">
              Alex Rivera
            </span>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider block">
              Firebase Administration Console
            </span>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          <span>View Public Portfolio</span>
        </Link>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
        {isAdmin ? <AdminDashboard /> : <AdminLogin />}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <PortfolioProvider>
      <AdminContent />
    </PortfolioProvider>
  );
}
