import { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  UserX
} from 'lucide-react';

import { Link } from 'react-router';

import {
  getAdminUsers,
  getAdminComplaints
} from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const [userResponse, complaintResponse] =
        await Promise.all([
          getAdminUsers(),
          getAdminComplaints()
        ]);

      setUsers(userResponse.data || []);
      setComplaints(complaintResponse.data || []);

    } catch (err) {
      setError(
        err.message || 'Unable to load admin dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalUsers = users.length;

  const blockedUsers = users.filter(
    user => Boolean(user.is_blocked)
  ).length;

  const activeUsers = totalUsers - blockedUsers;

  const openComplaints = complaints.filter(
    complaint =>
      complaint.status === 'open' ||
      complaint.status === 'under_review'
  ).length;

  const resolvedComplaints = complaints.filter(
    complaint => complaint.status === 'resolved'
  ).length;

  if (loading) {
    return (
      <main className="flex-1 p-10 text-center">
        Loading administrator dashboard...
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={34}
                className="text-blue-600"
              />

              <h1 className="text-3xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
            </div>

            <p className="mt-2 text-slate-500">
              Overview of Campus Plus users and moderation activity.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<Users />}
          />

          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={<CheckCircle />}
          />

          <StatCard
            title="Blocked Users"
            value={blockedUsers}
            icon={<UserX />}
          />

          <StatCard
            title="Open Complaints"
            value={openComplaints}
            icon={<AlertTriangle />}
          />

        </div>

        {/* Complaint summary */}

        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Complaint Overview
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div className="rounded-xl bg-amber-50 p-5">
              <p className="text-sm text-amber-700">
                Pending / Under Review
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-800">
                {openComplaints}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-green-700">
                Resolved Complaints
              </p>

              <p className="mt-2 text-3xl font-bold text-green-800">
                {resolvedComplaints}
              </p>
            </div>

          </div>

          <Link
            to="/admin/complaints"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Manage Complaints
          </Link>

        </section>

        {/* User management */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            User Management
          </h2>

          <p className="mt-2 text-slate-500">
            View registered users, monitor account status,
            and manage blocked accounts.
          </p>

          <Link
            to="/admin/users"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Manage Users
          </Link>

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