import React, { useEffect, useState } from "react";
import Header from "../../Layout/Header";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/config";
import { toast } from 'react-toastify';

export function BorrowerDashboard() {
  const { user, token } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // centralized fetch so we can call it from handlers too
  const fetchLoans = async () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/borrow/history');
      console.debug('Borrow fetch', '/borrow/history', res.status, res.data);
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.borrows)
        ? data.borrows
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.loans)
        ? data.loans
        : [];
      if (res.status === 200) setLoans(list);
      else setLoans([]);
    } catch (err) {
      console.error('Error fetching loans:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Unauthorized');
      } else {
        toast.error('Failed to load loans — check console for details');
      }
      setError(err);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    const onChange = () => fetchLoans();
    window.addEventListener('borrowHistoryChanged', onChange);
    return () => { window.removeEventListener('borrowHistoryChanged', onChange); };
  }, [user, token]);

  const fmt = (s) => {
    if (!s) return "-";
    try {
      return new Date(s).toLocaleDateString();
    } catch (e) {
      return String(s);
    }
  };

  const hasReturnTimestamp = (l) => Boolean(l.returnDate || l.return_date || l.returnedAt || l.returned_at);
  const activeLoans = loans.filter((l) => !hasReturnTimestamp(l));
  const overdue = loans.filter((l) => {
    const ret = l.returnDate ?? l.return_date ?? l.dueDate ?? l.due_date ?? l.returnedAt ?? l.returned_at;
    if (!ret) return false;
    const d = new Date(ret);
    return !isNaN(d.getTime()) && d < new Date();
  });
  const holds = loans.filter((l) => l.status === "hold" || l.status === "on-hold").length;

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <Header />
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[--text]">Welcome back</h1>
              <p className="text-sm text-[--muted]">Here's your borrowing activity and quick actions.</p>
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-[var(--surface)] p-4 shadow-sm">
              <div className="text-xs font-semibold text-[--muted]">Active Loans</div>
              <div className="mt-2 text-2xl font-bold text-[--text]">{activeLoans.length}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-[var(--surface)] p-4 shadow-sm">
              <div className="text-xs font-semibold text-[--muted]">Overdue</div>
              <div className="mt-2 text-2xl font-bold text-[--text]">{overdue.length}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-[var(--surface)] p-4 shadow-sm">
              <div className="text-xs font-semibold text-[--muted]">Holds</div>
              <div className="mt-2 text-2xl font-bold text-[--text]">{holds}</div>
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Current Loans</h2>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-6 text-center text-sm text-gray-500">Loading loans...</div>
              ) : error ? (
                <div className="p-6 text-center text-sm text-red-600">Failed to load loans</div>
              ) : loans.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">You have no active loans.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[var(--surface)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Book Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">ISBN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Borrow Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Return Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loans.map((l, i) => {
                      const borrowId = l._id || l.id || l.borrowId || l.borrow_id || null;
                      const book = l.book ?? l.bookId ?? null;
                      const bookName = l.bookTitle ?? l.book?.title ?? l.title ?? book?.title ?? book?.name ?? "-";
                      const isbn = l.book?.isbn ?? l.isbn ?? l.ISBN ?? book?.isbn ?? "-";
                      return (
                        <tr key={borrowId ?? i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-[--text]">{bookName}</td>
                          <td className="px-4 py-3 text-sm text-[--muted]">{isbn}</td>
                          <td className="px-4 py-3 text-sm text-[--muted]">{fmt(l.borrowDate ?? l.borrow_date ?? l.borrowedAt ?? l.borrowed_at)}</td>
                          <td className="px-4 py-3 text-sm text-[--muted]">{fmt(l.returnDate ?? l.return_date ?? l.dueDate ?? l.due_date ?? l.returnedAt ?? l.returned_at)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={async () => {
                                  // handle return action
                                  try {
                                    // quick local check: if this loan already has a return timestamp, don't call the API
                                    if (hasReturnTimestamp(l)) {
                                      const returnTs = l.returnedAt || l.returned_at || l.returnDate || l.return_date || null;
                                      const human = returnTs ? new Date(returnTs).toLocaleString() : null;
                                      return toast.info(returnTs ? `Book already returned on ${human}` : 'Book already returned');
                                    }

                                    if (!borrowId) {
                                      // try to resolve by fetching history
                                      const hr = await api.get('/borrow/history');
                                      const hist = hr.data ?? [];
                                      const found = (Array.isArray(hist) ? hist : hist.borrows || hist.data || []).find(rec => {
                                        const recBook = rec.bookId ?? rec.book ?? rec.bookDetails ?? null;
                                        const recBookId = recBook && (recBook._id || recBook.id) ? (recBook._id || recBook.id) : recBook;
                                        const matchById = recBookId && book && (String(recBookId) === String(book._id || book.id || book.bookId));
                                        const matchByIsbn = recBook && recBook.isbn && isbn && String(recBook.isbn) === String(isbn);
                                        return matchById || matchByIsbn;
                                      });
                                      if (found) {
                                          // if the found record already has a timestamp, show it instead of calling return
                                          if (hasReturnTimestamp(found)) {
                                            const returnTs = found.returnedAt || found.returned_at || found.returnDate || found.return_date || null;
                                            const human = returnTs ? new Date(returnTs).toLocaleString() : null;
                                            try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
                                            return toast.info(returnTs ? `Book already returned on ${human}` : 'Book already returned');
                                          }

                                          // use found id
                                          const resolvedId = found._id || found.id;
                                          if (!resolvedId) return toast.error('Could not find borrow id to return');
                                          console.debug('Attempting return (resolvedId)', { resolvedId, book, found });
                                          const ret = await api.post(`/borrow/return/${encodeURIComponent(resolvedId)}`);
                                          console.debug('Return response', ret?.status, ret?.data);
                                          toast.success(ret?.data?.message || 'Returned');
                                          // refresh authoritative data from server
                                          await fetchLoans();
                                          try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
                                        } else {
                                          return toast.error('Active borrow record not found');
                                        }
                                    } else {
                                      console.debug('Attempting return (borrowId)', { borrowId, book });
                                      const ret = await api.post(`/borrow/return/${encodeURIComponent(borrowId)}`);
                                      console.debug('Return response', ret?.status, ret?.data);
                                      toast.success(ret?.data?.message || 'Returned');
                                      // refresh authoritative data from server
                                      await fetchLoans();
                                      try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
                                    }
                                  } catch (err) {
                                    console.error('Return error', err);
                                    const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to return';

                                    // If server says it's already returned, re-fetch history and update local UI with any returned timestamp
                                    const text = typeof serverMsg === 'string' ? serverMsg.toLowerCase() : JSON.stringify(serverMsg).toLowerCase();
                                    if (text.includes('already') && text.includes('return')) {
                                      try {
                                        const probe = await api.get('/borrow/history');
                                        const hist = probe.data?.borrows || probe.data?.data || probe.data || [];
                                        const matching = hist.find(rec => {
                                          const recBook = rec.bookId ?? rec.book ?? null;
                                          const recBookId = recBook && (recBook._id || recBook.id) ? (recBook._id || recBook.id) : recBook;
                                          const matchById = borrowId && rec._id && String(rec._id) === String(borrowId);
                                          const matchByIsbn = recBook && recBook.isbn && isbn && String(recBook.isbn) === String(isbn);
                                          return matchById || matchByIsbn;
                                        });
                                        if (matching) {
                                          const returnTs = matching.returnedAt || matching.returned_at || matching.returnDate || matching.return_date || null;
                                          const human = returnTs ? new Date(returnTs).toLocaleString() : null;
                                          // update the loans array with whatever info server provides
                                          setLoans(prev => prev.map(p => {
                                            const pid = p._id ?? p.id ?? p.borrowId ?? p.borrow_id;
                                            const recId = matching._id ?? matching.id ?? matching.borrowId ?? matching.borrow_id;
                                            const match = (pid && recId && String(pid) === String(recId)) || (p.book && matching.bookId && String(p.book._id || p.book.id || p.book) === String(matching.bookId._id || matching.bookId.id || matching.bookId));
                                            if (!match) return p;
                                            const out = { ...p, returned: true };
                                            if (returnTs) {
                                              out.returnedAt = returnTs;
                                              out.returnDate = returnTs;
                                              out.returned_at = returnTs;
                                              out.return_date = returnTs;
                                            }
                                            return out;
                                          }));
                                          try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
                                          return toast.info(human ? `Book already returned on ${human}` : String(serverMsg));
                                        }
                                      } catch (e) {
                                        // ignore probe failure and fall through to toast
                                      }
                                    }

                                    toast.error(String(serverMsg));
                                  }
                                }}
                                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-95"
                              >
                                Return
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="mt-8 max-w-md">
            <div className="rounded-xl border border-slate-200 bg-[var(--surface)] p-4 text-sm text-[--muted] shadow-sm">
              <div className="mb-2 font-semibold text-[--text]">Getting started</div>
              <ul className="list-disc pl-5 text-[--muted]">
                <li>View your active loans and due dates.</li>
                <li>Use Renew or Return actions to manage loans.</li>
                <li>Use Books to browse the catalog and place holds.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default BorrowerDashboard;