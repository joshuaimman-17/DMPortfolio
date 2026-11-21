'use client';

import React, { useState } from 'react';
import { submitInboundForm } from '@/lib/client-api';

interface AuditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const INITIAL_DATA: ContactData = { name: '', email: '', phone: '', message: '' };

const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm';

export const AuditBookingModal: React.FC<AuditBookingModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<ContactData>(INITIAL_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');

  if (!isOpen) return null;

  const handleChange = (field: keyof ContactData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitInboundForm({
        type: 'audit',
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
        challenge: data.message.trim(),
        preferredSlot: data.phone.trim() ? `Phone: ${data.phone.trim()}` : '',
        sourcePage: typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/',
        honeypot,
      });
      if (res && res.success === false) {
        setErrorMsg(res.error || 'Something went wrong. Please try again.');
        return;
      }
      setIsSubmitted(true);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setData(INITIAL_DATA);
    setIsSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-neutral-200/90 my-auto sm:my-8 text-on-surface max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close Modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} noValidate>
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface pr-10">Get in touch</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Leave your contact details and I&apos;ll reach out to understand what you need.
            </p>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4 mt-5">
              <div>
                <label htmlFor="audit-name" className="block text-xs font-semibold text-on-surface mb-1">
                  Name *
                </label>
                <input
                  id="audit-name"
                  type="text"
                  autoComplete="name"
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="audit-email" className="block text-xs font-semibold text-on-surface mb-1">
                  Email *
                </label>
                <input
                  id="audit-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="audit-phone" className="block text-xs font-semibold text-on-surface mb-1">
                  Phone / WhatsApp <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <input
                  id="audit-phone"
                  type="tel"
                  autoComplete="tel"
                  value={data.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="audit-message" className="block text-xs font-semibold text-on-surface mb-1">
                  Message <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <textarea
                  id="audit-message"
                  rows={3}
                  value={data.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Honeypot field for bot protection */}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-on-primary text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-primary transition-all font-semibold disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Sending…' : 'Send'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        ) : (
          <div className="py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface">Thank you!</h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-sm mx-auto">
              Thanks, <strong className="text-on-surface">{data.name}</strong>. I&apos;ve received your details and will
              contact you soon at {data.email}.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold shadow hover:bg-primary transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
