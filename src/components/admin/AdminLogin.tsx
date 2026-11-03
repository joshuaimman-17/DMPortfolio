import React from 'react';
import { usePortfolioData } from '../../context/PortfolioContext';

export const AdminLogin: React.FC = () => {
  const { user, isAdmin, loginWithGoogle, logout, authLoading } = usePortfolioData();

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Case 1: Signed in but not an authorized admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-8 sm:p-10 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Access Denied
          </h2>

          <p className="text-sm text-neutral-600 leading-relaxed">
            You are signed in as <span className="font-semibold text-neutral-900">{user.email}</span>, but this account is not registered in the administrators registry.
          </p>

          <div className="p-3 rounded-xl bg-neutral-100 text-xs text-neutral-600 border border-neutral-200 text-left w-full">
            <span className="font-bold block mb-1">Notice:</span>
            Only authorized growth team administrators have access to content models and client submission inboxes.
          </div>

          <div className="flex flex-col gap-2 w-full pt-2">
            <button
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign out</span>
            </button>
            <a
              href="#/"
              className="w-full py-2.5 px-4 rounded-xl text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition-colors"
            >
              Return to Public Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Signed out
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-8 sm:p-10 text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Alex Rivera Portfolio
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mt-1">
            Admin Console
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
            Manage services, case studies, visual deliverables, playbooks, and client diagnostic inboxes.
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full py-3.5 px-5 rounded-2xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span className="text-white">Sign in with Google</span>
        </button>

        <a
          href="#/"
          className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          ← Back to Public Portfolio
        </a>
      </div>
    </div>
  );
};
