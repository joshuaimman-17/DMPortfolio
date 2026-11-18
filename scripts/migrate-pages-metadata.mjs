// One-off data migration for Firestore `pages_metadata`:
//   1. Brand-name fix: stored titles ending in " | Alex Rivera" -> " | <site name>" (title, openGraph.title,
//      twitter.title). <site name> is read from Firestore settings/profile.name, so it stays the single source.
//   2. Home route: its stored titles use a different "Name | tagline" form; set to "<site name> | <tagline>".
//   3. Creates pages_metadata/route_works_<type> for the 7 /works?type=X filter views (skips any that exist).
//
// DRY RUN by default: prints every before/after and writes nothing.
//   node scripts/migrate-pages-metadata.mjs                 # dry run
//   node scripts/migrate-pages-metadata.mjs --apply         # backs up first, then writes
//   --include-sitename   also rewrite the stale openGraph.siteName "Alex Rivera" (ignored by the site code)
//   --skip-home          leave route_home alone
// Credentials (only for --apply and for reading): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY,
// NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID — from the environment or .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const OLD_BRAND = 'Alex Rivera';
const HOME_TAGLINE = 'Growth Marketer - Performance Portfolio';

// Approved copy for the /works?type=X filter views (titles get " | <site name>" appended).
export const FILTER_COPY = {
  'case-studies': ['Growth Case Studies', 'Forensic growth case studies across B2B SaaS and D2C brands, with real ad accounts, Search Console data and the tactics behind each result.'],
  poster: ['Poster Design Work', 'Campaign and product-launch posters designed for performance marketing, with the creative thinking behind each piece.'],
  analytics: ['Analytics Dashboards & Reporting', 'Real analytics work, from Search Console click curves to GA4 funnel telemetry and attribution ledgers, shown as delivered.'],
  'seo-site': ['SEO Website & Taxonomy Work', 'SEO-led site builds and restructures: taxonomy rebuilds, programmatic landing pages and documentation architecture for B2B brands.'],
  social: ['Social Media Growth Work', 'Social media growth work, including short-form video and Reel playbooks built to grow reach and engagement for D2C brands.'],
  ad: ['Paid Ads & Creative Testing', 'Paid social ad creative and testing frameworks, including Meta dynamic creative matrices built to find winners and scale spend.'],
  email: ['Email & Retention Marketing', 'Email and retention work, including consumption-paced Klaviyo flow matrices that bring one-time buyers back to buy again.'],
};

/**
 * Pure planner. `docs` = { [docId]: data }. Returns { updates: {docId: {path, before, after}[]}, creates: {docId: data} }.
 * Field paths are dotted ("openGraph.title"); `after` replaces `before` at that path.
 */
export function buildPlan(docs, { siteName, includeSiteName = false, skipHome = false, nowIso }) {
  const suffixRe = new RegExp(` \\| ${OLD_BRAND}$`);
  const swap = (s) => (typeof s === 'string' ? s.replace(suffixRe, ` | ${siteName}`) : s);
  const updates = {};
  const push = (id, p, before, after) => {
    if (before === after) return;
    (updates[id] ||= []).push({ path: p, before, after });
  };

  for (const [id, d] of Object.entries(docs)) {
    if (id === 'route_home') continue; // handled below
    push(id, 'title', d.title, swap(d.title));
    push(id, 'openGraph.title', d.openGraph?.title, swap(d.openGraph?.title));
    push(id, 'twitter.title', d.twitter?.title, swap(d.twitter?.title));
    if (includeSiteName && d.openGraph?.siteName === OLD_BRAND) push(id, 'openGraph.siteName', OLD_BRAND, siteName);
  }

  const home = docs.route_home;
  if (home && !skipHome) {
    const homeTitle = `${siteName} | ${HOME_TAGLINE}`;
    push('route_home', 'title', home.title, homeTitle);
    push('route_home', 'openGraph.title', home.openGraph?.title, homeTitle);
    push('route_home', 'twitter.title', home.twitter?.title, homeTitle);
    (home.openGraph?.images || []).forEach((img, i) => {
      if (typeof img?.alt === 'string' && img.alt.includes(OLD_BRAND)) push('route_home', `openGraph.images.${i}.alt`, img.alt, homeTitle);
    });
    if (includeSiteName && home.openGraph?.siteName === OLD_BRAND) push('route_home', 'openGraph.siteName', OLD_BRAND, siteName);
  }

  const creates = {};
  for (const [type, [title, description]] of Object.entries(FILTER_COPY)) {
    const id = `route_works_${type}`;
    if (docs[id]) continue; // never overwrite an existing (possibly hand-edited) doc
    const fullTitle = `${title} | ${siteName}`;
    // No images on purpose: getPageMetadata falls back to the default share image from site settings.
    creates[id] = {
      title: fullTitle,
      description,
      alternates: { canonical: `/works?type=${type}` },
      openGraph: { title: fullTitle, description, siteName, locale: 'en_US', type: 'website' },
      twitter: { card: 'summary_large_image', title: fullTitle, description },
      updatedAt: nowIso,
    };
  }
  return { updates, creates };
}

const setPath = (obj, p, value) => {
  const keys = p.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  o[keys[keys.length - 1]] = value;
};

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const require = createRequire(path.join(root, 'package.json'));

  // env: process.env first, then .env.local
  const env = { ...process.env };
  const envFile = path.join(root, '.env.local');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  let key = (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (key && !key.includes('\n')) {
    // repair a key whose line breaks were collapsed to spaces
    const m = key.match(/^(-----BEGIN PRIVATE KEY-----)\s*(.*?)\s*(-----END PRIVATE KEY-----)/s);
    if (m) key = `${m[1]}\n${m[2].replace(/\s+/g, '').match(/.{1,64}/g).join('\n')}\n${m[3]}\n`;
  }
  const { initializeApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  initializeApp({ credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: key }) });
  const db = getFirestore(env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID);

  const siteSnap = await db.collection('settings').doc('profile').get();
  const siteName = siteSnap.exists ? siteSnap.data().name : null;
  if (!siteName) throw new Error('settings/profile.name is empty — refusing to guess the brand name.');

  const docs = {};
  (await db.collection('pages_metadata').get()).forEach((d) => (docs[d.id] = d.data()));
  const plan = buildPlan(docs, { siteName, includeSiteName: args.has('--include-sitename'), skipHome: args.has('--skip-home'), nowIso: new Date().toISOString() });

  console.log(`Site name (settings/profile.name): "${siteName}"   mode: ${apply ? 'APPLY' : 'DRY RUN'}\n`);
  let nFields = 0;
  for (const [id, ch] of Object.entries(plan.updates)) {
    console.log(id);
    ch.forEach((c) => { nFields++; console.log(`  ${c.path}\n    - ${c.before}\n    + ${c.after}`); });
  }
  for (const [id, d] of Object.entries(plan.creates)) {
    console.log(`${id}  (NEW)\n  title: ${d.title}\n  description (${d.description.length}): ${d.description}`);
  }
  console.log(`\n${nFields} fields in ${Object.keys(plan.updates).length} existing docs; ${Object.keys(plan.creates).length} new docs.`);
  if (!apply) return console.log('Dry run only — nothing written. Re-run with --apply to write.');

  // Backup first.
  const dir = path.join(root, 'scripts', '.backups');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `pages_metadata-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(docs, null, 1));
  console.log(`Backup written: ${file}`);

  const batch = db.batch();
  for (const [id, ch] of Object.entries(plan.updates)) {
    const next = structuredClone(docs[id]);
    ch.forEach((c) => setPath(next, c.path, c.after));
    next.updatedAt = new Date().toISOString();
    batch.set(db.collection('pages_metadata').doc(id), next);
  }
  for (const [id, d] of Object.entries(plan.creates)) batch.create(db.collection('pages_metadata').doc(id), d);
  await batch.commit();
  console.log('Applied atomically (one batch). To roll back, restore the backup file with set() per document.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(() => process.exit(0), (e) => { console.error('FAILED:', e.message); process.exit(1); });
}
