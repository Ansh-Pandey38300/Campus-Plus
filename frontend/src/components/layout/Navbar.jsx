import { Link, NavLink, useNavigate } from 'react-router';
import { ArrowUpRight, GraduationCap, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Shared navigation that changes based on authentication state.
export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    // Clear the saved session and update the app immediately.
    logout();
    navigate('/', { replace: true });
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive
      ? 'text-blue-600'
      : 'text-slate-600 hover:text-blue-600'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Brand logo and name */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <GraduationCap size={25} />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Campus<span className="text-blue-600">Plus</span>
          </span>
        </Link>

        {/* Main navigation links */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          {/* <Link
            to="/#features"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Features
          </Link> */}

          {user && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {user && (
               <NavLink to="/requests" className={navLinkClass}>
                Requests
               </NavLink>
             )}
        </div>

        {/* Show the correct actions for the current authentication state */}
        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <span className="text-sm text-slate-500">Loading...</span>
          ) : user ? (
            <>
              <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 lg:block">
                Hi, {user.name || 'Student'}
              </span>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              
               





              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 sm:px-4"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 sm:px-4"
              >
                <span>Get started</span>
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}