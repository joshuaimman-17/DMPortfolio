import { PORTFOLIO_DATA } from '@/data/portfolioData';

export interface SiteSettings {
  name?: string;
  hero: {
    roleTag: string;
    headline: string;
    subtext: string;
    badge1: string;
    badge2: string;
    badge3: string;
    avatar?: string;
    image?: string;
    driveFileId?: string;
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

/** OpenGraph image — `width`/`height` are pixel dimensions of the shared card. */
export type PageOpenGraphImage = {
  /** Absolute or site-relative URL. Next composes it against `metadataBase`. */
  url: string;
  /** Pixel width. */
  width: number;
  /** Pixel height. */
  height: number;
  /** Shown to assistive tech and as a link-preview fallback. */
  alt: string;
};

/** OpenGraph block — always `type: 'website'` and `locale: 'en_US'` on this site. */
export type PageOpenGraph = {
  title: string;
  description: string;
  /** Absolute URL — `siteUrl` + the route path. */
  url: string;
  /** From `SiteConfig.name`, so every card carries the org name. */
  siteName: string;
  locale: 'en_US';
  type: 'website';
  /** Always the single shared `/opengraph-image` card. */
  images: PageOpenGraphImage[];
};

/** Twitter/X card block — `summary_large_image` with the same shared card. */
export type PageTwitter = {
  card: 'summary_large_image';
  title: string;
  description: string;
  /** Twitter accepts bare URL strings; this site passes the one shared card. */
  images: string[];
};

/** Complete metadata object returned by `pageMetadata()`. */
export type PageMetadata = {
  title: string;
  description: string;
  /** Canonical is the route *path* (Next resolves it against `metadataBase`). */
  alternates: { canonical: string };
  openGraph: PageOpenGraph;
  twitter: PageTwitter;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  name: PORTFOLIO_DATA.profile.name || 'Alex Rivera',
  hero: {
    roleTag: PORTFOLIO_DATA.profile.roleTag,
    headline: 'I help brands grow with SEO and performance marketing',
    subtext: PORTFOLIO_DATA.profile.subtext,
    badge1: '+120% Organic Traffic Growth',
    badge2: '4.5x Average ROAS Blended Acquisition',
    badge3: 'Meta & Google Partner',
    avatar: PORTFOLIO_DATA.profile.avatar,
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
