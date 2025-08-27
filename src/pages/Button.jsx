import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AddBookButton({ onClick, fetchBooks, className }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    totalQuantity: "",
    author: "",
  });

  const handleClick = () => {
    if (onClick) return onClick();
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: (formData.title || "").trim(),
      author: (formData.author || "").trim(),
      isbn: (formData.isbn || "").trim(),
      quantity: Number(formData.totalQuantity || 0),
      availableBooks: Number(formData.totalQuantity || 0),
    };

    try {
      if (!token) {
        toast.error("You must be logged in to add a book.");
        setOpen(false);
        return;
      }

      const response = await axios.post("http://localhost:8000/api/books", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Book saved:", response.data);
      toast.success("Book added");
      if (typeof fetchBooks === "function") {
        fetchBooks();
      }
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add book");
    }
    console.log("Submitting book:", payload);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`primary-btn ${className || ''}`}
      >
        <FaPlus /> Add Book
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-book-title"
        >
          <div className="absolute inset-0 bg-black/40" onClick={close} />

          <div className="relative z-10 w-full max-w-md">
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="add-book-title" className="text-lg font-semibold text-gray-900">Add a new book</h2>
                <button type="button" onClick={close} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">×</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Book Title
                </label>
                <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. The Pragmatic Programmer" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label
                  htmlFor="isbn"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="totalQuantity"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="author"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
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
                <button type="button" onClick={close} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="primary-btn">Save</button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}