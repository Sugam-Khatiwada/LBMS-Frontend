import Header from "../../Layout/Header";
import Sidebar from "../../Layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import AddBorrowerButton from "../AddBorrowerButton";
import { FaUsers, FaBook, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import AddBookButton from "../Button";
import axios from 'axios';

export function Dashboard() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [totalBooks, setTotalBooks] = useState(null);
  const [activeBorrowers, setActiveBorrowers] = useState(null);
  const [totalBorrows, setTotalBorrows] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // load counts from backend
  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      if (!mounted) return;
      setStatsLoading(true);

      // defaults
      let booksCount = 0;
      let borrows = [];

      // reuse token if present for endpoints that need auth
      const token = localStorage.getItem('token');
      const hdrs = token ? { Authorization: `Bearer ${token}` } : {};

      // fetch books (non-fatal)
      try {
        const booksRes = await axios.get('http://localhost:8000/api/books', { headers: hdrs });
        const booksData = booksRes.data?.books || booksRes.data || [];
        booksCount = Array.isArray(booksData) ? booksData.length : 0;
      } catch (err) {
        console.debug('Could not fetch books for stats', err?.toString());
        // don't show toast here so login success toast isn't clobbered
      }

      // fetch borrow records (may require auth) — non-fatal
      try {
        const borRes = await axios.get('http://localhost:8000/api/borrowers', { headers: hdrs });
        borrows = Array.isArray(borRes.data) ? borRes.data : (Array.isArray(borRes.data?.borrowers) ? borRes.data.borrowers : []);
      } catch (err) {
        console.debug('Could not fetch borrows for stats', err?.toString());
        // swallow error, dashboard should still render
      }

      // compute and set results
      const totalBorrowsCount = Array.isArray(borrows) ? borrows.length : 0;
      const activeSet = new Set();
      (borrows || []).forEach(b => {
        const returned = b.returnDate ?? b.return_date ?? b.returnedAt ?? b.returned_at;
        if (!returned) {
          const uid = b.userId ?? b.user_id ?? (b.user && (b.user._id || b.user.id)) ?? null;
          if (uid) activeSet.add(String(uid));
        }
      });

      if (mounted) {
        setTotalBooks(booksCount);
        setTotalBorrows(totalBorrowsCount);
        setActiveBorrowers(activeSet.size);
        setStatsLoading(false);
      }
    };
    loadStats();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setMobileOpen(true)} />
      <div className="flex">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="text-sm font-semibold">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs"
                >
                  Close
                </button>
              </div>
              <div className="h-[calc(100%-48px)] overflow-y-auto">
                <Sidebar />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">
          {/* Hero Section */}
          <section className="mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back{user?.name ? `, ${user.name}` : ", Librarian"}
                </h1>
                <p className="text-sm text-gray-600">
                  Here’s a quick overview and helpful shortcuts.
                </p>
              </div>
              <div className="flex gap-2">
                <AddBookButton className="px-5 py-3 bg-accent-primary" />
                <AddBorrowerButton className="px-5 py-3" />
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
              <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">Total Books</div>
        <FaBook className="accent-primary" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{statsLoading ? '—' : (totalBooks ?? 0)}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700">View <FaArrowRight /></div>
            </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
              <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">Active Borrowers</div>
        <FaUsers className="accent-primary" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{statsLoading ? '—' : (activeBorrowers ?? 0)}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-700">View <FaArrowRight /></div>
            </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
              <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">Total Borrows</div>
        <FaUsers className="text-gray-600" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{statsLoading ? '—' : (totalBorrows ?? 0)}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-700">View <FaArrowRight /></div>
            </div>
          </section>

          {/* Announcements */}
          <section className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-3">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                Announcements
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="rounded-md  p-3">
                  System maintenance scheduled for Friday 9 PM.
                </li>
                <li className="rounded-md  p-3">
                  New arrivals this week in Fiction and Science.
                </li>
                <li className="rounded-md  p-3">
                  Reminder: Update borrower contact details regularly.
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;