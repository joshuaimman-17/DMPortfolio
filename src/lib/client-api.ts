'use client';

import { getAccessToken } from './firebase';

export interface FormSubmitResponse {
  success: boolean;
  sheetsSaved?: boolean;
  adminNotified?: boolean;
  userConfirmed?: boolean;
  notified?: boolean;
  error?: string;
}

export async function submitInboundForm(data: {
  type: 'audit' | 'contact';
  name: string;
  email: string;
  company?: string;
  website?: string;
  companyUrl?: string;
  message?: string;
  challenge?: string;
  budget?: string;
  preferredSlot?: string;
  slot?: string;
  service?: string;
  currentMetrics?: string;
  sourcePage?: string;
  honeypot?: string;
  spreadsheetId?: string;
}): Promise<FormSubmitResponse> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/forms', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: data.type,
        name: data.name,
        email: data.email,
        company: data.company || '',
        companyUrl: data.companyUrl || data.website || data.company || '',
        website: data.honeypot || '', // honeypot parameter sent under 'website'
        message: data.message || '',
        challenge: data.challenge || '',
        budget: data.budget || '',
        preferredSlot: data.preferredSlot || data.slot || '',
        service: data.service || '',
        currentMetrics: data.currentMetrics || '',
        sourcePage: data.sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        spreadsheetId: data.spreadsheetId,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Submission failed' };
  }
}

export async function subscribeNewsletter(
  email: string,
  honeypot = '',
  spreadsheetId?: string
): Promise<FormSubmitResponse> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/forms', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'newsletter',
        email,
        website: honeypot,
        spreadsheetId,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Subscription failed' };
  }
}
