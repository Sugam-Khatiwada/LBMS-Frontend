import { FaBook, FaQuestionCircle } from "react-icons/fa";
import AddBookButton from "../pages/Button";
import AddBorrowerButton from "../pages/AddBorrowerButton";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from '../config/config';

export function Sidebar() {
  const { pathname } = useLocation();
  const auth = useAuth();
  const user = auth?.user ?? null;

  // role detection (for borrower vs librarian views)
  const isBorrower = !!(
    user && (
      (typeof user.role === 'string' && user.role.toLowerCase().includes('borrower')) ||
      (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase().includes('borrower'))) ||
      user.isBorrower === true ||
      (() => {
        try { return JSON.stringify(user).toLowerCase().includes('borrower'); } catch (e) { return false; }
      })()
    )
  );
  const finalIsBorrower = isBorrower || pathname.startsWith('/borrower');

  // Narrow full-height rail on the left for all screens (small width)
  const [topBook, setTopBook] = useState(null); // { id, title, author, isbn, count }
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    const hdrs = token ? { Authorization: `Bearer ${token}` } : {};
    const loadTop = async () => {
      try {
        // borrow records endpoint used in Dashboard
        const borRes = await axios.get('http://localhost:8000/api/borrowers', { headers: hdrs });
        const borrows = Array.isArray(borRes.data) ? borRes.data : (Array.isArray(borRes.data?.borrowers) ? borRes.data.borrowers : []);
        // count by book
        const bookCounts = {};
        for (const b of (borrows || [])) {
          const bookId = b.bookId ?? b.book_id ?? (b.book && (b.book._id || b.book.id)) ?? b.isbn ?? null;
          if (bookId) bookCounts[bookId] = (bookCounts[bookId] || 0) + 1;
        }
        // find top ids
        const topBookId = Object.keys(bookCounts).sort((a,b) => bookCounts[b]-bookCounts[a])[0] || null;
  // only top book is required here
  let topBookTitle = null;
        if (topBookId) {
          // try to fetch book details if possible
          try {
            const bookRes = await axios.get('http://localhost:8000/api/books', { params: { id: topBookId }, headers: hdrs });
            const bdata = Array.isArray(bookRes.data) ? bookRes.data[0] : (bookRes.data?.books ? bookRes.data.books[0] : bookRes.data);
            topBookTitle = bdata?.title || bdata?.name || String(topBookId);
          } catch (e) {
            topBookTitle = String(topBookId);
          }
        }
        if (mounted) {
          const count = topBookId ? (bookCounts[topBookId] || 0) : 0;
          // attempt to parse details again from previously fetched bdata if available
          let bookDetails = { id: topBookId, title: topBookTitle, author: null, isbn: null, count };
          try {
            // try a more flexible fetch for the book by id or isbn
            const bookRes2 = await axios.get('http://localhost:8000/api/books', { params: { id: topBookId }, headers: hdrs, validateStatus: (s) => s < 500 });
            const data2 = Array.isArray(bookRes2.data) ? bookRes2.data[0] : (bookRes2.data?.books ? bookRes2.data.books[0] : bookRes2.data);
            if (data2) {
              bookDetails = {
                id: topBookId,
                title: data2.title || data2.name || bookDetails.title,
                author: data2.author || data2.authors || null,
                isbn: data2.isbn || data2.ISBN || null,
                count,
              };
            }
          } catch (e) {
            // ignore
          }
          setTopBook(bookDetails);
        }
      } catch (err) {
        console.debug('Could not compute top items', err?.toString());
      }
    };
    loadTop();
    return () => { mounted = false; };
  }, []);

  return (
  <aside className={`sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto border-r bg-white px-3 py-4 theme-dark:bg-surface ${finalIsBorrower ? '' : 'sidebar-rail modern-rail'}`}>
      <div className="flex flex-col gap-6 h-full">
  {/* Top: user role */}
        <div className="px-2">
          <div className="text-xs font-semibold text-gray-500">Signed in as</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-0 rounded-full bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{finalIsBorrower ? 'Borrower' : 'Librarian'}</div>
            <div className="text-sm font-medium text-gray-800">{user?.name || ''}</div>
          </div>
        </div>

        {/* Actions: Add Book / Add Borrower */}
        <div className="px-2">
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <AddBookButton className="w-full px-5 py-3 text-base bg-accent-primary hover:opacity-95" />
            </div>
            <div className="w-full">
              <AddBorrowerButton className="w-full px-5 py-3 text-base" />
            </div>
          </div>
        </div>

        {/* Top stats */}
        <div className="px-2">
          <div className="rounded-md bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <FaBook className="text-yellow-600" />
              <div className="text-sm font-semibold text-gray-600">Top borrowed book</div>
            </div>
            <div className="flex flex-col gap-1">
                {topBook ? (
                  <>
                    <div className="text-sm font-medium text-gray-900" title={topBook.title}>{topBook.title}</div>
                    <div className="text-xs text-gray-500">{topBook.author ? `By ${Array.isArray(topBook.author) ? topBook.author.join(', ') : topBook.author}` : (topBook.isbn ? `ISBN: ${topBook.isbn}` : '')}</div>
                      {/* count removed per design request */}
                  </>
                ) : (
                  <div className="text-sm text-gray-500">—</div>
                )}
              </div>
          </div>
        </div>

        {/* Spacer to push help/footer to bottom */}
        <div className="flex-1" />

        {/* Help section (restored) */}
        <div className="px-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-[12px] leading-relaxed text-gray-900 shadow-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <FaQuestionCircle className="text-gray-600" />
              <span>Getting started</span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>Use {APP_NAME} to manage Books and Borrowers.</li>
              <li>Books: view, add, or update your catalog.</li>
              <li>Borrowers: add members and manage details.</li>
              <li>Use the top-right Logout to end your session.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
  <div className="px-2 pt-3 text-[11px] text-gray-500">{user ? `${APP_NAME} · ${finalIsBorrower ? 'Borrower' : 'Admin'}` : APP_NAME + ' · v0.1.0'}</div>
      </div>
    </aside>
  );
}

export default Sidebar;