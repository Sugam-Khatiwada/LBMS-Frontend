import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Librarian/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Landing from "./pages/Landing";
import Book from "./pages/Librarian/Book";
import Borrowers from "./pages/Librarian/Borrowers";
import ProtectedRoute from "./utils/ProtectedRoute";
import BorrowerDashboard from "./pages/Borrowers/BorrowerDashboard";
import History from "./pages/Borrowers/History";
import Books from "./pages/Borrowers/Books";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/librarian"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/books"
          element={
            <ProtectedRoute>
              <Book />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/borrowers"
          element={
            <ProtectedRoute>
              <Borrowers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/borrower"
          element={
            <ProtectedRoute>
              <BorrowerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/borrower/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/borrower/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme="dark"
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;