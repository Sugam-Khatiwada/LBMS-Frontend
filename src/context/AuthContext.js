import {createContext, useContext, useState, useEffect} from 'react';

const AuthContext = createContext();

/**
 * AuthProvider
 * - Purpose: Wraps the app and provides authentication state and helpers.
 * - What it does: Manages user and token state, restores them from localStorage
 *   on mount, and exposes login/logout functions to update both state and storage.
 */
export function AuthProvider({children}) {
  // Current authenticated user object (or null if not authenticated)
  const [user, setUser] = useState(null);
  // JWT or similar token string (or null)
  const [token, setToken] = useState(null);
  // Loading flag while restoring auth state from storage
  const [loading, setLoading] = useState(true);

  /**
   * Restore auth state from localStorage on mount.
   * - Purpose: When the app loads, check for saved token and user and restore them.
   * - What it does: Reads token and user JSON from localStorage, sets state if found,
   *   then clears the loading flag.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setUser(JSON.parse(user));
      setToken(token);
    }
    setLoading(false);
  },[]);

  /**
   * login
   * - Purpose: Persist and set auth data after a successful login.
   * - What it does: Stores token and serialized user in localStorage and updates state.
   * - Parameters:
   *   - user: user object returned from the API
   *   - token: authentication token string
   */
  const login = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setToken(token);
  };

  /**
   * logout
   * - Purpose: Clear authentication state and storage.
   * - What it does: Removes token and user from localStorage and resets state to null.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{user, token, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

 /**
  * useAuth
  * - Purpose: Convenience hook to access AuthContext.
  * - What it does: Returns the context value provided by AuthProvider.
  */
export const useAuth = () => useContext(AuthContext);