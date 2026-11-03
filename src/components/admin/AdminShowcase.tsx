import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { uploadMediaFile } from '../../lib/portfolioService';
import { ShowcaseItem } from '../../data/portfolioData';
import { triggerRevalidation } from '../../lib/admin-service';
import { ImageField } from './ImageField';

export const AdminShowcase: React.FC = () => {
  const { showcase: cachedShowcase, works, refreshData, showToast } = usePortfolioData();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [formData, setFormData] = useState<any>({
    id: '',
    type: 'poster',
    title: '',
    client: '',
    image: '',
    badge: '',
    source: '',
    url: '',
    before: '',
    after: '',
    workSlug: '',
    highlight: '',
    status: 'published',
    order: 1,
  });

  const loadAllShowcase = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'showcase'));
      if (snap.empty) {
        setItems(cachedShowcase.map((s, idx) => ({ ...s, status: 'published', order: idx + 1 })));
      } else {
        const list: any[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(list);
      }
    } catch {
      setItems(cachedShowcase.map((s, idx) => ({ ...s, status: 'published', order: idx + 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllShowcase();
  }, [cachedShowcase]);

  const handleEdit = (item: any) => {
    setIsNew(false);
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      type: item.type || 'poster',
      title: item.title || '',
      client: item.client || '',
      image: item.image || '',
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      badge: item.badge || '',
      source: item.source || '',
      url: item.url || '',
      before: item.before || '',
      after: item.after || '',
      workSlug: item.workSlug || '',
      highlight: item.highlight || '',
      status: item.status || 'published',
      order: item.order || 1,
    });
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setFormData({
      id: `proof-${Date.now().toString(36)}`,
      type: 'analytics',
      title: '',
      client: '',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      driveFileId: '',
      alt: '',
      badge: 'Verified Metric',
      source: 'Google Search Console',
      url: 'analytics.google.com',
      before: '',
      after: '',
      workSlug: works[0]?.slug || '',
      highlight: '',
      status: 'published',
      order: items.length + 1,
    });
  };

  const handleDuplicate = (item: any) => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setFormData({
      ...item,
      id: `${item.id}-copy`,
      title: `${item.title} (Copy)`,
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      status: 'draft',
      order: items.length + 1,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size exceeds 2MB limit. Please select a smaller image.', 'error');
      return;
    }
    setUploadingImage(true);
    showToast('Uploading deliverable to Firebase Storage...', 'info');
    try {
      const url = await uploadMediaFile(file, 'showcase');
      setFormData((prev: any) => ({ ...prev, image: url }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message + '. You can paste image URL directly.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!formData.title.trim()) {
      showToast('Please enter an artifact title', 'error');
      return;
    }
    if (!formData.image.trim()) {
      showToast('Please provide an image URL', 'error');
      return;
    }
    const finalId = formData.id.trim() || `proof-${Date.now().toString(36)}`;

    const payload = {
      ...formData,
      id: finalId,
      status: publishNow !== undefined ? (publishNow ? 'published' : 'draft') : formData.status,
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'showcase', finalId), payload);
      showToast(`Deliverable "${formData.title}" saved!`, 'success');
      setEditingItem(null);
      await loadAllShowcase();
      await refreshData();
      await triggerRevalidation(['showcase']);
    } catch (err: any) {
      showToast(err.message || 'Failed to save deliverable', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'showcase', id));
      showToast('Deliverable deleted', 'success');
      setDeleteConfirmId(null);
      await loadAllShowcase();
      await refreshData();
      await triggerRevalidation(['showcase']);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const listCopy = [...items];
    const current = listCopy[index];
    const target = listCopy[targetIdx];

    const currentOrder = current.order || index + 1;
    const targetOrder = target.order || targetIdx + 1;

    current.order = targetOrder;
    target.order = currentOrder;

    try {
      await Promise.all([
        setDoc(doc(db, 'showcase', current.id), { ...current, order: targetOrder }, { merge: true }),
        setDoc(doc(db, 'showcase', target.id), { ...target, order: currentOrder }, { merge: true }),
      ]);
      await loadAllShowcase();
      await refreshData();
      await triggerRevalidation(['showcase']);
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  const filteredList = items.filter((it) => {
    const matchesSearch =
      it.title?.toLowerCase().includes(search.toLowerCase()) ||
      it.client?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || it.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || it.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Showcase &amp; Visual Proof</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage campaign posters, analytics charts, ranking sites, and deliverables rendered in the public lightbox.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Deliverable</span>
          </button>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      {editingItem ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900">
              {isNew ? 'New Proof Deliverable' : `Edit: ${formData.title}`}
            </h3>
            <button
              onClick={() => setEditingItem(null)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Deliverable Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold capitalize"
              >
                <option value="poster">Poster (Campaign / OOH)</option>
                <option value="analytics">Analytics (GSC / GA4 Screenshot)</option>
                <option value="seo-site">SEO Site (Ranked Landing)</option>
                <option value="social">Social Media (Reel / Carousel)</option>
                <option value="ad">Ad Creative (Meta / Google)</option>
                <option value="email">Email Funnel (Klaviyo Flow)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Client Name / Brand</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g. Lumina Sound • D2C Audio"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Artifact Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Acoustic Clarity 2024 Launch Poster"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            {/* Image via ImageField */}
            <div className="sm:col-span-2">
              <ImageField
                label="Artifact Image *"
                category={formData.type || 'posters'}
                value={formData.image || ''}
                driveFileId={formData.driveFileId}
                alt={formData.alt || formData.title}
                onChange={({ image, driveFileId, alt }) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    image,
                    driveFileId,
                    alt,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Brand Poster, +120% Clicks"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Highlight Note</label>
              <input
                type="text"
                value={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                placeholder="e.g. 185K Organic Reach"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Related Case Study (Work Slug)</label>
              <select
                value={formData.workSlug}
                onChange={(e) => setFormData({ ...formData, workSlug: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              >
                <option value="">None (Stand-alone proof)</option>
                {works.map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.client} ({w.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Display URL (Browser Frame)</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g. search.google.com/search-console"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Before Metric (Optional)</label>
              <input
                type="text"
                value={formData.before}
                onChange={(e) => setFormData({ ...formData, before: e.target.value })}
                placeholder="e.g. 2K/mo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">After Metric (Optional)</label>
              <input
                type="text"
                value={formData.after}
                onChange={(e) => setFormData({ ...formData, after: e.target.value })}
                placeholder="e.g. 18K/mo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-neutral-800">Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs font-semibold"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow cursor-pointer"
              >
                Save &amp; Publish
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE LIST */
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deliverables..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs font-semibold capitalize"
              >
                <option value="all">All Types</option>
                <option value="poster">Poster</option>
                <option value="analytics">Analytics</option>
                <option value="seo-site">SEO Site</option>
                <option value="social">Social Media</option>
                <option value="ad">Ad Creative</option>
                <option value="email">Email</option>
              </select>

              {/* Status Filter */}
              {(['all', 'published', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Loading deliverables...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">No deliverables found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Artifact</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {filteredList.map((sc, idx) => (
                    <tr key={sc.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-neutral-700 w-5">{sc.order || idx + 1}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                            </button>
                            <button
                              onClick={() => handleMoveOrder(idx, 'down')}
                              disabled={idx === filteredList.length - 1}
                              className="text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            <img src={sc.image} alt={sc.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 line-clamp-1">{sc.title}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">#{sc.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider">
                          {sc.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{sc.client}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sc.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {sc.status || 'published'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(sc)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(sc)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Duplicate"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(sc.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Delete Deliverable?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Delete item <span className="font-mono font-bold">{deleteConfirmId}</span>? It will no longer show in the public lightbox.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
