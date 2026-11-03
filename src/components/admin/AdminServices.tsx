import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { ServiceDetail } from '../../data/portfolioData';

export const AdminServices: React.FC = () => {
  const { services: cachedServices, refreshData, showToast } = usePortfolioData();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    icon: string;
    summary: string;
    tag: string;
    pricingApproach: string;
    status: 'draft' | 'published';
    order: number;
    deliverables: string[];
    whoItsFor: string[];
    process: { phase: string; title: string; desc: string }[];
    faqs: { q: string; a: string }[];
    relatedWorkSlugs: string[];
  }>({
    title: '',
    slug: '',
    icon: 'search_check',
    summary: '',
    tag: '',
    pricingApproach: '',
    status: 'draft',
    order: 1,
    deliverables: [''],
    whoItsFor: [''],
    process: [{ phase: 'Phase 1', title: '', desc: '' }],
    faqs: [{ q: '', a: '' }],
    relatedWorkSlugs: [],
  });

  const loadAllServices = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'services'));
      if (snap.empty) {
        setServices(cachedServices.map((s, idx) => ({ ...s, status: 'published', order: idx + 1 })));
      } else {
        const list: any[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setServices(list);
      }
    } catch {
      setServices(cachedServices.map((s, idx) => ({ ...s, status: 'published', order: idx + 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllServices();
  }, [cachedServices]);

  const handleEdit = (item: any) => {
    setIsNew(false);
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      slug: item.slug || item.id || '',
      icon: item.icon || 'search_check',
      summary: item.summary || '',
      tag: item.tag || '',
      pricingApproach: item.pricingApproach || '',
      status: item.status || 'published',
      order: item.order || 1,
      deliverables: item.deliverables && item.deliverables.length > 0 ? item.deliverables : [''],
      whoItsFor: item.whoItsFor && item.whoItsFor.length > 0 ? item.whoItsFor : [''],
      process: item.process && item.process.length > 0 ? item.process : [{ phase: 'Phase 1', title: '', desc: '' }],
      faqs: item.faqs && item.faqs.length > 0 ? item.faqs : [{ q: '', a: '' }],
      relatedWorkSlugs: item.relatedWorkSlugs || [],
    });
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setFormData({
      title: '',
      slug: '',
      icon: 'insights',
      summary: '',
      tag: 'Specialized Practice',
      pricingApproach: 'Monthly advisory retainer with transparent sprint deliverables.',
      status: 'draft',
      order: services.length + 1,
      deliverables: [''],
      whoItsFor: [''],
      process: [
        { phase: 'Phase 1', title: 'Forensic Audit', desc: 'Identify crawl and conversion bottlenecks.' },
        { phase: 'Phase 2', title: 'Architecture & Strategy', desc: 'Construct targeted execution sprints.' },
      ],
      faqs: [{ q: 'What is the turnaround time?', a: 'Initial deliverables launch within 10 business days.' }],
      relatedWorkSlugs: [],
    });
  };

  const handleDuplicate = (item: any) => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    const newSlug = `${item.slug || item.id}-copy`;
    setFormData({
      ...item,
      title: `${item.title} (Copy)`,
      slug: newSlug,
      status: 'draft',
      order: services.length + 1,
    });
  };

  const handleTitleChange = (val: string) => {
    const updated = { ...formData, title: val };
    if (isNew) {
      updated.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    setFormData(updated);
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!formData.title.trim()) {
      showToast('Please enter a service title', 'error');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('Please enter a unique URL slug', 'error');
      return;
    }

    // Check duplicate slug
    const duplicate = services.find(
      (s) => s.slug === formData.slug && (isNew || s.slug !== editingItem.slug)
    );
    if (duplicate) {
      showToast(`Slug "${formData.slug}" is already in use. Please pick another.`, 'error');
      return;
    }

    const payload = {
      ...formData,
      status: publishNow !== undefined ? (publishNow ? 'published' : 'draft') : formData.status,
      deliverables: formData.deliverables.filter((d) => d.trim().length > 0),
      whoItsFor: formData.whoItsFor.filter((w) => w.trim().length > 0),
      process: formData.process.filter((p) => p.title.trim().length > 0),
      faqs: formData.faqs.filter((f) => f.q.trim().length > 0),
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'services', formData.slug), payload);
      showToast(`Service "${formData.title}" saved successfully!`, 'success');
      setEditingItem(null);
      await loadAllServices();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save service', 'error');
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteDoc(doc(db, 'services', slug));
      showToast('Service deleted from Firestore', 'success');
      setDeleteConfirmSlug(null);
      await loadAllServices();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= services.length) return;

    const listCopy = [...services];
    const current = listCopy[index];
    const target = listCopy[targetIdx];

    const currentOrder = current.order || index + 1;
    const targetOrder = target.order || targetIdx + 1;

    current.order = targetOrder;
    target.order = currentOrder;

    try {
      await Promise.all([
        setDoc(doc(db, 'services', current.slug || current.id), { ...current, order: targetOrder }, { merge: true }),
        setDoc(doc(db, 'services', target.slug || target.id), { ...target, order: currentOrder }, { merge: true }),
      ]);
      await loadAllServices();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  // Filter list
  const filteredList = services.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.summary?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Services &amp; Capabilities</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage practice areas, deliverables checklists, process phases, and FAQs.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Service</span>
          </button>
        )}
      </div>

      {/* EDIT / CREATE FORM MODAL OR PANEL */}
      {editingItem ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900">
              {isNew ? 'Create New Service' : `Edit Service: ${formData.title}`}
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
              <label className="text-xs font-bold text-neutral-800 block mb-1">Service Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. SEO & Search Architecture"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">URL Slug (Unique ID) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. seo-search-architecture"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Google Material Symbol Icon</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. search_check, campaign, analytics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{formData.icon}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Category Tag / Subtitle</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g. Technical Audits • Programmatic • Authority"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Summary Description</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief value proposition and practice scope..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Pricing Approach</label>
              <input
                type="text"
                value={formData.pricingApproach}
                onChange={(e) => setFormData({ ...formData, pricingApproach: e.target.value })}
                placeholder="e.g. Monthly advisory retainer with transparent milestone deliverables."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Repeatable Deliverables */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Deliverables Checklist
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliverables: [...formData.deliverables, ''] })}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Row</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.deliverables.map((del, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={del}
                    onChange={(e) => {
                      const updated = [...formData.deliverables];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, deliverables: updated });
                    }}
                    placeholder={`Deliverable #${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.deliverables.filter((_, i) => i !== idx);
                      setFormData({ ...formData, deliverables: updated });
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Repeatable Who It's For */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Who It's For (Ideal Profiles)
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, whoItsFor: [...formData.whoItsFor, ''] })}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Row</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.whoItsFor.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...formData.whoItsFor];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, whoItsFor: updated });
                    }}
                    placeholder={`Target customer profile #${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.whoItsFor.filter((_, i) => i !== idx);
                      setFormData({ ...formData, whoItsFor: updated });
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Repeatable Process Phases */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Execution Process Phases
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    process: [
                      ...formData.process,
                      { phase: `Phase ${formData.process.length + 1}`, title: '', desc: '' },
                    ],
                  })
                }
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Phase</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.process.map((prc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prc.phase}
                      onChange={(e) => {
                        const updated = [...formData.process];
                        updated[idx].phase = e.target.value;
                        setFormData({ ...formData, process: updated });
                      }}
                      placeholder="Phase 1"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={prc.title}
                      onChange={(e) => {
                        const updated = [...formData.process];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, process: updated });
                      }}
                      placeholder="Phase Title (e.g. Forensic Crawl)"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.process.filter((_, i) => i !== idx);
                        setFormData({ ...formData, process: updated });
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={prc.desc}
                    onChange={(e) => {
                      const updated = [...formData.process];
                      updated[idx].desc = e.target.value;
                      setFormData({ ...formData, process: updated });
                    }}
                    placeholder="Phase description..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs resize-none"
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          {/* Repeatable FAQs */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Service FAQs
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, faqs: [...formData.faqs, { q: '', a: '' }] })}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add FAQ</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.faqs.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const updated = [...formData.faqs];
                        updated[idx].q = e.target.value;
                        setFormData({ ...formData, faqs: updated });
                      }}
                      placeholder="Question..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.faqs.filter((_, i) => i !== idx);
                        setFormData({ ...formData, faqs: updated });
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => {
                      const updated = [...formData.faqs];
                      updated[idx].a = e.target.value;
                      setFormData({ ...formData, faqs: updated });
                    }}
                    placeholder="Answer..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs resize-none"
                  ></textarea>
                </div>
              ))}
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
        /* TABLE LIST VIEW */
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
                placeholder="Search services..."
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

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Loading services...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">No services found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Title &amp; Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Deliverables</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {filteredList.map((srv, idx) => (
                    <tr key={srv.slug || srv.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-neutral-700 w-5">{srv.order || idx + 1}</span>
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
                        <div className="font-bold text-neutral-900">{srv.title}</div>
                        <div className="font-mono text-[11px] text-neutral-500">#{srv.slug || srv.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            srv.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {srv.status || 'published'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600">
                        {srv.deliverables?.length || 0} items
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(srv)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Edit Service"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(srv)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Duplicate Service"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmSlug(srv.slug || srv.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Delete Service"
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
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Delete Service?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Are you sure you want to delete <span className="font-mono font-bold text-neutral-800">{deleteConfirmSlug}</span>? This action cannot be undone.
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
