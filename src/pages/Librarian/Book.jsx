import BookTable from "../../Layout/BookTable";
import Sidebar from "../../Layout/Sidebar";
import Header from "../../Layout/Header";
import AddBookButton from "../Button";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import EditBookModal from '../../components/EditBookModal';
export default function Book() {
  const [books, setBooks] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const auth = useAuth();
  const token = auth?.token ?? localStorage.getItem('token');

  const fetchBooks = async () => {
    // Use a fresh axios instance so any global interceptors won't run for our
    // probe requests. We'll still treat 4xx as resolved so status can be
    // inspected (avoids global error handlers causing toasts/redirects).
    const localAxios = axios.create();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const safeGet = (hdrs) =>
      localAxios.get('http://localhost:8000/api/books', {
        headers: hdrs,
        validateStatus: (status) => status < 500,
      });

    try {
      const resAuth = await safeGet(headers);
      console.debug('fetchBooks auth probe status', resAuth.status, { data: resAuth.data });
      if (resAuth.status === 200) {
        const payload = resAuth.data?.books || resAuth.data || [];
        console.debug('Using auth response, items:', Array.isArray(payload) ? payload.length : typeof payload);
        setBooks(payload);
        return;
      }

      const resPublic = await safeGet({});
      console.debug('fetchBooks public probe status', resPublic.status, { data: resPublic.data });
      if (resPublic.status === 200) {
        const payload = resPublic.data?.books || resPublic.data || [];
        console.debug('Using public response, items:', Array.isArray(payload) ? payload.length : typeof payload);
        setBooks(payload);
        return;
      }

      console.error('Books fetch failed', { withAuthStatus: resAuth.status, publicStatus: resPublic.status });
      setBooks([]);
      toast.error('Failed to fetch books — check console for details');
    } catch (e) {
      console.error('Unexpected error fetching books', e);
      setBooks([]);
      toast.error('Failed to fetch books — check console for details');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // accept searchResults passed via navigation state
  const location = useLocation();
  const searchResults = location?.state?.searchResults ?? null;

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="mt-10 w-full px-4 sm:px-6 lg:px-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-secondary">Book List</h2>
            <AddBookButton fetchBooks={fetchBooks} className="px-3 py-1.5 text-sm bg-accent-primary" />
          </div>
          <div className="px-4 sm:px-6 lg:px-8">
            <BookTable books={searchResults ?? books} onEdit={(b) => { setEditing(b); setEditOpen(true); }} />
            <EditBookModal book={editing} open={editOpen} onClose={() => { setEditOpen(false); setEditing(null); }} fetchBooks={fetchBooks} />
          </div>
        </main>
      </div>
    </>
  );
}