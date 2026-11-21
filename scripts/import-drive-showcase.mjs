// Imports already-downloaded Drive images into Firebase Storage (images/showcase/) and creates showcase docs.
//   node scripts/import-drive-showcase.mjs <dir-with-list.json-and-images>            # dry run
//   node scripts/import-drive-showcase.mjs <dir> --apply
// Images are resized (max 1600px) and saved as WebP. Docs are created only if the id is free (re-runnable).
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const dir = process.argv[2];
const apply = process.argv.includes('--apply');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const sharp = require('sharp');

const CLIENTS = [
  [/hamza/i, 'Hamza Biriyani'], [/bestcook/i, 'BestCook'], [/natureaura/i, 'Nature Aura'],
  [/chocohollics/i, 'Chocohollics'], [/uec|study in uk/i, 'UEC'], [/bim workshop/i, 'BIM Workshop'],
];
const files = JSON.parse(fs.readFileSync(path.join(dir, 'list.json'), 'utf8'));

let n = 0;
const items = files
  .map((f) => {
    const t = f.title.replace(/\.[^.]+$/, '');
    const screenshot = /^Screenshot/i.test(t);
    const client = CLIENTS.find(([re]) => re.test(t))?.[1] || '';
    const generic = /^(IMG-|WhatsApp Image|\d+$|Screenshot)/i.test(t);
    return { f, t, screenshot, client, generic };
  })
  // named work first, then generic, screenshots last; stable by filename within a group
  .sort((a, b) => (a.screenshot - b.screenshot) || (a.generic - b.generic) || a.t.localeCompare(b.t, undefined, { numeric: true }))
  .map((x) => {
    n++;
    const type = x.screenshot ? 'analytics' : 'poster';
    const title = x.screenshot ? `Meta Ads Manager Report ${String(n).padStart(2, '0')}`
      : x.generic ? `Creative Design ${String(n).padStart(2, '0')}`
      : x.t.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return { ...x, type, title, id: `drive-${x.f.id.slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, '')}`, order: 100 + n };
  });

console.log(`${items.length} images, mode ${apply ? 'APPLY' : 'DRY RUN'}`);
items.slice(0, 8).forEach((i) => console.log(`  ${i.order} [${i.type}] ${i.title} | client="${i.client}" | ${i.f.title}`));
if (!apply) process.exit(0);

const env = { ...process.env };
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const bucketName = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET;
initializeApp({
  credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n') }),
  storageBucket: bucketName,
});
const db = getFirestore(env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID);
const bucket = getStorage().bucket();
const now = new Date().toISOString();

let done = 0, skipped = 0;
for (const it of items) {
  const ref = db.collection('showcase').doc(it.id);
  if ((await ref.get()).exists) { skipped++; continue; }
  const src = path.join(dir, `${it.f.id}.${it.f.mime.includes('png') ? 'png' : 'jpg'}`);
  const buf = await sharp(src).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const filePath = `images/showcase/${Date.now()}-${it.id}.webp`;
  const token = randomUUID();
  await bucket.file(filePath).save(buf, {
    resumable: false, contentType: 'image/webp',
    metadata: { cacheControl: 'public, max-age=31536000, immutable', metadata: { firebaseStorageDownloadTokens: token } },
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
  await ref.create({
    type: it.type, title: it.title, client: it.client, image: url, status: 'published', order: it.order,
    createdAt: now, updatedAt: now,
  });
  done++;
  if (done % 10 === 0) console.log(`  ${done}/${items.length}`);
}
console.log(`Created ${done}, skipped ${skipped} existing.`);
process.exit(0);
