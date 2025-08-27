import { FaSearch, FaBell, FaUser, FaMoon, FaSun, FaHome, FaBook, FaHistory } from "react-icons/fa";
import Logo from '../components/Logo';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from "../utils/Logout";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '../config/config';

export function Header({ onToggleSidebar }) {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dark, setDark] = React.useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch (e) { return false; }
  });

  React.useEffect(() => {
    try {
      if (dark) document.documentElement.classList.add('theme-dark');
      else document.documentElement.classList.remove('theme-dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (e) {}
  }, [dark]);

  // apply librarian theme class when the current user is a librarian
  React.useEffect(() => {
    try {
      const isLibrarian = !!(user && ((typeof user.role === 'string' && user.role.toLowerCase().includes('librarian')) || (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase().includes('librarian')))));
      if (isLibrarian) document.documentElement.classList.add('theme-librarian');
      else document.documentElement.classList.remove('theme-librarian');
    } catch (e) {}
  }, [user]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const timerRef = React.useRef(null);

  // fetch suggestions (debounced)
  React.useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/books', { params: { q: searchTerm } });
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.books) ? res.data.books : []);
        setSuggestions(list.slice(0, 10));
      } catch (err) {
        console.debug('Suggestion fetch error', err?.toString());
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [searchTerm]);

  const selectSuggestion = (s) => {
    // navigate to books page with single result
    navigate('/librarian/books', { state: { searchResults: [s] } });
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.trim().length === 0) return;
    try {
      const res = await axios.get('http://localhost:8000/api/books', { params: { q: searchTerm } });
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.books) ? res.data.books : []);
      // navigate to books page and pass results in state
      navigate('/librarian/books', { state: { searchResults: list } });
      setSearchTerm('');
      setSuggestions([]);
    } catch (err) {
      console.error('Search error', err);
    }
  };

  // forgiving role check: treat anything containing 'borrower' as borrower (e.g. 'ROLE_BORROWER')
  const isBorrower = !!(
    user && (
      (typeof user.role === "string" && user.role.toLowerCase().includes("borrower")) ||
      (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase().includes("borrower"))) ||
      user.isBorrower === true ||
      (() => {
        try {
          return JSON.stringify(user).toLowerCase().includes("borrower");
        } catch (e) {
          return false;
        }
      })()
    )
  );

  // quick librarian check to style header links for the librarian hero bar
  const isLibrarian = !!(user && ((typeof user.role === 'string' && user.role.toLowerCase().includes('librarian')) || (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase().includes('librarian')))));

  const navLinkClass = (active) => {
    if (isLibrarian) {
      return `px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'}`;
    }
    return `px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`;
  };

  const [accountOpen, setAccountOpen] = React.useState(false);

  const closeAccount = () => setAccountOpen(false);

  return (
    <header className={`${isLibrarian ? 'header-hero' : 'bg-white shadow'} sticky top-0 z-50`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left column aligned with sidebar: show branding above sidebar area on lg+ */}
        <div className="hidden lg:flex w-56 items-center">
          <div className="flex items-center gap-3">
            <Logo size={10} showText={false} />
            <span className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{APP_NAME}</span>
          </div>
        </div>

        {/* Main header content (nav/search/actions) */}
        <div className="flex items-center gap-4 flex-1">
          <nav className="hidden md:flex items-center gap-2 md:ml-6">
            {(() => {
              const dashPath = isBorrower ? '/borrower' : '/librarian';
              const booksPath = isBorrower ? '/borrower/books' : '/librarian/books';
              const thirdPath = isBorrower ? '/borrower/history' : '/librarian/borrowers';
              const dashActive = pathname === dashPath;
              const booksActive = pathname.startsWith(booksPath);
              const thirdActive = pathname.startsWith(thirdPath);
              return (
                <>
                  <Link to={dashPath} className={navLinkClass(dashActive)}>
                    <FaHome className={`inline mr-2 ${dashActive ? (isLibrarian ? 'text-white' : 'text-primary') : ''}`} /> Dashboard
                  </Link>
                  <Link to={booksPath} className={navLinkClass(booksActive)}>
                    <FaBook className={`inline mr-2 ${booksActive ? (isLibrarian ? 'text-white' : 'text-primary') : ''}`} /> Books
                  </Link>
                  <Link to={thirdPath} className={navLinkClass(thirdActive)}>
                    <FaHistory className={`inline mr-2 ${thirdActive ? (isLibrarian ? 'text-white' : 'text-primary') : ''}`} /> {isBorrower ? 'History' : 'Borrowers'}
                  </Link>
                </>
              );
            })()}
          </nav>
        </div>

        {/* Center: prominent search */}
        <div className="flex-1 px-6">
          <form className="relative mx-auto max-w-2xl" role="search" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
              placeholder="Search books, authors, ISBN..."
              className="h-11 w-full rounded-full border border-gray-200 pl-12 pr-28 text-sm outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 rounded-full px-4 text-sm bg-primary text-white"
            >
              Search
            </button>

            {suggestions.length > 0 && (
              <ul className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-white p-2 shadow">
                {suggestions.map((s) => (
                  <li key={s._id || s.isbn || s.id} className="cursor-pointer px-2 py-1 text-sm hover:bg-gray-100" onClick={() => selectSuggestion(s)}>{s.title}</li>
                ))}
              </ul>
            )}
          </form>
        </div>

        {/* Right: actions (Logout kept as the rightmost control) */}
          <div className="flex items-center gap-2 sm:gap-3">
          {/* notifications removed */}

          <button type="button" aria-label="Toggle theme" onClick={() => setDark(d => !d)} className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-gray-700 shadow-sm hover:bg-gray-50" title="Toggle theme">
            {dark ? <FaSun /> : <FaMoon />}
          </button>

          {/* If borrower, show Account button which opens a details dialog */}
          {isBorrower && (
            <>
              <button
                type="button"
                onClick={() => setAccountOpen(true)}
                title="Account"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <FaUser />
              </button>

              {accountOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true">
                  <div className="absolute inset-0 bg-black/40" onClick={closeAccount} />
                  <div className="relative z-20 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Account</h2>
                      <button type="button" onClick={closeAccount} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">×</button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-500">Name</div>
                        <div className="text-sm text-gray-800">{user?.name || user?.fullName || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500">Email</div>
                        <div className="text-sm text-gray-800">{user?.email || user?.username || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500">Role</div>
                        <div className="text-sm text-gray-800">{Array.isArray(user?.roles) ? user.roles.join(', ') : (user?.role || (isBorrower ? 'Borrower' : '-'))}</div>
                      </div>
                      {user?.createdAt && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Member since</div>
                          <div className="text-sm text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                      <button type="button" onClick={closeAccount} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

export default Header;