import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { SubscriberItem } from '../../lib/portfolioService';

export const AdminSubscribers: React.FC = () => {
  const { showToast } = usePortfolioData();
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'subscribers'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: SubscriberItem[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SubscriberItem);
      });
      setSubscribers(list);
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        setSubscribers(
          local.map((s: any, idx: number) => ({
            id: `local-sub-${idx}`,
            email: typeof s === 'string' ? s : s.email,
            createdAt: s.date || new Date().toISOString(),
          }))
        );
      } catch {
        setSubscribers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      showToast('No subscribers to export.', 'info');
      return;
    }
    const headers = 'Email,Date Subscribed\n';
    const rows = subscribers
      .map((s) => `"${s.email}","${s.createdAt || ''}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AlexRivera_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Subscribers CSV exported successfully!', 'success');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmId(null);
      showToast('Subscriber removed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove subscriber', 'error');
    }
  };

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Newsletter Subscribers</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Total active subscribers: <span className="font-bold text-neutral-900 font-mono">{subscribers.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://docs.google.com/spreadsheets"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Open Google Sheet</span>
          </a>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold shadow flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
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
              placeholder="Search by email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-neutral-400">mark_email_read</span>
            <span className="font-bold text-sm text-neutral-700">No subscribers found</span>
            <span className="text-xs text-neutral-500">Public newsletter opt-ins will be recorded here.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Sync &amp; Delivery</th>
                  <th className="py-3 px-4">Subscription Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 text-neutral-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">{item.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Sheets &amp; Welcome Email
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Remove Subscriber"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-neutral-200">
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Remove Subscriber?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Delete this email address from the subscribers list?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
