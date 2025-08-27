import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function EditBookModal({ book, open, onClose, onSaved, fetchBooks }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    totalQuantity: '',
    author: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title ?? '',
        isbn: book.isbn ?? '',
        totalQuantity: String(book.quantity ?? book.total ?? book.availableBooks ?? 0),
        author: book.author ?? '',
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!book || (!book._id && !book.id)) {
      toast.error('No book selected');
      return;
    }
    const idDb = book._id ?? book.id;
    const idIsbn = book.isbn ?? book.ISBN ?? null;
    setIsSubmitting(true);
    try {
      const payload = {
        title: (formData.title || '').trim(),
        author: (formData.author || '').trim(),
        isbn: (formData.isbn || '').trim(),
        quantity: Number(formData.totalQuantity || 0),
        availableBooks: Number(formData.totalQuantity || 0),
      };

      if (!token) {
        toast.error('You must be logged in to edit a book.');
        setIsSubmitting(false);
        return;
      }

      // Prefer using ISBN as identifier (DELETE uses ISBN). If backend
      // expects ISBN in the route, this avoids 404s when using DB id.
      const tryIdentifiers = [];
      if (idIsbn) tryIdentifiers.push(String(idIsbn));
      if (idDb) tryIdentifiers.push(String(idDb));

      let lastError = null;
      for (const ident of tryIdentifiers) {
        try {
          const url = `http://localhost:8000/api/books/${encodeURIComponent(ident)}`;
          console.debug('Attempting PUT to', url, 'payload:', payload);
          const res = await axios.put(url, payload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, validateStatus: (s) => s < 500 });
          console.debug('PUT response', res.status, res.data);
          if (res.status === 200 || res.status === 204) {
            toast.success('Book updated');
            if (typeof onSaved === 'function') onSaved(res.data);
            if (typeof fetchBooks === 'function') fetchBooks();
            onClose?.();
            setIsSubmitting(false);
            return;
          }
          lastError = res;
          // if not 200/204 continue to next identifier
        } catch (err) {
          console.error('PUT attempt failed for identifier', ident, err, err?.response?.data);
          lastError = err;
          // try next identifier
        }
      }

      // none of the identifiers worked
      if (lastError) {
        const status = lastError.response?.status;
        const data = lastError.response?.data || lastError.message || lastError;
        console.error('Edit book final error', status, data);
        const msg = (typeof data === 'object' && data?.message) ? data.message : (`Failed to update${status ? ` (${status})` : ''}`);
        toast.error(msg);
      } else {
        toast.error('Failed to update book');
      }
    } catch (err) {
      console.error('Edit book unexpected error', err);
      toast.error('Unexpected error while updating book');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="add-book-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="add-book-title" className="text-lg font-semibold text-gray-900">Edit book</h2>
            <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Book Title
            </label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. The Pragmatic Programmer" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label htmlFor="isbn" className="mb-1 block text-sm font-medium text-gray-700">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-0135957059"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="totalQuantity" className="mb-1 block text-sm font-medium text-gray-700">
              Total Quantity
            </label>
            <input
              id="totalQuantity"
              name="totalQuantity"
              type="number"
              min="0"
              value={formData.totalQuantity}
              onChange={handleChange}
              placeholder="e.g. 10"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="author" className="mb-1 block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Andy Hunt, Dave Thomas"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="primary-btn">{isSubmitting ? 'Saving...' : 'Save'}</button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
