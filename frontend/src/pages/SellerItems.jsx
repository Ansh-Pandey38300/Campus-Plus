
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Package,
  Plus,
  RefreshCw,
  Tag,
  Wallet
} from 'lucide-react';

import {
  createSellerItem,
  getMySellerItems,
  getSellerItemCategories
} from '../services/api';

const fieldClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 'Price unavailable';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(
    typeof value === 'string' ? value.replace(' ', 'T') : value
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export default function SellerItems() {
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    item_condition: 'good',
    asking_price: '',
    description: ''
  });

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [categoryResponse, itemResponse] = await Promise.all([
        getSellerItemCategories(),
        getMySellerItems()
      ]);

      setCategories(
        Array.isArray(categoryResponse?.categories)
          ? categoryResponse.categories
          : []
      );

      setItems(
        Array.isArray(itemResponse?.items)
          ? itemResponse.items
          : []
      );
    } catch (err) {
      setError(err.message || 'Unable to load seller items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadData();
}, [loadData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const title = form.title.trim();
    const description = form.description.trim();
    const price = Number(form.asking_price);
    const categoryId = Number(form.category_id);

    if (
      !title ||
      title.length > 150 ||
      !description ||
      !form.category_id ||
      !form.item_condition ||
      !form.asking_price
    ) {
      setError('Please complete all fields correctly.');
      return;
    }

    if (
      !Number.isSafeInteger(categoryId) ||
      categoryId <= 0
    ) {
      setError('Please select a valid category.');
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      price > 99999999.99
    ) {
      setError('Enter a valid asking price greater than zero.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createSellerItem({
        title,
        description,
        category_id: categoryId,
        item_condition: form.item_condition,
        asking_price: price
      });

      if (!response?.item) {
        throw new Error('The server did not return the saved item.');
      }

      setItems((previous) => [
        response.item,
        ...previous.filter(
          (item) => Number(item.id) !== Number(response.item.id)
        )
      ]);

      setForm({
        title: '',
        category_id: '',
        item_condition: 'good',
        asking_price: '',
        description: ''
      });

      setSuccess('Your item was added successfully.');
    } catch (err) {
      setError(err.message || 'Unable to add the item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <section className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Package size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                My Seller Items
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add items you want to sell and manage your own listings.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="seller-title"
                className="text-sm font-semibold text-slate-700"
              >
                Item title
              </label>
              <input
                id="seller-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="e.g. Second-hand engineering textbook"
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-slate-400">
                {form.title.length}/150 characters
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="seller-category"
                  className="text-sm font-semibold text-slate-700"
                >
                  Category
                </label>
                <select
                  id="seller-category"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && !loading && (
                  <p className="mt-1 text-xs text-amber-700">
                    No categories available. Check the database seed data.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="seller-condition"
                  className="text-sm font-semibold text-slate-700"
                >
                  Item condition
                </label>
                <select
                  id="seller-condition"
                  name="item_condition"
                  value={form.item_condition}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                >
                  {CONDITIONS.map((condition) => (
                    <option
                      key={condition.value}
                      value={condition.value}
                    >
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="seller-price"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <Wallet size={16} />
                Asking price (INR)
              </label>
              <input
                id="seller-price"
                name="asking_price"
                type="number"
                min="0.01"
                max="99999999.99"
                step="0.01"
                value={form.asking_price}
                onChange={handleChange}
                required
                placeholder="e.g. 500"
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="seller-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="seller-description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe the item and its condition..."
                className={`${fieldClass} resize-y`}
              />
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                categories.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />
              {submitting ? 'Adding item...' : 'Add item'}
            </button>
          </form>
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your listings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? 'Loading items...' : `${items.length} item(s)`}
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading your items...
            </div>
          ) : items.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Package
                size={32}
                className="mx-auto text-slate-400"
              />
              <h3 className="mt-3 font-bold text-slate-900">
                No seller items yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your first item using the form above.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      <Tag size={14} />
                      {item.category_name || 'Uncategorized'}
                    </span>

                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold capitalize text-green-700">
                      {item.status || 'active'}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-lg font-extrabold text-blue-700">
                      {formatPrice(item.asking_price)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Condition:{' '}
                      {CONDITIONS.find(
                        (condition) =>
                          condition.value === item.item_condition
                      )?.label || item.item_condition}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Added {formatDate(item.created_at)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
