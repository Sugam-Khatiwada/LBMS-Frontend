import React from "react";
import BookTable from "../../Layout/BookTable";
import Sidebar from "../../Layout/Sidebar";
import Header from "../../Layout/Header";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useLocation } from 'react-router-dom';

export default function Books(){
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const auth = useAuth();
  const token = auth?.token ?? localStorage.getItem('token');

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // first try with token if available
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('http://localhost:8000/api/books', { headers });
        if (!mounted) return;
        setBooks(res.data?.books || res.data || []);
      } catch (err) {
        // if token failed or forbidden, try without auth (some backends allow public GET)
        try {
          const res2 = await axios.get('http://localhost:8000/api/books');
          if (!mounted) return;
          setBooks(res2.data?.books || res2.data || []);
        } catch (err2) {
          const msg = err2?.response?.data?.message || err2.message || 'Failed to fetch books';
          setError(msg);
          console.error('Books fetch errors:', { withAuth: err?.toString(), withoutAuth: err2?.toString() });
          toast.error('Failed to fetch books — check console for details');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; }
  }, [token]);

  const location = useLocation();
  const searchResults = location?.state?.searchResults ?? null;

  function handleDelete(book) {
    setBooks((s) => s.filter(b => (b._id || b.id) !== (book._id || book.id)));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main className="flex-1 p-4">
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          {loading && <div>Loading books...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && (
            <BookTable books={searchResults ?? books} />
          )}
        </main>
      </div>
    </div>
  )
}