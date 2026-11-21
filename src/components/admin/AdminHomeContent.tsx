import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { triggerRevalidation } from '../../lib/admin-service';
import { Collapsible } from './Collapsible';
import { IconPicker } from './IconPicker';
import { BRAND_LOGOS } from '../../lib/brand-logos';
import { DEFAULT_HOME, mergeHome, type HomeContent } from '../../types/home-content';

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white';

function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{label}</span>
      {multiline ? (
        <textarea className={inputCls} rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Card({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Collapsible title={title} defaultOpen={defaultOpen}>
      {children}
    </Collapsible>
  );
}

function ListHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-neutral-700">{title}</span>
      <button
        type="button"
        onClick={onAdd}
        className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold cursor-pointer"
      >
        + {addLabel}
      </button>
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
    >
      Remove
    </button>
  );
}

export const HomeContentFields: React.FC<{
  form: HomeContent;
  setForm: React.Dispatch<React.SetStateAction<HomeContent>>;
}> = ({ form, setForm }) => {
  const set = <K extends keyof HomeContent>(section: K, patch: Partial<HomeContent[K]>) =>
    setForm((f) => ({ ...f, [section]: { ...(f[section] as any), ...patch } }));
  const setItem = <T,>(arr: T[], i: number, patch: Partial<T>) =>
    arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x));
  return (
    <>
      <Card title="Hero buttons & trust line" defaultOpen>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary button" value={form.hero.ctaPrimary} onChange={(v) => set('hero', { ctaPrimary: v })} />
          <Field label="Secondary button" value={form.hero.ctaSecondary} onChange={(v) => set('hero', { ctaSecondary: v })} />
        </div>
        <Field label="Trust line (under buttons)" value={form.hero.trustText} onChange={(v) => set('hero', { trustText: v })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Fallback role tag (when hero role tag is empty)" value={form.hero.roleFallback} onChange={(v) => set('hero', { roleFallback: v })} />
          <Field label="Hero image alt text" value={form.hero.avatarAlt} onChange={(v) => set('hero', { avatarAlt: v })} />
        </div>
      </Card>

      <Card title="Metrics bar (icons & tags — values come from Brand, Hero & Metrics above)">
        {form.metricsBar.items.map((m, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-3">
            <Field label={`Metric ${i + 1} tag`} value={m.tag} onChange={(v) => set('metricsBar', { items: setItem(form.metricsBar.items, i, { tag: v }) })} />
            <IconPicker label={`Metric ${i + 1} icon`} value={m.icon} onChange={(v) => set('metricsBar', { items: setItem(form.metricsBar.items, i, { icon: v }) })} />
          </div>
        ))}
      </Card>

      <Card title="About">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.about.eyebrow} onChange={(v) => set('about', { eyebrow: v })} />
          <Field label="Heading" value={form.about.heading} onChange={(v) => set('about', { heading: v })} />
        </div>
        <Field label="Paragraph 1" multiline rows={4} value={form.about.paragraph1} onChange={(v) => set('about', { paragraph1: v })} />
        <Field label="Paragraph 2" multiline rows={4} value={form.about.paragraph2} onChange={(v) => set('about', { paragraph2: v })} />

        <div className="pt-2 border-t border-neutral-100 flex flex-col gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Tools eyebrow" value={form.about.toolsEyebrow} onChange={(v) => set('about', { toolsEyebrow: v })} />
            <Field label="Tools heading" value={form.about.toolsHeading} onChange={(v) => set('about', { toolsHeading: v })} />
            <Field label="Tools note" value={form.about.toolsNote} onChange={(v) => set('about', { toolsNote: v })} />
          </div>
          <ListHeader
            title={`Tools (${form.about.tools.length})`}
            addLabel="Add tool"
            onAdd={() => set('about', { tools: [...form.about.tools, { name: '', icon: 'build', level: '' }] })}
          />
          {form.about.tools.map((t, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
              <Field label="Name" value={t.name} onChange={(v) => set('about', { tools: setItem(form.about.tools, i, { name: v }) })} />
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Brand logo</span>
                <select
                  className={inputCls}
                  value={t.brand || ''}
                  onChange={(e) => set('about', { tools: setItem(form.about.tools, i, { brand: e.target.value }) })}
                >
                  <option value="">None (use icon)</option>
                  {t.brand && !BRAND_LOGOS.some((b) => b.slug === t.brand) && <option value={t.brand}>{t.brand}</option>}
                  {BRAND_LOGOS.map((b) => (
                    <option key={b.slug} value={b.slug}>{b.label}</option>
                  ))}
                </select>
              </label>
              <IconPicker label="Fallback icon" value={t.icon} onChange={(v) => set('about', { tools: setItem(form.about.tools, i, { icon: v }) })} />
              <Field label="Level" value={t.level} onChange={(v) => set('about', { tools: setItem(form.about.tools, i, { level: v }) })} />
              <RemoveBtn onClick={() => set('about', { tools: form.about.tools.filter((_, idx) => idx !== i) })} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Services section (heading only)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.services.eyebrow} onChange={(v) => set('services', { eyebrow: v })} />
          <Field label="Heading" value={form.services.heading} onChange={(v) => set('services', { heading: v })} />
        </div>
        <Field label="Subtext" multiline value={form.services.subtext} onChange={(v) => set('services', { subtext: v })} />
        <Field label="“View all” link text" value={form.services.viewAllLabel} onChange={(v) => set('services', { viewAllLabel: v })} />
      </Card>

      <Card title="Works section (headings only)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.works.eyebrow} onChange={(v) => set('works', { eyebrow: v })} />
          <Field label="Heading" value={form.works.heading} onChange={(v) => set('works', { heading: v })} />
        </div>
        <Field label="Subtext" multiline value={form.works.subtext} onChange={(v) => set('works', { subtext: v })} />
        <Field label="“Browse” link text" value={form.works.browseLabel} onChange={(v) => set('works', { browseLabel: v })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Archive eyebrow" value={form.works.archiveEyebrow} onChange={(v) => set('works', { archiveEyebrow: v })} />
          <Field label="Archive heading" value={form.works.archiveHeading} onChange={(v) => set('works', { archiveHeading: v })} />
        </div>
      </Card>

      <Card title="Process / methodology">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.process.eyebrow} onChange={(v) => set('process', { eyebrow: v })} />
          <Field label="Heading" value={form.process.heading} onChange={(v) => set('process', { heading: v })} />
        </div>
        <Field label="Subtext" multiline value={form.process.subtext} onChange={(v) => set('process', { subtext: v })} />
        <ListHeader
          title={`Steps (${form.process.steps.length})`}
          addLabel="Add step"
          onAdd={() =>
            set('process', {
              steps: [
                ...form.process.steps,
                { step: String(form.process.steps.length + 1).padStart(2, '0'), title: '', timeframe: '', icon: 'bolt', desc: '' },
              ],
            })
          }
        />
        {form.process.steps.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-3">
            <div className="grid sm:grid-cols-4 gap-3">
              <Field label="Number" value={s.step} onChange={(v) => set('process', { steps: setItem(form.process.steps, i, { step: v }) })} />
              <Field label="Title" value={s.title} onChange={(v) => set('process', { steps: setItem(form.process.steps, i, { title: v }) })} />
              <Field label="Timeframe" value={s.timeframe} onChange={(v) => set('process', { steps: setItem(form.process.steps, i, { timeframe: v }) })} />
              <IconPicker label="Icon" value={s.icon} onChange={(v) => set('process', { steps: setItem(form.process.steps, i, { icon: v }) })} />
            </div>
            <Field label="Description" multiline value={s.desc} onChange={(v) => set('process', { steps: setItem(form.process.steps, i, { desc: v }) })} />
            <RemoveBtn onClick={() => set('process', { steps: form.process.steps.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
      </Card>

      <Card title="Testimonials section (heading only)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.testimonials.eyebrow} onChange={(v) => set('testimonials', { eyebrow: v })} />
          <Field label="Heading" value={form.testimonials.heading} onChange={(v) => set('testimonials', { heading: v })} />
        </div>
      </Card>

      <Card title="FAQ">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.faq.eyebrow} onChange={(v) => set('faq', { eyebrow: v })} />
          <Field label="Heading" value={form.faq.heading} onChange={(v) => set('faq', { heading: v })} />
        </div>
        <Field label="Subtext" multiline value={form.faq.subtext} onChange={(v) => set('faq', { subtext: v })} />
        <ListHeader
          title={`Questions (${form.faq.items.length})`}
          addLabel="Add question"
          onAdd={() => set('faq', { items: [...form.faq.items, { q: '', a: '' }] })}
        />
        {form.faq.items.map((it, i) => (
          <div key={i} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-3">
            <Field label="Question" value={it.q} onChange={(v) => set('faq', { items: setItem(form.faq.items, i, { q: v }) })} />
            <Field label="Answer" multiline value={it.a} onChange={(v) => set('faq', { items: setItem(form.faq.items, i, { a: v }) })} />
            <RemoveBtn onClick={() => set('faq', { items: form.faq.items.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
      </Card>

      <Card title="Blog section (heading only)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.blog.eyebrow} onChange={(v) => set('blog', { eyebrow: v })} />
          <Field label="Heading" value={form.blog.heading} onChange={(v) => set('blog', { heading: v })} />
        </div>
        <Field label="Subtext" multiline value={form.blog.subtext} onChange={(v) => set('blog', { subtext: v })} />
        <Field label="“Browse” link text" value={form.blog.browseLabel} onChange={(v) => set('blog', { browseLabel: v })} />
      </Card>

      <Card title="Contact section">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow" value={form.contact.eyebrow} onChange={(v) => set('contact', { eyebrow: v })} />
          <Field label="Heading" value={form.contact.heading} onChange={(v) => set('contact', { heading: v })} />
        </div>
        <Field label="Subtext" multiline value={form.contact.subtext} onChange={(v) => set('contact', { subtext: v })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Priority box title" value={form.contact.priorityTitle} onChange={(v) => set('contact', { priorityTitle: v })} />
          <Field label="Priority box button" value={form.contact.priorityButton} onChange={(v) => set('contact', { priorityButton: v })} />
        </div>
        <Field label="Priority box text" multiline value={form.contact.priorityText} onChange={(v) => set('contact', { priorityText: v })} />
        <p className="text-xs text-neutral-500">
          Email, phone, location and WhatsApp are edited in the “Hero &amp; Metrics” tab.
        </p>
      </Card>

      <Card title="Inquiry form">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Form title" value={form.inquiryForm.title} onChange={(v) => set('inquiryForm', { title: v })} />
          <Field label="Submit button" value={form.inquiryForm.submit} onChange={(v) => set('inquiryForm', { submit: v })} />
        </div>
        <Field label="Intro text" multiline value={form.inquiryForm.intro} onChange={(v) => set('inquiryForm', { intro: v })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name label" value={form.inquiryForm.nameLabel} onChange={(v) => set('inquiryForm', { nameLabel: v })} />
          <Field label="Name placeholder" value={form.inquiryForm.namePlaceholder} onChange={(v) => set('inquiryForm', { namePlaceholder: v })} />
          <Field label="Email label" value={form.inquiryForm.emailLabel} onChange={(v) => set('inquiryForm', { emailLabel: v })} />
          <Field label="Email placeholder" value={form.inquiryForm.emailPlaceholder} onChange={(v) => set('inquiryForm', { emailPlaceholder: v })} />
          <Field label="Company label" value={form.inquiryForm.companyLabel} onChange={(v) => set('inquiryForm', { companyLabel: v })} />
          <Field label="Company placeholder" value={form.inquiryForm.companyPlaceholder} onChange={(v) => set('inquiryForm', { companyPlaceholder: v })} />
          <Field label="Message label" value={form.inquiryForm.messageLabel} onChange={(v) => set('inquiryForm', { messageLabel: v })} />
          <Field label="Message placeholder" value={form.inquiryForm.messagePlaceholder} onChange={(v) => set('inquiryForm', { messagePlaceholder: v })} />
          <Field label="Sending text" value={form.inquiryForm.sending} onChange={(v) => set('inquiryForm', { sending: v })} />
          <Field label="Success title" value={form.inquiryForm.successTitle} onChange={(v) => set('inquiryForm', { successTitle: v })} />
          <Field label="“Send another” link" value={form.inquiryForm.another} onChange={(v) => set('inquiryForm', { another: v })} />
        </div>
        <Field label="Success message (use {name} for the visitor's name)" multiline value={form.inquiryForm.successText} onChange={(v) => set('inquiryForm', { successText: v })} />
      </Card>

      <Card title="Card button labels">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Service card: deliverables title" value={form.labels.coreDeliverables} onChange={(v) => set('labels', { coreDeliverables: v })} />
          <Field label="Service card: link" value={form.labels.exploreService} onChange={(v) => set('labels', { exploreService: v })} />
          <Field label="Service card: inquire button" value={form.labels.inquire} onChange={(v) => set('labels', { inquire: v })} />
          <Field label="Work card: link" value={form.labels.readTeardown} onChange={(v) => set('labels', { readTeardown: v })} />
          <Field label="Work card: audit button" value={form.labels.requestAudit} onChange={(v) => set('labels', { requestAudit: v })} />
          <Field label="Blog card: link" value={form.labels.readPlaybook} onChange={(v) => set('labels', { readPlaybook: v })} />
        </div>
      </Card>

    </>
  );
};

export const AdminHomeContent: React.FC = () => {
  const { settings, refreshData, showToast } = usePortfolioData();
  const [form, setForm] = useState<HomeContent>(mergeHome(settings.home));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(mergeHome(settings.home));
  }, [settings.home]);

  // Immutable section updater
  const set = <K extends keyof HomeContent>(section: K, patch: Partial<HomeContent[K]>) =>
    setForm((f) => ({ ...f, [section]: { ...(f[section] as any), ...patch } }));

  const setItem = <T,>(arr: T[], i: number, patch: Partial<T>) =>
    arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'home'), { data: form, updatedAt: new Date().toISOString() }, { merge: true });
      showToast('Home page content saved!', 'success');
      await refreshData();
      const ok = await triggerRevalidation(['settings'], ['/']);
      if (!ok) showToast('Saved, but the live home page was NOT refreshed. Sign in again and retry.', 'error');
    } catch (err: any) {
      showToast(err.message || 'Failed to save home content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    if (confirm('Reset every field on this form to the original text? (Nothing is saved until you click Save.)')) {
      setForm(DEFAULT_HOME);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Home Page Content</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Headings, descriptions, buttons, tools, process steps, FAQs and the contact section. Service, work, blog and
            testimonial cards are managed in their own tabs.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
          >
            Reset to defaults
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Home Content'}
          </button>
        </div>
      </div>

      <HomeContentFields form={form} setForm={setForm} />

      <div className="flex justify-end pb-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Home Content'}
        </button>
      </div>
    </form>
  );
};
