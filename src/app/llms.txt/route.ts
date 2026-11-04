import { NextRequest } from 'next/server';
import {
  getServices,
  getWorks,
  getPosts,
  getSiteSettings,
  DEFAULT_SETTINGS,
  SiteSettings,
} from '@/lib/data';
import { PORTFOLIO_DATA } from '@/data/portfolioData';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'alexriveragrowth.com';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = process.env.APP_URL
    ? process.env.APP_URL.replace(/\/$/, '')
    : `${proto}://${host}`;

  const [services, works, posts, settings] = await Promise.all([
    getServices(),
    getWorks(),
    getPosts(),
    getSiteSettings(),
  ]);

  const activeServices = services.length > 0 ? services : PORTFOLIO_DATA.services;
  const activeWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const activePosts = posts.length > 0 ? posts : PORTFOLIO_DATA.blogPosts;
  const activeSettings: SiteSettings = settings || DEFAULT_SETTINGS;

  const lines: string[] = [];

  // 1. Header & Summary (Standard llms.txt format)
  lines.push(`# ${activeSettings.name || 'Alex Rivera'} | Growth Marketing & Performance Portfolio`);
  lines.push('');
  lines.push(`> ${activeSettings.hero?.subtext || 'Helping high-growth B2B SaaS and D2C brands scale with quantitative SEO, performance marketing, and server-side tracking integrity.'}`);
  lines.push('');
  lines.push(
    'Alex Rivera is a Senior Growth Marketer and Performance Marketing Specialist with 7+ years of experience engineering data-driven acquisition engines for venture-backed B2B SaaS platforms and high-velocity D2C eCommerce brands. Specialized in Google & Meta Ads optimization, algorithmic SEO architecture, server-side attribution telemetry, and conversion rate optimization (CRO).'
  );
  lines.push('');

  // 2. Verified Track Record & Key Performance Indicators
  lines.push('## Verified Track Record');
  lines.push(`- Organic Traffic: ${activeSettings.metrics?.metric1?.value || '+120%'} (${activeSettings.metrics?.metric1?.desc || 'Average 6-month organic search uplift across audited clients'})`);
  lines.push(`- Return On Ad Spend: ${activeSettings.metrics?.metric2?.value || '4.5x'} (${activeSettings.metrics?.metric2?.desc || 'Blended ROAS across Meta Ads & Google Ads campaigns'})`);
  lines.push(`- Ad Capital Managed: ${activeSettings.metrics?.metric3?.value || '₹50L+'} (${activeSettings.metrics?.metric3?.desc || 'Managed ad spend across full-funnel paid media with zero budget leakage'})`);
  lines.push(`- Completed Engagements: ${activeSettings.metrics?.metric4?.value || '30+'} (${activeSettings.metrics?.metric4?.desc || 'Enterprise & D2C clients with documented growth trajectories'})`);
  lines.push('');

  // 3. Core Growth Services
  lines.push('## Core Services');
  for (const s of activeServices) {
    const serviceUrl = `${baseUrl}/services/${s.slug}`;
    lines.push(`- [${s.title}](${serviceUrl}): ${s.summary}`);
    if (s.deliverables && s.deliverables.length > 0) {
      lines.push(`  - Deliverables: ${s.deliverables.slice(0, 4).join(', ')}`);
    }
  }
  lines.push('');

  // 4. Case Studies & Proven Results
  lines.push('## Case Studies & Work');
  for (const w of activeWorks) {
    const workUrl = `${baseUrl}/works/${w.slug}`;
    const statsSummary =
      w.stats && w.stats.length > 0
        ? w.stats.map((st) => `${st.value} ${st.label}`).join(' | ')
        : w.result || '';
    lines.push(`- [${w.title} — ${w.client}](${workUrl}): ${w.goal}`);
    if (statsSummary) {
      lines.push(`  - Impact: ${statsSummary}`);
    }
  }
  lines.push('');

  // 5. Educational Playbooks & Articles
  lines.push('## Playbooks & Growth Guides');
  for (const p of activePosts) {
    const postUrl = `${baseUrl}/blog/${p.slug}`;
    lines.push(`- [${p.title}](${postUrl}): ${p.readTime || '5 min read'} — ${p.excerpt}`);
  }
  lines.push('');

  // 6. Technology & Measurement Stack
  lines.push('## Technology & Measurement Stack');
  lines.push('- Paid Acquisition: Google Ads (Search, Performance Max, YouTube, Display), Meta Ads Manager (Advantage+, Lookalikes, Dynamic Creative), LinkedIn Campaign Manager');
  lines.push('- SEO & Technical Auditing: Screaming Frog SEO Spider, Ahrefs, SEMrush, Google Search Console, Schema.org Structured Data, Programmatic SSR');
  lines.push('- Tracking & Attribution: Server-Side Google Tag Manager (sGTM), GA4 BigQuery Export, Looker Studio BI, Stape.io, Meta Conversions API (CAPI)');
  lines.push('- Conversion Rate Optimization: Microsoft Clarity, Hotjar, Unbounce, Framer, Webflow, VWO, Tailwind CSS');
  lines.push('');

  // 7. Engagement & Booking Model
  lines.push('## Engagement Model & Booking');
  lines.push(`- Diagnostic Audit: Complimentary 30-minute growth diagnostic session bookable at ${baseUrl}/#home`);
  lines.push(`- Primary Email: ${activeSettings.contact?.email || 'alex@alexriveragrowth.com'}`);
  lines.push(`- Location: ${activeSettings.contact?.location || 'San Francisco, CA & Remote'}`);
  lines.push(`- Full Unabridged Documentation: ${baseUrl}/llms-full.txt`);
  lines.push('');

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
