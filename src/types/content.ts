// Content shapes stored in Firestore (services, works, showcase, posts).
export interface ServiceDetail {
  slug: string;
  /** Former slugs, newest last. Requests for these 308-redirect to the current slug. */
  previousSlugs?: string[];
  title: string;
  icon: string;
  summary: string;
  tag: string;
  deliverables: string[];
  whoItsFor: string[];
  process: { phase: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  pricingApproach: string;
  relatedWorkSlugs: string[];
}

export interface WorkDetail {
  slug: string;
  /** Former slugs, newest last. Requests for these 308-redirect to the current slug. */
  previousSlugs?: string[];
  client: string;
  title: string;
  industry: string;
  duration: string;
  services: string[];
  result: string;
  stats: { label: string; value: string; trend?: string }[];
  goal: string;
  challenge: string;
  strategy: string;
  execution: { step: string; title: string; desc: string }[];
  proofItemIds: string[];
  testimonial: { quote: string; author: string; role: string; avatar?: string };
  learnings: string[];
  coverImage: string;
}

export interface ShowcaseItem {
  id: string;
  type: 'poster' | 'analytics' | 'seo-site' | 'social' | 'ad' | 'email';
  title: string;
  client: string;
  image: string;
  badge?: string;
  source?: string;
  url?: string;
  before?: string;
  after?: string;
  workSlug?: string;
  metrics?: { label: string; value: string }[];
  highlight?: string;
}

export interface BlogPostDetail {
  slug: string;
  /** Former slugs, newest last. Requests for these 308-redirect to the current slug. */
  previousSlugs?: string[];
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  coverImage: string;
  author: { name: string; role: string; avatar: string };
  toc: { id: string; title: string }[];
  contentBlocks: { heading?: string; paragraphs: string[]; pullQuote?: string }[];
  relatedSlugs: string[];
}
