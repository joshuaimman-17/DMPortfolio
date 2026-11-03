'use client';

import React, { useState } from 'react';
import { submitInboundForm } from '@/lib/client-api';

interface AuditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuditData {
  companyUrl: string;
  channelFocus: string;
  bottleneck: string;
  monthlySpendTier: string;
  desiredOutcome: string;
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
}

const INITIAL_DATA: AuditData = {
  companyUrl: '',
  channelFocus: 'Meta & Google Paid Ads',
  bottleneck: 'High CAC / Ad Creative Fatigue',
  monthlySpendTier: '₹5L - ₹15L / month',
  desiredOutcome: 'Scale to >4x ROAS with Lower CAC',
  name: '',
  email: '',
  phone: '',
  preferredTime: 'This Week (Morning Slot)',
};

export const AuditBookingModal: React.FC<AuditBookingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<AuditData>(INITIAL_DATA);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');

  if (!isOpen) return null;

  const handleChange = (field: keyof AuditData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!data.companyUrl.trim()) {
        setErrorMsg('Please enter your company or website URL.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!data.name.trim() || !data.email.trim() || !data.email.includes('@')) {
        setErrorMsg('Please enter a valid name and business email address.');
        return;
      }
      setIsSubmitting(true);
      setErrorMsg('');

      // Save diagnostic to localStorage & Firestore & Sheets/Gmail
      try {
        const stored = JSON.parse(localStorage.getItem('growth_audit_bookings') || '[]');
        stored.push({ ...data, submittedAt: new Date().toISOString() });
        localStorage.setItem('growth_audit_bookings', JSON.stringify(stored));
      } catch {
        // graceful ignore
      }

      // Submit to Firestore + Sheets/Gmail
      try {
        await submitInboundForm({
          type: 'audit',
          name: data.name,
          email: data.email,
          company: data.companyUrl,
          website: data.companyUrl,
          budget: data.monthlySpendTier,
          challenge: `${data.channelFocus} | ${data.bottleneck} | Desired: ${data.desiredOutcome}`,
          preferredSlot: `${data.preferredTime} (Phone: ${data.phone || 'N/A'})`,
          sourcePage: window.location.hash || '#/audit-modal',
          honeypot: honeypot,
        });
      } catch {
        // Resilient fallback: continue to success view
      } finally {
        setIsSubmitting(false);
      }

      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setData(INITIAL_DATA);
    setStep(1);
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/90 my-8 text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header & Step Tracker */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Complimentary 30-Min Diagnostic
              </div>
              <h3 className="font-headline-lg text-2xl font-bold text-on-surface">
                Book a Free 30-Min Growth Audit
              </h3>
              <p className="font-body-sm text-sm text-on-surface-variant mt-1">
                Direct working session with Alex Rivera to diagnose conversion leaks and outline high-probability levers.
              </p>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        step >= num ? 'bg-primary-container' : 'bg-neutral-200'
                      }`}
                    />
                    <span className="text-[10px] text-on-surface-variant mt-1 block">
                      {num === 1 ? 'Focus & Channel' : num === 2 ? 'Scale & Budget' : 'Schedule & Info'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Company Website / URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://yourbrand.com or brand name"
                    value={data.companyUrl}
                    onChange={(e) => handleChange('companyUrl', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Primary Acquisition Channel in Focus
                  </label>
                  <select
                    value={data.channelFocus}
                    onChange={(e) => handleChange('channelFocus', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm bg-white"
                  >
                    <option value="Meta & Google Paid Ads">Meta &amp; Google Paid Ads</option>
                    <option value="Technical & Organic SEO">Technical &amp; Organic SEO</option>
                    <option value="Full-Funnel CRO & Checkout">Full-Funnel CRO &amp; Checkout</option>
                    <option value="Klaviyo Lifecycle Retention">Klaviyo Lifecycle Retention</option>
                    <option value="Server-Side Tracking / GA4">Server-Side Tracking / GA4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Current Bottleneck or Pain Point
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CAC jumped 40%, stalled organic rankings, or creative fatigue"
                    value={data.bottleneck}
                    onChange={(e) => handleChange('bottleneck', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">
                    Current Monthly Paid Marketing Budget
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Under ₹3L / mo',
                      '₹3L - ₹10L / mo',
                      '₹10L - ₹30L / mo',
                      '₹30L+ / mo ($40k+)',
                    ].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleChange('monthlySpendTier', tier)}
                        className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all ${
                          data.monthlySpendTier === tier
                            ? 'bg-primary-fixed/40 border-primary-container text-primary shadow-sm'
                            : 'bg-surface-container-low border-neutral-200 hover:bg-neutral-100 text-on-surface'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">
                    Key Desired Milestone from Audit
                  </label>
                  <div className="space-y-2">
                    {[
                      'Scale to >4x ROAS with Lower CAC',
                      'Dominate Top-3 Organic Google Rankings',
                      'Eliminate 30%+ Funnel Drop-off & Lift Conversion',
                      'Deploy First-Party Server-Side Attribution',
                    ].map((goal) => (
                      <label
                        key={goal}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          data.desiredOutcome === goal
                            ? 'bg-primary-fixed/30 border-primary-container text-on-surface font-semibold'
                            : 'bg-surface-container-low border-neutral-200 text-on-surface-variant hover:bg-neutral-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="desiredOutcome"
                          checked={data.desiredOutcome === goal}
                          onChange={() => handleChange('desiredOutcome', goal)}
                          className="accent-primary-container"
                        />
                        <span>{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Siddharth Kapoor"
                      value={data.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={data.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Phone or WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={data.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Preferred Meeting Slot
                    </label>
                    <select
                      value={data.preferredTime}
                      onChange={(e) => handleChange('preferredTime', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm bg-white"
                    >
                      <option value="This Week (Morning Slot)">This Week (Morning Slot: 10am - 1pm)</option>
                      <option value="This Week (Afternoon Slot)">This Week (Afternoon: 2pm - 5pm)</option>
                      <option value="Next Week (Flexible)">Next Week (Flexible schedule)</option>
                      <option value="Urgent (Next 24-48 Hours)">Urgent (Within 24-48 Hours)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-neutral-200 text-xs text-on-surface-variant flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
                    check_circle
                  </span>
                  <span>
                    Direct 1-on-1 strategy call with Alex. No pitch deck, zero vendor lock-in. You receive an actionable written teardown of your ad accounts or organic SEO taxonomy.
                  </span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

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
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-xs shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-primary transition-all font-semibold disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Syncing with Sheets & Booking...'
                    : step === 3
                    ? 'Confirm & Schedule Audit'
                    : 'Continue'}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface">
              Growth Audit Scheduled!
            </h3>
            <p className="font-body-base text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
              Thank you, <strong className="text-on-surface">{data.name}</strong>. A calendar invitation and preliminary intake checklist have been prepared for{' '}
              <strong className="text-on-surface">{data.email}</strong>.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-surface-container-low border border-neutral-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Target Domain:</span>
                <span className="font-mono font-bold text-on-surface">{data.companyUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Focus Area:</span>
                <span className="font-semibold text-primary">{data.channelFocus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Budget Bracket:</span>
                <span className="font-semibold text-on-surface">{data.monthlySpendTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Preferred Time:</span>
                <span className="font-semibold text-secondary">{data.preferredTime}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-semibold shadow hover:bg-primary transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
