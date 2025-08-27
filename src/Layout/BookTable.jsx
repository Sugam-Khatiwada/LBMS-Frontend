import React from 'react';
import api from '../config/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function BookTable({ books: initialBooks, onEdit }) {
  const auth = useAuth();
  const token = auth?.token ?? localStorage.getItem('token');
  const user = auth?.user ?? (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch(e){ return null; }
  })();
  const [books, setBooks] = React.useState(initialBooks ?? []);
  // If parent passed `null` it means parent will fetch and provide data. In that
  // case BookTable should not fetch itself (prevents duplicate requests and
  // duplicate 401 toasts). loading is true when initialBooks is null or an
  // empty array (no data yet).
  const [loading, setLoading] = React.useState(initialBooks === null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // When parent-provided books change, sync local state and update loading.
    if (initialBooks === null) {
      setLoading(true);
    } else {
      setBooks(initialBooks || []);
      setLoading(false);
      setError(null);
    }
  }, [initialBooks]);

  const handleDelete = async (isbn) => {
    if (!isbn) return toast.error('Missing ISBN');
    if (!window.confirm('Delete this book?')) return;
    try {
      await api.delete(`/books/${encodeURIComponent(isbn)}`);
      setBooks((s) => s.filter(b => (b.isbn || b.ISBN) !== isbn));
      toast.success('Book deleted');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete';
      toast.error(msg);
    }
  };

  const handleEdit = async (isbn) => {
    if (!isbn) return toast.error('Missing ISBN');
    const book = books.find(b => (b.isbn || b.ISBN) === isbn);
    if (!book) return toast.error('Book not found');
    const title = window.prompt('Title', book.title || '');
    if (title === null) return; // cancelled
    const author = window.prompt('Author', book.author || '');
    if (author === null) return;
    const quantityStr = window.prompt('Quantity', String(book.quantity ?? book.total ?? 0));
    if (quantityStr === null) return;
    const availableStr = window.prompt('Available Books', String(book.availableBooks ?? book.available ?? 0));
    if (availableStr === null) return;
    const quantity = parseInt(quantityStr, 10) || 0;
    const availableBooks = parseInt(availableStr, 10) || 0;
    try {
  const res = await api.put(`/books/${encodeURIComponent(isbn)}`, { title, author, quantity, availableBooks });
  const updated = res.data?.book || res.data;
      setBooks((s) => s.map(b => ((b.isbn || b.ISBN) === isbn ? updated : b)));
      toast.success('Book updated');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update';
      toast.error(msg);
    }
  };

  const handleBorrow = async (book) => {
    const bookId = book._id || book.id || book.bookId;
    if (!bookId) return toast.error('Missing book id for borrow');
    try {
  const res = await api.post('/borrow', { bookId });
  toast.success(res?.data?.message || 'Borrowed');
      // update available locally
      setBooks((s) => s.map(b => ((b._id === bookId || b.id === bookId) ? { ...b, availableBooks: (b.availableBooks ?? b.available ?? 0) - 1 } : b)));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to borrow';
      toast.error(msg);
    }
  };

  const handleReturn = async (book) => {
    // Find the borrow record id for this user & book then call POST /api/borrow/return/:borrowId
    try {
      const bookId = book._id || book.id || (book.bookId && (book.bookId._id || book.bookId.id)) || null;

      // helper: detect whether a borrow record has a return timestamp (prefer timestamp over boolean flag)
      const hasReturnTimestamp = (rec) => {
        if (!rec) return false;
        return Boolean(rec.returnDate || rec.return_date || rec.returnedAt || rec.returned_at);
      };

      const res = await api.get('/borrow/history');
      const history = res.data?.borrows || res.data?.data || res.data || [];

      const found = history.find(rec => {
        // skip records that already have a return timestamp
        if (hasReturnTimestamp(rec)) return false;
        const recBook = rec.bookId ?? rec.book ?? null;
        const recBookId = recBook && (recBook._id || recBook.id) ? (recBook._id || recBook.id) : recBook;
        const matchById = bookId && recBookId && String(recBookId) === String(bookId);
        const matchByIsbn = recBook && recBook.isbn && book.isbn && String(recBook.isbn) === String(book.isbn);
        return matchById || matchByIsbn;
      });

      if (!found) {
        // If no active borrow found, try to detect if there is a returned record and surface its date
        const maybe = history.find(rec => {
          const recBook = rec.bookId ?? rec.book ?? null;
          const recBookId = recBook && (recBook._id || recBook.id) ? (recBook._id || recBook.id) : recBook;
          const matchById = bookId && recBookId && String(recBookId) === String(bookId);
          const matchByIsbn = recBook && recBook.isbn && book.isbn && String(recBook.isbn) === String(book.isbn);
          return matchById || matchByIsbn;
        });
        if (maybe && hasReturnTimestamp(maybe)) {
          const returnTs = maybe.returnedAt || maybe.returned_at || maybe.returnDate || maybe.return_date || null;
          const human = returnTs ? new Date(returnTs).toLocaleString() : 'already returned';
          toast.info(`Book already returned${returnTs ? ` on ${human}` : ''}`);
          return;
        }
        return toast.error('No active borrow record found for this book');
      }

  const borrowId = found._id || found.id || found.borrowId || found.borrow_id;
  if (!borrowId) return toast.error('Borrow record id not found');
      // attempt return
      try {
  console.debug('Attempting return (bookTable)', { borrowId, book });
  const ret = await api.post(`/borrow/return/${encodeURIComponent(borrowId)}`);
  console.debug('Return response (bookTable)', ret?.status, ret?.data);
  toast.success(ret?.data?.message || 'Returned');

        // after a return attempt, re-fetch history to confirm the server recorded the return
        try {
          const probe = await api.get('/borrow/history');
          const hist = probe.data?.borrows || probe.data?.data || probe.data || [];
          const matching = hist.find(rec => {
            const recBook = rec.bookId ?? rec.book ?? null;
            const recBookId = recBook && (recBook._id || recBook.id) ? (recBook._id || recBook.id) : recBook;
            const matchById = rec._id && String(rec._id) === String(borrowId);
            const matchByIsbn = recBook && recBook.isbn && book.isbn && String(recBook.isbn) === String(book.isbn);
            return matchById || matchByIsbn;
          });

          if (matching && hasReturnTimestamp(matching)) {
            // server recorded the return — update UI and notify others
            const returnTs = matching.returnedAt || matching.returned_at || matching.returnDate || matching.return_date || null;
            setBooks((s) => s.map(b => {
              const matches = (b._id && book._id && String(b._id) === String(book._id)) || (b.id && book.id && String(b.id) === String(book.id)) || (b.isbn && book.isbn && String(b.isbn) === String(book.isbn));
              if (!matches) return b;
              return { ...b, availableBooks: (b.availableBooks ?? b.available ?? 0) + 1 };
            }));
            try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
          } else {
            // server did not surface a return timestamp for this borrow — warn the user
            toast.warn('Return succeeded but server did not record a return timestamp. Refreshing history may help.');
            try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
          }
        } catch (e) {
          // probe failed — still update optimistic UI and notify others
          setBooks((s) => s.map(b => {
            const matches = (b._id && book._id && String(b._id) === String(book._id)) || (b.id && book.id && String(b.id) === String(book.id)) || (b.isbn && book.isbn && String(b.isbn) === String(book.isbn));
            if (!matches) return b;
            return { ...b, availableBooks: (b.availableBooks ?? b.available ?? 0) + 1 };
          }));
          try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
        }
      } catch (err) {
        // If server responds that it's already returned, attempt to show the server-known return date
        console.debug('Return error (bookTable)', err?.response?.status, err?.response?.data || err.message || err);
        const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to return';
        const text = typeof serverMsg === 'string' ? serverMsg.toLowerCase() : JSON.stringify(serverMsg).toLowerCase();
        if (text.includes('already') && text.includes('return')) {
          try {
            const probe = await api.get('/borrow/history');
            const hist = probe.data?.borrows || probe.data?.data || probe.data || [];
            const matching = hist.find(rec => {
              const recBook = rec.bookId ?? rec.book ?? null;
              const recBookId = recBook && (recBook._id || recBook.id) ? (recBook._id || recBook.id) : recBook;
              const matchById = rec._id && String(rec._id) === String(borrowId);
              const matchByIsbn = recBook && recBook.isbn && book.isbn && String(recBook.isbn) === String(book.isbn);
              return matchById || matchByIsbn;
            });
            if (matching && hasReturnTimestamp(matching)) {
              const returnTs = matching.returnedAt || matching.returned_at || matching.returnDate || matching.return_date || null;
              const human = returnTs ? new Date(returnTs).toLocaleString() : null;
              toast.info(returnTs ? `Book already returned on ${human}` : String(serverMsg));
              try { window.dispatchEvent(new CustomEvent('borrowHistoryChanged')); } catch (e) {}
              return;
            }
          } catch (e) {
            // ignore probe failure
          }
        }

        const message = typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg);
        toast.error(message);
        console.error('Return error', err);
      }
    } catch (err) {
      console.error('Return lookup error', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to return';
      toast.error(String(msg));
    }
  };

  // role detection
  const isBorrower = (() => {
    try {
      if (!user) return false;
      const normalize = v => (v ? String(v).toLowerCase() : '');
      if (normalize(user.role || user.type || user.userType).includes('borrower')) return true;
      if (Array.isArray(user.roles) && user.roles.some(r => normalize(r).includes('borrower'))) return true;
      if (user.isBorrower === true) return true;
      return JSON.stringify(user).toLowerCase().includes('borrower');
    } catch (e) {
      return false;
    }
  })();

  const isLibrarian = (() => {
    try {
      if (!user) return false;
      const normalize = v => (v ? String(v).toLowerCase() : '');
      if (normalize(user.role || user.type || user.userType).includes('librarian')) return true;
      if (Array.isArray(user.roles) && user.roles.some(r => normalize(r).includes('librarian'))) return true;
      if (user.isAdmin === true || user.isLibrarian === true) return true;
      return JSON.stringify(user).toLowerCase().includes('librarian');
    } catch (e) {
      return false;
    }
  })();

  if (loading) return <div>Loading books...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ISBN</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Available</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b._id || b.isbn || b.id} className="border-t">
              <td className="px-4 py-3 text-sm text-gray-800">{b.title}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{b.isbn}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{b.quantity ?? b.total ?? 0}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{b.availableBooks ?? b.available ?? 0}</td>
              <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-3">
                {isLibrarian && (
                  <>
                    {typeof onEdit === 'function' ? (
                      <button onClick={() => onEdit(b)} title="Edit" className="text-blue-600 hover:text-blue-800">Edit</button>
                    ) : (
                      <button onClick={() => handleEdit(b.isbn)} title="Edit" className="text-blue-600 hover:text-blue-800">Edit</button>
                    )}
                    <button onClick={() => handleDelete(b.isbn)} title="Delete" className="text-red-600 hover:text-red-800">Delete</button>
                  </>
                )}
                {isBorrower && (
                  <>
                    <button onClick={() => handleBorrow(b)} title="Borrow" className="ml-2 rounded px-2 py-1 text-white bg-green-600 hover:bg-green-700">Borrow</button>
                    <button onClick={() => handleReturn(b)} title="Return" className="ml-2 rounded px-2 py-1 text-white bg-yellow-500 hover:bg-yellow-600">Return</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}