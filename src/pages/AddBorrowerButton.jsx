import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import {useAuth} from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function AddBorrowerButton({ onClick, className }) {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();
  const [form, setForm] = useState({})

  const handleClick = () => {
    if (onClick) return onClick();
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     try {
    if(!token) {
      toast.error("You must be logged in to add a borrower.");
      setOpen(false);
      return;
    }
    const response = await axios.post("http://localhost:8000/api/borrowers", form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Borrower added:", response.data);
    toast.success("Borrower added");
  } catch (error) {
    console.error("Error adding borrower:", error);
  }
  };
 

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`primary-btn ${className || ''}`}
      >
        <FaUserPlus /> Add Borrower
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-borrower-title"
        >
          <div className="absolute inset-0 bg-black/40" onClick={close} />

          <div className="relative z-10 w-full max-w-md">
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="add-borrower-title" className="text-lg font-semibold text-gray-900">Add a new borrower</h2>
                <button type="button" onClick={close} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">×</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. jane@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
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