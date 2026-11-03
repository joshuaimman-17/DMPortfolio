export interface ServiceDetail {
  slug: string;
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

export interface RankedSite {
  domain: string;
  industry: string;
  description: string;
  keyword: string;
  monthlyVolume?: string;
  cpc?: string;
  rankBadge: string;
  image: string;
  tagColor?: string;
}

export type BlogPost = BlogPostDetail;
export type GalleryProofItem = ShowcaseItem;
export type CaseStudy = WorkDetail;

export const PORTFOLIO_DATA = {
  profile: {
    name: 'Alex Rivera',
    title: 'Alex Rivera | Growth Marketer',
    roleTag: 'Digital Marketing Expert',
    headline: 'I help brands grow with SEO and performance marketing',
    subtext:
      'Specializing in data-backed search ranking, high-ROAS paid ads across Google & Meta, and conversion rate optimization that directly accelerates revenue.',
    email: 'alex@growthmark.io',
    phone: '+1 (555) 234-8900',
    location: 'Global Remote (San Francisco & Mumbai)',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
    logo:
      'https://lh3.googleusercontent.com/aida/AEtjO1XGKSbm3RFFZB9dJT5FXqTLSJskOTa4QinPvhakKtSH9uqfb2dj98jgtJfu-W7M3hFJX0rr5tMc410rGkG0qOCCv2E83mWAM6zp24cvUoGrZ3IZ765oFl5HOKYYs4JBlibbaV_oqFFSsuO_aPgZWVQ-o-NSljkqIeqOW23FIIzhwzuPp9uzBq2s0EM7q7-8O5SRbJWivDqMjBc1_yX3Tq-gXVnpA_JYXzcNV1SsuvlP',
  },

  metricsBar: [
    {
      metric: '+120%',
      numericValue: 120,
      suffix: '%',
      prefix: '+',
      title: 'Organic Traffic',
      description: 'Avg. 6-Month Organic Uplift Across Audited Clients',
      icon: 'query_stats',
      color: 'text-secondary',
    },
    {
      metric: '4.5x',
      numericValue: 4.5,
      suffix: 'x',
      prefix: '',
      title: 'Blended ROAS',
      description: 'Average Return on Ad Spend Across Meta & Google',
      icon: 'percent',
      color: 'text-primary-container',
    },
    {
      metric: '₹50L+',
      numericValue: 50,
      suffix: 'L+',
      prefix: '₹',
      title: 'Ad Spend Managed',
      description: 'Over Google & Meta Ads Campaigns with Zero Wastage',
      icon: 'payments',
      color: 'text-on-surface',
    },
    {
      metric: '30+',
      numericValue: 30,
      suffix: '+',
      prefix: '',
      title: 'Completed Engagements',
      description: 'Enterprise & D2C Brands with Documented Growth Trajectories',
      icon: 'verified_user',
      color: 'text-secondary',
    },
  ],

  // 6 FULL SERVICES
  services: [
    {
      slug: 'seo-search-architecture',
      title: 'SEO & Search Architecture',
      icon: 'search_check',
      tag: 'Technical Audits • Programmatic • Authority',
      summary:
        'In-depth technical crawls, Core Web Vitals remediation, semantic entity clustering, and natural backlink acquisition engineered to secure stable top-3 commercial intent rankings.',
      deliverables: [
        'Comprehensive Technical Site Audit & Canonical Hierarchy',
        'Prioritized 6-Month Semantic Keyword Roadmap',
        'Programmatic On-Page Optimization & Schema Architecture',
      ],
      whoItsFor: [
        'B2B SaaS companies losing ranking to legacy competitors',
        'High-SKU E-commerce stores with severe index cannibalization',
        'Publishers or aggregators seeking programmatic landing scale',
      ],
      process: [
        { phase: 'Phase 1', title: 'Forensic Crawl & Cleanse', desc: 'De-indexing bloat, fixing 404s, canonical chaining, and server log analysis.' },
        { phase: 'Phase 2', title: 'Entity Clustering & Architecture', desc: 'Building content hubs around commercial buyer intent clusters.' },
        { phase: 'Phase 3', title: 'Internal PR & Link Equity', desc: 'Reverse proxy deployment and algorithmic topic authority compounding.' },
        { phase: 'Phase 4', title: 'Continuous SERP Monitoring', desc: 'Daily rank tracking and weekly Core Web Vitals optimization.' },
      ],
      pricingApproach:
        'Transparent monthly advisory retainer with no long-term lock-ins. Custom audits available as stand-alone 14-day diagnostic packages.',
      faqs: [
        {
          q: 'How fast can we see organic search improvements?',
          a: 'Technical fixes (e.g. index recovery and canonical fixes) produce measurable impressions within 21 to 30 days. Compounding top-3 commercial rankings typically solidify within 60 to 90 days.',
        },
        {
          q: 'Do you write the content or guide our team?',
          a: 'Both options are supported. I provide rigorous programmatic content briefs with semantic entity requirements, or collaborate directly with your internal copywriters.',
        },
      ],
      relatedWorkSlugs: ['payflow-systems', 'syncdev-api', 'cloudpulse-cloud'],
    },
    {
      slug: 'performance-marketing',
      title: 'Performance Marketing',
      icon: 'campaign',
      tag: 'Google Ads • Meta Ad Stacks • PMax',
      summary:
        'High-efficiency paid acquisition spanning Google Ads (Search, PMax, YouTube) and Meta Ads. Granular audience exclusions, predictive creative testing, and ROAS-focused bidding.',
      deliverables: [
        'Ad Creative Testing Matrix & Weekly Hook Scripts',
        'Hyper-Targeted Audience Segmentation & Negative Tiers',
        'Daily Bid & Machine-Learning Budget Pacing Engine',
      ],
      whoItsFor: [
        'D2C brands plateaued between ₹5L and ₹25L monthly ad spend',
        'B2B SaaS platforms with bloated, non-converting demo CPA',
        'Companies transitioning from agency dependence to in-house scale',
      ],
      process: [
        { phase: 'Phase 1', title: 'Pixel & Server-Side Audit', desc: 'Verifying Conversion API (CAPI) events and offline conversion uploads.' },
        { phase: 'Phase 2', title: 'Creative Sandbox Testing', desc: 'Isolating hooks, bodies, and CTAs to produce winning creative iterations.' },
        { phase: 'Phase 3', title: 'Consolidated Scaling', desc: 'Moving top variants into Advantage+ and Smart Bidding structures.' },
        { phase: 'Phase 4', title: 'LTV Margin Protection', desc: 'Budget expansion strictly gated by blended unit economics and payback windows.' },
      ],
      pricingApproach:
        'Monthly advisory retainer + agreed target ROAS performance incentive on ad spend exceeding baseline thresholds.',
      faqs: [
        {
          q: 'What minimum ad spend do you work with?',
          a: 'Most engagements manage between ₹3L/month and ₹50L/month ($4k to $60k/month). We calibrate bidding for maximum statistical significance.',
        },
        {
          q: 'Do I maintain ownership of the ad accounts?',
          a: 'Yes, 100%. All campaigns, pixel data, custom audiences, and creative assets remain in your corporate ad accounts at all times.',
        },
      ],
      relatedWorkSlugs: ['kinetic-activewear', 'kova-footwear', 'aura-health-cloud'],
    },
    {
      slug: 'social-media-strategy',
      title: 'Social Media Strategy',
      icon: 'share',
      tag: 'Brand Virality • Narrative • Distribution',
      summary:
        'Organic distribution playbooks, viral positioning mechanics, and founder-led branding matrices that turn passive scrollers into passionate advocates and inbound buyers.',
      deliverables: [
        'Editorial Content Calendar Architecture across LinkedIn & X',
        'Short-Form Video Concept Scripts (Reels / TikTok)',
        'Monthly Resonance Analytics & Community Engagement Blueprints',
      ],
      whoItsFor: [
        'Founders looking to build dominant personal executive presence',
        'Consumer brands wanting organic short-form viral traffic loops',
        'B2B companies seeking organic inbound pipeline from executive content',
      ],
      process: [
        { phase: 'Phase 1', title: 'Brand Narrative Positioning', desc: 'Defining opinionated contrarian angles and content pillars.' },
        { phase: 'Phase 2', title: 'Asset Repurposing Pipeline', desc: 'Turning podcasts and research reports into 15+ micro-assets weekly.' },
        { phase: 'Phase 3', title: 'Algorithmic Optimization', desc: 'Fine-tuning video hooks, watch-time retention, and audio selections.' },
        { phase: 'Phase 4', title: 'Direct-Response Funneling', desc: 'Converting viral impressions into newsletter and CRM subscribers.' },
      ],
      pricingApproach:
        'Monthly retainer covering strategic planning, script writing, and distribution playbooks.',
      faqs: [
        {
          q: 'Do you create the video footage or write the scripts?',
          a: 'I provide the hook formulas, teleprompter scripts, and editing guides. For select engagements, we also handle full post-production motion editing.',
        },
      ],
      relatedWorkSlugs: ['beancraft-coffee', 'kinetic-activewear'],
    },
    {
      slug: 'content-marketing',
      title: 'Content Marketing & Editorial',
      icon: 'auto_stories',
      tag: 'Editorial Hubs • Whitepapers • Lead Magnets',
      summary:
        'High-converting editorial schedules, product-led blog posts, and interactive lead magnets designed to capture users across mid-funnel and bottom-of-funnel consideration stages.',
      deliverables: [
        'Data-Backed SEO Content Briefs & Search Intent Outlines',
        'Flagship Long-Form Thought Leadership Articles',
        'High-Converting Downloadable Lead Magnets & Whitepapers',
      ],
      whoItsFor: [
        'High ACV B2B platforms requiring executive education content',
        'Startups wanting to establish thought leadership ahead of fundraising',
        'Brands building a dedicated media engine and newsletter moat',
      ],
      process: [
        { phase: 'Phase 1', title: 'Intent Gap Analysis', desc: 'Mapping user journeys from informational query to commercial conversion.' },
        { phase: 'Phase 2', title: 'Original Research & Studies', desc: 'Generating proprietary survey data that attracts natural backlinks.' },
        { phase: 'Phase 3', title: 'Editorial Production & Polish', desc: 'Publishing actionable, zero-fluff industry analyses.' },
        { phase: 'Phase 4', title: 'Multi-Surface Syndication', desc: 'Distributing across Substack, HackerNews, LinkedIn, and email lists.' },
      ],
      pricingApproach: 'Fixed monthly publishing cadences or project-based lead magnet sprints.',
      faqs: [
        {
          q: 'How does product-led content differ from standard SEO blogs?',
          a: 'Product-led content integrates your product naturally into the solution of a genuine technical problem, driving demos and trials rather than shallow pageviews.',
        },
      ],
      relatedWorkSlugs: ['payflow-systems', 'syncdev-api'],
    },
    {
      slug: 'email-retention',
      title: 'Email & Retention Funnels',
      icon: 'mail',
      tag: 'Lifecycle Flows • Klaviyo • Churn Reduction',
      summary:
        'Lifecycle CRM execution via Klaviyo & Customer.io. High-converting welcome series, abandoned checkout sequences, behavioral triggers, and VIP reactivation roadmaps.',
      deliverables: [
        'Behavioral Welcome & Onboarding Email Journeys',
        'Dynamic Multi-Stage Abandoned Cart & Checkout Triggers',
        'Predictive Churn-Risk Win-Back Sequences & VIP Segments',
      ],
      whoItsFor: [
        'D2C brands whose email revenue share is currently below 25%',
        'Subscription services struggling with Month 2 to Month 3 retention cliff',
        'E-commerce merchants scaling past 10,000 active customer profiles',
      ],
      process: [
        { phase: 'Phase 1', title: 'List Hygiene & Deliverability', desc: 'Fixing DKIM/DMARC authentication and cleaning unengaged contacts.' },
        { phase: 'Phase 2', title: 'Core Automated Flow Rebuild', desc: 'Deploying high-converting 7-step welcome and checkout sequences.' },
        { phase: 'Phase 3', title: 'Predictive Segment Triggers', desc: 'Triggering replenishment reminders based on individual consumption rates.' },
        { phase: 'Phase 4', title: 'A/B Testing & Offer Calibration', desc: 'Optimizing subject lines, send-times, and SMS cross-sell triggers.' },
      ],
      pricingApproach: 'Flow architecture setup sprint followed by monthly lifecycle management.',
      faqs: [
        {
          q: 'Which platforms do you work with?',
          a: 'Klaviyo, Customer.io, HubSpot, Omnisend, and Braze.',
        },
      ],
      relatedWorkSlugs: ['beancraft-coffee', 'kova-footwear'],
    },
    {
      slug: 'analytics-cro',
      title: 'Analytics, GTM & CRO',
      icon: 'analytics',
      tag: 'GA4 • A/B Split Testing • Heatmaps • GTM',
      summary:
        'Server-side GTM configurations, clean GA4 event schema, session heatmap forensic reviews, and rigorous statistical split-testing that lifts visitor-to-customer conversion rates.',
      deliverables: [
        'Custom Unified Looker Studio Attribution Dashboard',
        'Server-Side GTM & GA4 Tracking Schema with CAPI',
        'Bi-Weekly A/B Landing Page Split Experiments',
      ],
      whoItsFor: [
        'Companies seeing high ad spend traffic but poor on-site conversion',
        'Marketing teams suffering from broken or inflated attribution data',
        'Product teams needing rigorous statistical significance testing',
      ],
      process: [
        { phase: 'Phase 1', title: 'Data Pipeline Validation', desc: 'Eliminating duplicate triggers, testing server-side CAPI match rates.' },
        { phase: 'Phase 2', title: 'Heatmap & Drop-Off Forensics', desc: 'Identifying checkout friction points, field abandonment, and rage clicks.' },
        { phase: 'Phase 3', title: 'Hypothesis Backlog & VWO/Optimizely', desc: 'Deploying statistically powered A/B split variations.' },
        { phase: 'Phase 4', title: 'Attribution Modeling', desc: 'Creating executive Looker dashboards tracking true EBITDA and CAC payback.' },
      ],
      pricingApproach: 'Retainer-based continuous CRO sprints with transparent testing backlogs.',
      faqs: [
        {
          q: 'Why does server-side tracking matter?',
          a: 'Browser ad-blockers and Safari ITP delete client cookies after 24 hours. Server-side tracking recovers 25%+ of missing conversion signals for Meta and Google machine learning.',
        },
      ],
      relatedWorkSlugs: ['finnest-analytics', 'aura-health-cloud'],
    },
  ] as ServiceDetail[],

  // 6 FULL WORKS / CASE STUDIES
  works: [
    {
      slug: 'payflow-systems',
      client: 'PayFlow Systems',
      title: 'Engineered 185% organic pipeline jump in 5 months',
      industry: 'B2B FinTech SaaS',
      duration: '5 Months',
      services: ['Technical SEO', 'Content Strategy', 'CRO'],
      result: '+185% Demo Inbound Requests',
      stats: [
        { label: 'Demo Inbound', value: '+185%', trend: 'jump' },
        { label: 'Top-3 Commercial Ranks', value: '34', trend: 'page 1' },
        { label: 'Paid Search Dependency', value: '-32%', trend: 'savings' },
        { label: 'CAC Payback', value: '3.8 Mo', trend: 'efficient' },
      ],
      goal: 'Overcome organic search stagnation and reduce heavy reliance on $45/click Google Search Ads for B2B payment software.',
      challenge:
        'PayFlow had accrued 400+ low-quality blog posts over 3 years that caused severe internal keyword cannibalization. Multiple URLs competed for identical terms, and Google suppressed primary commercial pages.',
      strategy:
        'Conducted an exhaustive content hygiene crawl. Pruned 180 low-value pages, 301-redirected duplicate clusters into high-authority master guides, and built programmatic comparison hubs addressing specific competitor migration queries.',
      execution: [
        { step: 'Month 1', title: 'Technical Crawl & Index Pruning', desc: 'Removed 180 bloated URLs and resolved 3,400 redirect chains.' },
        { step: 'Month 2', title: 'Programmatic Comparison Taxonomy', desc: 'Engineered dynamic comparison hubs targeting high-intent "vs" keywords.' },
        { step: 'Month 3', title: 'Entity Optimization & Internal PR', desc: 'Restructured semantic topic clusters and implemented product-led schema.' },
        { step: 'Month 4-5', title: 'CRO on High-Rank Hubs', desc: 'Replaced generic book-a-demo forms with contextual 2-step interactive ROI intake.' },
      ],
      proofItemIds: ['gsc-proof', 'payflow-seo-dash'],
      testimonial: {
        quote:
          'Alex completely reworked our organic search architecture. We went from 50 to 300+ monthly demo requests without increasing paid marketing burn.',
        author: 'Siddharth Kapoor',
        role: 'Founder & CEO, PayFlow Systems',
      },
      learnings: [
        'Pruning low-quality pages is often 3x more effective than publishing new content.',
        'High-intent B2B searchers convert best on interactive calculators rather than static demo forms.',
        'Fixing canonical hierarchies allows Google algorithms to properly rank primary revenue pages.',
      ],
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCamaZrNHgm3B_5yiKd25_k81zk45s6B9likG1QRAmITUlfm03BNjhVCdKwWcuIQ3xjW-TROt0kgEnLMgNeZytvOWxOfUh1CquK8Wd_CvTRToR7ZdaGdcebYI2wFC4ruc9zfR1pLsXTOeb3YLhPQZS_3Po7IibaP7-5cV89FQ4zn9IgNX1VXxIURV5DZoZ5S0erlsBDVMCT3lWzvnnHSiX3z-AI8s1jqwUDvIri3g8',
    },
    {
      slug: 'kinetic-activewear',
      client: 'KINETIC Activewear',
      title: 'Scaled Meta Ads from ₹3L/mo to ₹18L/mo while maintaining 4.8x ROAS',
      industry: 'D2C Athleisure',
      duration: '8 Months',
      services: ['Performance Marketing', 'Creative Strategy', 'Retention'],
      result: '4.8x Blended ROAS at Scale',
      stats: [
        { label: 'Monthly Ad Spend', value: '₹18L', trend: '6x scale' },
        { label: 'Blended ROAS', value: '4.8x', trend: 'sustained' },
        { label: 'Customer Acquisition Cost', value: '₹340', trend: '-28%' },
        { label: 'Repeat Purchase Rate', value: '31%', trend: 'compounding' },
      ],
      goal: 'Scale DTC athletic apparel revenue past the early ₹3L/month plateau without experiencing creative fatigue or margin collapse.',
      challenge:
        'Ad accounts suffered from ad fatigue every 10 days. The in-house team was launching ad sets with micro-targeting that restricted Facebook machine learning from finding cheaper conversions.',
      strategy:
        'Restructured the account into a consolidated Advantage+ Shopping structure. Built a modular UGC testing factory producing 24 hook variations weekly and coupled paid traffic with automated Klaviyo post-purchase flows.',
      execution: [
        { step: 'Month 1-2', title: 'Account Consolidation', desc: 'Merged 14 fragmented ad sets into 2 master campaigns with relaxed broad targeting.' },
        { step: 'Month 3-4', title: 'Hook Matrix Deployment', desc: 'Tested 50+ video hooks targeting gym-goers, runners, and lifestyle buyers.' },
        { step: 'Month 5-6', title: 'Catalog Integration & Dynamic Retargeting', desc: 'Deployed personalized dynamic product ads (DPA) based on browse history.' },
        { step: 'Month 7-8', title: 'BFCM Scaling Sprint', desc: 'Scaled spend to ₹18L/month while maintaining a profitable 4.8x blended ROAS.' },
      ],
      proofItemIds: ['kinetic-poster', 'kova-ads'],
      testimonial: {
        quote:
          'Alex doesn’t just manage ad campaigns; he builds entire acquisition engines. His creative iteration method solved our ad fatigue permanently.',
        author: 'Manish Nair',
        role: 'VP Growth, KINETIC Activewear',
      },
      learnings: [
        'Consolidating ad accounts yields dramatically better algorithmic bidding than micro-segmentation.',
        'The first 3 seconds of creative dictate 80% of click-through rate variation.',
        'High-converting post-purchase retention flows allow higher upfront bids without risking margin.',
      ],
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB6N3d32N53HPKadGd4VDoJbzRbEsdc9uZYj9wlExgHNWPiBg1SQs7Gm-OJGyBUvY1YRLnZPrOqxIvpCFn9S49YAw9K06_t8YVhmZNLNr8YxxkbNOqSvv1L8hGRWeTK998hiL1Y1vWDmTjcNA4IC7M03ehQeJFsr-cgeoWj_IFoKrP_Gon-aIpUQpg0adZGtZxY_gEnfcMd_cQQBLGZVijOVdmQd8_Egwv1i4PgUGE',
    },
    {
      slug: 'aura-health-cloud',
      client: 'Aura Health Cloud',
      title: 'Redesigned acquisition funnel lowering CAC by 42%',
      industry: 'Hospital Tech & Health B2B',
      duration: '4 Months',
      services: ['Analytics & CRO', 'Paid Search', 'Funnel Rebuild'],
      result: '-42% Blended CAC',
      stats: [
        { label: 'Customer Acq. Cost', value: '-42%', trend: 'drop' },
        { label: 'Form Conversion Rate', value: '5.4%', trend: '3x jump' },
        { label: 'Sales Velocity', value: '28 Days', trend: '-14 days' },
        { label: 'MQL to SQL Match', value: '78%', trend: 'qualified' },
      ],
      goal: 'Improve sales pipeline quality and reduce high acquisition costs for cloud hospital EHR software.',
      challenge:
        'An intimidating 14-field demo form caused massive drop-off (98.2% abandonment). Search campaigns were also triggering irrelevant consumer queries like "free health records app".',
      strategy:
        'Introduced negative keyword tiers to eliminate consumer waste. Re-architected demo intake into a frictionless 2-step progressive form with Clearbit auto-enrichment, cutting friction while retaining qualification depth.',
      execution: [
        { step: 'Month 1', title: 'Forensic Form & Query Audit', desc: 'Identified that 40% of ad spend went to consumer medical keywords.' },
        { step: 'Month 2', title: '2-Step Progressive Form', desc: 'Reduced visible initial fields to 2, enriching company size behind the scenes.' },
        { step: 'Month 3', title: 'Search Query Restructuring', desc: 'Shifted to exact-match enterprise phrases with commercial intent modifiers.' },
        { step: 'Month 4', title: 'Personalized Landing Architecture', desc: 'Routed visitors based on clinical specialty (dental, hospital, pediatric).' },
      ],
      proofItemIds: ['aura-site-proof', 'aura-poster'],
      testimonial: {
        quote:
          'Our customer acquisition cost plummeted by 42% in 90 days. The most analytical, conversion-obsessed marketer I have worked with.',
        author: 'Rhea Verma',
        role: 'Chief Marketing Officer, Aura Health',
      },
      learnings: [
        'Form friction is the biggest silent killer of B2B paid media investment.',
        'Data enrichment APIs allow you to collect deep firmographics without alienating prospects.',
        'Specialty-specific landing pages convert at double the rate of generic enterprise homepages.',
      ],
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD4JP_bEuA12W6iGc125W-Tvi3tvo56PbW5BLbRAli_Dgn72gp9U5R2VQV8Ht9T9xo7gJ628-EHQKunuA7CDHdUhuenuAp1svhbxosvcbo8TLXQyZsPescNwpdzztbhMY29fBJCBdyMfIHY7-B6Tk8L4_T9ZwvIn5pzaJ9_cNOzhb6rEhCS4ChCMsNeo7nUqxTN-qsR8qhJin3F0wJ3ltABAmnIsw0zmeAh51amoV0',
    },
    {
      slug: 'cloudpulse-cloud',
      client: 'CloudPulse.io',
      title: 'Scaled B2B Infrastructure Traffic from 2K to 18K/mo with 14.2x Retainer ROI',
      industry: 'Enterprise Cloud Infrastructure',
      duration: '8 Months',
      services: ['Technical SEO', 'Analytics & Attribution', 'Content Hubs'],
      result: '14.2x Return on Retainer',
      stats: [
        { label: 'Monthly Visitors', value: '2K → 18K', trend: '9x lift' },
        { label: 'Page 1 Keywords', value: '140+', trend: 'top positions' },
        { label: 'Enterprise ARR', value: '+$1.8M', trend: 'attributed' },
        { label: 'Return on Retainer', value: '14.2x', trend: 'verified' },
      ],
      goal: 'Dominate high-ACV commercial keywords for hybrid-cloud telemetry and displace entrenched legacy competitors.',
      challenge:
        'CloudPulse had great developer documentation but zero non-branded commercial ranking. Engineering jargon crowded out commercial search intent.',
      strategy:
        'Re-engineered the site architecture with a decoupled static markdown blog, implemented server-side GA4 telemetry, and established authoritative programmatic integration hubs.',
      execution: [
        { step: 'Month 1-2', title: 'Architecture Overhaul', desc: 'Built high-speed Next.js static landing hubs optimized for Core Web Vitals.' },
        { step: 'Month 3-4', title: 'Integration Directory Scale', desc: 'Published 80+ programmatic integration teardowns (AWS, GCP, Kubernetes).' },
        { step: 'Month 5-6', title: 'Backlink Authority Outreach', desc: 'Secured natural links from tech publications and developer media.' },
        { step: 'Month 7-8', title: 'Conversion Attribution Modeling', desc: 'Connected Looker Studio directly to BigQuery for closed-loop ARR tracking.' },
      ],
      proofItemIds: ['cloudpulse-seo', 'cloudpulse-serp'],
      testimonial: {
        quote:
          'Alex didn’t just present vanity metrics; he systematically re-engineered our acquisition channel economics. Enterprise ARR shot through the roof.',
        author: 'Marcus Vance',
        role: 'Founder & CEO, CloudPulse (Series A)',
      },
      learnings: [
        'Developer audience requires authentic code examples inside marketing hubs to build trust.',
        'First-page rankings on high-intent B2B terms compound faster than paid search spend.',
      ],
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAdtQj6OlpB7T8uUTLHmqa7jxhbMW_yX-7gGVmKRb2dssFOTmitzVIuiJJE9EEsCFrMMhQ2KLqW4LjYf8pYGS6mGWIuVTDv5ercOgVjbithBp08Eitkv9VvsNVnwqMo6uTpQS6yspMhyJ9sdAYzzDk5xjPnNLv58E3LSdoJFClvcHA5pwGI1VtAdKpVY6yGM-6FcnUy9GYVnD36wudFAeYlBk3_MqE7fZ7WWdnU5dY',
    },
    {
      slug: 'beancraft-coffee',
      client: 'BeanCraft Coffee',
      title: 'Automated 38% Total Revenue Share via Klaviyo Retention Architecture',
      industry: 'Artisanal Beverage D2C',
      duration: '6 Months',
      services: ['Email & Retention', 'Social Media Strategy', 'CRO'],
      result: '38% Email Revenue Share',
      stats: [
        { label: 'Email Rev Share', value: '38%', trend: 'automated' },
        { label: 'Average Open Rate', value: '44.8%', trend: 'high intent' },
        { label: 'Reel Reach', value: '185K', trend: 'viral' },
        { label: 'Churn Reduction', value: '-31%', trend: 'sustained' },
      ],
      goal: 'Turn one-time artisanal coffee buyers into compounding monthly subscribers and lift lifecycle value.',
      challenge:
        'Over 70% of purchasers never placed a second order. Standard automated welcome flows generated an anemic 8% open rate due to poor deliverability.',
      strategy:
        'Authenticated domain deliverability (SPF/DKIM/DMARC). Built a 14-step dynamic replenishment flow calibrated to bag weight consumption velocity, combined with short-form brewing tutorials on Instagram Reels.',
      execution: [
        { step: 'Month 1', title: 'Deliverability Hygiene', desc: 'Segmented unengaged profiles and lifted inbox placement from 68% to 99%.' },
        { step: 'Month 2-3', title: 'Consumption-Paced Flows', desc: 'Triggered re-order offers exactly 4 days before typical bag exhaustion.' },
        { step: 'Month 4', title: 'VIP Subscription Club', desc: 'Introduced early-access seasonal micro-lots for subscribers.' },
        { step: 'Month 5-6', title: 'Organic Social Amplification', desc: 'Scripted viral reels demonstrating espresso techniques, driving 185k organic reach.' },
      ],
      proofItemIds: ['beancraft-reel', 'beancraft-email'],
      testimonial: {
        quote:
          'Alex transformed our email list into our highest-margin revenue channel. The replenishment triggers alone pay for his advisory tenfold.',
        author: 'Arjun Mehta',
        role: 'Co-Founder, BeanCraft Roasters',
      },
      learnings: [
        'Timing retention triggers to actual physical consumption patterns beats generic calendar intervals.',
        'High deliverability hygiene immediately doubles open rates without changing subject lines.',
      ],
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRMJ8x6-3AwB21rjWPLHTp5C5SHHvvJ9kZst6k0uaErVrqhq-qGMoC8klwAXEnsrXwwlYtagEi6LzA1P2-BaULDnWnPpQgX1iNZCt6_VMtLnXJq7yZs8pEHzr6c2QVrbk9_9IONxLg5tHqH9CC47mKI6wscHP0hdwuUXZJmKWJUui32_G2kRZd9_gBBxMutMtrnWH_a5DzeY4Xphp0Tc-Z-JiljaTR0ft8quXFl0',
    },
    {
      slug: 'syncdev-api',
      client: 'SyncDev',
      title: 'Built 12,000-Page Programmatic SEO Empire Reaching 450K Monthly Developers',
      industry: 'Developer Tools',
      duration: '7 Months',
      services: ['Programmatic SEO', 'Technical SEO', 'Search Architecture'],
      result: '0 → 450K Monthly Devs',
      stats: [
        { label: 'Monthly Developers', value: '450K', trend: 'organic' },
        { label: 'Programmatic Pages', value: '12,000+', trend: 'indexed' },
        { label: 'Self-Serve Signups', value: '8,400/mo', trend: 'zero paid ads' },
        { label: 'Indexation Rate', value: '98.4%', trend: 'healthy' },
      ],
      goal: 'Scale developer acquisition for an API orchestration engine organically without paying $12/click Google ad rates.',
      challenge:
        'Traditional manual blogging could not cover the vast long-tail matrix of thousands of possible API integration pairs (e.g., "Stripe to Xero webhook syncing").',
      strategy:
        'Architected a programmatic search matrix generating 12,000 verified code integration pages. Each page had live curl examples, JSON payloads, and automated error-handling guides.',
      execution: [
        { step: 'Month 1-2', title: 'Data Pipeline & Schema Engine', desc: 'Generated structured Markdown for 12,000 API integration pairs.' },
        { step: 'Month 3', title: 'Internal Linking Mesh', desc: 'Built hierarchical taxonomy hubs ensuring clean crawl equity distribution.' },
        { step: 'Month 4-5', title: 'Googlebot Index Acceleration', desc: 'Submitted dynamic XML sitemaps partitioned by developer ecosystem.' },
        { step: 'Month 6-7', title: 'Terminal Snippet Optimization', desc: 'Added 1-click copy CLI snippets that drove self-serve software downloads.' },
      ],
      proofItemIds: ['syncdev-seo', 'syncdev-serp'],
      testimonial: {
        quote:
          'Alex built an organic search asset that generated 8,400 monthly developers on autopilot. It is the highest-leverage marketing system we have ever deployed.',
        author: 'Elena Rostova',
        role: 'Chief Technology Officer, SyncDev',
      },
      learnings: [
        'Programmatic SEO succeeds only when pages contain genuinely useful, unique utility (not spun text).',
        'Structured schema markup accelerates Google featured snippet capture across long-tail queries.',
      ],
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAxReJVDm23ewkf3OK3UHkic293CIWg9GaRc7wXahIMoVgglWT6OyZwZmN7_VZOqc2RTfuM_BsIw1Z2GaLSjD5HP0Ab51XLKvc2HvM1pLGeKk8hTIzDVLHOom2CruxtOBXJicjXrjwMTIKCo56t9R3T9T4Jr9kDbuk38MVHJROwuQCvWNuTVHouXGFUlXni7mVqlAjfFeOlr1V0XHrGs54CjUVWtCmrxCnBKIWlLJQ',
    },
  ] as WorkDetail[],

  // 12 SHOWCASE ITEMS (Covering all 6 types: poster, analytics, seo-site, social, ad, email)
  showcase: [
    {
      id: 'lumina-poster',
      type: 'poster',
      title: 'Acoustic Clarity 2024 Launch Poster',
      client: 'Lumina Sound • D2C Audio',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBreclOtTIOY__8vnDa9OmshD9MZo9CzHE1ZHeJ2yyZ-Nzw7nYvhLECPcQDJ4HBwewgnMC9bmCjmVFNp71cuIkZKsFj44ZW_G122cj0OQe-nTZY500R2STC3ZpZPm1u0TIMb0hi-fXzaaxdhUq7iLkxcwYTwbPNzFis83ddnqlvjlp2wDUuTP2oB-hOxkwNGjL6d2bch9LqWYyv4qNEYlHHrWK3jcJXIGjx7S4ZFTw',
      badge: 'Brand Poster',
      highlight: 'Digital + OOH Billboard',
      workSlug: 'kinetic-activewear',
    },
    {
      id: 'gsc-proof',
      type: 'analytics',
      title: 'Google Search Console Clicks Spike',
      client: 'PayFlow Systems • B2B SaaS',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAZK6pUbuSMJu7rfL5g4CShWgbfzv1MxnT8Mx__tEWC-F4cRw25vWCObfmDb8Hym66txtXS5tTOXBcMrutmOo4v21XNMCPEShbDcZe7uHJsGHOQZD20mLWtsOCS1F8Al706ZpzlrBKAkiEwKPE2mJBAuJ-6zDc7yxHsXA-9aLT-oYOxDru3DrtiKMwgVSArjGZ_hBn6crBR8mE_4P7BwECYf2Tgc8nYpu49Z4M9Eck',
      badge: '+120% Organic Clicks',
      source: 'Google Search Console',
      url: 'search.google.com/search-console',
      workSlug: 'payflow-systems',
    },
    {
      id: 'cloudpulse-seo',
      type: 'seo-site',
      title: 'CloudPulse.io Taxonomy Restructure',
      client: 'CloudPulse.io',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAdtQj6OlpB7T8uUTLHmqa7jxhbMW_yX-7gGVmKRb2dssFOTmitzVIuiJJE9EEsCFrMMhQ2KLqW4LjYf8pYGS6mGWIuVTDv5ercOgVjbithBp08Eitkv9VvsNVnwqMo6uTpQS6yspMhyJ9sdAYzzDk5xjPnNLv58E3LSdoJFClvcHA5pwGI1VtAdKpVY6yGM-6FcnUy9GYVnD36wudFAeYlBk3_MqE7fZ7WWdnU5dY',
      url: 'cloudpulse.io',
      before: '2K/mo',
      after: '18K/mo',
      badge: 'Page 1 Commercial Engine',
      workSlug: 'cloudpulse-cloud',
    },
    {
      id: 'kova-ads',
      type: 'ad',
      title: 'Meta Dynamic Creative Testing Matrix',
      client: 'Kova Footwear D2C',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBreclOtTIOY__8vnDa9OmshD9MZo9CzHE1ZHeJ2yyZ-Nzw7nYvhLECPcQDJ4HBwewgnMC9bmCjmVFNp71cuIkZKsFj44ZW_G122cj0OQe-nTZY500R2STC3ZpZPm1u0TIMb0hi-fXzaaxdhUq7iLkxcwYTwbPNzFis83ddnqlvjlp2wDUuTP2oB-hOxkwNGjL6d2bch9LqWYyv4qNEYlHHrWK3jcJXIGjx7S4ZFTw',
      badge: 'Meta Advantage+',
      metrics: [
        { label: 'CTR', value: '4.6%' },
        { label: 'CPL', value: '₹32.50' },
        { label: 'ROAS', value: '5.4x' },
        { label: 'Spend', value: '₹12.5L' },
      ],
      workSlug: 'kinetic-activewear',
    },
    {
      id: 'beancraft-reel',
      type: 'social',
      title: 'Viral Instagram Reel Growth Playbook',
      client: 'BeanCraft Coffee',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRMJ8x6-3AwB21rjWPLHTp5C5SHHvvJ9kZst6k0uaErVrqhq-qGMoC8klwAXEnsrXwwlYtagEi6LzA1P2-BaULDnWnPpQgX1iNZCt6_VMtLnXJq7yZs8pEHzr6c2QVrbk9_9IONxLg5tHqH9CC47mKI6wscHP0hdwuUXZJmKWJUui32_G2kRZd9_gBBxMutMtrnWH_a5DzeY4Xphp0Tc-Z-JiljaTR0ft8quXFl0',
      badge: '185K Organic Reach',
      highlight: '14.2K Likes · 3.8K Shares',
      workSlug: 'beancraft-coffee',
    },
    {
      id: 'finnest-analytics',
      type: 'analytics',
      title: 'GA4 Ecommerce Funnel Telemetry',
      client: 'FinNest Wealth Cloud',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCVq20SqPKRFV43fWxSUhULfEMbQMQ78PXxvmV6Tv8LLVzdm8fS6eA6vPLuCAigE0z5xDBtU9-4xQZeCBz4MFFFyGa_9jkZkCtlBMJu0rqaypD3MLwozRm_w72T2llcEgURqtmPKhsrqJ-O9NTP8r6EqDOUL8dcutxr0QygKU_4Cmn3LgKAAVP3J0-iH5XVfUsCksSM19a1zW-YPlrVsGXBwxEksSYb3-ITE0Achng',
      badge: '+340% GA4 Revenue',
      source: 'Google Analytics 4',
      url: 'analytics.google.com/ga4/monetization',
      workSlug: 'payflow-systems',
    },
    {
      id: 'aura-poster',
      type: 'poster',
      title: 'Botanical Clinical Drops Hero Asset',
      client: 'Aura Health Life',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAZK6pUbuSMJu7rfL5g4CShWgbfzv1MxnT8Mx__tEWC-F4cRw25vWCObfmDb8Hym66txtXS5tTOXBcMrutmOo4v21XNMCPEShbDcZe7uHJsGHOQZD20mLWtsOCS1F8Al706ZpzlrBKAkiEwKPE2mJBAuJ-6zDc7yxHsXA-9aLT-oYOxDru3DrtiKMwgVSArjGZ_hBn6crBR8mE_4P7BwECYf2Tgc8nYpu49Z4M9Eck',
      badge: 'Product Poster',
      highlight: '+310% Pre-Orders',
      workSlug: 'aura-health-cloud',
    },
    {
      id: 'syncdev-seo',
      type: 'seo-site',
      title: 'SyncDev API Documentation Taxonomy',
      client: 'SyncDev',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAxReJVDm23ewkf3OK3UHkic293CIWg9GaRc7wXahIMoVgglWT6OyZwZmN7_VZOqc2RTfuM_BsIw1Z2GaLSjD5HP0Ab51XLKvc2HvM1pLGeKk8hTIzDVLHOom2CruxtOBXJicjXrjwMTIKCo56t9R3T9T4Jr9kDbuk38MVHJROwuQCvWNuTVHouXGFUlXni7mVqlAjfFeOlr1V0XHrGs54CjUVWtCmrxCnBKIWlLJQ',
      url: 'syncdev.io/docs',
      before: '0 Devs',
      after: '450K Devs',
      badge: '12,000 Programmatic Pages',
      workSlug: 'syncdev-api',
    },
    {
      id: 'beancraft-email',
      type: 'email',
      title: 'Consumption-Paced Klaviyo Flow Matrix',
      client: 'BeanCraft Coffee',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRMJ8x6-3AwB21rjWPLHTp5C5SHHvvJ9kZst6k0uaErVrqhq-qGMoC8klwAXEnsrXwwlYtagEi6LzA1P2-BaULDnWnPpQgX1iNZCt6_VMtLnXJq7yZs8pEHzr6c2QVrbk9_9IONxLg5tHqH9CC47mKI6wscHP0hdwuUXZJmKWJUui32_G2kRZd9_gBBxMutMtrnWH_a5DzeY4Xphp0Tc-Z-JiljaTR0ft8quXFl0',
      badge: 'Klaviyo Matrix',
      metrics: [
        { label: 'Open Rate', value: '44.8%' },
        { label: 'Order Rate', value: '6.2%' },
        { label: 'Rev Share', value: '38%' },
      ],
      workSlug: 'beancraft-coffee',
    },
    {
      id: 'kinetic-poster',
      type: 'poster',
      title: 'Athletic Motion Campaign Poster',
      client: 'KINETIC Activewear',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB6N3d32N53HPKadGd4VDoJbzRbEsdc9uZYj9wlExgHNWPiBg1SQs7Gm-OJGyBUvY1YRLnZPrOqxIvpCFn9S49YAw9K06_t8YVhmZNLNr8YxxkbNOqSvv1L8hGRWeTK998hiL1Y1vWDmTjcNA4IC7M03ehQeJFsr-cgeoWj_IFoKrP_Gon-aIpUQpg0adZGtZxY_gEnfcMd_cQQBLGZVijOVdmQd8_Egwv1i4PgUGE',
      badge: 'Ad Poster',
      highlight: 'Omnichannel Launch Asset',
      workSlug: 'kinetic-activewear',
    },
    {
      id: 'aura-site-proof',
      type: 'seo-site',
      title: 'Aura Hospital EHR Landing Funnel',
      client: 'Aura Health Cloud',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD4JP_bEuA12W6iGc125W-Tvi3tvo56PbW5BLbRAli_Dgn72gp9U5R2VQV8Ht9T9xo7gJ628-EHQKunuA7CDHdUhuenuAp1svhbxosvcbo8TLXQyZsPescNwpdzztbhMY29fBJCBdyMfIHY7-B6Tk8L4_T9ZwvIn5pzaJ9_cNOzhb6rEhCS4ChCMsNeo7nUqxTN-qsR8qhJin3F0wJ3ltABAmnIsw0zmeAh51amoV0',
      url: 'aurawellness.co',
      before: '2.1K',
      after: '24.8K',
      badge: '42% Lower CAC',
      workSlug: 'aura-health-cloud',
    },
    {
      id: 'payflow-seo-dash',
      type: 'analytics',
      title: 'PayFlow Organic ARR Attribution Ledger',
      client: 'PayFlow Systems',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCamaZrNHgm3B_5yiKd25_k81zk45s6B9likG1QRAmITUlfm03BNjhVCdKwWcuIQ3xjW-TROt0kgEnLMgNeZytvOWxOfUh1CquK8Wd_CvTRToR7ZdaGdcebYI2wFC4ruc9zfR1pLsXTOeb3YLhPQZS_3Po7IibaP7-5cV89FQ4zn9IgNX1VXxIURV5DZoZ5S0erlsBDVMCT3lWzvnnHSiX3z-AI8s1jqwUDvIri3g8',
      badge: '+185% Demos',
      source: 'Google Search Console',
      url: 'search.google.com/search-console/payflow',
      workSlug: 'payflow-systems',
    },
  ] as ShowcaseItem[],

  // SITES I'VE RANKED
  rankedSites: [
    {
      domain: 'cloudpulse.io',
      industry: 'B2B SaaS',
      description: 'Cloud Infrastructure Monitoring',
      keyword: 'b2b cloud infrastructure',
      monthlyVolume: '74,000 / mo',
      cpc: '$18.40',
      rankBadge: 'Position #34 → #3',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAdtQj6OlpB7T8uUTLHmqa7jxhbMW_yX-7gGVmKRb2dssFOTmitzVIuiJJE9EEsCFrMMhQ2KLqW4LjYf8pYGS6mGWIuVTDv5ercOgVjbithBp08Eitkv9VvsNVnwqMo6uTpQS6yspMhyJ9sdAYzzDk5xjPnNLv58E3LSdoJFClvcHA5pwGI1VtAdKpVY6yGM-6FcnUy9GYVnD36wudFAeYlBk3_MqE7fZ7WWdnU5dY',
      tagColor: 'bg-primary text-white',
    },
    {
      domain: 'beancraft.co',
      industry: 'E-Commerce',
      description: 'Artisanal Cold Brew Coffee',
      keyword: 'organic cold brew subscription',
      monthlyVolume: '28,500 / mo',
      cpc: '$4.10',
      rankBadge: 'Position #58 → #1',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRMJ8x6-3AwB21rjWPLHTp5C5SHHvvJ9kZst6k0uaErVrqhq-qGMoC8klwAXEnsrXwwlYtagEi6LzA1P2-BaULDnWnPpQgX1iNZCt6_VMtLnXJq7yZs8pEHzr6c2QVrbk9_9IONxLg5tHqH9CC47mKI6wscHP0hdwuUXZJmKWJUui32_G2kRZd9_gBBxMutMtrnWH_a5DzeY4Xphp0Tc-Z-JiljaTR0ft8quXFl0',
      tagColor: 'bg-tertiary-container text-white',
    },
    {
      domain: 'aurahealth.life',
      industry: 'Health D2C',
      description: 'Clinical Dermatology Formulation',
      keyword: 'clinical d2c skincare',
      monthlyVolume: '51,000 / mo',
      cpc: '$8.90',
      rankBadge: 'Position #42 → #2',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAZK6pUbuSMJu7rfL5g4CShWgbfzv1MxnT8Mx__tEWC-F4cRw25vWCObfmDb8Hym66txtXS5tTOXBcMrutmOo4v21XNMCPEShbDcZe7uHJsGHOQZD20mLWtsOCS1F8Al706ZpzlrBKAkiEwKPE2mJBAuJ-6zDc7yxHsXA-9aLT-oYOxDru3DrtiKMwgVSArjGZ_hBn6crBR8mE_4P7BwECYf2Tgc8nYpu49Z4M9Eck',
      tagColor: 'bg-secondary text-white',
    },
    {
      domain: 'syncdev.io/docs',
      industry: 'DevTech',
      description: 'API Integration Documentation',
      keyword: 'developer api documentation',
      monthlyVolume: '110,000 / mo',
      cpc: '$12.30',
      rankBadge: 'Position #65 → #4',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAxReJVDm23ewkf3OK3UHkic293CIWg9GaRc7wXahIMoVgglWT6OyZwZmN7_VZOqc2RTfuM_BsIw1Z2GaLSjD5HP0Ab51XLKvc2HvM1pLGeKk8hTIzDVLHOom2CruxtOBXJicjXrjwMTIKCo56t9R3T9T4Jr9kDbuk38MVHJROwuQCvWNuTVHouXGFUlXni7mVqlAjfFeOlr1V0XHrGs54CjUVWtCmrxCnBKIWlLJQ',
      tagColor: 'bg-primary-container text-white',
    },
  ] as RankedSite[],

  // 6 BLOG POSTS
  blogPosts: [
    {
      slug: 'core-update-recovery',
      title: 'The 2024 Core Update Recovery Blueprint: Surviving Helpful Content Audits',
      category: 'SEO Strategy',
      excerpt:
        "How we helped three websites recover lost traffic after Google's major algorithmic shifts by de-indexing bloat and restoring search intent.",
      date: 'Oct 14, 2024',
      readTime: '6 min read',
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCl1MoutUuZqgPpyksLS17nsHcSHS32lVHS2A2Wm3EtA8aY2Kg5dXXNI4c55COiyvSMZMcCjGfqqAQjyGweSFg_tnFwQch3pLCE-EnhA6R6fRlg6a_5ccYKjwcHZUNYKpsX6RnPZ8LkZQ4uqELAvzmQ6bLlgaVCVXUW_2bq1LE8N8rP4CICJOAzgA_0Jj9ySSCxQdLqG6MHaeqiLA-nNg-5CmAk8NWQ-inMzBuvVYc',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [
        { id: 'root-cause', title: '1. Diagnosing the Drop' },
        { id: 'index-bloat', title: '2. De-indexing Bloat' },
        { id: 'entity-clustering', title: '3. Rebuilding Topic Clusters' },
        { id: 'results', title: '4. Recovery Outcomes' },
      ],
      contentBlocks: [
        {
          heading: '1. Diagnosing the Drop',
          paragraphs: [
            'When Google rolled out its recent core updates, hundreds of content-heavy sites saw 40% to 70% drops in organic traffic overnight. The immediate panic response for many was to generate even more articles or churn out cheap backlinks.',
            'Our forensic crawl analysis revealed the real root cause: keyword cannibalization and index bloat. Over 62% of indexed URLs had zero clicks over a 180-day window.',
          ],
          pullQuote: 'Pruning 40% of low-performing URLs improved overall domain crawl efficiency by 240%.',
        },
        {
          heading: '2. De-indexing Bloat',
          paragraphs: [
            'Search engines operate on a finite crawl budget for any given domain. When Googlebot is forced to index thin tag archives, duplicate category sorts, and outdated news articles, it deprioritizes your core commercial landing hubs.',
            'We implemented a rigorous 3-step triage: (1) 301-redirecting cannibalized topics into authoritative master guides, (2) adding noindex tags to zero-traffic tag and category pages, and (3) refreshing surviving URLs with proprietary first-party research.',
          ],
        },
        {
          heading: '3. Rebuilding Topic Clusters',
          paragraphs: [
            'Instead of writing disconnected articles, we restructured the website into semantic entity hubs. Every sub-page links exclusively upward to its parent category anchor, creating an unmistakable signal of topical authority to Google’s neural matching algorithms.',
          ],
        },
        {
          heading: '4. Recovery Outcomes',
          paragraphs: [
            'Within 90 days of deploying the canonical hygiene cleanup, all three audited sites completely rebounded, with commercial lead capture reaching new all-time highs without spending an additional dollar on paid ads.',
          ],
        },
      ],
      relatedSlugs: ['scaling-meta-ads', 'ga4-server-side'],
    },
    {
      slug: 'scaling-meta-ads',
      title: 'Scaling Meta Ads Past ₹10L/Month Without Fatiguing Creative',
      category: 'Paid Media',
      excerpt:
        'The dynamic iteration methodology we use to produce 25+ high-performing hook variations weekly and stabilize blended ROAS.',
      date: 'Sep 28, 2024',
      readTime: '8 min read',
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCRjtZ24G7uWB7OGkkIvFULSUiTHPb5tagH5UQEzniucPjaNIQBA1tRAtKCoTNbXvwqeJX8FuMa4apOBCgl4psCjJt7vu09Wj7EPVeB8nynn3pSgsWGNaOiVKJS0Ff56hUaoLwqK8jvG2IC1rk4MKw9gL9VKOADCUMhXRpAk8pnLi0rxqNs1p8-se9MUDAIYaTG82HShqmG_FBg9a5QQzF8Xk7kEYwa2SAHMFN_680',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [
        { id: 'scaling-wall', title: '1. The ₹10L Scaling Wall' },
        { id: 'hook-matrix', title: '2. The 3-Part Hook Matrix' },
        { id: 'cbo-graduation', title: '3. CBO Scaling Campaigns' },
      ],
      contentBlocks: [
        {
          heading: '1. The ₹10L Scaling Wall',
          paragraphs: [
            'Most DTC brands hit a scaling wall at ₹5L to ₹10L per month in ad spend. The algorithm exhausts narrow lookalike pools, frequency creeps above 3.5, and blended CPA spikes uncontrollably.',
            'Rather than creating entirely new video concepts from scratch every Monday, we implement a modular creative testing sandbox.',
          ],
          pullQuote: 'Creative testing is not an art experiment; it is an iterative manufacturing pipeline.',
        },
        {
          heading: '2. The 3-Part Hook Matrix',
          paragraphs: [
            'We isolate three distinct creative levers: (1) The First 3 Seconds (Visual Hook), (2) The Problem Agitation (Body), and (3) The Offer Urgency (CTA).',
            'By mixing and matching 5 hooks, 2 bodies, and 3 CTAs, we produce 30 testable variations at a fraction of production cost.',
          ],
        },
        {
          heading: '3. CBO Scaling Campaigns',
          paragraphs: [
            'Winning variations from the dynamic sandbox are graduated into a consolidated CBO scaling campaign with relaxed targeting, allowing Meta’s machine learning to allocate capital to optimal customer segments.',
          ],
        },
      ],
      relatedSlugs: ['core-update-recovery', 'ga4-server-side'],
    },
    {
      slug: 'ga4-server-side',
      title: 'Why Your GA4 Setup is Leaking Attribution & How Server-Side Solves It',
      category: 'Analytics & CRO',
      excerpt:
        'Recovering 25%+ of missing ad conversion data through modern first-party tracking implementations and CAPI.',
      date: 'Sep 12, 2024',
      readTime: '5 min read',
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC6OXXw4cnNhJU5YFYUqgTRr2VdaaglB5uInVgphxmSHPnVXQBubGkKS2JRSuzGleEH4jxPDDdzXrM6kMXpq30Y27PLSyF2ki78jM_ajpPXAYulfBTpJ0oyabqyz-w2ghLPo7HPZ0K6zbFmfLNPpJQ33-rgfFCRmXW3WnTYBVnjZB-hNa6nruD7UITqreZ26xRsnzmsECsHr6hnX8RIIe4tFE2lCTLxkuVBwNJPzkA',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [
        { id: 'attribution-leak', title: '1. The Cookie Depreciation Reality' },
        { id: 'server-side-arch', title: '2. How ssGTM Functions' },
        { id: 'capi-impact', title: '3. Real Impact on Platform ROAS' },
      ],
      contentBlocks: [
        {
          heading: '1. The Cookie Depreciation Reality',
          paragraphs: [
            'Safari ITP, Brave shields, and ad-blocking DNS profiles now suppress or strip up to 35% of client-side tracking pixels. If your campaigns rely strictly on browser tags, your bid algorithms are optimizing on severely broken attribution data.',
          ],
        },
        {
          heading: '2. How ssGTM Functions',
          paragraphs: [
            'Server-side Google Tag Manager (ssGTM) running on a custom sub-domain routes tracking hits through your primary domain as first-party HTTP cookies. This extends cookie lifetimes from 24 hours back to 13 months and bypasses browser content blockers.',
          ],
          pullQuote: 'Server-side CAPI setups recover an immediate 22% of previously lost conversions for Meta algorithms.',
        },
        {
          heading: '3. Real Impact on Platform ROAS',
          paragraphs: [
            'Clients who transitioned saw attributed ROAS improve immediately because the platforms could now properly connect purchases with initial click interactions, feeding machine learning the signals it needs to scale spend profitably.',
          ],
        },
      ],
      relatedSlugs: ['scaling-meta-ads', 'cro-high-dropoff'],
    },
    {
      slug: 'cro-high-dropoff',
      title: 'Fixing the 14-Field B2B Form: How Progressive Profiling Tripled Demo Bookings',
      category: 'Analytics & CRO',
      excerpt:
        'A breakdown of how removing visual form barriers and using data enrichment lifted lead-to-opportunity velocity by 3x.',
      date: 'Aug 24, 2024',
      readTime: '6 min read',
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD4JP_bEuA12W6iGc125W-Tvi3tvo56PbW5BLbRAli_Dgn72gp9U5R2VQV8Ht9T9xo7gJ628-EHQKunuA7CDHdUhuenuAp1svhbxosvcbo8TLXQyZsPescNwpdzztbhMY29fBJCBdyMfIHY7-B6Tk8L4_T9ZwvIn5pzaJ9_cNOzhb6rEhCS4ChCMsNeo7nUqxTN-qsR8qhJin3F0wJ3ltABAmnIsw0zmeAh51amoV0',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [
        { id: 'barrier-audit', title: '1. The Form Drop-off Problem' },
        { id: 'progressive-profiling', title: '2. Progressive Micro-Commitments' },
        { id: 'pipeline-results', title: '3. Results on Opportunity Velocity' },
      ],
      contentBlocks: [
        {
          heading: '1. The Form Drop-off Problem',
          paragraphs: [
            'B2B sales teams often mandate lengthy forms: Company, Title, Budget, Employees, Timeline, and Phone Number. The result is a 95%+ visitor abandonment rate before a single lead is submitted.',
          ],
        },
        {
          heading: '2. Progressive Micro-Commitments',
          paragraphs: [
            'By splitting the intake into 2 frictionless steps and enriching company data via APIs, we reduced visible initial inputs to just Work Email and Website URL.',
          ],
          pullQuote: 'Conversion friction decays exponentially with each additional visible input field.',
        },
        {
          heading: '3. Results on Opportunity Velocity',
          paragraphs: [
            'Completion rate climbed from 1.8% to 5.4%, while sales qualification rates actually improved because high-intent buyers were no longer bounced by visual fatigue.',
          ],
        },
      ],
      relatedSlugs: ['ga4-server-side', 'klaviyo-retention-playbook'],
    },
    {
      slug: 'programmatic-seo-engine',
      title: 'Building a 10,000-Page Programmatic SEO Engine Without Search Engine Penalties',
      category: 'SEO Strategy',
      excerpt:
        'The technical principles behind scalable markdown directories that provide real developer utility and rank #1.',
      date: 'Aug 02, 2024',
      readTime: '7 min read',
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAxReJVDm23ewkf3OK3UHkic293CIWg9GaRc7wXahIMoVgglWT6OyZwZmN7_VZOqc2RTfuM_BsIw1Z2GaLSjD5HP0Ab51XLKvc2HvM1pLGeKk8hTIzDVLHOom2CruxtOBXJicjXrjwMTIKCo56t9R3T9T4Jr9kDbuk38MVHJROwuQCvWNuTVHouXGFUlXni7mVqlAjfFeOlr1V0XHrGs54CjUVWtCmrxCnBKIWlLJQ',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [
        { id: 'programmatic-trap', title: '1. The Spun Content Trap' },
        { id: 'utility-first', title: '2. The Utility-First Framework' },
        { id: 'indexing-strategy', title: '3. Clean Internal Link Meshing' },
      ],
      contentBlocks: [
        {
          heading: '1. The Spun Content Trap',
          paragraphs: [
            'Programmatic SEO gets a bad reputation because marketers often generate thousands of template pages with thin synonyms. Google’s Helpful Content system aggressively de-indexes sites utilizing this tactic.',
          ],
        },
        {
          heading: '2. The Utility-First Framework',
          paragraphs: [
            'Our system focused on real programmatic utility: real curl syntax, verified integration test parameters, and automated error-handling blueprints for every API pair.',
          ],
        },
        {
          heading: '3. Clean Internal Link Meshing',
          paragraphs: [
            'A strict hub-and-spoke taxonomy allowed crawl bots to index 98.4% of the directory within 60 days, establishing a self-sustaining traffic engine.',
          ],
        },
      ],
      relatedSlugs: ['core-update-recovery', 'scaling-meta-ads'],
    },
    {
      slug: 'klaviyo-retention-playbook',
      title: 'Beyond Abandoned Cart: The 5 Lifecycle Email Flows That Drive 30%+ of Revenue',
      category: 'Paid Media',
      excerpt:
        'How consumption-paced replenishment triggers and VIP early-access sequences transform one-time buyers into lifetime subscribers.',
      date: 'Jul 18, 2024',
      readTime: '6 min read',
      coverImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRMJ8x6-3AwB21rjWPLHTp5C5SHHvvJ9kZst6k0uaErVrqhq-qGMoC8klwAXEnsrXwwlYtagEi6LzA1P2-BaULDnWnPpQgX1iNZCt6_VMtLnXJq7yZs8pEHzr6c2QVrbk9_9IONxLg5tHqH9CC47mKI6wscHP0hdwuUXZJmKWJUui32_G2kRZd9_gBBxMutMtrnWH_a5DzeY4Xphp0Tc-Z-JiljaTR0ft8quXFl0',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [
        { id: 'retention-gap', title: '1. The One-and-Done Problem' },
        { id: 'consumption-timing', title: '2. Pacing by Consumption Velocity' },
        { id: 'vip-activation', title: '3. VIP Reactivation Tactics' },
      ],
      contentBlocks: [
        {
          heading: '1. The One-and-Done Problem',
          paragraphs: [
            'Most D2C brands spend 90% of their energy on customer acquisition and settle for 10% repeat purchase rates. In an era of high ad CPMs, repeat purchases represent virtually all net operating profit.',
          ],
        },
        {
          heading: '2. Pacing by Consumption Velocity',
          paragraphs: [
            'Instead of sending replenishment reminders at generic 30-day marks, we calculate when customers will actually finish their product based on purchase weight and usage frequency.',
          ],
        },
        {
          heading: '3. VIP Reactivation Tactics',
          paragraphs: [
            'Rewarding top 10% LTV customers with secret drops and direct founder notes created a moat that stabilized cash flow throughout off-peak retail quarters.',
          ],
        },
      ],
      relatedSlugs: ['scaling-meta-ads', 'cro-high-dropoff'],
    },
  ] as BlogPostDetail[],

  // TOOLS & CERTIFICATIONS
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

  certifications: [
    {
      name: 'Google Ads Search & Display',
      issuer: 'Google Skillshop Certified',
      id: '884-GA-91',
      icon: 'ads_click',
      color: 'text-primary',
    },
    {
      name: 'Google Analytics 4 (GA4)',
      issuer: 'Measurement & Event Auditing',
      id: '412-GA4-02',
      icon: 'monitoring',
      color: 'text-secondary',
    },
    {
      name: 'Meta Certified Media Buyer',
      issuer: 'Meta Blueprint Professional',
      id: '109-MB-74',
      icon: 'verified_user',
      color: 'text-primary',
    },
    {
      name: 'HubSpot Inbound & Content',
      issuer: 'HubSpot Academy Certified',
      id: '673-HB-30',
      icon: 'mark_email_unread',
      color: 'text-tertiary',
    },
  ],

  testimonials: [
    {
      name: 'Siddharth Kapoor',
      role: 'Founder & CEO',
      company: 'FinNova',
      avatarInitials: 'SK',
      avatarBg: 'bg-primary-container',
      avatarColor: 'text-on-primary',
      quote:
        'Alex completely reworked our paid social approach. In 90 days, our customer acquisition cost plummeted by 38% while revenue nearly doubled. The most analytical marketer I’ve worked with.',
      rating: 5,
    },
    {
      name: 'Rhea Verma',
      role: 'Chief Marketing Officer',
      company: 'CureStack',
      avatarInitials: 'RV',
      avatarBg: 'bg-secondary-fixed',
      avatarColor: 'text-on-secondary-fixed',
      quote:
        'Our organic search was practically stagnant until Alex restructured our technical taxonomy. Organic leads went from 50 to 300+ monthly without relying purely on paid ads.',
      rating: 5,
    },
    {
      name: 'Manish Nair',
      role: 'VP Growth',
      company: 'UrbanWear D2C',
      avatarInitials: 'MN',
      avatarBg: 'bg-tertiary-fixed',
      avatarColor: 'text-on-tertiary-fixed',
      quote:
        'Alex doesn’t just manage ad campaigns; he builds entire acquisition engines. His retention email flows now account for 27% of our monthly recurring revenue on autopilot.',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Founder & CEO',
      company: 'CloudPulse (Series A)',
      avatarInitials: 'MV',
      avatarBg: 'bg-primary',
      avatarColor: 'text-white',
      avatarImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBtE94Ry0cmjReAlgWpNufbIVAbuLAAP8QmmeAjHF_exAwZFfAea2YqOpJwHGi5klBIMI2ECNmBoMo_w3EylTq76JT5a__Pbfb5kxFq7OqGiMh4ilcuiEWs4Xmz0xF_zCXDSxDYIpeGodIZIAdaR6HDdQcKqiqmiZ9FlwanpzqnxfTxUzo1UYl11WMCtqbdKdPrYH4oim-QLOGf7UbfIxzFvzXtrhKx3MC6hGOfOss',
      quote:
        'Alex didn’t just present vanity metrics; he systematically re-engineered our acquisition channel economics. Our CAC went down by 42% while enterprise ARR shot through the roof.',
      rating: 5,
    },
  ],

  methodologySteps: [
    {
      number: '01',
      title: 'Deep Audit & Hygiene',
      description: 'Auditing pixel triggers, server-side data logs, crawl index coverage, and spend inefficiencies.',
      timeframe: 'Days 1-7',
      icon: 'verified',
    },
    {
      number: '02',
      title: 'Growth Hypothesis',
      description: 'Constructing an ICE-prioritized experimentation backlog and multi-touch channel matrix.',
      timeframe: 'Days 8-14',
      icon: 'tune',
    },
    {
      number: '03',
      title: 'Rapid Execution',
      description: 'Deploying new ad creative batches, landing page tests, and targeted backlink outreach engines.',
      timeframe: 'Weeks 3-4',
      icon: 'rocket_launch',
    },
    {
      number: '04',
      title: 'Scientific CRO',
      description: 'Continuous heuristic analysis, heatmaps, form field drop-off tests, and statistical significance tracking.',
      timeframe: 'Ongoing',
      icon: 'science',
    },
    {
      number: '05',
      title: 'Scale & Reporting',
      description: 'Budget expansion on winning angles with live Looker Studio executive telemetry dashboards.',
      timeframe: 'Compounding',
      icon: 'trending_up',
    },
  ],

  faqs: [
    {
      id: 'pricing',
      question: 'What pricing models do you offer (retainer vs. performance)?',
      answer:
        'Most engagements operate on a transparent monthly advisory retainer based on the scope and complexity of channels managed. For high-growth DTC or B2B SaaS accounts spending over $40k/month, a hybrid model (base retainer + agreed performance bonus tied to verified net profit or target ROAS thresholds) is available after an initial 90-day baseline period.',
    },
    {
      id: 'timelines',
      question: 'What are the typical project timelines before seeing results?',
      answer:
        'Paid acquisition experiments and CRO landing page adjustments generate measurable traction within 14 to 21 days of launch. Organic search engine optimization and programmatic content strategies represent compounding investments, typically yielding measurable organic pipeline expansion within 60 to 90 days.',
    },
    {
      id: 'reporting',
      question: 'How does weekly reporting and operational communication work?',
      answer:
        'You receive access to a live 24/7 Looker Studio dashboard connected directly to your ad platforms, GA4, and CRM. Every Monday starts with an asynchronous video executive summary of key experiments, followed by a scheduled 30-minute bi-weekly strategy sprint call with decision-makers.',
    },
    {
      id: 'contracts',
      question: 'Do you require long-term lock-in contracts?',
      answer:
        'No. Engagements begin with an initial 90-day sprint agreement to establish tracking hygiene and validate growth hypotheses. Afterwards, agreements shift to a flexible month-to-month commitment with a standard 30-day notice period. I believe partnerships should be renewed based on measurable ROI, not legal lock-ins.',
    },
    {
      id: 'permissions',
      question: 'What access permissions do you need from our team?',
      answer:
        'During onboarding, we request standard partner/agency delegate access to Google Tag Manager, Google Analytics 4, Meta Business Manager, Google Ads, and your CMS or email platform. You retain full administrative master ownership at all times.',
    },
  ],
};
