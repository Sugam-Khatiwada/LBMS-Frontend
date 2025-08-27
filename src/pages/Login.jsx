import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import { APP_NAME } from '../config/config';

export default function Login() {
  const [email, setEmail] = React.useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
  setIsLoading(true);
      const response = await axios.post("https://librarymanagementsystem-48c3.onrender.com/api/login", {
        email: email,
        password: password,
      });
      console.log(response.data);

      const token = response.data.token;
      const user = response.data.user;
      console.log(response.data.token);
      console.log(response.data.user);
      if (token && user) {
        login(user, token);
      }

      if (token) {
        // forgiving role detection: treat any role containing 'borrower' (e.g. 'ROLE_BORROWER') as borrower
        const isBorrower = (() => {
          if (!user) return false;
          const normalize = (v) => (v ? String(v).toLowerCase().trim() : "");
          const role = normalize(user.role || user.type || user.userType);
          if (role.includes("borrower")) return true;
          if (Array.isArray(user.roles)) {
            if (user.roles.some(r => normalize(r).includes("borrower"))) return true;
          }
          if (user.isBorrower === true) return true;
          try {
            if (JSON.stringify(user).toLowerCase().includes("borrower")) return true;
          } catch (e) {
            // ignore
          }
          return false;
        })();

        toast.success("Login successful");
        // store token (login already saved user/token, but keep localStorage token for compatibility)
        localStorage.setItem("token", token);
        if (isBorrower) {
          navigate("/borrower");
        } else {
          navigate("/librarian");
        }
      } else {
        toast.error("Login failed, please try again");
      }
    } catch (error) {
      toast.error("Login failed, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="login-container flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-10">
        <div className="login-form w-full max-w-md rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>{APP_NAME}</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back. Please login to continue.</p>
          </div>
          <form
            onSubmit={handleLogin}
            action="loginForm"
            className="flex flex-col gap-4"
          >
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto rounded px-2 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="remember" className="text-gray-600">Remember me</label>
              </div>
              <span className="text-gray-400">•</span>
              <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary-gradient px-4 py-2.5 font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading && (
                  <svg className="mr-2 h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-xs text-gray-400">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </>
  );
}