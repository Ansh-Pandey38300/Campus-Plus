import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Ban, RefreshCw, CheckCircle, Users } from 'lucide-react';
import { getAdminComplaints, moderateComplaint } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useDialog } from '../context/DialogContext';

export default function AdminComplaints() {
  const { confirm, prompt } = useDialog();
  const { success, error: showError, } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(null);

  async function loadComplaints() {
    try {
      setLoading(true);
      setError('');

      const response = await getAdminComplaints();

      setComplaints(response.data || []);
    } catch (err) {
      setError(err.message || 'Could not load complaints.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchComplaints() {
      try {
        const response = await getAdminComplaints();

        if (!cancelled) {
          setComplaints(response.data || []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load complaints.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchComplaints();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleModeration(
    complaint,
    type,
    userId
  ) {
    let days = null;

    // Ask for block duration using custom input modal.
    if (type === 'temporary_block') {
      const input = await prompt(
        'Enter block duration in days (1-30):',
        '7',
        {
          title: 'Temporary User Block',
          inputType: 'number',
          min: 1,
          max: 30,
          placeholder: 'Enter days',
        }
      );

      if (input === null) return;

      days = Number(input);

      if (
        !Number.isInteger(days) ||
        days < 1 ||
        days > 30
      ) {
        const validationMessage =
          'Enter a duration between 1 and 30 days.';

        setError(validationMessage);
        showError(validationMessage);
        return;
      }
    }

    // Ask for confirmation using custom modal.
    const confirmed = await confirm(
      `Are you sure you want to ${type === 'warning' ? 'warn' : 'block'
      } this user?`,
      'Confirm Moderation Action'
    );

    if (!confirmed) return;

    try {
      setProcessing(complaint.id);
      setError('');
      setMessage('');

      await moderateComplaint(complaint.id, {
        user_id: userId,
        type,
        days,
      });

      const successMessage =
        type === 'warning'
          ? 'Warning issued successfully.'
          : 'User temporarily blocked successfully.';

      setMessage(successMessage);
      success(successMessage);

      await loadComplaints();

    } catch (err) {
      const errorMessage =
        err.message || 'Moderation action failed.';

      setError(errorMessage);
      showError(errorMessage);

    } finally {
      setProcessing(null);
    }
  }

  const openComplaints = complaints.filter(
    (item) => item.status === 'open'
  ).length;

  const resolvedComplaints = complaints.filter(
    (item) => item.status === 'resolved'
  ).length;

  if (loading) {
    return (
      <main className="flex-1 p-10 text-center">
        Loading admin Complaints...
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={32}
                className="text-blue-600"
              />

              <h1 className="text-3xl font-bold text-slate-900">
                Complaints
              </h1>
            </div>

            <p className="mt-2 text-slate-500">
              Manage complaints and moderate Campus Plus users.
            </p>
          </div>

          <button
            onClick={loadComplaints}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <StatCard
            title="Total Complaints"
            value={complaints.length}
            icon={<Users />}
          />

          <StatCard
            title="Open Complaints"
            value={openComplaints}
            icon={<AlertTriangle />}
          />

          <StatCard
            title="Resolved Complaints"
            value={resolvedComplaints}
            icon={<CheckCircle />}
          />

        </div>

        {/* Complaints */}
        <section className="mt-10">

          <h2 className="text-2xl font-bold text-slate-900">
            Complaint Management
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Review reported problems and take appropriate action.
          </p>

          {complaints.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-white p-8 text-center text-slate-500">
              No complaints have been submitted.
            </div>
          ) : (

            <div className="mt-6 space-y-5">

              {complaints.map((complaint) => {

                const busy =
                  processing === complaint.id;

                const canModerate =
                  complaint.status === 'open' ||
                  complaint.status === 'under_review';

                return (

                  <article
                    key={complaint.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <h3 className="text-lg font-bold text-slate-900">
                        Complaint #{complaint.id}
                      </h3>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complaint.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : complaint.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                        {complaint.status}
                      </span>

                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Reporter
                        </p>

                        <p className="mt-1 font-semibold">
                          {complaint.reporter_name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {complaint.reporter_email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Deal
                        </p>

                        <p className="mt-1 font-semibold">
                          Deal #{complaint.deal_id}
                        </p>

                        <p className="text-sm text-slate-500">
                          Status: {complaint.deal_status}
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Complaint Description
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {complaint.reason}
                      </p>

                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      <div className="rounded-xl border p-4">
                        <p className="text-sm text-slate-500">
                          Buyer
                        </p>

                        <p className="mt-1 font-semibold">
                          {complaint.buyer_name}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          ID: {complaint.buyer_id}
                        </p>

                        {canModerate && (
                          <ModerationButtons
                            disabled={busy}
                            onWarn={() =>
                              handleModeration(
                                complaint,
                                'warning',
                                complaint.buyer_id
                              )
                            }
                            onBlock={() =>
                              handleModeration(
                                complaint,
                                'temporary_block',
                                complaint.buyer_id
                              )
                            }
                          />
                        )}
                      </div>

                      <div className="rounded-xl border p-4">
                        <p className="text-sm text-slate-500">
                          Seller
                        </p>

                        <p className="mt-1 font-semibold">
                          {complaint.seller_name}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          ID: {complaint.seller_id}
                        </p>

                        {canModerate && (
                          <ModerationButtons
                            disabled={busy}
                            onWarn={() =>
                              handleModeration(
                                complaint,
                                'warning',
                                complaint.seller_id
                              )
                            }
                            onBlock={() =>
                              handleModeration(
                                complaint,
                                'temporary_block',
                                complaint.seller_id
                              )
                            }
                          />
                        )}
                      </div>

                    </div>

                    {busy && (
                      <p className="mt-4 text-sm text-blue-600">
                        Processing moderation action...
                      </p>
                    )}

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          {icon}
        </div>

      </div>

    </div>
  );
}

function ModerationButtons({
  disabled,
  onWarn,
  onBlock
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">

      <button
        disabled={disabled}
        onClick={onWarn}
        className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-50"
      >
        <AlertTriangle size={15} />
        Warn
      </button>

      <button
        disabled={disabled}
        onClick={onBlock}
        className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        <Ban size={15} />
        Block
      </button>

    </div>
  );
}