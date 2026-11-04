'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider, setCachedAccessToken } from '../lib/firebase';
import {
  PORTFOLIO_DATA,
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '../data/portfolioData';
import { SiteSettings, DEFAULT_SETTINGS } from '../types/settings';
import {
  checkIsAdmin,
  ensureAdminRecord,
  triggerRevalidation,
} from '../lib/admin-service';
import {
  fetchPublishedCollection,
  fetchSiteSettings,
} from '../lib/portfolioService';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PortfolioContextType {
  services: ServiceDetail[];
  works: WorkDetail[];
  showcase: ShowcaseItem[];
  blogPosts: BlogPostDetail[];
  testimonials: any[];
  settings: SiteSettings;
  loading: boolean;
  refreshData: () => Promise<void>;
  findService: (slug: string) => ServiceDetail | undefined;
  findWork: (slug: string) => WorkDetail | undefined;
  findPost: (slug: string) => BlogPostDetail | undefined;

  // Auth & Admin
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;

  // Toast notifications
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceDetail[]>(PORTFOLIO_DATA.services);
  const [works, setWorks] = useState<WorkDetail[]>(PORTFOLIO_DATA.works);
  const [showcase, setShowcase] = useState<ShowcaseItem[]>(PORTFOLIO_DATA.showcase);
  const [blogPosts, setBlogPosts] = useState<BlogPostDetail[]>(PORTFOLIO_DATA.blogPosts);
  const [testimonials, setTestimonials] = useState<any[]>(PORTFOLIO_DATA.testimonials);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        const adminStatus = await checkIsAdmin(currentUser.email);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          await ensureAdminRecord(currentUser.email);
        }
      } else {
        setIsAdmin(false);
        setCachedAccessToken(null);
      }
      setAuthLoading(false);
    });

    return () => {
      setCachedAccessToken(null);
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
      }

      if (result.user?.email) {
        const adminStatus = await checkIsAdmin(result.user.email);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          await ensureAdminRecord(result.user.email);
          showToast(`Welcome back, ${result.user.displayName || result.user.email}!`, 'success');
          return true;
        } else {
          showToast('Access denied: You are signed in, but this Google account is not an authorized administrator.', 'error');
          return false;
        }
      }
      return false;
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast(err.message || 'Failed to sign in with Google.', 'error');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCachedAccessToken(null);
      setUser(null);
      setIsAdmin(false);
      showToast('Signed out successfully.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error signing out', 'error');
    }
  };

  // Load published data from Firestore
  const loadPublishedData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedServices, fetchedWorks, fetchedShowcase, fetchedPosts, fetchedTestimonials, fetchedSettings] =
        await Promise.all([
          fetchPublishedCollection<ServiceDetail>('services', PORTFOLIO_DATA.services),
          fetchPublishedCollection<WorkDetail>('works', PORTFOLIO_DATA.works),
          fetchPublishedCollection<ShowcaseItem>('showcase', PORTFOLIO_DATA.showcase),
          fetchPublishedCollection<BlogPostDetail>('posts', PORTFOLIO_DATA.blogPosts),
          fetchPublishedCollection<any>('testimonials', PORTFOLIO_DATA.testimonials),
          fetchSiteSettings(),
        ]);

      setServices(fetchedServices);
      setWorks(fetchedWorks);
      setShowcase(fetchedShowcase);
      setBlogPosts(fetchedPosts);
      setTestimonials(fetchedTestimonials);
      setSettings(fetchedSettings);
    } catch {
      // Fallback to sample data gracefully
      setServices(PORTFOLIO_DATA.services);
      setWorks(PORTFOLIO_DATA.works);
      setShowcase(PORTFOLIO_DATA.showcase);
      setBlogPosts(PORTFOLIO_DATA.blogPosts);
      setTestimonials(PORTFOLIO_DATA.testimonials);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublishedData();
  }, [loadPublishedData]);

  const findService = useCallback(
    (slug: string) => services.find((s) => s.slug === slug),
    [services]
  );

  const findWork = useCallback(
    (slug: string) => works.find((w) => w.slug === slug),
    [works]
  );

  const findPost = useCallback(
    (slug: string) => blogPosts.find((p) => p.slug === slug),
    [blogPosts]
  );

  return (
    <PortfolioContext.Provider
      value={{
        services,
        works,
        showcase,
        blogPosts,
        testimonials,
        settings,
        loading,
        refreshData: loadPublishedData,
        findService,
        findWork,
        findPost,
        user,
        isAdmin,
        authLoading,
        loginWithGoogle,
        logout,
        toast,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-md animate-fadeIn transition-all">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-700/60'
                : toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-700/60'
                : 'bg-slate-900/95 text-slate-100 border-slate-700/60'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'error'
                ? 'error'
                : 'info'}
            </span>
            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioData = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    return {
      services: PORTFOLIO_DATA.services,
      works: PORTFOLIO_DATA.works,
      showcase: PORTFOLIO_DATA.showcase,
      blogPosts: PORTFOLIO_DATA.blogPosts,
      testimonials: PORTFOLIO_DATA.testimonials,
      settings: DEFAULT_SETTINGS,
      loading: false,
      refreshData: async () => {},
      findService: (slug: string) => PORTFOLIO_DATA.services.find((s) => s.slug === slug),
      findWork: (slug: string) => PORTFOLIO_DATA.works.find((w) => w.slug === slug),
      findPost: (slug: string) => PORTFOLIO_DATA.blogPosts.find((p) => p.slug === slug),
      user: null,
      isAdmin: false,
      authLoading: false,
      loginWithGoogle: async () => false,
      logout: async () => {},
      toast: null,
      showToast: () => {},
    };
  }
  return context;
};
