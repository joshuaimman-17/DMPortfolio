'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { triggerRevalidation, uploadImage } from '../../lib/admin-service';
import { PageMetadata, PageOpenGraphImage } from '@/types/settings';
import { PORTFOLIO_DATA } from '@/data/portfolioData';

interface PageItem {
  id: string; // Firestore document ID e.g. "route_home"
  routePath: string; // e.g. "/" or "/services/seo-optimization"
  name: string; // Display label
  category: 'hub' | 'service' | 'work' | 'blog';
  defaultTitle: string;
  defaultDescription: string;
  defaultImage?: string;
}

export const AdminMetadata: React.FC = () => {
  const { settings, services, works, blogPosts, showToast } = usePortfolioData();
  const siteName = settings?.name || PORTFOLIO_DATA.profile.name || 'Alex Rivera';

  // Build full inventory of public pages
  const allPages: PageItem[] = [
    {
      id: 'route_home',
      routePath: '/',
      name: 'Homepage (Overview & Funnel)',
      category: 'hub',
      defaultTitle: `${siteName} | Growth Marketer - Performance Portfolio`,
      defaultDescription:
        'Performance marketing portfolio and client acquisition platform for senior digital marketing expert. Featuring full-funnel case studies, verified organic SERP rankings, and growth audit booking.',
      defaultImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    },
    {
      id: 'route_services',
      routePath: '/services',
      name: 'Services Hub (Capabilities)',
      category: 'hub',
      defaultTitle: `Growth Services & Capabilities | ${siteName}`,
      defaultDescription:
        'Full-funnel growth services built for scalable revenue. Technical SEO, high-ROAS paid media across Google and Meta, and conversion rate optimization.',
      defaultImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=630&fit=crop',
    },
    {
      id: 'route_works',
      routePath: '/works',
      name: 'Works Hub (Proof of Work)',
      category: 'hub',
      defaultTitle: `Proof of Work & Case Studies | ${siteName}`,
      defaultDescription:
        'Forensic case studies, unedited Google Search Console curves, and high-converting ad creative assets across B2B SaaS and D2C brands.',
      defaultImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=630&fit=crop',
    },
    {
      id: 'route_blog',
      routePath: '/blog',
      name: 'Blog Hub (Field Notes)',
      category: 'hub',
      defaultTitle: `Growth Playbooks & Field Notes | ${siteName}`,
      defaultDescription:
        'Field notes on technical SEO, ad script testing frameworks, and server-side conversion tracking by Alex Rivera.',
      defaultImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&h=630&fit=crop',
    },
    // Dynamic Services
    ...services.map((s) => ({
      id: `route_service_${s.slug}`,
      routePath: `/services/${s.slug}`,
      name: `Service: ${s.title}`,
      category: 'service' as const,
      defaultTitle: `${s.title} | Growth Practice Area | ${siteName}`,
      defaultDescription: s.summary || `Specialized growth advisory and execution for ${s.title}.`,
      defaultImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=630&fit=crop',
    })),
    // Dynamic Works
    ...works.map((w) => ({
      id: `route_work_${w.slug}`,
      routePath: `/works/${w.slug}`,
      name: `Study: ${w.client} (${w.title.slice(0, 30)}...)`,
      category: 'work' as const,
      defaultTitle: `${w.title} | Case Study | ${siteName}`,
      defaultDescription: w.challenge || w.goal || `Deep teardown of growth milestone achieved for ${w.client}.`,
      defaultImage: w.coverImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=630&fit=crop',
    })),
    // Dynamic Blog Posts
    ...blogPosts.map((p) => ({
      id: `route_post_${p.slug}`,
      routePath: `/blog/${p.slug}`,
      name: `Article: ${p.title.slice(0, 36)}...`,
      category: 'blog' as const,
      defaultTitle: `${p.title} | Field Notes | ${siteName}`,
      defaultDescription: p.excerpt || `Growth architecture article analyzing acquisition and attribution.`,
      defaultImage: p.coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&h=630&fit=crop',
    })),
  ];

  const [selectedPage, setSelectedPage] = useState<PageItem>(allPages[0]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'hub' | 'service' | 'work' | 'blog'>('all');
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activePreview, setActivePreview] = useState<'google' | 'og' | 'twitter'>('og');

  // Form State adhering to PageMetadata
  const [formData, setFormData] = useState<PageMetadata>({
    title: allPages[0].defaultTitle,
    description: allPages[0].defaultDescription,
    alternates: {
      canonical: allPages[0].routePath,
    },
    openGraph: {
      title: allPages[0].defaultTitle,
      description: allPages[0].defaultDescription,
      url: `https://alexriveragrowth.com${allPages[0].routePath}`,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: allPages[0].defaultImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
          width: 1200,
          height: 630,
          alt: allPages[0].defaultTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: allPages[0].defaultTitle,
      description: allPages[0].defaultDescription,
      images: [allPages[0].defaultImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'],
    },
  });

  // Load custom metadata when selected page changes
  useEffect(() => {
    let isCurrent = true;
    async function loadPageDoc() {
      setLoadingDoc(true);
      try {
        const docRef = doc(db, 'pages_metadata', selectedPage.id);
        const snap = await getDoc(docRef);
        if (!isCurrent) return;

        const defaultImg = selectedPage.defaultImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop';
        const defaultOgImage: PageOpenGraphImage = {
          url: defaultImg,
          width: 1200,
          height: 630,
          alt: selectedPage.defaultTitle,
        };

        if (snap.exists()) {
          const d = snap.data();
          setFormData({
            title: d.title || selectedPage.defaultTitle,
            description: d.description || selectedPage.defaultDescription,
            alternates: {
              canonical: d.alternates?.canonical || selectedPage.routePath,
            },
            openGraph: {
              title: d.openGraph?.title || d.title || selectedPage.defaultTitle,
              description: d.openGraph?.description || d.description || selectedPage.defaultDescription,
              url: d.openGraph?.url || `https://alexriveragrowth.com${selectedPage.routePath}`,
              siteName: siteName,
              locale: 'en_US',
              type: 'website',
              images: Array.isArray(d.openGraph?.images) && d.openGraph.images.length > 0
                ? d.openGraph.images.map((img: any) => ({
                    url: img.url || defaultImg,
                    width: Number(img.width) || 1200,
                    height: Number(img.height) || 630,
                    alt: img.alt || selectedPage.name,
                  }))
                : [defaultOgImage],
            },
            twitter: {
              card: 'summary_large_image',
              title: d.twitter?.title || d.title || selectedPage.defaultTitle,
              description: d.twitter?.description || d.description || selectedPage.defaultDescription,
              images: Array.isArray(d.twitter?.images) && d.twitter.images.length > 0
                ? d.twitter.images
                : [defaultImg],
            },
          });
        } else {
          // Pre-populate with route-specific defaults
          setFormData({
            title: selectedPage.defaultTitle,
            description: selectedPage.defaultDescription,
            alternates: {
              canonical: selectedPage.routePath,
            },
            openGraph: {
              title: selectedPage.defaultTitle,
              description: selectedPage.defaultDescription,
              url: `https://alexriveragrowth.com${selectedPage.routePath}`,
              siteName: siteName,
              locale: 'en_US',
              type: 'website',
              images: [defaultOgImage],
            },
            twitter: {
              card: 'summary_large_image',
              title: selectedPage.defaultTitle,
              description: selectedPage.defaultDescription,
              images: [defaultImg],
            },
          });
        }
      } catch (err) {
        console.warn('Error loading page metadata from Firestore:', err);
      } finally {
        if (isCurrent) setLoadingDoc(false);
      }
    }

    loadPageDoc();
    return () => {
      isCurrent = false;
    };
  }, [selectedPage, siteName]);

  const handleCopyMetaToSocial = () => {
    const currentImg = formData.openGraph.images[0]?.url || selectedPage.defaultImage || '';
    setFormData((prev) => ({
      ...prev,
      openGraph: {
        ...prev.openGraph,
        title: prev.title,
        description: prev.description,
        siteName: siteName,
      },
      twitter: {
        ...prev.twitter,
        title: prev.title,
        description: prev.description,
        images: currentImg ? [currentImg] : prev.twitter.images,
      },
    }));
    showToast('Page Title and Description synced to OpenGraph & Twitter!', 'info');
  };

  const handleOgImageChange = (url: string) => {
    const primaryImg: PageOpenGraphImage = {
      url,
      width: 1200,
      height: 630,
      alt: formData.openGraph.images[0]?.alt || formData.title,
    };
    setFormData((prev) => ({
      ...prev,
      openGraph: {
        ...prev.openGraph,
        images: [primaryImg],
      },
      twitter: {
        ...prev.twitter,
        images: [url],
      },
    }));
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading OpenGraph card image...', 'info');
      const { url } = await uploadImage(file, 'metadata');
      handleOgImageChange(url);
      showToast('Card image uploaded with auto-configured 1200x630 dimensions!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed. You can paste an image URL directly.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: PageMetadata & { updatedAt: string } = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        alternates: {
          canonical: formData.alternates.canonical.trim(),
        },
        openGraph: {
          title: (formData.openGraph.title || formData.title).trim(),
          description: (formData.openGraph.description || formData.description).trim(),
          url: formData.openGraph.url.trim(),
          siteName: siteName,
          locale: 'en_US',
          type: 'website',
          images: formData.openGraph.images.map((img) => ({
            url: img.url.trim(),
            width: Number(img.width) || 1200,
            height: Number(img.height) || 630,
            alt: img.alt?.trim() || formData.title,
          })),
        },
        twitter: {
          card: 'summary_large_image',
          title: (formData.twitter.title || formData.title).trim(),
          description: (formData.twitter.description || formData.description).trim(),
          images: formData.twitter.images.filter(Boolean),
        },
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'pages_metadata', selectedPage.id), payload);
      showToast(`Metadata for "${selectedPage.name}" saved to Firestore!`, 'success');

      // Trigger precise cache revalidation on the specific route path and metadata tag
      await triggerRevalidation(['metadata', 'settings'], [selectedPage.routePath]);
      showToast(`Cache revalidated for ${selectedPage.routePath}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save metadata', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredPages = allPages.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.routePath.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeImage = formData.openGraph.images[0]?.url || selectedPage.defaultImage || '';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">SEO &amp; OpenGraph Metadata</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage custom page titles, meta descriptions, canonical URLs, and 1200×630 social share cards across all public pages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loadingDoc}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{saving ? 'Saving...' : 'Save Page Metadata'}</span>
        </button>
      </div>

      {/* Main 2-Pane Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Page Directory */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Site Pages ({allPages.length})
            </span>
            <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary-fixed/40">
              Active: {selectedPage.routePath}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-neutral-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search page or route..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'hub', label: 'Hubs' },
              { id: 'service', label: 'Services' },
              { id: 'work', label: 'Studies' },
              { id: 'blog', label: 'Articles' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === cat.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Page List */}
          <div className="flex flex-col gap-1.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredPages.map((page) => {
              const isSelected = selectedPage.id === page.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setSelectedPage(page)}
                  className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        page.category === 'hub'
                          ? 'bg-blue-100 text-blue-700'
                          : page.category === 'service'
                          ? 'bg-emerald-100 text-emerald-700'
                          : page.category === 'work'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {page.category}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {page.routePath}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 line-clamp-1">
                    {page.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Metadata Form & Social Preview */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Editing Metadata For
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-0.5">
                  {selectedPage.name}
                </h3>
                <span className="font-mono text-xs text-neutral-500">
                  Canonical: {formData.alternates.canonical}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyMetaToSocial}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                title="Populate OpenGraph and Twitter card title/description from page meta"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Sync Page Meta to Social Cards</span>
              </button>
            </div>

            {/* 1. Core Page Meta (HTML Title, Meta Description, Canonical) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">title</span>
                <span>Standard HTML Search Metadata</span>
              </h4>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-800">
                    Page Title (&lt;title&gt;) *
                  </label>
                  <span className={`text-[11px] font-mono ${formData.title.length > 60 ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
                    {formData.title.length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Page title displayed on browser tab & Google SERP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-800">
                    Meta Description (&lt;meta name=&quot;description&quot;&gt;) *
                  </label>
                  <span className={`text-[11px] font-mono ${formData.description.length > 160 ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
                    {formData.description.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Concise overview snippet shown in Google search result snippets and social shares"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Canonical URL */}
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Canonical Route Path (alternates.canonical)
                </label>
                <input
                  type="text"
                  value={formData.alternates.canonical}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alternates: { canonical: e.target.value },
                      openGraph: {
                        ...formData.openGraph,
                        url: `https://alexriveragrowth.com${e.target.value}`,
                      },
                    })
                  }
                  placeholder="/services/performance-marketing"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-700"
                />
              </div>
            </div>

            {/* 2. OpenGraph & Twitter Card Block */}
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">share</span>
                <span>OpenGraph &amp; Twitter/X Card Configuration</span>
              </h4>

              {/* OG Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    OpenGraph Title (og:title)
                  </label>
                  <input
                    type="text"
                    value={formData.openGraph.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        openGraph: { ...formData.openGraph, title: e.target.value },
                        twitter: { ...formData.twitter, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    OpenGraph Site Name (og:site_name)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={siteName}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs text-neutral-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Synced from Site Settings: {siteName}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  OpenGraph Description (og:description)
                </label>
                <textarea
                  rows={2}
                  value={formData.openGraph.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openGraph: { ...formData.openGraph, description: e.target.value },
                      twitter: { ...formData.twitter, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs resize-none"
                />
              </div>

              {/* 1200x630 Card Image */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    Shared Card Image (1200 × 630 px)
                  </span>
                  <span className="text-[10px] font-bold text-secondary px-2 py-0.5 rounded bg-secondary-container/40">
                    Preset: 1200×630 Aspect Ratio
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8">
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Image URL (Absolute or Google Drive CDN)
                    </label>
                    <input
                      type="text"
                      value={activeImage}
                      onChange={(e) => handleOgImageChange(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-4 flex flex-col justify-end">
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Upload New Card
                    </label>
                    <label className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Image Alt Description (for accessibility &amp; fallback)
                  </label>
                  <input
                    type="text"
                    value={formData.openGraph.images[0]?.alt || ''}
                    onChange={(e) => {
                      const updatedImages = [...formData.openGraph.images];
                      if (updatedImages[0]) {
                        updatedImages[0].alt = e.target.value;
                      }
                      setFormData({
                        ...formData,
                        openGraph: { ...formData.openGraph, images: updatedImages },
                      });
                    }}
                    placeholder="e.g. Alex Rivera Performance Marketing Portfolio Overview"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{saving ? 'Saving...' : `Save & Revalidate ${selectedPage.routePath}`}</span>
              </button>
            </div>
          </form>

          {/* Real-Time Live Social Card Previews */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">preview</span>
                <span className="text-sm font-bold text-neutral-900">
                  Live Social &amp; Search Engine Previews
                </span>
              </div>

              {/* Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActivePreview('og')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activePreview === 'og'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  LinkedIn / Facebook Card
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview('twitter')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activePreview === 'twitter'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Twitter / X Card
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview('google')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activePreview === 'google'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Google SERP
                </button>
              </div>
            </div>

            {/* 1. OpenGraph Preview (LinkedIn/Facebook) */}
            {activePreview === 'og' && (
              <div className="max-w-md mx-auto border border-neutral-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="relative aspect-[1200/630] bg-neutral-100 overflow-hidden">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={formData.openGraph.images[0]?.alt || formData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                      No card image selected
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                    1200 × 630
                  </span>
                </div>
                <div className="p-3.5 space-y-1 bg-neutral-50 border-t border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    alexriveragrowth.com
                  </span>
                  <div className="text-xs font-bold text-neutral-900 line-clamp-2 leading-tight">
                    {formData.openGraph.title || formData.title}
                  </div>
                  <p className="text-[11px] text-neutral-600 line-clamp-2 leading-snug">
                    {formData.openGraph.description || formData.description}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Twitter/X Summary Large Image Card Preview */}
            {activePreview === 'twitter' && (
              <div className="max-w-md mx-auto border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-black text-white">
                <div className="relative aspect-[1200/630] bg-neutral-900 overflow-hidden">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">
                      No Twitter card image
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                    <span>alexriveragrowth.com</span>
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="text-xs font-bold text-neutral-100 line-clamp-1">
                    {formData.twitter.title || formData.title}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {formData.twitter.description || formData.description}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Google SERP Preview */}
            {activePreview === 'google' && (
              <div className="max-w-xl mx-auto p-4 rounded-xl border border-neutral-200 bg-white space-y-1">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold">
                    AR
                  </div>
                  <span className="text-[11px] text-neutral-700 font-medium">alexriveragrowth.com</span>
                  <span className="text-neutral-400">›</span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedPage.routePath.replace(/^\//, '') || 'home'}
                  </span>
                </div>

                <div className="text-base text-blue-700 hover:underline font-medium line-clamp-1 cursor-pointer">
                  {formData.title}
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {formData.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
