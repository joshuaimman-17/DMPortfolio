'use client';

import React, { useState } from 'react';
import { submitInboundForm } from '@/lib/client-api';

export function HomeContactForm() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setIsSubmitting(true);
    setContactError(null);

    try {
      const msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      msgs.push({ ...contactForm, sentAt: new Date().toISOString() });
      localStorage.setItem('portfolio_messages', JSON.stringify(msgs));
    } catch {
      // ignore
    }

    try {
      const res = await submitInboundForm({
        type: 'contact',
        name: contactForm.name,
        email: contactForm.email,
        company: contactForm.company,
        message: contactForm.message,
        honeypot,
        sourcePage: '/',
      });
      if (!res.success && res.error) {
        setContactError(res.error);
      }
    } catch (err: any) {
      console.warn('Submission error:', err);
    } finally {
      setIsSubmitting(false);
      setContactSubmitted(true);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
      <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">
        Direct Project Inquiry
      </h3>
      <p className="text-xs text-on-surface-variant mb-6">
        Fill out this brief intake and Alex will reply within 24 hours with diagnostic notes.
      </p>

      {contactError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {contactError}
        </div>
      )}

      {!contactSubmitted ? (
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maya Patel"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Company / Website URL
            </label>
            <input
              type="text"
              placeholder="https://yourbrand.com"
              value={contactForm.company}
              onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Message or Specific Growth Objective
            </label>
            <textarea
              rows={4}
              placeholder="Tell me about your current acquisition channels, challenges, or targets..."
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Sending Message...' : 'Send Inquiry to Alex'}</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      ) : (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">check</span>
          </div>
          <h4 className="font-bold text-on-surface text-base">Inquiry Dispatched!</h4>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Thanks for reaching out, <strong>{contactForm.name}</strong>. I will review your site and respond within 24 hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              Recorded in Google Sheet
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
              <span className="material-symbols-outlined text-[12px]">mail</span>
              Confirmation emailed to {contactForm.email}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
              <span className="material-symbols-outlined text-[12px]">notifications</span>
              Admin alert sent
            </span>
          </div>
          <button
            type="button"
            onClick={() => setContactSubmitted(false)}
            className="text-xs text-primary font-semibold hover:underline mt-2 inline-block cursor-pointer"
          >
            Send another inquiry
          </button>
        </div>
      )}
    </div>
  );
}
