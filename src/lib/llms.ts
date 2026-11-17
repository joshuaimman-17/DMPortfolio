import { getServices, getWorks, getPosts, getTestimonials, getSiteSettings } from '@/lib/data';
import { mergeHome } from '@/types/home-content';
import { getSiteUrl } from '@/lib/site-url';

/**
 * Builds llms.txt / llms-full.txt purely from live Firestore content (cached with tags, so any
 * admin save → revalidateTag/revalidatePath rebuilds these files). Nothing here is hard-coded copy.
 */
export async function buildLlmsText(full: boolean): Promise<string> {
  const baseUrl = getSiteUrl();
  const [services, works, posts, testimonials, settings] = await Promise.all([
    getServices(),
    getWorks(),
    getPosts(),
    full ? getTestimonials() : Promise.resolve([] as any[]),
    getSiteSettings(),
  ]);

  const home = mergeHome(settings.home);
  const name = settings.name || 'Portfolio';
  const L: string[] = [];
  const push = (...x: string[]) => L.push(...x);

  // ---- Header ----
  push(`# ${name}${settings.hero?.roleTag ? ` — ${settings.hero.roleTag}` : ''}`, '');
  if (settings.hero?.headline) push(`> ${settings.hero.headline}`, '');
  if (settings.hero?.subtext) push(settings.hero.subtext, '');
  if (full) {
    push('## About', '', home.about.heading, '', home.about.paragraph1, '', home.about.paragraph2, '');
  }

  // ---- Metrics ----
  const metrics = [settings.metrics?.metric1, settings.metrics?.metric2, settings.metrics?.metric3, settings.metrics?.metric4].filter(
    (m) => m && (m.value || m.label)
  );
  if (metrics.length) {
    push('## Verified Track Record');
    for (const m of metrics) push(`- ${m!.label}: ${m!.value}${m!.desc ? ` (${m!.desc})` : ''}`);
    push('');
  }

  // ---- Services ----
  if (services.length) {
    push('## Services', '');
    for (const s of services) {
      if (!full) {
        push(`- [${s.title}](${baseUrl}/services/${s.slug}): ${s.summary}`);
        if (s.deliverables?.length) push(`  - Deliverables: ${s.deliverables.slice(0, 4).join(', ')}`);
        continue;
      }
      push(`### ${s.title}`, `- URL: ${baseUrl}/services/${s.slug}`);
      if (s.tag) push(`- Tag: ${s.tag}`);
      push(`- Summary: ${s.summary}`);
      if (s.pricingApproach) push(`- Pricing approach: ${s.pricingApproach}`);
      if (s.deliverables?.length) {
        push('- Deliverables:');
        s.deliverables.forEach((d) => push(`  * ${d}`));
      }
      if (s.process?.length) {
        push('- Process:');
        s.process.forEach((p) => push(`  * ${p.phase}: ${p.title} — ${p.desc}`));
      }
      if (s.faqs?.length) {
        push('- FAQs:');
        s.faqs.forEach((f) => push(`  * Q: ${f.q} A: ${f.a}`));
      }
      push('');
    }
    push('');
  }

  // ---- Works ----
  if (works.length) {
    push('## Case Studies', '');
    for (const w of works) {
      const impact = w.stats?.length ? w.stats.map((st) => `${st.value} ${st.label}`).join(' | ') : w.result || '';
      if (!full) {
        push(`- [${w.title} — ${w.client}](${baseUrl}/works/${w.slug}): ${w.goal}`);
        if (impact) push(`  - Impact: ${impact}`);
        continue;
      }
      push(`### ${w.title} (${w.client})`, `- URL: ${baseUrl}/works/${w.slug}`);
      if (w.industry) push(`- Industry: ${w.industry}`);
      if (w.duration) push(`- Duration: ${w.duration}`);
      if (w.goal) push(`- Goal: ${w.goal}`);
      if (impact) push(`- Impact: ${impact}`);
      if (w.challenge) push(`- Challenge: ${w.challenge}`);
      if (w.strategy) push(`- Strategy: ${w.strategy}`);
      if (w.testimonial?.quote) push(`- Client quote: "${w.testimonial.quote}" — ${w.testimonial.author}, ${w.testimonial.role}`);
      push('');
    }
    push('');
  }

  // ---- Blog ----
  if (posts.length) {
    push('## Articles', '');
    for (const p of posts) {
      if (!full) {
        push(`- [${p.title}](${baseUrl}/blog/${p.slug}): ${p.readTime ? `${p.readTime} — ` : ''}${p.excerpt}`);
        continue;
      }
      push(`### ${p.title}`, `- URL: ${baseUrl}/blog/${p.slug}`);
      if (p.category) push(`- Category: ${p.category}`);
      if (p.date) push(`- Published: ${p.date}`);
      if (p.readTime) push(`- Read time: ${p.readTime}`);
      push(`- Summary: ${p.excerpt}`);
      const sample = p.contentBlocks?.[0]?.paragraphs?.[0];
      if (sample) push(`- Key insight: ${sample.slice(0, 300)}${sample.length > 300 ? '…' : ''}`);
      push('');
    }
    push('');
  }

  // ---- Full only: testimonials, process, FAQ ----
  if (full) {
    if (testimonials.length) {
      push('## Client Endorsements', '');
      for (const t of testimonials) {
        push(`> "${t.quote}"`, `— ${t.name}${t.role ? `, ${t.role}` : ''}${t.company ? ` at ${t.company}` : ''}`, '');
      }
    }
    if (home.process.steps?.length) {
      push(`## ${home.process.heading}`, '');
      home.process.steps.forEach((s) => push(`- ${s.step}. ${s.title} (${s.timeframe}): ${s.desc}`));
      push('');
    }
    if (home.faq.items?.length) {
      push(`## ${home.faq.heading}`, '');
      home.faq.items.forEach((f) => push(`**${f.q}**`, f.a, ''));
    }
  }

  // ---- Tools ----
  if (home.about.tools?.length) {
    push('## Tools & Platforms');
    push(`- ${home.about.tools.map((t) => (t.level ? `${t.name} (${t.level})` : t.name)).join(', ')}`);
    push('');
  }

  // ---- Contact ----
  push('## Contact');
  push(`- Website: ${baseUrl}`);
  if (settings.contact?.email) push(`- Email: ${settings.contact.email}`);
  if (settings.contact?.phone) push(`- Phone: ${settings.contact.phone}`);
  if (settings.contact?.whatsapp) push(`- WhatsApp: ${settings.contact.whatsapp}`);
  if (settings.contact?.location) push(`- Location: ${settings.contact.location}`);
  for (const [k, v] of Object.entries(settings.social || {})) {
    if (typeof v === 'string' && /^https?:\/\//.test(v)) push(`- ${k[0].toUpperCase() + k.slice(1)}: ${v}`);
  }
  push(`- Book a growth diagnostic: ${baseUrl}/#contact`);
  push(full ? `- Short summary: ${baseUrl}/llms.txt` : `- Full documentation: ${baseUrl}/llms-full.txt`);
  push('');

  return L.join('\n');
}
