import React, { useState, useEffect } from 'react';
import { PORTFOLIO_DATA, ShowcaseItem, RankedSite, BlogPostDetail } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioContext';
import { submitInboundForm } from '../lib/portfolioService';
import { RoasCalculator } from './RoasCalculator';

interface HomeViewProps {
  onOpenAudit: () => void;
  onOpenLightboxById: (id: string) => void;
}

// Custom animated counter hook
function useAnimatedCounter(targetValue: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Number((easeProgress * targetValue).toFixed(targetValue % 1 === 0 ? 0 : 1)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return value;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAudit,
  onOpenLightboxById,
}) => {
  const { services, showcase, blogPosts, testimonials, settings } = usePortfolioData();

  // Animated metric counters
  const c1 = useAnimatedCounter(120);
  const c2 = useAnimatedCounter(4.5);
  const c3 = useAnimatedCounter(50);
  const c4 = useAnimatedCounter(30);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setIsSubmitting(true);
    setContactError(null);

    // Save to local storage for offline continuity
    try {
      const msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      msgs.push({ ...contactForm, sentAt: new Date().toISOString() });
      localStorage.setItem('portfolio_messages', JSON.stringify(msgs));
    } catch {
      // ignore
    }

    // Submit to Firestore submissions collection
    try {
      const res = await submitInboundForm({
        type: 'contact',
        name: contactForm.name,
        email: contactForm.email,
        company: contactForm.company,
        message: contactForm.message,
        honeypot,
        sourcePage: window.location.hash || '#/',
      });
      if (!res.success && res.error) {
        console.warn('Firestore submission notice:', res.error);
      }
    } catch (err: any) {
      console.warn('Submission fallback applied:', err);
    } finally {
      setIsSubmitting(false);
      setContactSubmitted(true);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(label);
    setTimeout(() => setCopiedChannel(null), 2500);
  };

  const handleDownloadCv = (e: React.MouseEvent) => {
    e.preventDefault();
    const content = `ALEX RIVERA | SENIOR GROWTH MARKETER & SEO ARCHITECT
Email: alex@growthmark.io | Website: https://growthmark.io

SUMMARY:
7+ years driving full-funnel revenue growth across B2B SaaS and D2C brands.
Managed over $42M in blended ad spend with 4.8x average ROAS. 
Scaled organic search from 40k to 520k+ monthly visits.

CORE COMPETENCIES:
- Performance Marketing: Meta Ads (CBO/ABO), Google Search & Performance Max, YouTube Ads
- Search Engine Optimization: Programmatic SEO, Core Web Vitals remediation, semantic clustering
- Lifecycle Retention: Klaviyo automation, behavioral triggers, churn mitigation
- Analytics & Attribution: Server-side GTM, GA4 custom schema, BigQuery SQL

EXPERIENCE:
- Lead Growth Consultant (2022 - Present): Scaled 12+ tech companies past $1M ARR.
- Senior Performance Marketing Manager, Nexus Digital (2020 - 2022): Managed $15M+ media budget.
- Growth & SEO Specialist, Elevate E-Commerce (2018 - 2020): Led SEO architecture and content hubs.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Alex_Rivera_Growth_Marketer_Resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      q: 'What is your typical engagement model?',
      a: 'I partner on monthly growth advisory retainers with flexible milestone sprints, or dedicated 14-day diagnostic teardowns (such as full GA4 audit, Google Search Console recovery, or Meta ad account re-architecture). There are no long-term restrictive locks.',
    },
    {
      q: 'How quickly do we see organic search and paid ad results?',
      a: 'Paid media efficiency improvements, bid optimization, and pixel server-side telemetry updates take effect within 7 to 10 days. Organic search technical recoveries typically index within 21 to 30 days, compounding into top-3 commercial rankings by days 60 to 90.',
    },
    {
      q: 'Do you work with our existing in-house team or execute solo?',
      a: 'I adapt to your team structure. I can execute complete hands-on technical deployments (GTM server containers, creative testing matrices, programmatic URL taxonomy) or coach and lead your existing marketing specialists through prioritized sprint backlogs.',
    },
    {
      q: 'What monthly ad spend range do you specialize in?',
      a: 'My performance frameworks are calibrated for brands spending between ₹3L/month and ₹50L/month ($4,000 to $65,000/month), ensuring statistical significance for creative testing and machine-learning bid algorithms.',
    },
    {
      q: 'How does your growth audit differ from a generic agency pitch?',
      a: 'Unlike agencies that hand-wave with boilerplate slides, my 30-minute diagnostic examines real Search Console indexation logs, server-side attribution discrepancies, and unit economics. You receive an actionable prioritized punch list regardless of whether we collaborate.',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION (id="home") */}
      <section
        id="home"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60 relative overflow-hidden"
      >
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/40 text-primary font-label-sm text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>{PORTFOLIO_DATA.profile.roleTag}</span>
            </div>

            {/* Headline */}
            <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-on-surface tracking-tight font-bold leading-tight">
              I help brands grow with <span className="text-primary-container">SEO</span> and{' '}
              <span className="text-primary-container">performance marketing</span>
            </h1>

            {/* Subtext */}
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              {PORTFOLIO_DATA.profile.subtext}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#/works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-label-md text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all font-semibold"
              >
                <span>View My Works</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>

              <button
                onClick={onOpenAudit}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-low text-on-surface font-label-md text-sm hover:bg-surface-container hover:text-primary transition-all font-semibold border border-neutral-200/80 cursor-pointer"
              >
                <span>Hire Me</span>
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </button>
            </div>

            {/* Trust Mini-Proof */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-on-surface-variant text-xs font-semibold">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
              <span>Trusted by 30+ Growth-Stage Startups &amp; Enterprise Brands</span>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-surface-container-low ring-1 ring-neutral-200/80">
              <img
                alt="Alex Rivera - Growth Marketer"
                className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                src={PORTFOLIO_DATA.profile.avatar}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Badge 1: +120% Traffic */}
            <div className="absolute -bottom-4 -left-4 sm:left-2 bg-surface-container-lowest/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg flex items-center gap-3 border border-neutral-200/70">
              <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">trending_up</span>
              </div>
              <div>
                <div className="font-headline-md text-base text-secondary font-bold font-mono">
                  +120%
                </div>
                <div className="text-[11px] text-on-surface-variant font-medium">
                  Organic Traffic Growth
                </div>
              </div>
            </div>

            {/* Badge 2: 4.5x ROAS */}
            <div className="absolute -top-3 -right-2 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 border border-neutral-200/70">
              <span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span>
              <div>
                <div className="text-xs text-on-surface font-bold">4.5x Average ROAS</div>
                <div className="text-[10px] text-on-surface-variant">Blended Acquisition</div>
              </div>
            </div>

            {/* Badge 3: Verified Partner */}
            <div className="hidden sm:flex absolute top-1/2 -right-6 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg items-center gap-2 border border-neutral-200/70">
              <span
                className="material-symbols-outlined text-primary text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="text-xs text-on-surface font-semibold">
                Meta &amp; Google Partner
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRICS BAR WITH ANIMATED COUNTERS */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-10 border-y sm:border-y-0 border-neutral-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Item 1: Organic Traffic */}
          <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl flex flex-col gap-1 border border-neutral-200/60 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
                +{c1}%
              </span>
              <span className="material-symbols-outlined text-[28px]">query_stats</span>
            </div>
            <div className="font-bold text-sm text-on-surface pt-1">Organic Traffic</div>
            <div className="text-xs text-on-surface-variant">
              Avg. 6-Month Organic Uplift Across Audited Clients
            </div>
          </div>

          {/* Item 2: Blended ROAS */}
          <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl flex flex-col gap-1 border border-neutral-200/60 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between text-primary-container">
              <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
                {c2}x
              </span>
              <span className="material-symbols-outlined text-[28px]">percent</span>
            </div>
            <div className="font-bold text-sm text-on-surface pt-1">Blended ROAS</div>
            <div className="text-xs text-on-surface-variant">
              Average Return on Ad Spend Across Meta &amp; Google
            </div>
          </div>

          {/* Item 3: Ad Spend Managed */}
          <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl flex flex-col gap-1 border border-neutral-200/60 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between text-on-surface">
              <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
                ₹{c3}L+
              </span>
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <div className="font-bold text-sm text-on-surface pt-1">Ad Spend Managed</div>
            <div className="text-xs text-on-surface-variant">
              Over Google &amp; Meta Ads Campaigns with Zero Wastage
            </div>
          </div>

          {/* Item 4: Engagements */}
          <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl flex flex-col gap-1 border border-neutral-200/60 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
                {c4}+
              </span>
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div className="font-bold text-sm text-on-surface pt-1">Completed Engagements</div>
            <div className="text-xs text-on-surface-variant">
              Enterprise &amp; D2C Brands with Documented Growth
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION (id="about") - Full comprehensive About details */}
      <section
        id="about"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        {/* About Bio Header */}
        <div className="flex flex-col gap-3 mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Available for Q3/Q4 Advisory</span>
          </div>

          <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            Driven by Data, Obsessed with Scalable Revenue Growth.
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Over the past 7+ years, I’ve operated at the intersection of quantitative analytics, performance acquisition, and full-funnel CRO. I treat marketing not as an expense line, but as a compounding asset engine calibrated directly against net margins and unit economics.
          </p>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            From scaling Series A disruptors past eight figures in ARR to orchestrating multimillion-dollar omnichannel ad budgets, my methodology replaces guesswork with rigorous hypothesis validation and server-side tracking integrity.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={handleDownloadCv}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold shadow hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Resume / CV</span>
            </button>
            <button
              onClick={onOpenAudit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm font-semibold border border-neutral-200 hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
              <span>Book Strategy Call</span>
            </button>
          </div>
        </div>

        {/* 4 Guiding Principles */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            Core Philosophy
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-6">
            4 Principles Guiding Every Growth Campaign
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary block mb-2">01</span>
                <h4 className="font-bold text-base text-on-surface mb-1">Unit Economics First</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  We never scale ad spend without validating true Contribution Margin (CM3) and LTV:CAC ratios exceeding 3:1.
                </p>
              </div>
              <span className="text-[10px] text-secondary font-semibold mt-4 block">No Vanity Metrics</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary block mb-2">02</span>
                <h4 className="font-bold text-base text-on-surface mb-1">Hypothesis-Driven</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Every ad creative, copy variation, and landing page experiment is registered with statistical power and pre-defined stop-loss criteria.
                </p>
              </div>
              <span className="text-[10px] text-primary font-semibold mt-4 block">Rapid Scientific Cadence</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary block mb-2">03</span>
                <h4 className="font-bold text-base text-on-surface mb-1">Algorithmic Compounding</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Search rankings survive Google Core Updates because they leverage topical entity clustering, fast Core Web Vitals, and real user utility.
                </p>
              </div>
              <span className="text-[10px] text-secondary font-semibold mt-4 block">100% White-Hat Systems</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary block mb-2">04</span>
                <h4 className="font-bold text-base text-on-surface mb-1">Telemetry Integrity</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Client-side cookies fail. We implement first-party server-side tracking (CAPI) and BigQuery schemas for accurate EBITDA attribution.
                </p>
              </div>
              <span className="text-[10px] text-primary font-semibold mt-4 block">Zero Attribution Leakage</span>
            </div>
          </div>
        </div>

        {/* Career Timeline */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Track Record
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-6">
            Career Timeline &amp; Milestones
          </h3>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-on-surface">Lead Growth Consultant</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">Present</span>
                </div>
                <span className="text-xs text-primary font-semibold block">Independent Practice • SF &amp; Mumbai</span>
                <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                  Advised 12+ tech companies and high-growth consumer brands. Spearheaded programmatic SEO architectures and Meta ad frameworks scaling client portfolios past $10M ARR.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface-variant whitespace-nowrap">2022 — Present</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-base text-on-surface block">Senior Performance Marketing Manager</span>
                <span className="text-xs text-on-surface-variant font-medium block">Nexus Digital Media</span>
                <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                  Managed $15M+ annual ad budgets across Google Search, Performance Max, and Meta. Cut client acquisition costs by 34% while lifting blended revenue across 8 accounts.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface-variant whitespace-nowrap">2020 — 2022</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-base text-on-surface block">Growth &amp; Technical SEO Specialist</span>
                <span className="text-xs text-on-surface-variant font-medium block">Elevate E-Commerce</span>
                <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                  Built technical content hierarchies and programmatic landing engines. Grew organic traffic from 40,000 to over 500,000 monthly unique visits.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface-variant whitespace-nowrap">2018 — 2020</span>
            </div>
          </div>
        </div>

        {/* Certifications & Personal Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-neutral-200/60">
          {/* Certifications */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-neutral-200/70">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
              Accreditations
            </span>
            <h4 className="font-bold text-base text-on-surface mb-4">Official Certifications</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                <div>
                  <div className="text-xs font-bold text-on-surface">Google Ads Search &amp; Measurement Certified</div>
                  <div className="text-[10px] text-on-surface-variant">Google Partners • Active 2024</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                <div>
                  <div className="text-xs font-bold text-on-surface">Meta Certified Media Buying Professional</div>
                  <div className="text-[10px] text-on-surface-variant">Meta Blueprint • 100/100 Audit Score</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                <div>
                  <div className="text-xs font-bold text-on-surface">GA4 &amp; GTM Server-Side Practitioner</div>
                  <div className="text-[10px] text-on-surface-variant">Google Analytics Academy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Balance */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-neutral-200/70">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
              Beyond the Spreadsheets
            </span>
            <h4 className="font-bold text-base text-on-surface mb-4">Personal Balance &amp; Drive</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container border border-neutral-200/50">
                <span className="font-bold text-on-surface block">🏃 Ultra Running</span>
                <span className="text-on-surface-variant text-[11px]">50km mountain trail finisher</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-neutral-200/50">
                <span className="font-bold text-on-surface block">☕ Specialty Coffee</span>
                <span className="text-on-surface-variant text-[11px]">V60 pour-over single-origin roaster</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-neutral-200/50">
                <span className="font-bold text-on-surface block">♟️ Speed Chess</span>
                <span className="text-on-surface-variant text-[11px]">1850+ blitz rating on Chess.com</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-neutral-200/50">
                <span className="font-bold text-on-surface block">💻 Open Source</span>
                <span className="text-on-surface-variant text-[11px]">SEO scraping &amp; GTM script author</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES OVERVIEW (id="services") */}
      <section
        id="services"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Capabilities
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Full-Funnel Growth Services
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1">
              Engineered frameworks to eliminate acquisition bottlenecks and compound predictable customer pipelines.
            </p>
          </div>
          <a
            href="#/services"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 whitespace-nowrap"
          >
            <span>View all services</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(services.length > 0 ? services : PORTFOLIO_DATA.services).map((service) => (
            <a
              key={service.slug}
              href={`#/services/${service.slug}`}
              className="bg-surface-container-low p-6 sm:p-7 rounded-2xl flex flex-col justify-between border border-neutral-200/70 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
                </div>
                <h3 className="font-bold text-lg text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  {service.summary}
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-primary font-semibold">
                <span>View practice details</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 5. WORKS & SHOWCASE (id="works") */}
      <section
        id="works"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
              Visual Proof &amp; Artifacts
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Works &amp; Deliverables Showcase
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1">
              Live production creatives, telemetry dashboards, Search Console logs, and real ranking ecosystems.
            </p>
          </div>
          <a
            href="#/works"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 whitespace-nowrap"
          >
            <span>View full portfolio</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        {/* 6 Mixed Deliverables Masonry Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(showcase.length > 0 ? showcase : PORTFOLIO_DATA.showcase).slice(0, 6).map((item: ShowcaseItem) => (
            <div
              key={item.id}
              onClick={() => onOpenLightboxById(item.id)}
              className="bg-surface-container-low rounded-2xl overflow-hidden border border-neutral-200/70 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    alt={item.title}
                    src={item.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[11px] font-semibold border border-white/20 capitalize">
                      {item.badge || item.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                    {item.client}
                  </span>
                  <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {item.title}
                  </h4>
                  {item.highlight && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-container/40 text-secondary text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>{item.highlight}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs text-primary font-semibold border-t border-neutral-200/40 mt-2">
                <span>View Proof Artifact</span>
                <span className="material-symbols-outlined text-[16px]">fullscreen</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sites I've Ranked #1 to #3 Strip */}
        <div className="pt-8 border-t border-neutral-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                Organic Search Proof
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                Sites I've Ranked #1 to #3
              </h3>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>100% White-Hat Algorithmic Compounding</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PORTFOLIO_DATA.rankedSites.map((site: RankedSite, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-container-low border border-neutral-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-on-surface">{site.domain}</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary text-[10px] font-bold">
                      {site.rankBadge}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant block mb-2">{site.industry}</span>
                  <div className="text-xs font-medium text-neutral-600">
                    Keyword: <span className="text-on-surface font-semibold">"{site.keyword}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW I WORK (id="process") */}
      <section
        id="process"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
            Methodology
          </span>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
            Proven 5-Stage Growth Framework
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2">
            Every engagement follows a battle-tested protocol to ensure minimum ad waste, zero vanity metrics, and compounding bottom-line returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {PORTFOLIO_DATA.methodologySteps.map((step) => (
            <div
              key={step.number}
              className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between border border-neutral-200/70 hover:-translate-y-1 transition-all"
            >
              <div>
                <span className="font-mono text-2xl font-bold text-primary-container block mb-2">
                  {step.number}
                </span>
                <h4 className="font-bold text-base text-on-surface mb-2">{step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-200/50 flex items-center gap-1.5 text-xs font-semibold text-secondary">
                <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                <span>{step.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TOOLS I USE */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-10 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Ecosystem
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface">Tools &amp; Stack I Use</h3>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
            Certified enterprise toolkit for real-time tracking, organic SERP crawls, and precision ad routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {PORTFOLIO_DATA.tools.map((tool, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface text-xs sm:text-sm font-semibold border border-neutral-200/70 hover:bg-surface-container transition-all"
            >
              <span className={`material-symbols-outlined ${tool.color} text-[18px]`}>{tool.icon}</span>
              <span>{tool.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ROAS & GROWTH ROI CALCULATOR */}
      <section className="w-full mb-4 sm:mb-[40px]">
        <RoasCalculator onBookAudit={onOpenAudit} />
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Client Endorsements
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              What Founders &amp; Heads of Growth Say
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
            Unfiltered feedback from direct growth engagements across D2C and SaaS brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(testimonials.length > 0 ? testimonials : PORTFOLIO_DATA.testimonials).slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-surface-container-low p-6 sm:p-7 rounded-2xl flex flex-col justify-between border border-neutral-200/70"
            >
              <div>
                <div className="flex items-center text-amber-500 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-on-surface italic leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60">
                {item.avatarImage ? (
                  <img
                    src={item.avatarImage}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full ${item.avatarBg} ${item.avatarColor} flex items-center justify-center font-bold text-xs`}
                  >
                    {item.avatarInitials}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-on-surface">{item.name}</div>
                  <div className="text-[11px] text-on-surface-variant">
                    {item.role}, {item.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. BLOG (id="blog") */}
      <section
        id="blog"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Field Insights
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Growth Playbooks &amp; Articles
            </h2>
          </div>
          <a
            href="#/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-blue-700 whitespace-nowrap"
          >
            <span>View all articles</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {((blogPosts.length > 0 ? blogPosts : PORTFOLIO_DATA.blogPosts) as BlogPostDetail[]).slice(0, 3).map((post) => (
            <a
              key={post.slug}
              href={`#/blog/${post.slug}`}
              className="bg-surface-container-low rounded-2xl overflow-hidden flex flex-col justify-between border border-neutral-200/70 hover:-translate-y-1 hover:shadow-lg transition-all group"
            >
              <div>
                <div className="w-full h-44 overflow-hidden bg-slate-900 relative">
                  <img
                    alt={post.title}
                    src={post.coverImage}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-900 text-[10px] font-bold shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-200/50 mt-2 flex items-center justify-between text-xs text-primary font-semibold">
                <span>Read Article</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section className="w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Clarity &amp; Terms
            </span>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-200/80 bg-surface-container-low overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-on-surface text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        isOpen ? 'rotate-180 text-primary' : 'text-neutral-500'
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-neutral-200/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. CONTACT SECTION (id="contact") */}
      <section
        id="contact"
        className="scroll-mt-28 w-full bg-surface-container-lowest rounded-none sm:rounded-3xl shadow-none sm:shadow-xl ring-0 sm:ring-1 sm:ring-neutral-200/80 mb-4 sm:mb-[40px] p-4 sm:p-6 md:p-12 border-y sm:border-y-0 border-neutral-200/60"
      >
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Direct Advisory &amp; Inquiries
          </div>
          <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            Let’s Build Your Predictable Acquisition Engine
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2">
            Whether you want an exhaustive ad account teardown, an enterprise SEO rebuild, or full-funnel CRO strategy, reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info & Quick Booking */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* 30-min Booking Card */}
            <div className="bg-gradient-to-br from-primary-container to-primary rounded-2xl p-6 sm:p-7 text-white shadow-lg">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-primary-fixed">
                Fastest Path to Answers
              </span>
              <h3 className="text-xl font-bold mt-1 text-white">
                Schedule a 30-Min Diagnostic
              </h3>
              <p className="text-xs text-primary-fixed mt-2 leading-relaxed">
                Skip email back-and-forth. Pick a time directly for a forensic review of your current telemetry and unit economics.
              </p>

              <button
                onClick={onOpenAudit}
                className="mt-5 w-full py-3 px-5 rounded-xl bg-white text-primary font-bold text-xs sm:text-sm shadow hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Growth Diagnostic</span>
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </button>
            </div>

            {/* Direct Details */}
            <div className="bg-surface-container-low rounded-2xl p-5 border border-neutral-200/70 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Direct Channels
              </h4>

              {/* Email */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-neutral-200/50">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                  <div className="truncate">
                    <span className="text-[10px] text-on-surface-variant block">Email</span>
                    <span className="text-xs font-semibold text-on-surface truncate block">
                      {settings.contact.email || PORTFOLIO_DATA.profile.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(settings.contact.email || PORTFOLIO_DATA.profile.email, 'email')}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors"
                  title="Copy email"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedChannel === 'email' ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-neutral-200/50">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">call</span>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Direct Line</span>
                    <span className="text-xs font-semibold text-on-surface">
                      {settings.contact.phone || PORTFOLIO_DATA.profile.phone}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(settings.contact.phone || PORTFOLIO_DATA.profile.phone, 'phone')}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors"
                  title="Copy phone"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedChannel === 'phone' ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-neutral-200/50 text-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Primary Locations</span>
                  <span className="font-semibold text-on-surface">{settings.contact.location || PORTFOLIO_DATA.profile.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Intake Form */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-neutral-200/70">
            <h3 className="text-lg font-bold text-on-surface mb-2">Send an Advisory Inquiry</h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              I reply to all direct inbound inquiries within 24 hours Monday through Friday.
            </p>

            {contactSubmitted ? (
              <div className="p-5 rounded-xl bg-secondary-container/40 text-secondary border border-secondary/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                <div>
                  <div className="font-bold text-sm">Message Transmitted!</div>
                  <div className="text-xs mt-0.5">Thank you, {contactForm.name}. I will review your submission and reply shortly.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {/* Honeypot field for bot protection */}
                <input
                  type="text"
                  name="website"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-neutral-200 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="maya@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-neutral-200 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Company / Website
                  </label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-neutral-200 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    What challenges are you looking to solve?
                  </label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell me about your current ad spend, CAC targets, or organic search roadblocks..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-neutral-200 text-xs sm:text-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  ></textarea>
                </div>

                {contactError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{contactError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Transmitting...' : 'Submit Advisory Request'}</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
