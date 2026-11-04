import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { SiteSettings } from '../../lib/portfolioService';
import { triggerRevalidation } from '../../lib/admin-service';
import { ImageField } from './ImageField';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

export const AdminSettings: React.FC = () => {
  const { settings, refreshData, showToast } = usePortfolioData();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, 'settings', 'profile'), { name: form.name || 'Alex Rivera', updatedAt: new Date().toISOString() }),
        setDoc(doc(db, 'settings', 'hero'), { data: form.hero, updatedAt: new Date().toISOString() }),
        setDoc(doc(db, 'settings', 'metrics'), { data: form.metrics, updatedAt: new Date().toISOString() }),
        setDoc(doc(db, 'settings', 'contact'), { data: form.contact, updatedAt: new Date().toISOString() }),
        setDoc(doc(db, 'settings', 'social'), { data: form.social, updatedAt: new Date().toISOString() }),
        setDoc(doc(db, 'settings', 'footer'), { data: form.footer, updatedAt: new Date().toISOString() }),
      ]);
      showToast('Site settings updated across public portfolio!', 'success');
      await refreshData();
      await triggerRevalidation(['settings'], ['/', '/services', '/works', '/blog']);
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Site Settings &amp; Global Copy</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Configure brand name, headline, subtext, 4 animated metrics, contact channels, and footer copy.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* 0. Brand & Personal Identity */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
          <span>Brand &amp; Personal Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">
              Portfolio Owner / Brand Name *
            </label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              This name dynamically populates across the navigation bar, hero section, about bio, footer copyright, and OpenGraph site name.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Hero Section Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">home</span>
          <span>Hero Banner Copy &amp; Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Role / Eyebrow Tag</label>
            <input
              type="text"
              value={form.hero.roleTag}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, roleTag: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Main Headline</label>
            <input
              type="text"
              value={form.hero.headline}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, headline: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-neutral-800 block mb-1">Hero Subtext Description</label>
            <textarea
              rows={3}
              value={form.hero.subtext}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtext: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Floating Badge 1 (Traffic)</label>
            <input
              type="text"
              value={form.hero.badge1}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, badge1: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Floating Badge 2 (ROAS)</label>
            <input
              type="text"
              value={form.hero.badge2}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, badge2: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Floating Badge 3 (Partner Status)</label>
            <input
              type="text"
              value={form.hero.badge3 || ''}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, badge3: e.target.value } })}
              placeholder="e.g. Meta & Google Partner"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-neutral-100">
            <ImageField
              label="Hero Section Portrait / Cover Image"
              category="testimonials"
              value={form.hero.avatar || form.hero.image || PORTFOLIO_DATA.profile.avatar}
              driveFileId={form.hero.driveFileId}
              aspectRatioClass="aspect-square max-w-[280px]"
              helperText="Alex Rivera portrait image displayed in the hero visual block with floating metric badges."
              onChange={({ image, driveFileId }) =>
                setForm({
                  ...form,
                  hero: {
                    ...form.hero,
                    avatar: image,
                    image,
                    driveFileId,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* 2. Four Metrics Bar Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">query_stats</span>
          <span>The 4 Animated Metric Cards</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="text-[11px] font-bold text-primary block">Metric 1</span>
            <input
              type="text"
              value={form.metrics.metric1.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric1: { ...form.metrics.metric1, value: e.target.value } },
                })
              }
              placeholder="+120%"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm font-mono font-bold text-secondary"
            />
            <input
              type="text"
              value={form.metrics.metric1.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric1: { ...form.metrics.metric1, label: e.target.value } },
                })
              }
              placeholder="Organic Traffic"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
            />
            <input
              type="text"
              value={form.metrics.metric1.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric1: { ...form.metrics.metric1, desc: e.target.value } },
                })
              }
              placeholder="Description"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px]"
            />
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="text-[11px] font-bold text-primary block">Metric 2</span>
            <input
              type="text"
              value={form.metrics.metric2.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric2: { ...form.metrics.metric2, value: e.target.value } },
                })
              }
              placeholder="4.5x"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm font-mono font-bold text-primary-container"
            />
            <input
              type="text"
              value={form.metrics.metric2.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric2: { ...form.metrics.metric2, label: e.target.value } },
                })
              }
              placeholder="Blended ROAS"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
            />
            <input
              type="text"
              value={form.metrics.metric2.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric2: { ...form.metrics.metric2, desc: e.target.value } },
                })
              }
              placeholder="Description"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px]"
            />
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="text-[11px] font-bold text-primary block">Metric 3</span>
            <input
              type="text"
              value={form.metrics.metric3.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric3: { ...form.metrics.metric3, value: e.target.value } },
                })
              }
              placeholder="₹50L+"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm font-mono font-bold"
            />
            <input
              type="text"
              value={form.metrics.metric3.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric3: { ...form.metrics.metric3, label: e.target.value } },
                })
              }
              placeholder="Ad Spend Managed"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
            />
            <input
              type="text"
              value={form.metrics.metric3.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric3: { ...form.metrics.metric3, desc: e.target.value } },
                })
              }
              placeholder="Description"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px]"
            />
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="text-[11px] font-bold text-primary block">Metric 4</span>
            <input
              type="text"
              value={form.metrics.metric4.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric4: { ...form.metrics.metric4, value: e.target.value } },
                })
              }
              placeholder="30+"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm font-mono font-bold text-secondary"
            />
            <input
              type="text"
              value={form.metrics.metric4.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric4: { ...form.metrics.metric4, label: e.target.value } },
                })
              }
              placeholder="Engagements"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
            />
            <input
              type="text"
              value={form.metrics.metric4.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  metrics: { ...form.metrics, metric4: { ...form.metrics.metric4, desc: e.target.value } },
                })
              }
              placeholder="Description"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* 3. Contact & Social Channels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">contact_mail</span>
          <span>Contact Channels &amp; Social Links</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Direct Email Address</label>
            <input
              type="email"
              value={form.contact.email}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Direct Phone / WhatsApp</label>
            <input
              type="text"
              value={form.contact.phone}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Location Details</label>
            <input
              type="text"
              value={form.contact.location}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, location: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">WhatsApp Quick Link</label>
            <input
              type="text"
              value={form.contact.whatsapp}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, whatsapp: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={form.social.linkedin}
              onChange={(e) => setForm({ ...form, social: { ...form.social, linkedin: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">X (Twitter) URL</label>
            <input
              type="text"
              value={form.social.twitter}
              onChange={(e) => setForm({ ...form, social: { ...form.social, twitter: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Footer Branding */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-neutral-700 text-[20px]">short_text</span>
          <span>Footer Branding &amp; Tagline</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Footer Tagline</label>
            <input
              type="text"
              value={form.footer.tagline}
              onChange={(e) => setForm({ ...form, footer: { ...form.footer, tagline: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1">Copyright Line</label>
            <input
              type="text"
              value={form.footer.copyright}
              onChange={(e) => setForm({ ...form, footer: { ...form.footer, copyright: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
};
