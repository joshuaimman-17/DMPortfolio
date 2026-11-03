import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { uploadMediaFile } from '../../lib/portfolioService';
import { WorkDetail, ShowcaseItem } from '../../data/portfolioData';
import { ImageField } from './ImageField';

export const AdminWorks: React.FC = () => {
  const { works: cachedWorks, showcase, refreshData, showToast } = usePortfolioData();
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    client: '',
    title: '',
    slug: '',
    industry: '',
    duration: '',
    services: ['Performance Marketing', 'SEO'],
    result: '',
    stats: [
      { label: 'Organic Uplift', value: '+120%', trend: 'jump' },
      { label: 'ROAS', value: '4.8x', trend: 'scale' },
    ],
    goal: '',
    challenge: '',
    strategy: '',
    execution: [
      { step: 'Month 1', title: 'Technical Crawl & Cleanse', desc: 'Resolved canonical chaining and index bloat.' },
    ],
    proofItemIds: [],
    testimonial: { quote: '', author: '', role: '' },
    learnings: [''],
    coverImage: '',
    status: 'draft',
    order: 1,
  });

  const loadAllWorks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'works'));
      if (snap.empty) {
        setWorks(cachedWorks.map((w, idx) => ({ ...w, status: 'published', order: idx + 1 })));
      } else {
        const list: any[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setWorks(list);
      }
    } catch {
      setWorks(cachedWorks.map((w, idx) => ({ ...w, status: 'published', order: idx + 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllWorks();
  }, [cachedWorks]);

  const handleEdit = (item: any) => {
    setIsNew(false);
    setEditingItem(item);
    setFormData({
      client: item.client || '',
      title: item.title || '',
      slug: item.slug || item.id || '',
      industry: item.industry || '',
      duration: item.duration || '',
      services: item.services || [],
      result: item.result || '',
      stats: item.stats && item.stats.length > 0 ? item.stats : [{ label: '', value: '', trend: '' }],
      goal: item.goal || '',
      challenge: item.challenge || '',
      strategy: item.strategy || '',
      execution: item.execution && item.execution.length > 0 ? item.execution : [{ step: 'Month 1', title: '', desc: '' }],
      proofItemIds: item.proofItemIds || [],
      testimonial: item.testimonial || { quote: '', author: '', role: '' },
      learnings: item.learnings && item.learnings.length > 0 ? item.learnings : [''],
      coverImage: item.coverImage || '',
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      status: item.status || 'published',
      order: item.order || 1,
    });
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setFormData({
      client: '',
      title: '',
      slug: '',
      industry: 'B2B SaaS',
      duration: '6 Months',
      services: ['Technical SEO', 'Performance Ads'],
      result: '+140% Pipeline Scale',
      stats: [
        { label: 'Revenue Growth', value: '+140%', trend: 'jump' },
        { label: 'Blended ROAS', value: '4.6x', trend: 'sustained' },
      ],
      goal: 'Scale revenue past current acquisition plateau with protected unit economics.',
      challenge: 'High cost per lead and poor keyword indexation.',
      strategy: 'Restructured semantic topic clusters and deployed programmatic landing engines.',
      execution: [
        { step: 'Month 1', title: 'Audit & Telemetry Hygiene', desc: 'Resolved pixel drops and set up CAPI.' },
      ],
      proofItemIds: [],
      testimonial: { quote: 'Alex completely transformed our growth pipeline.', author: 'Founder Name', role: 'CEO' },
      learnings: ['Server-side tracking recovers vital conversion signals.'],
      coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      driveFileId: '',
      alt: '',
      status: 'draft',
      order: works.length + 1,
    });
  };

  const handleDuplicate = (item: any) => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    const newSlug = `${item.slug || item.id}-copy`;
    setFormData({
      ...item,
      client: `${item.client} (Copy)`,
      title: `${item.title} (Copy)`,
      slug: newSlug,
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      status: 'draft',
      order: works.length + 1,
    });
  };

  const handleTitleChange = (val: string) => {
    const updated = { ...formData, title: val };
    if (isNew) {
      updated.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    setFormData(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size exceeds 2MB limit. Please select a smaller image.', 'error');
      return;
    }
    setUploadingImage(true);
    showToast('Uploading cover image to Firebase Storage...', 'info');
    try {
      const url = await uploadMediaFile(file, 'works');
      setFormData((prev: any) => ({ ...prev, coverImage: url }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast('Firebase Storage upload failed: ' + err.message + '. You can paste image URL directly.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!formData.client.trim()) {
      showToast('Please enter a client name', 'error');
      return;
    }
    if (!formData.title.trim()) {
      showToast('Please enter a case study title', 'error');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('Please enter a unique URL slug', 'error');
      return;
    }

    const duplicate = works.find(
      (w) => w.slug === formData.slug && (isNew || w.slug !== editingItem.slug)
    );
    if (duplicate) {
      showToast(`Slug "${formData.slug}" is already in use. Please pick another.`, 'error');
      return;
    }

    const payload = {
      ...formData,
      status: publishNow !== undefined ? (publishNow ? 'published' : 'draft') : formData.status,
      learnings: formData.learnings.filter((l: string) => l.trim().length > 0),
      stats: formData.stats.filter((s: any) => s.label.trim().length > 0),
      execution: formData.execution.filter((ex: any) => ex.title.trim().length > 0),
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'works', formData.slug), payload);
      showToast(`Case Study "${formData.title}" saved successfully!`, 'success');
      setEditingItem(null);
      await loadAllWorks();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save case study', 'error');
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteDoc(doc(db, 'works', slug));
      showToast('Case study deleted', 'success');
      setDeleteConfirmSlug(null);
      await loadAllWorks();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete case study', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= works.length) return;

    const listCopy = [...works];
    const current = listCopy[index];
    const target = listCopy[targetIdx];

    const currentOrder = current.order || index + 1;
    const targetOrder = target.order || targetIdx + 1;

    current.order = targetOrder;
    target.order = currentOrder;

    try {
      await Promise.all([
        setDoc(doc(db, 'works', current.slug || current.id), { ...current, order: targetOrder }, { merge: true }),
        setDoc(doc(db, 'works', target.slug || target.id), { ...target, order: currentOrder }, { merge: true }),
      ]);
      await loadAllWorks();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  const filteredList = works.filter((w) => {
    const matchesSearch =
      w.title?.toLowerCase().includes(search.toLowerCase()) ||
      w.client?.toLowerCase().includes(search.toLowerCase()) ||
      w.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Case Studies &amp; Works</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage comprehensive client breakdowns, result statistics, execution timelines, and proof galleries.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Case Study</span>
          </button>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      {editingItem ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900">
              {isNew ? 'New Case Study' : `Edit: ${formData.title}`}
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
              <label className="text-xs font-bold text-neutral-800 block mb-1">Client Name *</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g. PayFlow Systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. B2B FinTech SaaS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Case Study Headline / Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Engineered 185% organic pipeline jump in 5 months"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">URL Slug (Unique ID) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. payflow-systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Duration &amp; Timeline</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 5 Months"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Primary Result Badge</label>
              <input
                type="text"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                placeholder="e.g. +185% Demo Inbound Requests"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Cover Image via ImageField */}
            <div className="sm:col-span-2">
              <ImageField
                label="Case Study Cover Image"
                category="works"
                value={formData.coverImage || ''}
                driveFileId={formData.driveFileId}
                alt={formData.alt || formData.title}
                onChange={({ image, driveFileId, alt }) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    coverImage: image,
                    driveFileId,
                    alt,
                  }))
                }
              />
            </div>

            {/* Goal, Challenge, Strategy */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">The Goal</label>
              <textarea
                rows={2}
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="What was the client trying to achieve?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none"
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">The Challenge / Bottleneck</label>
              <textarea
                rows={2}
                value={formData.challenge}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                placeholder="What was holding them back?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none"
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">The Strategy &amp; Solution</label>
              <textarea
                rows={2}
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                placeholder="How did we solve it?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none"
              ></textarea>
            </div>
          </div>

          {/* Repeatable 4 Result Stat Cards */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Key Result Stats (Cards)
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, stats: [...formData.stats, { label: '', value: '', trend: '' }] })}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Stat</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.stats.map((st: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const updated = [...formData.stats];
                      updated[idx].label = e.target.value;
                      setFormData({ ...formData, stats: updated });
                    }}
                    placeholder="Label (e.g. Demo Inbound)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs"
                  />
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => {
                      const updated = [...formData.stats];
                      updated[idx].value = e.target.value;
                      setFormData({ ...formData, stats: updated });
                    }}
                    placeholder="Value (e.g. +185%)"
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-mono font-bold text-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.stats.filter((_: any, i: number) => i !== idx);
                      setFormData({ ...formData, stats: updated });
                    }}
                    className="p-1 text-neutral-400 hover:text-rose-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Repeatable Execution Timeline */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Execution Sprints &amp; Timeline
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    execution: [
                      ...formData.execution,
                      { step: `Month ${formData.execution.length + 1}`, title: '', desc: '' },
                    ],
                  })
                }
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Step</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.execution.map((step: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={step.step}
                      onChange={(e) => {
                        const updated = [...formData.execution];
                        updated[idx].step = e.target.value;
                        setFormData({ ...formData, execution: updated });
                      }}
                      placeholder="Month 1"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...formData.execution];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, execution: updated });
                      }}
                      placeholder="Step Title..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.execution.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, execution: updated });
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...formData.execution];
                      updated[idx].desc = e.target.value;
                      setFormData({ ...formData, execution: updated });
                    }}
                    placeholder="Description of execution..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs resize-none"
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="pt-2 border-t border-neutral-200 space-y-3">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              Client Testimonial Quote
            </label>
            <textarea
              rows={2}
              value={formData.testimonial?.quote || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  testimonial: { ...formData.testimonial, quote: e.target.value },
                })
              }
              placeholder="What did the client say about this engagement?"
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
            ></textarea>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.testimonial?.author || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    testimonial: { ...formData.testimonial, author: e.target.value },
                  })
                }
                placeholder="Author Name (e.g. Siddharth Kapoor)"
                className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
              />
              <input
                type="text"
                value={formData.testimonial?.role || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    testimonial: { ...formData.testimonial, role: e.target.value },
                  })
                }
                placeholder="Author Role (e.g. Founder & CEO)"
                className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
              />
            </div>
          </div>

          {/* Multi-Select Proof Artifacts from Showcase */}
          <div className="pt-2 border-t border-neutral-200">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-2">
              Link Proof Artifacts (from Showcase collection)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-neutral-50 border border-neutral-200">
              {showcase.map((sc: ShowcaseItem) => {
                const isSelected = formData.proofItemIds?.includes(sc.id);
                return (
                  <label
                    key={sc.id}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border ${
                      isSelected ? 'bg-blue-50 border-primary text-primary font-bold' : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const current = formData.proofItemIds || [];
                        const updated = e.target.checked
                          ? [...current, sc.id]
                          : current.filter((id: string) => id !== sc.id);
                        setFormData({ ...formData, proofItemIds: updated });
                      }}
                      className="rounded"
                    />
                    <span className="truncate">{sc.title}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status & Action Buttons */}
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
        /* WORKS TABLE LIST */
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search works by client, title..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-neutral-500">Status:</span>
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
            <div className="p-8 text-center text-sm text-neutral-500">Loading case studies...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">No case studies found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Client &amp; Case Study</th>
                    <th className="py-3 px-4">Industry</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Verified Result</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {filteredList.map((wrk, idx) => (
                    <tr key={wrk.slug || wrk.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-neutral-700 w-5">{wrk.order || idx + 1}</span>
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
                        <div className="font-bold text-neutral-900">{wrk.client}</div>
                        <div className="text-xs text-neutral-600 line-clamp-1">{wrk.title}</div>
                        <div className="font-mono text-[11px] text-neutral-400">#{wrk.slug}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600">
                        {wrk.industry}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            wrk.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {wrk.status || 'published'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-secondary text-xs">
                        {wrk.result}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(wrk)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(wrk)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Duplicate"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmSlug(wrk.slug || wrk.id)}
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
      {deleteConfirmSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Delete Case Study?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Delete <span className="font-mono font-bold text-neutral-800">{deleteConfirmSlug}</span>? This will remove it from the public portfolio.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmSlug(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmSlug)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
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
