
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ArrowRight,
  CalendarDays,
  Gavel,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Wallet,
} from 'lucide-react';

import { getRequests } from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  if (!value) return 'Not specified';

  const date = new Date(
    typeof value === 'string' ? value.replace(' ', 'T') : value,
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatBudget(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 'Budget unavailable';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function RequestList() {
  const location = useLocation();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getRequests();

      setRequests(
        Array.isArray(response?.requests)
          ? response.requests
          : [],
      );
    } catch (err) {
      setError(err.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return requests;

    return requests.filter((item) =>
      [
        item.title,
        item.description,
        item.category_name,
        item.pickup_location_name,
      ].some((value) =>
        String(value || '').toLowerCase().includes(query),
      ),
    );
  }, [requests, search]);

  return (
    <main className="flex-1 bg-slate-50">
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Campus Plus Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Student Requests
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Browse requests, compare offers, and help students
                find the right items on campus.
              </p>
            </div>

            <Link
              to="/requests/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <Plus size={18} />
              Create Request
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {location.state?.message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {location.state.message}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? 'Loading requests...'
                : `${filteredRequests.length} request(s) found`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests..."
              aria-label="Search requests"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading requests...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-8 text-center"
          >
            <p className="font-semibold text-red-700">{error}</p>

            <button
              type="button"
              onClick={loadRequests}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredRequests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Search size={25} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {search ? 'No matching requests' : 'No requests yet'}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? 'Try a different search term.'
                : 'Be the first to tell the campus community what you need.'}
            </p>

            {!search && (
              <Link
                to="/requests/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create the first request
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}

        {!loading && !error && filteredRequests.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredRequests.map((item) => {
              const isOwner =
                Number(item.buyer_id) === Number(user?.id);

              return (
                <article
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      <Tag size={14} />
                      {item.category_name || 'Uncategorized'}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                        item.status === 'open'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status || 'unknown'}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <div className="flex items-start gap-2.5">
                      <Wallet size={18} className="mt-0.5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">
                          Maximum budget
                        </p>
                        <p className="mt-1 font-bold text-slate-900">
                          {formatBudget(item.max_budget)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin size={18} className="mt-0.5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">
                          Pickup location
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {item.pickup_location_name || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:col-span-2">
                      <CalendarDays size={18} className="mt-0.5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Deadline</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDate(item.deadline)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <Link
                      to={`/requests/${item.id}/offers`}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Gavel size={16} />
                      {isOwner
                        ? 'View offers'
                        : 'View offers / submit offer'}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
