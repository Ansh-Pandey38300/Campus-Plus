import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <p className="text-sm text-slate-500">
          Loading Campus Plus...
        </p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex-1 bg-slate-50">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {user.name || 'Student'}!
            </h1>

            <p className="mt-3 text-slate-600">
              Discover campus items and explore bidding
              opportunities with other students.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                My Dashboard
              </Link>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Campus Marketplace
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Listings and bidding activity will appear here
              when the marketplace functionality is connected.
            </p>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16 sm:py-24">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
          Campus Plus
        </p>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Your Campus Bidding Marketplace
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
          Discover campus items, connect with fellow students,
          and participate in bidding.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}