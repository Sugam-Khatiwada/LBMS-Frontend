import React, { useState, useEffect } from "react";
import Header from "../../Layout/Header";
import Sidebar from "../../Layout/Sidebar";
import axios from "axios";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
import AddBorrowerButton from "../AddBorrowerButton";

export default function Borrowers() {
  const { token } = useAuth();
  const [borrower, setBorrower] = useState([]);
  const [booksMap, setBooksMap] = useState({});
  const [modelForm, setModelForm] = useState(false);

  const formatDate = (val) => {
    if (!val) return "-";
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? String(val) : d.toLocaleString();
    } catch (e) {
      return String(val);
    }
  };

  const fetchBorrower = async () => {
    try {
      const res = await axios.get("https://librarymanagementsystem-48c3.onrender.com/api/borrowers", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 200) {
        // normalize response to an array
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.borrowers)
          ? data.borrowers
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setBorrower(list);
        // also try to fetch books to resolve titles (bookId may be an ObjectId)
        try {
          const bres = await axios.get('https://librarymanagementsystem-48c3.onrender.com/api/books', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          const bdata = bres.data || [];
          const map = {};
          if (Array.isArray(bdata)) {
            bdata.forEach(bb => {
              if (bb._id) map[String(bb._id)] = bb.title || bb.name || '';
            });
          } else if (Array.isArray(bdata?.books)) {
            bdata.books.forEach(bb => { if (bb._id) map[String(bb._id)] = bb.title || bb.name || ''; });
          }
          setBooksMap(map);
        } catch (be) {
          // ignore book fetch errors — we'll fall back to ids
          console.debug('Could not fetch books to resolve titles', be?.toString());
        }
      } else {
        console.error("Unexpected status when fetching borrowers:", res.status, res.data);
      }
    } catch (err) {
      console.error("Error fetching borrowers:", err);
    }
  };

  const handleMarkReturned = async (borrowId) => {
    if (!borrowId) return toast.error('Missing borrow id');
    if (!window.confirm('Mark this borrow as returned?')) return;
    try {
      const res = await axios.put(`https://librarymanagementsystem-48c3.onrender.com/api/borrowers/${encodeURIComponent(borrowId)}`, { returnDate: new Date().toISOString() }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      // update local state
      setBorrower((s) => s.map(b => ((b._id === borrowId || b.id === borrowId) ? (res.data?.borrow || res.data || b) : b)));
      toast.success(res?.data?.message || 'Borrow updated');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update borrow';
      toast.error(msg);
      console.error('Error updating borrow:', err);
    }
  };

  const handleDeleteBorrow = async (borrowId) => {
    if (!borrowId) return toast.error('Missing borrow id');
    if (!window.confirm('Delete this borrow record?')) return;
    try {
      const res = await axios.delete(`https://librarymanagementsystem-48c3.onrender.com/api/borrowers/${encodeURIComponent(borrowId)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setBorrower((s) => s.filter(b => !((b._id === borrowId) || (b.id === borrowId))));
      toast.success(res?.data?.message || 'Borrow deleted');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete borrow';
      toast.error(msg);
      console.error('Error deleting borrow:', err);
    }
  };

  useEffect(() => {
    fetchBorrower();
  }, [token]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="mt-10 w-full px-4 sm:px-6 lg:px-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-secondary">Borrower List</h2>
            <AddBorrowerButton className="px-3 py-1.5 text-sm bg-accent-primary" />
          </div>

          <div className="mt-4 px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Book ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Borrow Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Return Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(borrower || []).map((r, idx) => {
                    // borrow record id fallback
                    const foundBorrowId = r._id || r.id || r.borrowId || r.borrow_id || null;
                    // derive user display name
                    const userObj = r.user ?? r.userId ?? r.member ?? null;
                    const userName = (userObj && (userObj.name || userObj.fullName || userObj.email)) || r.userName || r.user_name || String(r.userId ?? r.user ?? r.memberId ?? r.member ?? "-");
                    // derive book title
                    const bookObj = r.book ?? r.bookId ?? null;
                    const bookId = (bookObj && (bookObj._id || bookObj.id)) || r.bookId || r.book_id || null;
                    const bookTitle = (bookObj && (bookObj.title || bookObj.name)) || (bookId && booksMap[String(bookId)]) || r.bookTitle || r.book_title || String(bookId ?? "-");
                    const borrowDate = r.borrowDate ?? r.borrow_date ?? r.borrowedAt ?? r.borrowed_at ?? r.createdAt ?? r.created_at;
                    const returnDate = r.returnDate ?? r.return_date ?? r.dueDate ?? r.due_date ?? r.returnedAt ?? r.returned_at;
                    return (
                      <tr key={r.id ?? idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{userName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{bookTitle}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(borrowDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(returnDate)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleMarkReturned(foundBorrowId ?? (r._id || r.id))}
                              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBorrow(foundBorrowId ?? (r._id || r.id))}
                              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}