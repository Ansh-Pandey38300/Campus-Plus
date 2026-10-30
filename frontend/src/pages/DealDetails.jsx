import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle2, PackageCheck, RefreshCw } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import {
  getDealDetails,
  markDealHandedOver,
  confirmDealHandover,
} from '../services/api';

import {
  markPaymentCompleted,
  confirmPaymentReceived,
} from '../services/api';

export default function DealDetails() {
  const { dealId } = useParams();
  const { user } = useAuth();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDeal = useCallback(async () => {
    try {
      setError('');
      const response = await getDealDetails(dealId);
      setDeal(response);
    } catch (err) {
      setError(err.message || 'Unable to load deal details.');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    loadDeal();
  }, [loadDeal]);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  async function handleHandoverAction(action) {
    try {
      setActionLoading(true);
      setError('');

      if (action === 'mark') {
        await markDealHandedOver(dealId);
      } else {
        await confirmDealHandover(dealId);
      }

      await loadDeal();
    } catch (err) {
      setError(err.message || 'Action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  }
  async function handlePaymentAction(action) {
  try {
    setActionLoading(true);
    setError('');

    if (action === 'buyer') {
      await markPaymentCompleted(dealInfo.id, paymentMethod);
    } else {
      await confirmPaymentReceived(dealInfo.id);
    }

    await loadDeal();
  } catch (err) {
    setError(err.message || 'Payment action could not be completed.');
  } finally {
    setActionLoading(false);
  }
}

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 p-8">
        <p className="text-slate-600">Loading deal details...</p>
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="flex-1 bg-slate-50 px-4 py-12">
        <p className="text-center text-red-600">
          {error || 'Deal not found.'}
        </p>
      </main>
    );
  }

  const dealInfo = deal.deal;
const handoverStatus = deal.handover?.status || 'agreed';
const isSeller = Number(user?.id) === Number(dealInfo?.seller_id);
const isBuyer = Number(user?.id) === Number(dealInfo?.buyer_id);
  return (
    <main className="flex-1 bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <PackageCheck size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Your Deal
              </h1>
              <p className="text-sm text-slate-500">
                Deal #{dealInfo.id} · Handover & Confirmation
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Agreed Amount</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                ₹{dealInfo.agreed_amount ?? deal.agreedAmount ?? '—'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Deal Status</p>
              <p className="mt-1 font-bold capitalize text-slate-900">
                {dealInfo.status || '—'}
              </p>
            </div>
          </div>
            {/* Transaction Details */}
<div className="mt-7 border-t border-slate-200 pt-6">
  <h2 className="font-bold text-slate-900">
    Transaction Details
  </h2>

  {deal.transactions?.length > 0 ? (
    deal.transactions.map((transaction) => (
      <div
        key={transaction.id}
        className="mt-4 rounded-xl bg-slate-50 p-4"
      >
        <div className="flex justify-between gap-3">
          <span className="text-sm text-slate-500">
            Payment Status
          </span>
          <span className="font-semibold capitalize text-amber-600">
            {transaction.status}
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-3">
          <span className="text-sm text-slate-500">
            Amount
          </span>
          <span className="font-semibold">
            ₹{transaction.amount}
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-3">
          <span className="text-sm text-slate-500">
            Payment Method
          </span>
          <span className="font-semibold uppercase">
            {transaction.payment_method || 'Not selected'}
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-3">
          <span className="text-sm text-slate-500">
            Reference Code
          </span>
          <span className="font-semibold">
            {transaction.reference_code || 'Not available'}
          </span>
        </div>
      </div>
    ))
  ) : (
    <p className="mt-3 text-sm text-slate-500">
      No transaction has been created for this deal yet.
    </p>
  )}
</div>
{deal.transactions?.[0]?.status === 'pending' && isBuyer && (
  <div className="mt-5">
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      Select Payment Method
    </label>

    <select
      value={paymentMethod}
      onChange={(event) => setPaymentMethod(event.target.value)}
      className="w-full rounded-xl border border-slate-300 bg-white p-3"
    >
      <option value="upi">UPI</option>
      <option value="cash">Cash</option>
    </select>

    <button
      type="button"
      disabled={actionLoading}
      onClick={() => handlePaymentAction('buyer')}
      className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
    >
      {actionLoading ? 'Please wait...' : 'Payment Completed'}
    </button>
  </div>
)}

{deal.transactions?.[0]?.status === 'paid' &&
  handoverStatus === 'confirmed' &&
  isSeller &&
  dealInfo.status !== 'completed' && (
    <button
      type="button"
      disabled={actionLoading || dealInfo.status === 'completed'}
      onClick={() => handlePaymentAction('seller')}
      className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
    >
      {actionLoading ? 'Please wait...' : 'Confirm Received'}
    </button>
)}

{deal.transactions?.[0]?.status === 'paid' && (
  <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
    Buyer has marked the payment as completed.
  </p>
)}
          <div className="mt-7 border-t border-slate-200 pt-6">
            <h2 className="font-bold text-slate-900">
              Handover Progress
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Current status:
              <span className="ml-2 font-semibold capitalize text-blue-700">
                {handoverStatus.replaceAll('_', ' ')}
              </span>
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {['agreed', 'handed_over', 'confirmed'].map((status) => {
                const completed =
                  ['agreed', 'handed_over', 'confirmed'].indexOf(
                    handoverStatus,
                  ) >=
                  ['agreed', 'handed_over', 'confirmed'].indexOf(status);

                return (
                  <span
                    key={status}
                    className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${
                      completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {status.replaceAll('_', ' ')}
                  </span>
                );
              })}
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            {isSeller && handoverStatus === 'agreed' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleHandoverAction('mark')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <PackageCheck size={18} />
                {actionLoading ? 'Please wait...' : 'Mark as Handed Over'}
              </button>
            )}

            {isBuyer && handoverStatus === 'handed_over' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleHandoverAction('confirm')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 size={18} />
                {actionLoading ? 'Please wait...' : 'Confirm Received'}
              </button>
            )}

            {handoverStatus === 'confirmed' && (
              <p className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-700">
                <CheckCircle2 size={20} />
                Handover completed successfully!
              </p>
            )}

            <button
              type="button"
              onClick={loadDeal}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
            >
              <RefreshCw size={15} />
              Refresh status
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}