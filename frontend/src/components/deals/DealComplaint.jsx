import { useState } from 'react';
import { submitComplaint } from '../../services/api';

function DealComplaint({ dealId }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason.trim()) {
      setError('Please enter a reason for your complaint.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await submitComplaint({
        deal_id: dealId,
        reason: reason.trim(),
      });

      setMessage('Your complaint has been submitted successfully.');
      setReason('');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to submit your complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Report a Problem
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Facing an issue with this deal? Let the admin know.
      </p>

      {submitted ? (
        <div className="mt-4">
          <p className="text-sm text-green-700">{message}</p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setMessage('');
            }}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Submit another complaint
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <label
            htmlFor="complaint-reason"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Describe your problem
          </label>

          <textarea
            id="complaint-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain what went wrong with this deal..."
            rows={4}
            maxLength={5000}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-right text-xs text-slate-500">
            {reason.length}/5000 characters
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      )}
    </section>
  );
}

export default DealComplaint;