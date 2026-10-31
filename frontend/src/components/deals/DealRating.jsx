import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import {
  getDealRating,
  submitDealRating,
} from '../../services/api';

export default function DealRating({ dealId, dealStatus, isBuyer }) {
  const [details, setDetails] = useState(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadRating() {
      try {
        const response = await getDealRating(dealId);

        if (active) {
          setDetails(response.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load rating.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRating();

    return () => {
      active = false;
    };
  }, [dealId]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setMessage('');

      await submitDealRating({
        deal_id: Number(dealId),
        stars,
        comment: comment.trim() || null,
      });

      const response = await getDealRating(dealId);
      setDetails(response.data);
      setMessage('Your rating has been submitted successfully!');
    } catch (err) {
      setError(err.message || 'Rating could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="mt-6 text-sm text-slate-500">
        Loading seller rating...
      </p>
    );
  }

  const existingRating = details?.rating;
  const average = Number(details?.average_rating || 0);
  const totalRatings = details?.total_ratings || 0;

  return (
    <section className="mt-7 border-t border-slate-200 pt-6">
      <h2 className="text-lg font-bold text-slate-900">
        Seller Rating
      </h2>

      <div className="mt-3 rounded-xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          Average Rating
        </p>

        <div className="mt-1 flex items-center gap-2">
          <Star
            size={20}
            className="fill-amber-400 text-amber-400"
          />

          <span className="text-xl font-bold text-slate-900">
            {average > 0 ? average.toFixed(2) : 'Not rated yet'}
          </span>

          <span className="text-sm text-slate-500">
            ({totalRatings} ratings)
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          {message}
        </p>
      )}

      {existingRating && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-800">
            {isBuyer
              ? 'You have already rated this seller.'
              : 'Buyer Rating'}
          </p>

          <p className="mt-2 text-sm text-slate-700">
            Rating: {'★'.repeat(existingRating.stars)}{' '}
            ({existingRating.stars}/5)
          </p>

          {existingRating.comment && (
            <p className="mt-2 text-sm text-slate-600">
              {existingRating.comment}
            </p>
          )}
        </div>
      )}

      {!isBuyer && !existingRating && (
        <p className="mt-4 text-sm text-slate-600">
          The buyer has not submitted a rating yet.
        </p>
      )}

      {isBuyer && dealStatus !== 'completed' && (
        <p className="mt-4 text-sm text-slate-600">
          You can rate the seller after the deal is completed.
        </p>
      )}

      {isBuyer && dealStatus === 'completed' && !existingRating && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Your Rating
            </label>

            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStars(value)}
                  aria-label={`${value} stars`}
                  className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Star
                    size={30}
                    className={
                      value <= stars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }
                  />
                </button>
              ))}

              <span className="text-sm text-slate-600">
                {stars}/5
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="rating-comment"
              className="block text-sm font-semibold text-slate-700"
            >
              Comment (Optional)
            </label>

            <textarea
              id="rating-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Share your experience with the seller..."
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {comment.length}/1000
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      )}
    </section>
  );
}