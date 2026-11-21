/* Editable home-page copy (Firestore: settings/home).
   Service / work / blog / testimonial CARDS live in their own collections. */
export interface HomeContent {
  hero: {
    ctaPrimary: string;
    ctaSecondary: string;
    trustText: string;
    roleFallback: string;
    avatarAlt: string;
  };
  metricsBar: { items: { icon: string; tag: string }[] };
  inquiryForm: {
    title: string;
    intro: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    successTitle: string;
    successText: string;
    another: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    toolsEyebrow: string;
    toolsHeading: string;
    toolsNote: string;
    tools: { name: string; icon: string; brand?: string; level: string; color?: string }[];
  };
  services: { eyebrow: string; heading: string; subtext: string; viewAllLabel: string };
  works: {
    eyebrow: string;
    heading: string;
    subtext: string;
    browseLabel: string;
    archiveEyebrow: string;
    archiveHeading: string;
  };
  process: {
    eyebrow: string;
    heading: string;
    subtext: string;
    steps: { step: string; title: string; timeframe: string; icon: string; desc: string }[];
  };
  testimonials: { eyebrow: string; heading: string };
  faq: { eyebrow: string; heading: string; subtext: string; items: { q: string; a: string }[] };
  blog: { eyebrow: string; heading: string; subtext: string; browseLabel: string };
  labels: {
    coreDeliverables: string;
    exploreService: string;
    inquire: string;
    readTeardown: string;
    requestAudit: string;
    readPlaybook: string;
    headquarters: string;
    directLine: string;
    directEmail: string;
    whatsapp: string;
    baseLocation: string;
  };
  contact: {
    eyebrow: string;
    heading: string;
    subtext: string;
    priorityTitle: string;
    priorityText: string;
    priorityButton: string;
  };
}

export const DEFAULT_HOME: HomeContent = {
  hero: {
    ctaPrimary: 'Book a Free Growth Diagnostic',
    ctaSecondary: 'Explore Case Studies',
    trustText: 'Trusted by 30+ Growth-Stage Startups & Enterprise Brands',
    roleFallback: 'Senior Performance Marketer & SEO Architect',
    avatarAlt: 'Senior Growth Marketer',
  },
  metricsBar: {
    items: [
      { icon: 'query_stats', tag: 'Verified Uplift' },
      { icon: 'percent', tag: 'Blended' },
      { icon: 'payments', tag: 'Capital' },
      { icon: 'verified_user', tag: 'Track Record' },
    ],
  },
  inquiryForm: {
    title: 'Direct Project Inquiry',
    intro: 'Fill out this brief intake and Alex will reply within 24 hours with diagnostic notes.',
    nameLabel: 'Your Name *',
    namePlaceholder: 'e.g. Maya Patel',
    emailLabel: 'Work Email *',
    emailPlaceholder: 'name@company.com',
    companyLabel: 'Company / Website URL',
    companyPlaceholder: 'https://yourbrand.com',
    messageLabel: 'Message or Specific Growth Objective',
    messagePlaceholder: 'Tell me about your current acquisition channels, challenges, or targets...',
    submit: 'Send Inquiry to Alex',
    sending: 'Sending Message...',
    successTitle: 'Inquiry Dispatched!',
    successText: 'Thanks for reaching out, {name}. I will review your site and respond within 24 hours.',
    another: 'Send another inquiry',
  },
  about: {
    eyebrow: 'About The Marketer',
    heading: 'Engineer’s Mindset. Marketer’s Growth Instincts.',
    paragraph1:
      'With over 8 years navigating high-stakes customer acquisition, I merge data engineering rigor with relentless creative testing. Having managed over ₹50L+ in advertising capital across Google, Meta, and LinkedIn, I eliminate guesswork by diagnosing hidden funnel friction.',
    paragraph2:
      'Unlike traditional agencies that prioritize billable hours and vanity impressions, my methodology anchors strictly on cashflow-positive metrics: Blended MER, First-Party LTV, and Unshakable Organic Dominance.',
    toolsEyebrow: 'Arsenal & Infrastructure',
    toolsHeading: 'Measurement & Attribution Stack',
    toolsNote: 'Daily production deployment',
    tools: [
      { name: 'Google Analytics 4', icon: 'insights', level: 'Daily Expert', color: 'text-primary' },
      { name: 'Google Search Console', icon: 'troubleshoot', level: 'Advanced', color: 'text-primary' },
      { name: 'Ahrefs', icon: 'travel_explore', level: 'Power User', color: 'text-secondary' },
      { name: 'SEMrush', icon: 'query_stats', level: 'Advanced', color: 'text-secondary' },
      { name: 'Meta Ads Manager', icon: 'ads_click', level: 'Daily Expert', color: 'text-primary' },
      { name: 'Klaviyo', icon: 'mail', level: 'Daily Expert', color: 'text-primary' },
      { name: 'Google Tag Manager', icon: 'label', level: 'Advanced', color: 'text-primary' },
      { name: 'Looker Studio', icon: 'dashboard', level: 'Architect', color: 'text-primary' },
      { name: 'Hotjar', icon: 'local_fire_department', level: 'Proficient', color: 'text-tertiary' },
      { name: 'HubSpot', icon: 'hub', level: 'Certified', color: 'text-secondary' },
      { name: 'VWO', icon: 'call_split', level: 'Advanced', color: 'text-secondary' },
      { name: 'BigQuery', icon: 'database', level: 'Intermediate', color: 'text-secondary' },
    ],
  },
  services: {
    eyebrow: 'Capabilities & Retainers',
    heading: 'Full-Funnel Growth Practice Areas',
    subtext:
      'Systematic growth protocols engineered for high-growth venture-backed SaaS and modern D2C eCommerce brands.',
    viewAllLabel: 'View All Growth Capabilities',
  },
  works: {
    eyebrow: 'Documented Proof',
    heading: 'Selected Growth Case Studies',
    subtext:
      'Real numbers, verified Search Console curves, and margin-protected ad scale across B2B SaaS and D2C brands.',
    browseLabel: 'Browse Full Case Study Hub & Deliverables',
    archiveEyebrow: 'Visual Deliverable Archive',
    archiveHeading: 'Verified SERP Rank Previews & Ad Creative Assets',
  },
  process: {
    eyebrow: 'Execution Methodology',
    heading: 'The 4-Step ICE Growth Protocol',
    subtext:
      'How every engagement operates from day zero. Eliminating subjective opinions in favor of structured experimentation.',
    steps: [
      { step: '01', title: 'Deep Audit & Hygiene', timeframe: 'Days 1-7', icon: 'verified', desc: 'Auditing pixel triggers, server-side data logs, crawl index coverage, and ad spend inefficiencies.' },
      { step: '02', title: 'Growth Hypothesis', timeframe: 'Days 8-14', icon: 'tune', desc: 'Constructing an ICE-prioritized experimentation backlog and multi-touch channel acquisition matrix.' },
      { step: '03', title: 'Rapid Sprint Execution', timeframe: 'Days 15-45', icon: 'bolt', desc: 'Launching high-velocity creative hook tests, schema rollouts, and landing page progressive conversion sprints.' },
      { step: '04', title: 'Scale & Moat Building', timeframe: 'Day 45+', icon: 'rocket_launch', desc: 'Scaling profitable ad spend, programmatic search authority, and first-party retention automation.' },
    ],
  },
  testimonials: {
    eyebrow: 'Executive Endorsements',
    heading: 'Trusted by Founders & Marketing Leaders',
  },
  faq: {
    eyebrow: 'Common Inquiries',
    heading: 'Frequently Asked Questions',
    subtext: 'Everything you need to know about working models, timelines, attribution, and pricing.',
    items: [
      { q: 'How are client engagements structured?', a: 'Engagements typically operate on a flexible monthly advisory retainer with clear milestone deliverables, or sprint-based standalone diagnostics (such as a 14-day technical SEO crawl or an ad account audit). We never require long-term lock-ins.' },
      { q: 'Do you execute hands-on or advise internal teams?', a: 'Both. For early-to-mid stage startups, I handle full hands-on campaign architecture, pixel setups, and landing page CRO. For larger enterprise teams, I provide strategic playbooks, creative briefs, and weekly executive coaching.' },
      { q: 'What is your typical onboarding timeline?', a: 'Initial diagnostic audits and telemetry access take 48-72 hours. First optimization sprints and initial test campaigns launch within 7 to 10 business days.' },
      { q: 'How do you measure success and attribution?', a: 'We build server-side GTM tracking with GA4 and custom Looker Studio dashboards, measuring blended MER (Marketing Efficiency Ratio), CAC payback period, and net incremental revenue rather than channel vanity metrics.' },
      { q: 'What spend level makes the most sense for an engagement?', a: 'Clients usually invest between ₹3L/month to ₹30L+/month ($4k to $40k+/month) in paid acquisition or have at least 50k+ monthly organic visitors seeking algorithmic monetization and technical CRO.' },
      { q: 'Do you work with venture-backed SaaS or D2C eCommerce?', a: 'Both. I specialize in high-ticket B2B SaaS acquisition funnels as well as high-velocity D2C eCommerce brands where creative iteration speed and retention economics dictate profitability.' },
    ],
  },
  blog: {
    eyebrow: 'Field Notes & Playbooks',
    heading: 'Growth Architecture Articles',
    subtext:
      'Uncensored playbooks on technical SEO, ad script testing frameworks, and server-side conversion tracking.',
    browseLabel: 'Browse All Articles',
  },
  labels: {
    coreDeliverables: 'Core Deliverables',
    exploreService: 'Explore Practice Area',
    inquire: 'Inquire',
    readTeardown: 'Read Deep Teardown',
    requestAudit: 'Request Similar Audit',
    readPlaybook: 'Read Playbook',
    headquarters: 'Headquarters',
    directLine: 'Direct Line',
    directEmail: 'Direct Email',
    whatsapp: 'WhatsApp / Mobile',
    baseLocation: 'Base Locations',
  },
  contact: {
    eyebrow: 'Start a Conversation',
    heading: 'Let’s Engineer Your Next Growth Inflection',
    subtext:
      'Whether you need a dedicated 14-day technical crawl, an ad account restructure, or an ongoing CMO growth advisory, reach out directly.',
    priorityTitle: 'Need a 30-Minute Priority Audit?',
    priorityText:
      'Skip the email thread and schedule directly on my calendar with custom intake questions.',
    priorityButton: 'Schedule 30-Min Diagnostic',
  },
};

/** Section-wise merge: saved Firestore values override defaults; arrays replace wholesale. */
export function mergeHome(saved?: Partial<HomeContent> | null): HomeContent {
  const out: any = {};
  for (const key of Object.keys(DEFAULT_HOME) as (keyof HomeContent)[]) {
    out[key] = { ...(DEFAULT_HOME[key] as any), ...((saved as any)?.[key] || {}) };
  }
  return out as HomeContent;
}
