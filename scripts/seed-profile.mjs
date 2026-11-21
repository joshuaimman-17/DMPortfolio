// Seeds M Prem's real profile data over the sample (Alex Rivera) content.
//   node scripts/seed-profile.mjs            # DRY RUN: prints what would be written, touches nothing
//   node scripts/seed-profile.mjs --apply    # backs up affected docs, then writes
// Credentials (only for --apply): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY,
// NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID — from the environment or .env.local.
// Settings use merge:true (fields not listed here are untouched). Items are created only if the slug is free.
// Nothing here invents numbers, clients or testimonials. Items marked DRAFT are copy for review (status 'draft').

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const NAME = 'M Prem';
const ROLE = 'General Manager, Hype Strategies';
const now = new Date().toISOString();

// ---------- settings/* (one doc each; extractSetting reads flat docs) ----------
const settings = {
  profile: { name: NAME },
  hero: {
    roleTag: 'Digital Marketing Professional | SEO & Performance Marketing | AI-Powered Marketing | Marketing Automation | Business Growth & Lead Generation | Digital Marketing Trainer',
    headline: "Let's turn digital marketing into measurable growth.",
    subtext:
      'I believe digital marketing should do more than create visibility. It should help businesses attract the right audience, generate quality leads and achieve meaningful growth. I combine strategy, creativity and data to make marketing more effective.',
    badge1: ROLE,
    badge2: 'Digital Marketing Trainer',
    badge3: 'Performance Marketing & Lead Generation',
    // avatar: intentionally absent. Upload the photo in the admin, then set it.
  },
  // DRAFT: capability labels taken from your headline, no numeric claims. Replace with real numbers when you have them.
  metrics: {
    metric1: { value: 'SEO', label: 'Search', desc: 'SEO audits and organic growth strategy' },
    metric2: { value: 'Ads', label: 'Performance Marketing', desc: 'Paid campaigns focused on quality leads' },
    metric3: { value: 'AI', label: 'AI-Powered Marketing', desc: 'Automation and AI to make marketing more efficient' },
    metric4: { value: 'Training', label: 'Digital Marketing Trainer', desc: 'Training and consulting for marketers and businesses' },
  },
  contact: {
    email: 'premsunitha047@gmail.com',
    phone: '+91 9500363147',
    location: 'Chennai, Tamil Nadu, India',
    whatsapp: '+91 9500363147', // assumed same as phone; edit if different
  },
  social: { linkedin: 'https://www.linkedin.com/in/m-prem-/', twitter: '', github: '' },
  footer: {
    tagline: 'Digital marketing strategy, performance marketing and business growth consulting.',
    copyright: `© ${new Date().getFullYear()} ${NAME}. All rights reserved.`,
  },
  // Removes sample-persona text from the homepage. Only the keys below change; arrays are replaced wholesale.
  home: {
    hero: {
      trustText: 'Digital marketing for business owners, startups and growing companies',
      roleFallback: 'Digital Marketing Strategist & Business Growth Consultant',
      avatarAlt: NAME,
    },
    about: {
      heading: 'Digital Marketing Strategist & Business Growth Consultant',
      paragraph1:
        "I'm M Prem, a Digital Marketing Strategist, Performance Marketing Professional and Business Growth Consultant based in Chennai, India. My focus covers digital marketing strategy, performance marketing, lead generation, business growth consulting and digital marketing training.",
      paragraph2:
        'I combine strategy, creativity and data. I start by understanding business objectives and the right audience, then continuously improve campaign performance. I work with business owners, startups, growing companies, aspiring marketers and organisations looking for marketing training and consulting.',
      tools: [], // none provided; clears the sample tool list. Send tools + levels to fill.
    },
    inquiryForm: {
      intro: "Fill out this brief intake and I'll reply within 24 hours.",
      submit: 'Send Inquiry',
      successText: "Thanks for reaching out, {name}. I'll review your message and respond within 24 hours.",
    },
    // DRAFT: neutral FAQs with no pricing or result claims.
    faq: {
      items: [
        { q: 'What kind of businesses do you work with?', a: 'Business owners, startups and growing companies that want to attract the right audience and generate quality leads through digital marketing.' },
        { q: 'Do you offer digital marketing training?', a: 'Yes. I train aspiring marketers and organisations, and also offer consulting for teams that want to improve their marketing.' },
        { q: 'How do you approach a new project?', a: 'I start by understanding your business objectives and target audience, build a strategy around them, and then keep improving campaign performance using data.' },
        { q: 'How can I get in touch?', a: 'Use the contact form on this page, email, or connect on LinkedIn. I will get back to you as soon as possible.' },
      ],
    },
  },
};

// ---------- items (doc id = slug; status published unless DRAFT) ----------
const emptyWork = {
  industry: '', duration: '', services: [], result: '', stats: [], goal: '', challenge: '', strategy: '',
  execution: [], proofItemIds: [], testimonial: { quote: '', author: '', role: '' }, learnings: [], coverImage: '',
};
const works = [
  { slug: 'hype-strategies-general-manager', client: 'Hype Strategies', title: 'General Manager',
    industry: 'Marketing agency: strategy, branding, websites, digital marketing', duration: 'Oct 2025 – Present' },
  { slug: 'human-intelr-manager', client: 'Human IntelR', title: 'Manager',
    duration: 'Mar 2024 – May 2025', services: ['SEO Audits', 'Digital Marketing'] },
  { slug: 'ieqs-digital-marketing', client: 'Industrial Engineering Quality Solutions Group (IEQS)', title: 'Digital Marketing',
    industry: 'Engineering recruitment', duration: 'Nov 2022 – Jun 2023', services: ['SEO Audits', 'Digital Marketing'],
    goal: 'Assisted in executing digital marketing campaigns and performance analysis; coordinated recruitment and onboarding; did talent acquisition research for an MBA project.' },
].map((w, i) => ({ ...emptyWork, ...w, status: 'published', order: i + 1 }));

const mkService = (slug, title, icon, tag, summary, deliverables, whoItsFor, order) => ({
  slug, title, icon, tag, summary, deliverables, whoItsFor,
  process: [
    { phase: '01', title: 'Understand', desc: 'Clarify business objectives and the right audience.' },
    { phase: '02', title: 'Plan', desc: 'Build a strategy that connects content, channels and tracking to goals.' },
    { phase: '03', title: 'Execute & Improve', desc: 'Launch, measure and continuously improve performance.' },
  ],
  faqs: [], pricingApproach: 'Scoped to your goals after an initial conversation.', relatedWorkSlugs: [],
  status: 'draft', order, // DRAFT: review copy, then publish from the admin
});
const services = [
  mkService('seo-performance-marketing', 'SEO & Performance Marketing', 'trending_up', 'Growth',
    'Search and paid marketing that attracts the right audience and generates quality leads.',
    ['SEO audits', 'Paid campaign setup and optimisation', 'Performance tracking and reporting'],
    ['Business owners', 'Startups', 'Growing companies'], 1),
  mkService('lead-generation-business-growth', 'Lead Generation & Business Growth Consulting', 'target', 'Consulting',
    'Strategy that connects audience, content, advertising and tracking to real business goals.',
    ['Digital marketing strategy', 'Lead generation planning', 'Growth consulting'],
    ['Business owners', 'Startups', 'Growing companies'], 2),
  mkService('digital-marketing-training', 'Digital Marketing Training', 'school', 'Training',
    'Practical digital marketing training for aspiring marketers and organisations.',
    ['Digital marketing fundamentals', 'Hands-on, practical sessions', 'Team training for organisations'],
    ['Aspiring marketers', 'Organisations and teams'], 3),
];

const posts = [{
  slug: 'digital-marketing-is-not-just-about-posting-on-instagram-or-facebook',
  title: 'Digital Marketing Is Not Just About Posting on Instagram or Facebook',
  category: 'Digital Marketing',
  excerpt: "An active social page isn't a marketing strategy. Effective digital marketing connects audience, content, advertising and tracking to real business goals.",
  date: '2026-11-14', readTime: '1 min', coverImage: '',
  author: { name: NAME, role: ROLE, avatar: '' },
  toc: [{ id: 'more-than-posting', title: 'More than posting' }],
  contentBlocks: [{
    heading: 'More than posting',
    paragraphs: ['Effective digital marketing means understanding your target audience, building a strong online presence, creating valuable content, reaching the right people through advertising, generating quality leads, and tracking performance to improve results.'],
    pullQuote: "Don't just market your business. Market it with a purpose.",
  }],
  relatedSlugs: [], status: 'published', order: 1,
}];

const collections = { works, services, posts };

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN'}\n`);
  for (const [id, data] of Object.entries(settings)) console.log(`settings/${id}  (merge)\n${JSON.stringify(data, null, 1).slice(0, 400)}${JSON.stringify(data).length > 400 ? ' …' : ''}\n`);
  for (const [col, items] of Object.entries(collections))
    for (const it of items) console.log(`${col}/${it.slug}  (create if free)  status=${it.status}  title="${it.title}"`);
  if (!apply) return console.log('\nDry run only. Nothing written.');

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const require = createRequire(path.join(root, 'package.json'));
  const env = { ...process.env };
  const envFile = path.join(root, '.env.local');
  if (fs.existsSync(envFile))
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  let key = (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const { initializeApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  initializeApp({ credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: key }) });
  const db = getFirestore(env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID);

  // Backup current settings docs and sample items that exist, plus a list of every existing item (to flag leftovers).
  const backup = { settings: {}, existing: {} };
  for (const id of Object.keys(settings)) { const s = await db.collection('settings').doc(id).get(); backup.settings[id] = s.exists ? s.data() : null; }
  for (const col of Object.keys(collections)) { const s = await db.collection(col).get(); backup.existing[col] = Object.fromEntries(s.docs.map((d) => [d.id, d.data()])); }
  const dir = path.join(root, 'scripts', '.backups');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `seed-profile-${now.replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`\nBackup: ${file}`);

  const batch = db.batch();
  for (const [id, data] of Object.entries(settings)) batch.set(db.collection('settings').doc(id), data, { merge: true });
  for (const [col, items] of Object.entries(collections))
    for (const it of items) {
      if (backup.existing[col][it.slug]) { console.log(`SKIP ${col}/${it.slug} (exists)`); continue; }
      batch.create(db.collection(col).doc(it.slug), { ...it, previousSlugs: [], createdAt: now, updatedAt: now });
    }
  await batch.commit();
  for (const col of Object.keys(collections)) {
    const left = Object.keys(backup.existing[col]).filter((id) => !collections[col].some((i) => i.slug === id));
    if (left.length) console.log(`NOTE: ${col} still has sample docs (not deleted): ${left.join(', ')}`);
  }
  console.log('Applied. Revalidate the site (admin save or /api/revalidate) so cached pages refresh.');
}
main().then(() => process.exit(0), (e) => { console.error('FAILED:', e.message); process.exit(1); });
