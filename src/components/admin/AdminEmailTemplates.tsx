import React, { useEffect, useRef, useState } from 'react';
import { RichEmailEditor, type RichEmailEditorHandle } from './RichEmailEditor';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import {
  DEFAULT_EMAIL_TEMPLATES,
  PLACEHOLDERS,
  SAMPLE_VARS,
  TEMPLATE_META,
  mergeEmailTemplates,
  renderTemplate,
  type EmailTemplatesConfig,
  type TemplateKey,
} from '../../types/email-templates';

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white';

export const AdminEmailTemplates: React.FC = () => {
  const { showToast } = usePortfolioData();
  const [config, setConfig] = useState<EmailTemplatesConfig>(mergeEmailTemplates(null));
  const [active, setActive] = useState<TemplateKey>('audit_admin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const bodyRef = useRef<RichEmailEditorHandle>(null);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'email_templates', 'config'));
        setConfig(mergeEmailTemplates(snap.exists() ? (snap.data() as any) : null));
      } catch (e: any) {
        showToast(e?.message || 'Could not load email templates.', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tpl = config.templates[active];
  const meta = TEMPLATE_META.find((m) => m.key === active)!;

  const patch = (p: Partial<typeof tpl>) =>
    setConfig((c) => ({ ...c, templates: { ...c.templates, [active]: { ...c.templates[active], ...p } } }));

  const insertPlaceholder = (name: string) => {
    const token = `{{${name}}}`;
    if (bodyRef.current) bodyRef.current.insertText(token);
    else patch({ html: tpl.html + token });
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'email_templates', 'config'), { ...config, updatedAt: new Date().toISOString() });
      showToast('Email templates saved. They apply to the next form submission.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to save templates.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetThis = () => {
    if (confirm('Reset this template to the default wording? (Not saved until you click Save.)')) {
      patch(DEFAULT_EMAIL_TEMPLATES.templates[active]);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Please sign in again.');
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: await user.getIdToken(),
          subject: tpl.subject,
          html: tpl.html,
          fromName: config.fromName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Test failed (${res.status})`);
      showToast(`Test email sent to ${data.to}`, 'success');
    } catch (e: any) {
      showToast(e?.message || 'Could not send test email.', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-neutral-500">Loading templates…</div>;
  }

  const previewSubject = renderTemplate(tpl.subject, SAMPLE_VARS, { html: false });
  const previewHtml = renderTemplate(tpl.html, SAMPLE_VARS, { html: true });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Email Templates</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Customize the notification you receive and the confirmation visitors get when they submit a form.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {saving ? 'Saving...' : 'Save Templates'}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-sm flex flex-col gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Sender name (shown as “From”)</label>
        <input
          className={inputCls}
          value={config.fromName}
          placeholder="Leave empty to use your brand name"
          onChange={(e) => setConfig((c) => ({ ...c, fromName: e.target.value }))}
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Template list */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-3 border border-neutral-200/80 shadow-sm flex flex-col gap-1">
          {TEMPLATE_META.map((m) => {
            const t = config.templates[m.key];
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setActive(m.key)}
                className={`text-left px-3.5 py-3 rounded-2xl transition-colors cursor-pointer ${
                  active === m.key ? 'bg-primary text-white' : 'hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <span className="text-sm font-semibold block">{m.label}</span>
                <span className={`text-[11px] ${active === m.key ? 'text-blue-100' : 'text-neutral-500'}`}>
                  {t.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Editor + preview */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">{meta.label}</h3>
                <p className="text-xs text-neutral-500">{meta.description}</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer shrink-0">
                <input type="checkbox" checked={tpl.enabled} onChange={(e) => patch({ enabled: e.target.checked })} />
                Send this email
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Subject</span>
              <input className={inputCls} value={tpl.subject} onChange={(e) => patch({ subject: e.target.value })} />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Add visitor details (click to insert where your cursor is)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PLACEHOLDERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => insertPlaceholder(p)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[11px] font-mono text-neutral-700 cursor-pointer"
                  >
                    {`{{${p}}}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Email message</span>
              <RichEmailEditor ref={bodyRef} value={tpl.html} onChange={(html) => patch({ html })} />
              <p className="text-[11px] text-neutral-500">
                Just type and format like in Gmail. Words like <span className="font-mono">{'{{name}}'}</span> are filled in with the
                visitor's details when the email is sent.
              </p>
              <button
                type="button"
                onClick={() => setShowSource((v) => !v)}
                className="self-start text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showSource ? 'Hide advanced HTML' : 'Advanced: edit HTML'}
              </button>
              {showSource && (
                <textarea
                  rows={10}
                  spellCheck={false}
                  className={`${inputCls} font-mono text-xs leading-relaxed`}
                  value={tpl.html}
                  onChange={(e) => patch({ html: e.target.value })}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={sendTest}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {testing ? 'Sending…' : 'Send test email to me'}
              </button>
              <button
                type="button"
                onClick={resetThis}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
              >
                Reset this template
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-sm flex flex-col gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Preview with sample details (how the recipient sees it)</span>
              <span className="text-sm font-semibold text-neutral-900">Subject: {previewSubject}</span>
            </div>
            <iframe
              title="Email preview"
              sandbox=""
              srcDoc={`<!doctype html><html><body style="margin:0;padding:16px;background:#f1f5f9;">${previewHtml}</body></html>`}
              className="w-full h-[360px] rounded-2xl border border-neutral-200 bg-neutral-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
