import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { triggerRevalidation } from '../../lib/admin-service';
import { SiteSettings } from '../../lib/portfolioService';
import { DEFAULT_HOME, mergeHome, type HomeContent } from '../../types/home-content';
import { SettingsFields } from './AdminSettings';
import { HomeContentFields } from './AdminHomeContent';

/**
 * ONE form for the whole home page: brand, hero, metrics, footer + every section's copy.
 * (Cards live in their own tabs; contact channels & social links live on the Contact page.)
 */
export const AdminHome: React.FC = () => {
  const { settings, refreshData, showToast } = usePortfolioData();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [home, setHome] = useState<HomeContent>(mergeHome(settings.home));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
    setHome(mergeHome(settings.home));
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await Promise.all([
        setDoc(doc(db, 'settings', 'profile'), { name: form.name || 'Alex Rivera', updatedAt: now }),
        setDoc(doc(db, 'settings', 'hero'), { data: form.hero, updatedAt: now }),
        setDoc(doc(db, 'settings', 'metrics'), { data: form.metrics, updatedAt: now }),
        setDoc(doc(db, 'settings', 'footer'), { data: form.footer, updatedAt: now }),
        setDoc(doc(db, 'settings', 'home'), { data: home, updatedAt: now }, { merge: true }),
      ]);
      showToast('Home page saved!', 'success');
      await refreshData();
      const ok = await triggerRevalidation(['settings'], ['/']);
      if (!ok) showToast('Saved, but the live home page was NOT refreshed. Sign in again and retry.', 'error');
    } catch (err: any) {
      showToast(err.message || 'Failed to save home page', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetCopy = () => {
    if (confirm('Reset all section text on this form to the original wording? (Nothing is saved until you click Save.)')) {
      setHome(DEFAULT_HOME);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Home Page</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Everything on the home page except the service / work / blog / testimonial cards and the contact
            channels &amp; social links.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={resetCopy}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
          >
            Reset section text
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Home Page'}
          </button>
        </div>
      </div>

      <SettingsFields form={form} setForm={setForm} scope="home" />
      <HomeContentFields form={home} setForm={setHome} />

      <div className="flex justify-end pb-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Home Page'}
        </button>
      </div>
    </form>
  );
};
