import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { uploadMediaFile } from '../../lib/portfolioService';
import { triggerRevalidation } from '../../lib/admin-service';
import { ImageField } from './ImageField';

export const AdminTestimonials: React.FC = () => {
  const { testimonials: cachedTestimonials, refreshData, showToast } = usePortfolioData();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [formData, setFormData] = useState<any>({
    id: '',
    name: '',
    role: '',
    company: '',
    quote: '',
    rating: 5,
    avatarImage: '',
    avatarInitials: '',
    avatarBg: 'bg-primary-container',
    avatarColor: 'text-white',
    status: 'published',
    order: 1,
  });

  const loadAllTestimonials = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      if (snap.empty) {
        setItems(cachedTestimonials.map((t, idx) => ({ ...t, id: t.id || `testimonial-${idx + 1}`, status: 'published', order: idx + 1 })));
      } else {
        const list: any[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(list);
      }
    } catch {
      setItems(cachedTestimonials.map((t, idx) => ({ ...t, id: t.id || `testimonial-${idx + 1}`, status: 'published', order: idx + 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTestimonials();
  }, [cachedTestimonials]);

  const handleEdit = (item: any) => {
    setIsNew(false);
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      name: item.name || '',
      role: item.role || '',
      company: item.company || '',
      quote: item.quote || '',
      rating: item.rating || 5,
      avatarImage: item.avatarImage || '',
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      avatarInitials: item.avatarInitials || '',
      avatarBg: item.avatarBg || 'bg-primary-container',
      avatarColor: item.avatarColor || 'text-white',
      status: item.status || 'published',
      order: item.order || 1,
    });
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setFormData({
      id: `testimonial-${Date.now().toString(36)}`,
      name: '',
      role: 'Founder & CEO',
      company: 'Tech Brand',
      quote: 'Alex delivered transformative results for our acquisition pipeline within the first 60 days.',
      rating: 5,
      avatarImage: '',
      driveFileId: '',
      alt: '',
      avatarInitials: 'FB',
      avatarBg: 'bg-primary-container',
      avatarColor: 'text-white',
      status: 'published',
      order: items.length + 1,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size exceeds 2MB limit.', 'error');
      return;
    }
    setUploadingImage(true);
    showToast('Uploading avatar to Firebase Storage...', 'info');
    try {
      const url = await uploadMediaFile(file, 'testimonials');
      setFormData((prev: any) => ({ ...prev, avatarImage: url }));
      showToast('Avatar uploaded successfully!', 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message + '. You can paste image URL directly.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!formData.name.trim()) {
      showToast('Please enter an author name', 'error');
      return;
    }
    if (!formData.quote.trim()) {
      showToast('Please enter the testimonial quote', 'error');
      return;
    }

    const finalId = formData.id.trim() || `testimonial-${Date.now().toString(36)}`;
    const initials = formData.avatarInitials.trim() || formData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const payload = {
      ...formData,
      id: finalId,
      avatarInitials: initials,
      status: publishNow !== undefined ? (publishNow ? 'published' : 'draft') : formData.status,
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'testimonials', finalId), payload);
      showToast(`Testimonial from "${formData.name}" saved!`, 'success');
      setEditingItem(null);
      await loadAllTestimonials();
      await refreshData();
      await triggerRevalidation(['testimonials'], ['/']);
    } catch (err: any) {
      showToast(err.message || 'Failed to save testimonial', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      showToast('Testimonial deleted', 'success');
      setDeleteConfirmId(null);
      await loadAllTestimonials();
      await refreshData();
      await triggerRevalidation(['testimonials'], ['/']);
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
        setDoc(doc(db, 'testimonials', current.id), { ...current, order: targetOrder }, { merge: true }),
        setDoc(doc(db, 'testimonials', target.id), { ...target, order: currentOrder }, { merge: true }),
      ]);
      await loadAllTestimonials();
      await refreshData();
      await triggerRevalidation(['testimonials'], ['/']);
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  const filteredList = items.filter((t) => {
    return (
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.company?.toLowerCase().includes(search.toLowerCase()) ||
      t.quote?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Client Testimonials</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage verified client endorsements, founder quotes, company roles, and star ratings.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Testimonial</span>
          </button>
        )}
      </div>

      {editingItem ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900">
              {isNew ? 'New Testimonial' : `Edit: ${formData.name}`}
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
              <label className="text-xs font-bold text-neutral-800 block mb-1">Author Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Siddharth Kapoor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Company / Organization *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. FinNova (Series B)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Founder & CEO"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Star Rating (1 - 5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              >
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★☆</option>
                <option value={3}>3 Stars ★★★☆☆</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Quote Text *</label>
              <textarea
                rows={3}
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="What did the client say?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none"
              ></textarea>
            </div>

            {/* Avatar via ImageField */}
            <div className="sm:col-span-2">
              <ImageField
                label="Avatar Photo (Optional)"
                category="testimonials"
                value={formData.avatarImage || ''}
                driveFileId={formData.driveFileId}
                alt={formData.alt || formData.name}
                aspectRatioClass="aspect-square max-w-[120px]"
                onChange={({ image, driveFileId, alt }) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    avatarImage: image,
                    driveFileId,
                    alt,
                  }))
                }
              />
            </div>
          </div>

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
                onClick={() => handleSave(true)}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow cursor-pointer"
              >
                Save Testimonial
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search testimonials..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Loading testimonials...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">No testimonials found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Company &amp; Role</th>
                    <th className="py-3 px-4">Quote</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {filteredList.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-neutral-700 w-5">{t.order || idx + 1}</span>
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
                        <div className="font-bold text-neutral-900">{t.name}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600">
                        {t.role}, {t.company}
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600 max-w-xs truncate">
                        "{t.quote}"
                      </td>
                      <td className="py-3 px-4 text-amber-500 font-bold">
                        {'★'.repeat(t.rating || 5)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
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

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Delete Testimonial?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Delete testimonial <span className="font-mono font-bold">{deleteConfirmId}</span>?
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
