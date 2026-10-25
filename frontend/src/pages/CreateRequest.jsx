
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  MapPin,
  Send,
  Wallet,
} from 'lucide-react';

import {
  createRequest,
  getPickupLocations,
  getRequestCategories,
} from '../services/api';

function getLocalDateTimeMinimum() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  now.setSeconds(0, 0);

  const localDateTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000,
  );

  return localDateTime.toISOString().slice(0, 16);
}

const fieldClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

export default function CreateRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    pickup_location_id: '',
    max_budget: '',
    deadline: '',
  });

  const [categories, setCategories] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadFormOptions() {
      setLoadingOptions(true);
      setError('');

      try {
        const [categoryResponse, locationResponse] =
          await Promise.all([
            getRequestCategories(),
            getPickupLocations(),
          ]);

        if (cancelled) return;

        setCategories(
          Array.isArray(categoryResponse?.categories)
            ? categoryResponse.categories
            : [],
        );

        setPickupLocations(
          Array.isArray(locationResponse?.pickupLocations)
            ? locationResponse.pickupLocations
            : [],
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Unable to load categories and pickup locations.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadFormOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category_id ||
      !form.pickup_location_id ||
      !form.max_budget ||
      !form.deadline
    ) {
      setError('Please complete all required fields.');
      return;
    }

    const budget = Number(form.max_budget);

    if (!Number.isFinite(budget) || budget <= 0) {
      setError('Maximum budget must be greater than zero.');
      return;
    }

    if (budget > 99999999.99) {
      setError('Maximum budget exceeds the allowed limit.');
      return;
    }

    const deadlineDate = new Date(form.deadline);

    if (
      Number.isNaN(deadlineDate.getTime()) ||
      deadlineDate.getTime() <= Date.now()
    ) {
      setError('Please select a future deadline.');
      return;
    }

    setSubmitting(true);

    try {
      await createRequest({
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.category_id),
        pickup_location_id: Number(form.pickup_location_id),
        max_budget: budget,
        // Backend validation requires seconds in the datetime.
        deadline: `${form.deadline}:00`,
      });

      navigate('/requests', {
        replace: true,
        state: {
          message: 'Your request was created successfully.',
        },
      });
    } catch (err) {
      setError(
        err.message || 'Unable to create the request. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <section className="mx-auto max-w-3xl">
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to requests
        </Link>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Create a Request
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tell other students what you need, your budget, and
                where you can collect the item.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {loadingOptions ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="mt-4 text-sm text-slate-500">
                Loading form options...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="request-title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Request title
                </label>
                <input
                  id="request-title"
                  name="title"
                  type="text"
                  maxLength={150}
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Need a second-hand engineering textbook"
                  className={fieldClass}
                />
                <p className="mt-1 text-xs text-slate-400">
                  {form.title.length}/150 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="request-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="request-description"
                  name="description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what you need and any important details..."
                  className={`${fieldClass} resize-y`}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="request-category"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>
                  <select
                    id="request-category"
                    name="category_id"
                    required
                    value={form.category_id}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {categories.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      No categories found. Check your database seed data.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="request-pickup"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Pickup location
                  </label>
                  <select
                    id="request-pickup"
                    name="pickup_location_id"
                    required
                    value={form.pickup_location_id}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">Select a pickup location</option>
                    {pickupLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>

                  {pickupLocations.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      No pickup locations found. Check your database seed data.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="request-budget"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Wallet size={16} />
                    Maximum budget (INR)
                  </label>
                  <input
                    id="request-budget"
                    name="max_budget"
                    type="number"
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    required
                    value={form.max_budget}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="request-deadline"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <CalendarClock size={16} />
                    Deadline
                  </label>
                  <input
                    id="request-deadline"
                    name="deadline"
                    type="datetime-local"
                    min={getLocalDateTimeMinimum()}
                    required
                    value={form.deadline}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Link
                  to="/requests"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    categories.length === 0 ||
                    pickupLocations.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={17} />
                  {submitting ? 'Creating request...' : 'Create Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
