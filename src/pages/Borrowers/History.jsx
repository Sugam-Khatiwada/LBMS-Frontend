import React, { useEffect, useState } from "react";
import Header from "../../Layout/Header";
import Sidebar from "../../Layout/Sidebar";
import api from "../../config/config";
import { useAuth } from "../../context/AuthContext";

export default function History() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        // use configured axios instance (baseURL + interceptors)
        const res = await api.get("/borrow/history");
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.borrows)
          ? data.borrows
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setHistory(list);
      } catch (err) {
        console.error("Error fetching borrow history:", err);
        // extract a useful message for UI and debugging
        const serverMessage =
          err?.response?.data?.message || err?.response?.data || err?.message || "Unknown error";
        setError(serverMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  const onChange = () => fetchHistory();
  window.addEventListener('borrowHistoryChanged', onChange);
  return () => { window.removeEventListener('borrowHistoryChanged', onChange); };
  }, [token]);

  const fmt = (v) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleDateString();
    } catch (e) {
      return String(v);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Borrow History</h1>
            <p className="text-sm text-gray-500">Your past borrows and returns.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-red-600">Failed to load history</div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No borrow history found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">ISBN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Borrow Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Return Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => {
                    const book = h.bookId ?? h.book ?? (h.bookDetails ?? null);
                    const title = book?.title ?? book?.name ?? "-";
                    const author = book?.author ?? "-";
                    const isbn = book?.isbn ?? "-";
                    const borrowDate = h.borrowDate ?? h.borrow_date ?? h.createdAt ?? h.created_at;
                    const returnDate = h.returnDate ?? h.return_date ?? h.returnedAt ?? h.returned_at;
                    const status = h.status ?? (returnDate ? "returned" : "borrowed");
                    return (
                      <tr key={h._id ?? h.id ?? i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{i + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{title}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{author}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{isbn}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{fmt(borrowDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{fmt(returnDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}