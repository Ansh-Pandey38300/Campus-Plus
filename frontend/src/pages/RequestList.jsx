
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Wallet,
  X,
} from 'lucide-react';

import { getRequests } from '../services/api';

function parseDeadline(value) {
  if (!value) return null;

  // MySQL DATETIME values normally look like:
  // 2026-10-28 14:30:00
  // Treat this value as local wall-clock time.
  const normalized =
    typeof value === 'string' ? value.replace(' ', 'T') : value;

  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  if (!value) return 'Not specified';

  const date = parseDeadline(value);

  if (!date) return String(value);

  return date.toLocaleString('en-IN', {
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

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

export default function RequestList() {
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getRequests();

      if (!Array.isArray(response?.requests)) {
        throw new Error('The server returned an invalid request list.');
      }

      setRequests(response.requests);
    } catch (err) {
      setError(err.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Build the category dropdown from the data returned by the API.
  const categories = useMemo(() => {
    const uniqueCategories = new Map();

    requests.forEach((item) => {
      if (item.category_id != null && item.category_name) {
        uniqueCategories.set(String(item.category_id), {
          id: String(item.category_id),
          name: item.category_name,
        });
      }
    });

    return Array.from(uniqueCategories.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [requests]);

  const budgetRangeInvalid =
    minBudget !== '' &&
    maxBudget !== '' &&
    Number(minBudget) > Number(maxBudget);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (budgetRangeInvalid) return [];

    const minimum =
      minBudget === '' ? null : Number(minBudget);

    const maximum =
      maxBudget === '' ? null : Number(maxBudget);

    const startDate = deadlineFrom
      ? new Date(`${deadlineFrom}T00:00:00`)
      : null;

    const endDate = deadlineTo
      ? new Date(`${deadlineTo}T23:59:59.999`)
      : null;

    return requests.filter((item) => {
      // 1. Search title, description, category and location.
      const matchesSearch =
        !query ||
        [
          item.title,
          item.description,
          item.category_name,
          item.pickup_location_name,
        ].some((value) =>
          String(value || '').toLowerCase().includes(query),
        );

      if (!matchesSearch) return false;

      // 2. Category filter.
      if (
        categoryId &&
        String(item.category_id) !== categoryId
      ) {
        return false;
      }

      // 3. Minimum and maximum budget filters.
      const budget = Number(item.max_budget);

      if (!Number.isFinite(budget)) {
        if (minimum !== null || maximum !== null) {
          return false;
        }
      } else {
        if (minimum !== null && budget < minimum) {
          return false;
        }

        if (maximum !== null && budget > maximum) {
          return false;
        }
      }

      // 4. Deadline date range filter.
      if (startDate || endDate) {
        const deadline = parseDeadline(item.deadline);

        // Do not include records with missing or invalid deadlines
        // when the user explicitly filters by deadline.
        if (!deadline) return false;

        if (startDate && deadline < startDate) {
          return false;
        }

        if (endDate && deadline > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [
    requests,
    search,
    categoryId,
    minBudget,
    maxBudget,
    deadlineFrom,
    deadlineTo,
    budgetRangeInvalid,
  ]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      categoryId ||
      minBudget !== '' ||
      maxBudget !== '' ||
      deadlineFrom ||
      deadlineTo,
  );

  function clearFilters() {
    setSearch('');
    setCategoryId('');
    setMinBudget('');
    setMaxBudget('');
    setDeadlineFrom('');
    setDeadlineTo('');
  }

  function getStatusClass(status) {
    switch (String(status || '').toLowerCase()) {
      case 'open':
        return 'bg-green-50 text-green-700';

      case 'closed':
        return 'bg-slate-100 text-slate-700';

      case 'cancelled':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-amber-50 text-amber-700';
    }
  }

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
                Search and filter student requests by category,
                budget and deadline.
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

        {/* Search */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label
            htmlFor="request-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search requests
          </label>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="request-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, category or location..."
              className={`${inputClass} pl-10`}
            />
          </div>

          {/* Filters */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="request-category-filter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="request-category-filter"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={inputClass}
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="request-min-budget"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Minimum budget (₹)
              </label>

              <input
                id="request-min-budget"
                type="number"
                min="0"
                step="0.01"
                value={minBudget}
                onChange={(event) => setMinBudget(event.target.value)}
                placeholder="e.g. 100"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="request-max-budget"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Maximum budget (₹)
              </label>

              <input
                id="request-max-budget"
                type="number"
                min="0"
                step="0.01"
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                placeholder="e.g. 2000"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="request-deadline-from"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Deadline from
              </label>

              <input
                id="request-deadline-from"
                type="date"
                value={deadlineFrom}
                max={deadlineTo || undefined}
                onChange={(event) =>
                  setDeadlineFrom(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="request-deadline-to"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Deadline to
              </label>

              <input
                id="request-deadline-to"
                type="date"
                value={deadlineTo}
                min={deadlineFrom || undefined}
                onChange={(event) =>
                  setDeadlineTo(event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {budgetRangeInvalid && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              Minimum budget cannot exceed maximum budget.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              {loading
                ? 'Loading requests...'
                : `${filteredRequests.length} of ${requests.length} request(s) shown`}
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                Clear filters
              </button>

              <button
                type="button"
                onClick={loadRequests}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
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

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              {hasActiveFilters
                ? 'No matching requests'
                : 'No requests yet'}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {hasActiveFilters
                ? 'Try changing your search or filters.'
                : 'Be the first to tell the campus community what you need.'}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Clear filters
              </button>
            ) : (
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
            {filteredRequests.map((item) => (
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
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(item.status)}`}
                  >
                    {item.status || 'unknown'}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {item.title}
                </h2>

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
                    <CalendarDays
                      size={18}
                      className="mt-0.5 text-blue-600"
                    />

                    <div>
                      <p className="text-xs text-slate-500">Deadline</p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(item.deadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
