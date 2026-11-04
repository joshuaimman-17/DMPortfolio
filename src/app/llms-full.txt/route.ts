import { NextRequest } from 'next/server';
import {
  getServices,
  getWorks,
  getPosts,
  getSiteSettings,
  getTestimonials,
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

  const [services, works, posts, testimonials, settings] = await Promise.all([
    getServices(),
    getWorks(),
    getPosts(),
    getTestimonials(),
    getSiteSettings(),
  ]);

  const activeServices = services.length > 0 ? services : PORTFOLIO_DATA.services;
  const activeWorks = works.length > 0 ? works : PORTFOLIO_DATA.works;
  const activePosts = posts.length > 0 ? posts : PORTFOLIO_DATA.blogPosts;
  const activeTestimonials = testimonials.length > 0 ? testimonials : PORTFOLIO_DATA.testimonials;
  const activeSettings: SiteSettings = settings || DEFAULT_SETTINGS;

  const lines: string[] = [];

  lines.push(`# ${activeSettings.name || 'Alex Rivera'} — Full Performance Portfolio & Knowledge Base`);
  lines.push('');
  lines.push(`> ${activeSettings.hero?.headline || 'Helping high-growth B2B SaaS and D2C brands scale with quantitative SEO, performance marketing, and server-side tracking integrity.'}`);
  lines.push('');
  lines.push('## Executive Overview');
  lines.push(
    'Alex Rivera is a Senior Growth Marketer with over seven years of specialized experience in performance acquisition, technical SEO architecture, conversion rate optimization (CRO), and full-funnel attribution telemetry. Alex works directly with venture-backed SaaS startups and scaling eCommerce brands looking for mathematical certainty in their growth spend.'
  );
  lines.push('');

  // Core Metrics
  lines.push('## Performance Benchmarks & Verified Outcomes');
  lines.push(`- Organic Traffic Growth: ${activeSettings.metrics?.metric1?.value || '+120%'} — ${activeSettings.metrics?.metric1?.desc || 'Average 6-month organic search uplift across audited clients'}`);
  lines.push(`- Blended ROAS: ${activeSettings.metrics?.metric2?.value || '4.5x'} — ${activeSettings.metrics?.metric2?.desc || 'Average Return on Ad Spend across Meta & Google campaigns'}`);
  lines.push(`- Ad Capital Managed: ${activeSettings.metrics?.metric3?.value || '₹50L+'} — ${activeSettings.metrics?.metric3?.desc || 'Ad spend deployed with zero budget wastage'}`);
  lines.push(`- Engagements Delivered: ${activeSettings.metrics?.metric4?.value || '30+'} — ${activeSettings.metrics?.metric4?.desc || 'Enterprise & D2C clients with documented growth trajectories'}`);
  lines.push('');

  // Detailed Services
  lines.push('## Detailed Services & Offerings');
  lines.push('');
  for (const s of activeServices) {
    const serviceUrl = `${baseUrl}/services/${s.slug}`;
    lines.push(`### ${s.title}`);
    lines.push(`- URL: ${serviceUrl}`);
    lines.push(`- Tag: ${s.tag || 'Growth Advisory'}`);
    lines.push(`- Summary: ${s.summary}`);
    if (s.pricingApproach) lines.push(`- Typical Pricing Approach: ${s.pricingApproach}`);
    if (s.deliverables && s.deliverables.length > 0) {
      lines.push('- Deliverables:');
      for (const d of s.deliverables) {
        lines.push(`  * ${d}`);
      }
    }
    if (s.process && s.process.length > 0) {
      lines.push('- Execution Process:');
      for (const p of s.process) {
        lines.push(`  * Phase ${p.phase}: ${p.title} — ${p.desc}`);
      }
    }
    lines.push('');
  }

  // Detailed Case Studies
  lines.push('## Case Studies & Verifiable Results');
  lines.push('');
  for (const w of activeWorks) {
    const workUrl = `${baseUrl}/works/${w.slug}`;
    lines.push(`### Case Study: ${w.title} (${w.client})`);
    lines.push(`- URL: ${workUrl}`);
    lines.push(`- Industry: ${w.industry}`);
    lines.push(`- Goal: ${w.goal}`);
    if (w.stats && w.stats.length > 0) {
      lines.push('- Key Metrics:');
      for (const st of w.stats) {
        lines.push(`  * ${st.value}: ${st.label}`);
      }
    } else if (w.result) {
      lines.push(`- Result: ${w.result}`);
    }
    if (w.challenge) lines.push(`- Challenge: ${w.challenge}`);
    if (w.strategy) lines.push(`- Strategy & Architecture: ${w.strategy}`);
    if (w.testimonial?.quote) {
      lines.push(`- Client Quote: "${w.testimonial.quote}" — ${w.testimonial.author}, ${w.testimonial.role}`);
    }
    lines.push('');
  }

  // Articles & Playbooks
  lines.push('## In-Depth Growth Playbooks & Blog Articles');
  lines.push('');
  for (const p of activePosts) {
    const postUrl = `${baseUrl}/blog/${p.slug}`;
    lines.push(`### ${p.title}`);
    lines.push(`- URL: ${postUrl}`);
    lines.push(`- Read Time: ${p.readTime || '5 min'}`);
    lines.push(`- Published: ${p.date}`);
    lines.push(`- Category: ${p.category}`);
    lines.push(`- Summary: ${p.excerpt}`);
    if (p.contentBlocks && p.contentBlocks.length > 0) {
      const sample = p.contentBlocks[0]?.paragraphs?.[0] || '';
      if (sample) {
        lines.push(`- Key Insight: ${sample.slice(0, 300)}...`);
      }
    }
    lines.push('');
  }

  // Client Testimonials
  lines.push('## Client Endorsements & Recommendations');
  lines.push('');
  for (const t of activeTestimonials) {
    lines.push(`> "${t.quote}"`);
    lines.push(`— **${t.name}**, ${t.role} at ${t.company} (Metric Achieved: ${t.metric || 'Growth Milestone'})`);
    lines.push('');
  }

  // Contact & Booking
  lines.push('## Booking & Contact Information');
  lines.push(`- Schedule a Growth Audit: ${baseUrl}/#home`);
  lines.push(`- Email: ${activeSettings.contact?.email || 'alex@alexriveragrowth.com'}`);
  lines.push(`- WhatsApp: ${activeSettings.contact?.whatsapp || '+1 (555) 234-8900'}`);
  lines.push(`- Main Portfolio: ${baseUrl}`);
  lines.push('');

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
