import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { SiteSettings } from '../../lib/portfolioService';
import { triggerRevalidation } from '../../lib/admin-service';
import { ImageField } from './ImageField';
import { Collapsible } from './Collapsible';
import { mergeHome } from '../../types/home-content';

export const SettingsFields: React.FC<{
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
  scope: 'home' | 'contact';
}> = ({ form, setForm, scope }) => {
  const isContact = scope === 'contact';
  return (
    <>
      {!isContact && (
      <>
      {/* 0. Brand & Personal Identity */}
      <Collapsible title="Brand &amp; Personal Identity" icon="badge" iconClass="text-primary" defaultOpen>

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
      </Collapsible>

      {/* 1. Hero Section Settings */}
      <Collapsible title="Hero Banner Copy &amp; Badges" icon="home" iconClass="text-primary">

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
              value={form.hero.avatar || form.hero.image || ''}
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
      </Collapsible>

      {/* 2. Four Metrics Bar Settings */}
      <Collapsible title="The 4 Animated Metric Cards" icon="query_stats" iconClass="text-secondary">

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
      </Collapsible>

      </>
      )}

      {isContact && (
      <>
      <Collapsible title="Contact Channels &amp; Social Links" icon="contact_mail" iconClass="text-primary" defaultOpen>

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
      </Collapsible>

      <Collapsible title="Contact & About Labels" icon="label" iconClass="text-primary">
        <p className="text-xs text-neutral-500">
          Small captions shown next to your contact details on the home page (About block and Contact section).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ['headquarters', 'About block: location caption'],
            ['directLine', 'About block: email caption'],
            ['directEmail', 'Contact section: email caption'],
            ['whatsapp', 'Contact section: phone caption'],
            ['baseLocation', 'Contact section: location caption'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-bold text-neutral-800 block mb-1">{label}</label>
              <input
                type="text"
                value={mergeHome(form.home).labels[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...mergeHome(form.home),
                      labels: { ...mergeHome(form.home).labels, [key]: e.target.value },
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>
          ))}
        </div>
      </Collapsible>
      </>
      )}

      {!isContact && (
      <Collapsible title="Footer Branding &amp; Tagline" icon="short_text" iconClass="text-neutral-700">

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
      </Collapsible>

      )}

    </>
  );
};

export const AdminSettings: React.FC<{ scope?: 'home' | 'contact' }> = ({ scope = 'home' }) => {
  const isContact = scope === 'contact';
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
      const now = new Date().toISOString();
      await Promise.all(
        isContact
          ? [
              setDoc(doc(db, 'settings', 'contact'), { data: form.contact, updatedAt: now }),
              setDoc(doc(db, 'settings', 'social'), { data: form.social, updatedAt: now }),
              setDoc(
                doc(db, 'settings', 'home'),
                {
                  data: {
                    labels: (({ headquarters, directLine, directEmail, whatsapp, baseLocation }) => ({
                      headquarters,
                      directLine,
                      directEmail,
                      whatsapp,
                      baseLocation,
                    }))(mergeHome(form.home).labels),
                  },
                  updatedAt: now,
                },
                { merge: true }
              ),
            ]
          : [
              setDoc(doc(db, 'settings', 'profile'), { name: form.name || 'Alex Rivera', updatedAt: now }),
              setDoc(doc(db, 'settings', 'hero'), { data: form.hero, updatedAt: now }),
              setDoc(doc(db, 'settings', 'metrics'), { data: form.metrics, updatedAt: now }),
              setDoc(doc(db, 'settings', 'footer'), { data: form.footer, updatedAt: now }),
            ]
      );
      showToast('Site settings updated across public portfolio!', 'success');
      await refreshData();
      const revalidated = await triggerRevalidation(['settings'], ['/', '/services', '/works', '/blog']);
      if (!revalidated) {
        showToast('Saved, but the live site was NOT refreshed. Sign in again and retry.', 'error');
      }
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
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{isContact ? 'Contact Channels & Social Links' : 'Brand, Hero & Metrics'}</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            {isContact ? 'Email, phone, WhatsApp, location and social profile links shown across the site.' : 'Configure brand name, headline, subtext, avatar, 4 animated metrics, and footer copy.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{saving ? 'Saving...' : isContact ? 'Save Contact' : 'Save Settings'}</span>
        </button>
      </div>

      <SettingsFields form={form} setForm={setForm} scope={scope} />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : isContact ? 'Save Contact' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};
