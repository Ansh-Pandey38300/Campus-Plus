
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Gavel,
  LoaderCircle,
  RefreshCw,
  Send,
  Tag,
  Wallet,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import {
  getOffersForRequest,
  getMyOfferForRequest,
  getRequestById,
  selectOffer,
  submitOffer,
} from '../services/api';

function money(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 'Price unavailable';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

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

export default function RequestOffers() {
  const { requestId } = useParams();
  const { user } = useAuth();

  const [requestInfo, setRequestInfo] = useState(null);
  const [offers, setOffers] = useState([]);
  const [myOffer, setMyOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectingOfferId, setSelectingOfferId] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isOwner =
    Number(requestInfo?.buyer_id) === Number(user?.id);

  const isClosed =
    requestInfo?.status !== undefined &&
    requestInfo.status !== 'open';

  const loadData = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [requestResponse, offersResponse] = await Promise.all([
        getRequestById(requestId),
        getOffersForRequest(requestId),
      ]);

      const request =
        requestResponse?.request ?? requestResponse;

      setRequestInfo(request);

      setOffers(
        Array.isArray(offersResponse?.offers)
          ? offersResponse.offers
          : [],
      );

      if (Number(request?.buyer_id) !== Number(user?.id)) {
        try {
          const mineResponse =
            await getMyOfferForRequest(requestId);

          setMyOffer(mineResponse?.offer ?? null);
        } catch (mineError) {
          const message = String(
            mineError.message || '',
          ).toLowerCase();

          if (
            message.includes('not submitted') ||
            message.includes('not found')
          ) {
            setMyOffer(null);
          } else {
            throw mineError;
          }
        }
      } else {
        setMyOffer(null);
      }
    } catch (err) {
      setError(
        err.message ||
          'Unable to load this request and its offers.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedOffers = useMemo(
    () =>
      [...offers].sort(
        (first, second) =>
          Number(first.offered_price) -
          Number(second.offered_price),
      ),
    [offers],
  );

  async function handleSubmitOffer(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const price = Number(offerPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter an offer price greater than zero.');
      return;
    }

    if (
      requestInfo?.max_budget != null &&
      price > Number(requestInfo.max_budget)
    ) {
      setError(
        "Your offer cannot exceed the request's maximum budget.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitOffer(requestId, {
        offered_price: price,
        offer_note: offerNote.trim(),
      });

      setNotice(
        result?.message || 'Offer saved successfully.',
      );

      setOfferPrice('');
      setOfferNote('');

      await loadData(true);
    } catch (err) {
      setError(err.message || 'Unable to submit offer.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelectOffer(offer) {
    const confirmed = window.confirm(
      `Select ${
        offer.seller_name || `seller #${offer.seller_id}`
      } at ${money(offer.offered_price)}? This creates a confirmed deal and closes the request.`,
    );

    if (!confirmed) return;

    setSelectingOfferId(offer.id);
    setError('');
    setNotice('');

    try {
      const response = await selectOffer(offer.id);
      const deal = response?.deal;

      setNotice(
        `Winner selected successfully. Deal #${
          deal?.dealId ?? 'created'
        } is confirmed.`,
      );

      await loadData(true);
    } catch (err) {
      setError(
        err.message || 'Unable to select this offer.',
      );
    } finally {
      setSelectingOfferId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 p-10">
        <LoaderCircle
          size={32}
          className="animate-spin text-blue-600"
        />
        <span className="ml-3 text-sm text-slate-600">
          Loading request and offers...
        </span>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50">
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to requests
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Request #{requestId}
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-white">
                {requestInfo?.title || 'Request offers'}
              </h1>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-blue-100">
                {requestInfo?.description ||
                  'Review offers submitted by students.'}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${
                isClosed
                  ? 'bg-white/15 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <Clock3 size={15} />
              {requestInfo?.status || 'unknown'}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-blue-100">
            <span className="inline-flex items-center gap-2">
              <Wallet size={16} />
              Budget: {money(requestInfo?.max_budget)}
            </span>

            <span className="inline-flex items-center gap-2">
              <CalendarClock size={16} />
              Deadline: {formatDate(requestInfo?.deadline)}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {notice && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Offers ({sortedOffers.length})
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sorted by price, lowest first. The buyer chooses the winner.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {sortedOffers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Tag size={28} className="mx-auto text-slate-400" />

            <h3 className="mt-3 font-bold text-slate-900">
              No offers yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sellers can submit an offer while the request is open.
            </p>
          </div>
        )}

        {sortedOffers.map((offer) => {
          const isOwnOffer =
            Number(offer.seller_id) === Number(user?.id);

          return (
            <article
              key={offer.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {offer.seller_name ||
                        `Seller #${offer.seller_id}`}
                    </h3>

                    {isOwnOffer && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Your offer
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Offer #{offer.id} · Submitted{' '}
                    {formatDate(offer.created_at)}
                  </p>

                  {offer.offer_note && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {offer.offer_note}
                    </p>
                  )}
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Offered price
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {money(offer.offered_price)}
                  </p>
                </div>
              </div>

              {isOwner && !isClosed && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectOffer(offer)}
                    disabled={selectingOfferId !== null}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {selectingOfferId === offer.id ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}

                    {selectingOfferId === offer.id
                      ? 'Selecting winner...'
                      : 'Select winner'}
                  </button>
                </div>
              )}
            </article>
          );
        })}

        {!isOwner && requestInfo?.status === 'open' && (
          <form
            onSubmit={handleSubmitOffer}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Gavel size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {myOffer
                    ? 'Revise your offer'
                    : 'Submit an offer'}
                </h2>

                <p className="text-sm text-slate-500">
                  Your price must obey the buyer's budget and bidding rules.
                </p>
              </div>
            </div>

            {myOffer && (
              <p className="mt-3 text-sm text-slate-600">
                Current offer: {money(myOffer.offered_price)}.
                Enter a lower price to revise.
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Your price (INR)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={requestInfo?.max_budget ?? undefined}
                  value={offerPrice}
                  onChange={(event) =>
                    setOfferPrice(event.target.value)
                  }
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="e.g. 450"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Message (optional)
                <textarea
                  value={offerNote}
                  maxLength={5000}
                  onChange={(event) =>
                    setOfferNote(event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Describe the item's condition or availability."
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || isClosed}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Send size={17} />
              )}

              {submitting
                ? 'Submitting...'
                : myOffer
                  ? 'Save lower price'
                  : 'Submit offer'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}