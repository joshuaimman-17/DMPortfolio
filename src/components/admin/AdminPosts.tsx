import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { uploadMediaFile } from '../../lib/portfolioService';
import { BlogPostDetail } from '../../data/portfolioData';
import { triggerRevalidation } from '../../lib/admin-service';
import { ImageField } from './ImageField';

export const AdminPosts: React.FC = () => {
  const { blogPosts: cachedPosts, refreshData, showToast } = usePortfolioData();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    category: 'SEO Strategy',
    excerpt: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: '6 min read',
    coverImage: '',
    author: {
      name: 'Alex Rivera',
      role: 'Growth & Search Strategist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
    },
    toc: [{ id: 'intro', title: '1. Introduction' }],
    contentBlocks: [
      {
        heading: '1. Introduction',
        paragraphs: ['Article paragraph content...'],
        pullQuote: 'Actionable takeaway insight.',
      },
    ],
    status: 'draft',
    order: 1,
  });

  const loadAllPosts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'posts'));
      if (snap.empty) {
        setPosts(cachedPosts.map((p, idx) => ({ ...p, status: 'published', order: idx + 1 })));
      } else {
        const list: any[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPosts(list);
      }
    } catch {
      setPosts(cachedPosts.map((p, idx) => ({ ...p, status: 'published', order: idx + 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPosts();
  }, [cachedPosts]);

  const handleEdit = (item: any) => {
    setIsNew(false);
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      slug: item.slug || item.id || '',
      category: item.category || 'SEO Strategy',
      excerpt: item.excerpt || '',
      date: item.date || '',
      readTime: item.readTime || '6 min read',
      coverImage: item.coverImage || '',
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      author: item.author || {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar: '',
      },
      toc: item.toc || [{ id: 'intro', title: '1. Introduction' }],
      contentBlocks: item.contentBlocks || [
        { heading: '1. Introduction', paragraphs: [''], pullQuote: '' },
      ],
      status: item.status || 'published',
      order: item.order || 1,
    });
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setFormData({
      title: '',
      slug: '',
      category: 'Paid Media',
      excerpt: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      driveFileId: '',
      alt: '',
      author: {
        name: 'Alex Rivera',
        role: 'Growth & Search Strategist',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwM19j5w1v2dJv_uT9m5VnItSeSG2kLLGTVk3pTaunRHwNEu1XZ3bZlXCi8g-1yZEroYTim5ZmX5h1veVo3K5RS2IPqkdJtMcsEnWSmSTdxM37KLgTcCpWjnHT2IuQzh8CKh8CBK7n6W-_qELf32puSPKNgRGdQ4Br7lJySyQswFrp6hkuestTYD15t4zQTrbjY9eN3IBnBX6bakWdEk8UN94sZJU4hapXgTp23Q',
      },
      toc: [{ id: 'section-1', title: '1. Problem Statement' }],
      contentBlocks: [
        {
          heading: '1. Problem Statement',
          paragraphs: ['Write the strategic problem and methodology breakdown...'],
          pullQuote: 'Key takeaway for growth practitioners.',
        },
      ],
      status: 'draft',
      order: posts.length + 1,
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
      driveFileId: item.driveFileId || '',
      alt: item.alt || '',
      status: 'draft',
      order: posts.length + 1,
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
      showToast('File exceeds 2MB limit. Please upload a smaller image.', 'error');
      return;
    }
    setUploadingImage(true);
    showToast('Uploading post cover to Firebase Storage...', 'info');
    try {
      const url = await uploadMediaFile(file, 'posts');
      setFormData((prev: any) => ({ ...prev, coverImage: url }));
      showToast('Cover image uploaded!', 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message + '. You can paste image URL directly.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!formData.title.trim()) {
      showToast('Please enter an article title', 'error');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('Please enter a unique URL slug', 'error');
      return;
    }

    const duplicate = posts.find(
      (p) => p.slug === formData.slug && (isNew || p.slug !== editingItem.slug)
    );
    if (duplicate) {
      showToast(`Slug "${formData.slug}" is already in use. Please pick another.`, 'error');
      return;
    }

    // Auto-generate TOC from content blocks
    const toc = formData.contentBlocks.map((b: any, i: number) => ({
      id: `section-${i + 1}`,
      title: b.heading || `Section ${i + 1}`,
    }));

    const payload = {
      ...formData,
      toc,
      status: publishNow !== undefined ? (publishNow ? 'published' : 'draft') : formData.status,
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'posts', formData.slug), payload);
      showToast(`Article "${formData.title}" saved!`, 'success');
      setEditingItem(null);
      await loadAllPosts();
      await refreshData();
      await triggerRevalidation(['posts']);
    } catch (err: any) {
      showToast(err.message || 'Failed to save article', 'error');
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteDoc(doc(db, 'posts', slug));
      showToast('Article deleted', 'success');
      setDeleteConfirmSlug(null);
      await loadAllPosts();
      await refreshData();
      await triggerRevalidation(['posts']);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete article', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= posts.length) return;

    const listCopy = [...posts];
    const current = listCopy[index];
    const target = listCopy[targetIdx];

    const currentOrder = current.order || index + 1;
    const targetOrder = target.order || targetIdx + 1;

    current.order = targetOrder;
    target.order = currentOrder;

    try {
      await Promise.all([
        setDoc(doc(db, 'posts', current.slug || current.id), { ...current, order: targetOrder }, { merge: true }),
        setDoc(doc(db, 'posts', target.slug || target.id), { ...target, order: currentOrder }, { merge: true }),
      ]);
      await loadAllPosts();
      await refreshData();
      await triggerRevalidation(['posts']);
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  const filteredList = posts.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Blog &amp; Growth Playbooks</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage long-form technical teardowns, structured content blocks, and table of contents.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Article</span>
          </button>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      {editingItem ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900">
              {isNew ? 'New Article' : `Edit: ${formData.title}`}
            </h3>
            <button
              onClick={() => setEditingItem(null)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Article Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. The 2024 Core Update Recovery Blueprint"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">URL Slug (Unique ID) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. core-update-recovery"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. SEO Strategy, Paid Media, Analytics & CRO"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Publication Date</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. Oct 14, 2024"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">Estimated Read Time</label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g. 6 min read"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 block mb-1">Excerpt Summary</label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short teaser for cards and meta descriptions..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none"
              ></textarea>
            </div>

            {/* Cover Image via ImageField */}
            <div className="sm:col-span-2">
              <ImageField
                label="Article Cover Image"
                category="posts"
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
          </div>

          {/* Repeatable Content Blocks */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Article Sections &amp; Content Blocks
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    contentBlocks: [
                      ...formData.contentBlocks,
                      {
                        heading: `${formData.contentBlocks.length + 1}. Section Title`,
                        paragraphs: [''],
                        pullQuote: '',
                      },
                    ],
                  })
                }
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.contentBlocks.map((block: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={block.heading || ''}
                      onChange={(e) => {
                        const updated = [...formData.contentBlocks];
                        updated[idx].heading = e.target.value;
                        setFormData({ ...formData, contentBlocks: updated });
                      }}
                      placeholder={`Section ${idx + 1} Heading...`}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs sm:text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.contentBlocks.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, contentBlocks: updated });
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  {/* Paragraphs */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Body Paragraphs
                    </label>
                    <textarea
                      rows={3}
                      value={block.paragraphs?.join('\n\n') || ''}
                      onChange={(e) => {
                        const updated = [...formData.contentBlocks];
                        updated[idx].paragraphs = e.target.value.split('\n\n');
                        setFormData({ ...formData, contentBlocks: updated });
                      }}
                      placeholder="Write paragraph text here (separate paragraphs with an empty line)..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs leading-relaxed resize-none"
                    ></textarea>
                  </div>

                  {/* Pull Quote */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Highlight Pull-Quote (Optional)
                    </label>
                    <input
                      type="text"
                      value={block.pullQuote || ''}
                      onChange={(e) => {
                        const updated = [...formData.contentBlocks];
                        updated[idx].pullQuote = e.target.value;
                        setFormData({ ...formData, contentBlocks: updated });
                      }}
                      placeholder="Key takeaway quote..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs italic"
                    />
                  </div>
                </div>
              ))}
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
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
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
            <div className="p-8 text-center text-sm text-neutral-500">Loading articles...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">No articles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Read Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {filteredList.map((post, idx) => (
                    <tr key={post.slug || post.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-neutral-700 w-5">{post.order || idx + 1}</span>
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
                        <div className="font-bold text-neutral-900 line-clamp-1">{post.title}</div>
                        <div className="font-mono text-[11px] text-neutral-400">#{post.slug}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600">{post.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {post.status || 'published'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600">{post.readTime}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(post)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Duplicate"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmSlug(post.slug || post.id)}
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
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Delete Article?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Delete article <span className="font-mono font-bold">{deleteConfirmSlug}</span>?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmSlug(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmSlug)}
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
