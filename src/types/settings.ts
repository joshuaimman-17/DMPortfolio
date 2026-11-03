import { PORTFOLIO_DATA } from '@/data/portfolioData';

export interface SiteSettings {
  hero: {
    roleTag: string;
    headline: string;
    subtext: string;
    badge1: string;
    badge2: string;
    badge3: string;
  };
  metrics: {
    metric1: { value: string; label: string; desc: string };
    metric2: { value: string; label: string; desc: string };
    metric3: { value: string; label: string; desc: string };
    metric4: { value: string; label: string; desc: string };
  };
  contact: {
    email: string;
    phone: string;
    location: string;
    whatsapp: string;
  };
  social: {
    linkedin: string;
    twitter: string;
    github: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
  integrations?: {
    googleSheetUrl: string;
    driveFolderUrl: string;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    roleTag: PORTFOLIO_DATA.profile.roleTag,
    headline: 'I help brands grow with SEO and performance marketing',
    subtext: PORTFOLIO_DATA.profile.subtext,
    badge1: '+120% Organic Traffic Growth',
    badge2: '4.5x Average ROAS Blended Acquisition',
    badge3: 'Meta & Google Partner',
  },
  metrics: {
    metric1: { value: '+120%', label: 'Organic Traffic', desc: 'Avg. 6-Month Organic Uplift Across Audited Clients' },
    metric2: { value: '4.5x', label: 'Blended ROAS', desc: 'Average Return on Ad Spend Across Meta & Google' },
    metric3: { value: '₹50L+', label: 'Ad Spend Managed', desc: 'Over Google & Meta Ads Campaigns with Zero Wastage' },
    metric4: { value: '#1 SERP', label: 'Top-3 Rankings', desc: 'First Page Search Positions Secured for Competitive Queries' },
  },
  contact: {
    email: PORTFOLIO_DATA.profile.email,
    phone: PORTFOLIO_DATA.profile.phone,
    location: PORTFOLIO_DATA.profile.location,
    whatsapp: '+1 (555) 234-8900',
  },
  social: {
    linkedin: 'https://linkedin.com/in/alexriveragrowth',
    twitter: 'https://twitter.com/alexgrowthmark',
    github: 'https://github.com/alexrivera-growth',
  },
  footer: {
    tagline: 'Empowering ambitious brands with compound growth architectures.',
    copyright: `© ${new Date().getFullYear()} Alex Rivera. All rights reserved.`,
  },
  integrations: {
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/your-sheet-id/edit',
    driveFolderUrl: 'https://drive.google.com/drive/folders/your-folder-id',
  },
};
