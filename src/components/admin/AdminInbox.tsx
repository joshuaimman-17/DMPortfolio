import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usePortfolioData } from '../../context/PortfolioContext';
import { SubmissionItem } from '../../lib/portfolioService';

export const AdminInbox: React.FC = () => {
  const { showToast } = usePortfolioData();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'audit' | 'contact'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: SubmissionItem[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SubmissionItem);
      });
      setSubmissions(list);
    } catch {
      // Fallback check from localStorage if offline/empty
      try {
        const local = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        const auditLocal = JSON.parse(localStorage.getItem('growth_audit_bookings') || '[]');
        const combined: SubmissionItem[] = [
          ...local.map((m: any, idx: number) => ({
            id: `local-c-${idx}`,
            type: 'contact' as const,
            name: m.name || 'Anonymous',
            email: m.email || '',
            company: m.company || '',
            message: m.message || '',
            status: 'New' as const,
            createdAt: m.sentAt || new Date().toISOString(),
          })),
          ...auditLocal.map((a: any, idx: number) => ({
            id: `local-a-${idx}`,
            type: 'audit' as const,
            name: a.name || 'Anonymous',
            email: a.email || '',
            company: a.website || '',
            website: a.website || '',
            challenge: a.goal || a.bottleneck || '',
            budget: a.spend || '',
            status: 'New' as const,
            createdAt: a.submittedAt || new Date().toISOString(),
          })),
        ];
        setSubmissions(combined);
      } catch {
        setSubmissions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'New' | 'Contacted' | 'Closed') => {
    try {
      await updateDoc(doc(db, 'submissions', id), { status: newStatus });
      setSubmissions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Status updated to "${newStatus}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'submissions', id));
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      setDeleteConfirmId(null);
      showToast('Submission deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete submission', 'error');
    }
  };

  const filtered = submissions.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Inbound Submissions &amp; Audits</h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Review growth diagnostic requests and direct advisory contact inquiries.
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-neutral-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-semibold">Type:</span>
          {(['all', 'audit', 'contact'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                filterType === t
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t === 'all' ? 'All Inquiries' : t === 'audit' ? 'Audits' : 'Contact Forms'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-semibold">Status:</span>
          {(['all', 'New', 'Contacted', 'Closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">Loading inbox entries...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-neutral-400">inbox</span>
            <span className="font-bold text-sm text-neutral-700">No submissions matching filter</span>
            <span className="text-xs text-neutral-500">Inbound inquiries will appear here automatically.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Company / URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'audit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{item.name}</div>
                      <div className="text-xs text-neutral-500">{item.email}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-600">
                      {item.company || item.website || '—'}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                          item.status === 'New'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.status === 'Contacted'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`mailto:${item.email}?subject=Alex%20Rivera%20Growth%20Advisory`}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600"
                          title="Reply by email"
                        >
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                        </a>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
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

      {/* DETAIL DRAWER / MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedItem.type === 'audit' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {selectedItem.type} request
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Name</span>
                <span className="text-base font-bold text-neutral-900">{selectedItem.name}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Email Address</span>
                <a href={`mailto:${selectedItem.email}`} className="text-sm font-semibold text-primary hover:underline">
                  {selectedItem.email}
                </a>
              </div>

              {(selectedItem.company || selectedItem.website) && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Company / Website</span>
                  <span className="text-sm text-neutral-800">{selectedItem.company || selectedItem.website}</span>
                </div>
              )}

              {selectedItem.budget && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Monthly Ad Spend / Budget</span>
                  <span className="text-sm text-neutral-800 font-mono font-bold">{selectedItem.budget}</span>
                </div>
              )}

              {selectedItem.preferredSlot && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Preferred Call Slot</span>
                  <span className="text-sm text-neutral-800">{selectedItem.preferredSlot}</span>
                </div>
              )}

              {(selectedItem.message || selectedItem.challenge) && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Challenge &amp; Scope</span>
                  <p className="text-xs sm:text-sm text-neutral-700 p-3 bg-neutral-50 rounded-xl border border-neutral-200 mt-1 leading-relaxed">
                    {selectedItem.message || selectedItem.challenge}
                  </p>
                </div>
              )}

              {selectedItem.sourcePage && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Source Route</span>
                  <span className="text-xs font-mono text-neutral-600">{selectedItem.sourcePage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-600">Status:</span>
                <select
                  value={selectedItem.status}
                  onChange={(e) => handleUpdateStatus(selectedItem.id, e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs font-bold"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedItem.email}?subject=Alex%20Rivera%20Growth%20Diagnostic`}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">reply</span>
                  <span>Reply by Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-neutral-200">
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Delete Submission?</h4>
            <p className="text-xs text-neutral-600 mb-6">
              Remove submission permanently from the database?
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
