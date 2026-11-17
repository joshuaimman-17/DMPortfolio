/* Editable email templates (Firestore: email_templates/config — admin-only, never public). */

export type FormKind = 'audit' | 'contact' | 'newsletter';
export type Audience = 'admin' | 'visitor';
export type TemplateKey = `${FormKind}_${Audience}`;

export interface EmailTemplate {
  enabled: boolean;
  subject: string;
  html: string;
}

export interface EmailTemplatesConfig {
  fromName: string;
  templates: Record<TemplateKey, EmailTemplate>;
}

export const PLACEHOLDERS = [
  'siteName',
  'name',
  'email',
  'company',
  'website',
  'challenge',
  'budget',
  'slot',
  'service',
  'message',
  'page',
  'timestamp',
] as const;

export type TemplateVars = Partial<Record<(typeof PLACEHOLDERS)[number], string>>;

export const TEMPLATE_META: { key: TemplateKey; label: string; description: string }[] = [
  { key: 'audit_admin', label: 'Growth audit → You (notification)', description: 'Sent to you when someone books a growth audit.' },
  { key: 'audit_visitor', label: 'Growth audit → Visitor (confirmation)', description: 'Sent to the person who booked the audit.' },
  { key: 'contact_admin', label: 'Contact form → You (notification)', description: 'Sent to you when someone uses the contact form.' },
  { key: 'contact_visitor', label: 'Contact form → Visitor (confirmation)', description: 'Sent to the person who contacted you.' },
  { key: 'newsletter_admin', label: 'Newsletter → You (notification)', description: 'Sent to you when someone subscribes.' },
  { key: 'newsletter_visitor', label: 'Newsletter → Subscriber (welcome)', description: 'Sent to the new subscriber.' },
];

export const SAMPLE_VARS: TemplateVars = {
  siteName: 'Your Brand',
  name: 'Maya Patel',
  email: 'maya@example.com',
  company: 'Acme Inc.',
  website: 'https://acme.example',
  challenge: 'Organic traffic has plateaued for 6 months',
  budget: '₹3L – ₹10L / month',
  slot: 'Tuesday morning',
  service: 'SEO & Search Architecture',
  message: 'We would like help restructuring our paid and organic funnel.',
  page: '/',
  timestamp: 'Mon, 17 Nov 2026 09:30:00 UTC',
};

const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
const wrap = (inner: string, width = 600) =>
  `<div style="${FONT}max-width:${width}px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;color:#334155;">${inner}</div>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:8px 0;width:140px;font-weight:600;color:#64748b;vertical-align:top;">${label}</td><td style="padding:8px 0;color:#0f172a;">${value}</td></tr>`;

const footer = `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">{{siteName}}</div>`;

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplatesConfig = {
  fromName: '',
  templates: {
    audit_admin: {
      enabled: true,
      subject: '🚀 New growth audit request: {{name}}',
      html: wrap(
        `<h2 style="margin:0 0 16px;color:#0f172a;">Growth Diagnostic Audit Request</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
${row('Name', '{{name}}')}
${row('Email', '<a href="mailto:{{email}}" style="color:#2563eb;">{{email}}</a>')}
${row('Website', '{{website}}')}
${row('Challenge', '{{challenge}}')}
${row('Monthly budget', '{{budget}}')}
${row('Preferred slot', '{{slot}}')}
${row('Submitted from', '{{page}}')}
${row('Time', '{{timestamp}}')}
</table>
<p style="margin-top:20px;font-size:13px;">Reply to this email to answer {{name}} directly.</p>`
      ),
    },
    audit_visitor: {
      enabled: true,
      subject: 'Your growth audit request is confirmed',
      html: wrap(
        `<h2 style="margin:0 0 8px;color:#0f172a;">Hi {{name}}, your request is confirmed</h2>
<p style="font-size:14px;line-height:1.6;">Thanks for booking a complimentary growth diagnostic with {{siteName}}. Here is what you sent:</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;background:#f8fafc;border-radius:10px;">
${row('Website', '{{website}}')}
${row('Challenge', '{{challenge}}')}
${row('Monthly budget', '{{budget}}')}
${row('Preferred slot', '{{slot}}')}
</table>
<p style="font-size:14px;line-height:1.6;margin-top:18px;"><strong>What happens next?</strong><br/>We will review your site and reply within 24 business hours with a calendar invite that matches your preferred slot.</p>${footer}`
      ),
    },
    contact_admin: {
      enabled: true,
      subject: '💼 New contact message from {{name}}',
      html: wrap(
        `<h2 style="margin:0 0 16px;color:#0f172a;">New inbound contact message</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
${row('Name', '{{name}}')}
${row('Email', '<a href="mailto:{{email}}" style="color:#2563eb;">{{email}}</a>')}
${row('Company / site', '{{company}}')}
${row('Message', '{{message}}')}
${row('Submitted from', '{{page}}')}
${row('Time', '{{timestamp}}')}
</table>
<p style="margin-top:20px;font-size:13px;">Reply to this email to answer {{name}} directly.</p>`
      ),
    },
    contact_visitor: {
      enabled: true,
      subject: 'We received your message',
      html: wrap(
        `<h2 style="margin:0 0 8px;color:#0f172a;">Thanks for reaching out, {{name}}</h2>
<p style="font-size:14px;line-height:1.6;">Your message has reached {{siteName}} and will get a personal reply within 24 hours.</p>
<p style="font-size:13px;line-height:1.6;background:#f8fafc;border-radius:10px;padding:14px;color:#475569;"><em>{{message}}</em></p>${footer}`
      ),
    },
    newsletter_admin: {
      enabled: true,
      subject: '📩 New subscriber: {{email}}',
      html: wrap(
        `<h3 style="margin:0 0 12px;color:#0f172a;">New newsletter subscriber</h3>
<p style="font-size:16px;font-weight:700;color:#2563eb;margin:0 0 8px;">{{email}}</p>
<p style="font-size:12px;color:#64748b;">Source: {{page}} · {{timestamp}}</p>`,
        500
      ),
    },
    newsletter_visitor: {
      enabled: true,
      subject: 'Welcome to {{siteName}}',
      html: wrap(
        `<h2 style="margin:0 0 12px;color:#0f172a;">You're subscribed!</h2>
<p style="font-size:14px;line-height:1.6;">Welcome aboard. You'll receive our latest case studies, playbooks and growth tactics straight to your inbox.</p>${footer}`,
        540
      ),
    },
  },
};

/** Saved Firestore values override defaults per template; unknown/missing keys fall back to defaults. */
export function mergeEmailTemplates(saved?: Partial<EmailTemplatesConfig> | null): EmailTemplatesConfig {
  const templates = { ...DEFAULT_EMAIL_TEMPLATES.templates } as Record<TemplateKey, EmailTemplate>;
  for (const key of Object.keys(templates) as TemplateKey[]) {
    const s = (saved?.templates as any)?.[key];
    if (s && typeof s === 'object') {
      templates[key] = {
        enabled: typeof s.enabled === 'boolean' ? s.enabled : templates[key].enabled,
        subject: typeof s.subject === 'string' && s.subject.trim() ? s.subject : templates[key].subject,
        html: typeof s.html === 'string' && s.html.trim() ? s.html : templates[key].html,
      };
    }
  }
  return { fromName: typeof saved?.fromName === 'string' ? saved.fromName : '', templates };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Replaces {{placeholders}}. For HTML bodies every value is escaped (form input is untrusted). */
export function renderTemplate(source: string, vars: TemplateVars, opts: { html: boolean }): string {
  return source.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => {
    const raw = (vars as Record<string, string | undefined>)[key] ?? '';
    const val = String(raw);
    return opts.html ? escapeHtml(val).replace(/\n/g, '<br/>') : val.replace(/[\r\n]+/g, ' ');
  });
}
