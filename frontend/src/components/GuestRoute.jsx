import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function GuestRoute() {
  const { user, loading } = useAuth();

  // Wait until the saved session has been verified.
  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <p className="text-sm text-slate-500">
          Checking your session...
        </p>
      </main>
    );
  }

  // Authenticated users should not see guest-only pages.
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Allow logged-out visitors to continue.
  return <Outlet />;
}