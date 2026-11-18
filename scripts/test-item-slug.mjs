// Run: node scripts/test-item-slug.mjs   (Node >= 22.18 strips TS types natively; no deps, no network)
import assert from 'node:assert/strict';
import { saveItem } from '../src/lib/item-slug.ts';
import { findCurrentSlug } from '../src/lib/slug-redirects.ts';

// ---- Minimal in-memory Firestore (admin SDK subset used by saveItem) ----
class FakeDb {
  constructor() { this.cols = new Map(); this.failNextCommit = false; }
  _col(n) { if (!this.cols.has(n)) this.cols.set(n, new Map()); return this.cols.get(n); }
  seed(col, id, data) { this._col(col).set(id, structuredClone(data)); }
  read(col, id) { const d = this._col(col).get(id); return d ? structuredClone(d) : undefined; }
  ids(col) { return [...this._col(col).keys()].sort(); }
  collection(name) {
    const db = this;
    const mkDoc = (id) => ({
      id, col: name,
      async get() { const d = db._col(name).get(id); return { exists: d !== undefined, id, ref: mkDoc(id), data: () => structuredClone(d) }; },
    });
    return {
      doc: mkDoc,
      where(field, op, value) {
        return {
          async get() {
            const docs = [...db._col(name).entries()]
              .filter(([, d]) => (op === 'array-contains' ? Array.isArray(d[field]) && d[field].includes(value) : d[field] === value))
              .map(([id, d]) => ({ id, ref: mkDoc(id), data: () => structuredClone(d) }));
            return { docs };
          },
        };
      },
    };
  }
  batch() {
    const ops = []; const db = this;
    return {
      set: (ref, data) => ops.push(['set', ref, structuredClone(data)]),
      update: (ref, data) => ops.push(['update', ref, structuredClone(data)]),
      delete: (ref) => ops.push(['delete', ref]),
      async commit() {
        if (db.failNextCommit) { db.failNextCommit = false; throw new Error('simulated commit failure'); } // nothing applied
        for (const [t, ref, data] of ops) {
          const c = db._col(ref.col);
          if (t === 'set') c.set(ref.id, data);
          else if (t === 'update') { if (!c.has(ref.id)) throw new Error('update of missing doc'); c.set(ref.id, { ...c.get(ref.id), ...data }); }
          else c.delete(ref.id);
        }
      },
    };
  }
}

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log('  ok -', name); };
const NOW = '2026-11-18T10:00:00.000Z';
const seedWorld = () => {
  const db = new FakeDb();
  db.seed('works', 'old-title', { slug: 'old-title', title: 'Old Title', status: 'published', createdAt: '2026-01-01T00:00:00.000Z', order: 3, previousSlugs: [] });
  db.seed('works', 'other-work', { slug: 'other-work', title: 'Other', status: 'published', previousSlugs: ['retired-url'] });
  db.seed('pages_metadata', 'route_work_old-title', { title: 'Custom SEO title', description: 'Custom desc', openGraph: { title: 'og t' } });
  db.seed('services', 'svc-a', { slug: 'svc-a', relatedWorkSlugs: ['old-title', 'other-work'] });
  db.seed('services', 'svc-b', { slug: 'svc-b', relatedWorkSlugs: ['other-work'] });
  db.seed('showcase', 'sc1', { workSlug: 'old-title', title: 'poster' });
  db.seed('showcase', 'sc2', { workSlug: 'other-work', title: 'ad' });
  return db;
};
const formWork = (extra = {}) => ({ title: 'New Title', status: 'published', order: 3, ...extra });

console.log('saveItem');

await test('no slug change: overwrites in place, history untouched, createdAt kept, nothing else touched', async () => {
  const db = seedWorld();
  const r = await saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'old-title', payload: formWork({ id: 'junk' }), nowIso: NOW });
  assert.equal(r.renamed, false);
  assert.deepEqual(db.ids('works'), ['old-title', 'other-work']);
  const d = db.read('works', 'old-title');
  assert.equal(d.title, 'New Title'); assert.equal(d.createdAt, '2026-01-01T00:00:00.000Z'); assert.equal(d.updatedAt, NOW);
  assert.equal('id' in d, false); assert.deepEqual(d.previousSlugs, []);
  assert.ok(db.read('pages_metadata', 'route_work_old-title'));
});

await test('rename: new doc written, old doc deleted, previousSlugs records old slug', async () => {
  const db = seedWorld();
  const r = await saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'new-title', payload: formWork(), nowIso: NOW });
  assert.equal(r.renamed, true);
  assert.deepEqual(db.ids('works'), ['new-title', 'other-work']);
  const d = db.read('works', 'new-title');
  assert.equal(d.slug, 'new-title'); assert.deepEqual(d.previousSlugs, ['old-title']);
  assert.equal(d.createdAt, '2026-01-01T00:00:00.000Z'); assert.equal(d.order, 3);
});

await test('rename: pages_metadata moves to the new key with content intact', async () => {
  const db = seedWorld();
  await saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'new-title', payload: formWork(), nowIso: NOW });
  assert.equal(db.read('pages_metadata', 'route_work_old-title'), undefined);
  assert.deepEqual(db.read('pages_metadata', 'route_work_new-title'), { title: 'Custom SEO title', description: 'Custom desc', openGraph: { title: 'og t' } });
});

await test('rename: services.relatedWorkSlugs and showcase.workSlug are rewritten; unrelated docs untouched', async () => {
  const db = seedWorld();
  const r = await saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'new-title', payload: formWork(), nowIso: NOW });
  assert.deepEqual(db.read('services', 'svc-a').relatedWorkSlugs, ['new-title', 'other-work']);
  assert.deepEqual(db.read('services', 'svc-b').relatedWorkSlugs, ['other-work']);
  assert.equal(db.read('showcase', 'sc1').workSlug, 'new-title');
  assert.equal(db.read('showcase', 'sc2').workSlug, 'other-work');
  assert.ok(r.tags.includes('works') && r.tags.includes('services') && r.tags.includes('showcase'));
  assert.ok(r.paths.includes('/works/old-title') && r.paths.includes('/works/new-title') && r.paths.includes('/services/svc-a') && !r.paths.includes('/services/svc-b'));
});

await test('two renames in a row keep the full history (A -> B -> C)', async () => {
  const db = seedWorld();
  await saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'second', payload: formWork(), nowIso: NOW });
  const r = await saveItem(db, { kind: 'work', oldSlug: 'second', newSlug: 'third', payload: formWork(), nowIso: NOW });
  assert.deepEqual(r.previousSlugs, ['old-title', 'second']);
  assert.deepEqual(db.ids('works'), ['other-work', 'third']);
  const items = [db.read('works', 'third'), db.read('works', 'other-work')];
  assert.equal(findCurrentSlug(items, 'old-title'), 'third'); // single hop, no chain
  assert.equal(findCurrentSlug(items, 'second'), 'third');
});

await test('renaming back to an earlier slug removes it from previousSlugs (never both current and previous)', async () => {
  const db = seedWorld();
  await saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'second', payload: formWork(), nowIso: NOW });
  const r = await saveItem(db, { kind: 'work', oldSlug: 'second', newSlug: 'old-title', payload: formWork(), nowIso: NOW });
  assert.deepEqual(r.previousSlugs, ['second']);
  assert.equal(findCurrentSlug([db.read('works', 'old-title')], 'old-title'), null);
});

await test('rename onto an existing live slug is rejected and changes nothing', async () => {
  const db = seedWorld();
  await assert.rejects(() => saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'other-work', payload: formWork(), nowIso: NOW }), { code: 'SLUG_TAKEN' });
  assert.deepEqual(db.ids('works'), ['old-title', 'other-work']);
  assert.ok(db.read('pages_metadata', 'route_work_old-title'));
});

await test("rename onto another item's retired URL is rejected (would hijack its redirect)", async () => {
  const db = seedWorld();
  await assert.rejects(() => saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'retired-url', payload: formWork(), nowIso: NOW }), { code: 'SLUG_PREVIOUSLY_USED' });
  assert.deepEqual(db.ids('works'), ['old-title', 'other-work']);
});

await test('create: new slug stored, empty history; existing or retired slug rejected', async () => {
  const db = seedWorld();
  const r = await saveItem(db, { kind: 'work', oldSlug: null, newSlug: 'brand-new', payload: formWork({ createdAt: undefined }), nowIso: NOW });
  assert.equal(r.renamed, false); assert.deepEqual(db.read('works', 'brand-new').previousSlugs, []); assert.equal(db.read('works', 'brand-new').createdAt, NOW);
  await assert.rejects(() => saveItem(db, { kind: 'work', oldSlug: null, newSlug: 'old-title', payload: formWork(), nowIso: NOW }), { code: 'SLUG_TAKEN' });
  await assert.rejects(() => saveItem(db, { kind: 'work', oldSlug: null, newSlug: 'retired-url', payload: formWork(), nowIso: NOW }), { code: 'SLUG_PREVIOUSLY_USED' });
});

await test('editing a slug that no longer exists reports NOT_FOUND instead of creating a duplicate', async () => {
  const db = seedWorld();
  await assert.rejects(() => saveItem(db, { kind: 'work', oldSlug: 'ghost', newSlug: 'ghost-2', payload: formWork(), nowIso: NOW }), { code: 'NOT_FOUND' });
  assert.deepEqual(db.ids('works'), ['old-title', 'other-work']);
});

await test('atomic: a failed commit leaves every collection exactly as it was', async () => {
  const db = seedWorld();
  const before = JSON.stringify([...db.cols].map(([k, v]) => [k, [...v]]));
  db.failNextCommit = true;
  await assert.rejects(() => saveItem(db, { kind: 'work', oldSlug: 'old-title', newSlug: 'new-title', payload: formWork(), nowIso: NOW }), /simulated/);
  assert.equal(JSON.stringify([...db.cols].map(([k, v]) => [k, [...v]])), before);
});

await test('service rename: metadata moves, nothing else is rewritten', async () => {
  const db = new FakeDb();
  db.seed('services', 'seo', { slug: 'seo', title: 'SEO', previousSlugs: [] });
  db.seed('pages_metadata', 'route_service_seo', { title: 'SEO meta' });
  db.seed('works', 'w', { slug: 'w', title: 'w' });
  const r = await saveItem(db, { kind: 'service', oldSlug: 'seo', newSlug: 'search-seo', payload: { title: 'SEO' }, nowIso: NOW });
  assert.deepEqual(db.ids('services'), ['search-seo']); assert.deepEqual(db.read('pages_metadata', 'route_service_search-seo'), { title: 'SEO meta' });
  assert.deepEqual(r.tags, ['services']); assert.ok(r.paths.includes('/services/seo'));
});

await test('post rename: other posts relatedSlugs and its own self-reference are rewritten', async () => {
  const db = new FakeDb();
  db.seed('posts', 'a', { slug: 'a', relatedSlugs: ['b', 'a'], previousSlugs: [] });
  db.seed('posts', 'b', { slug: 'b', relatedSlugs: ['a'] });
  db.seed('posts', 'c', { slug: 'c', relatedSlugs: ['b'] });
  db.seed('pages_metadata', 'route_post_a', { title: 'meta a' });
  await saveItem(db, { kind: 'post', oldSlug: 'a', newSlug: 'a2', payload: { relatedSlugs: ['b', 'a'] }, nowIso: NOW });
  assert.deepEqual(db.ids('posts'), ['a2', 'b', 'c']);
  assert.deepEqual(db.read('posts', 'a2').relatedSlugs, ['b', 'a2']);
  assert.deepEqual(db.read('posts', 'b').relatedSlugs, ['a2']);
  assert.deepEqual(db.read('posts', 'c').relatedSlugs, ['b']);
  assert.deepEqual(db.read('pages_metadata', 'route_post_a2'), { title: 'meta a' });
});

console.log('findCurrentSlug');
await test('redirect lookup: unknown -> null, live slug -> null, retired -> current, live beats retired', async () => {
  const items = [{ slug: 'x', previousSlugs: ['a', 'b'] }, { slug: 'y' }, { slug: 'z', previousSlugs: ['x'] }];
  assert.equal(findCurrentSlug(items, 'nope'), null);
  assert.equal(findCurrentSlug(items, 'x'), null); // live on x, even though z lists it as previous
  assert.equal(findCurrentSlug(items, 'a'), 'x');
  assert.equal(findCurrentSlug([{ slug: 'q', previousSlugs: undefined }], 'a'), null);
});

console.log(`\n${passed} tests passed`);
