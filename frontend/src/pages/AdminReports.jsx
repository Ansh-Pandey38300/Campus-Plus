import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  FileText,
  Tag,
  Users,
  Wallet,
  PackageSearch
} from 'lucide-react';

import { getAdminReports } from '../services/api';

export default function AdminReports() {
  const [reports, setReports] = useState({
    requestsWithoutOffers: [],
    topCategories: [],
    topSellers: [],
    buyerSavings: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReports() {
    try {
      setLoading(true);
      setError('');

      const response = await getAdminReports();

      setReports(response.data || {});
    } catch (err) {
      setError(err.message || 'Could not load reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const totalSavings = reports.buyerSavings.reduce(
    (total, item) => total + Number(item.savings || 0),
    0
  );

  if (loading) {
    return (
      <main className="flex-1 p-10 text-center">
        Loading admin reports...
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
              <ShieldCheck size={32} className="text-blue-600" />

              <h1 className="text-3xl font-bold text-slate-900">
                Reports
              </h1>
            </div>

            <p className="mt-2 text-slate-500">
              View important statistics and reports for Campus Plus.
            </p>
          </div>

          <button
            onClick={loadReports}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Requests Without Offers"
            value={reports.requestsWithoutOffers.length}
            icon={<PackageSearch />}
          />

          <StatCard
            title="Categories Listed"
            value={reports.topCategories.length}
            icon={<Tag />}
          />

          <StatCard
            title="Sellers With Completed Deals"
            value={reports.topSellers.length}
            icon={<Users />}
          />

          <StatCard
            title="Total Buyer Savings"
            value={formatCurrency(totalSavings)}
            icon={<Wallet />}
          />
        </div>

        {/* Requests Without Offers */}
        <ReportSection
          title="Requests Without Offers"
          description="Requests that have not received any offers."
          icon={<PackageSearch />}
          emptyMessage="All requests have received offers."
          isEmpty={reports.requestsWithoutOffers.length === 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Maximum Budget</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {reports.requestsWithoutOffers.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">#{item.id}</td>
                    <td className="p-4 font-medium text-slate-800">
                      {item.title}
                    </td>
                    <td className="p-4">
                      {formatCurrency(item.max_budget)}
                    </td>
                    <td className="p-4 capitalize">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        {/* Top Categories */}
        <ReportSection
          title="Most Requested Categories"
          description="Categories ranked by the number of requests."
          icon={<Tag />}
          emptyMessage="No category data available."
          isEmpty={reports.topCategories.length === 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Total Requests</th>
                </tr>
              </thead>

              <tbody>
                {reports.topCategories.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4 font-medium text-slate-800">
                      {item.category}
                    </td>
                    <td className="p-4">{item.total_requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        {/* Top Sellers */}
        <ReportSection
          title="Top Sellers"
          description="Sellers ranked by their completed deals."
          icon={<Users />}
          emptyMessage="No completed deals available."
          isEmpty={reports.topSellers.length === 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Seller ID</th>
                  <th className="p-4">Seller Name</th>
                  <th className="p-4">Completed Deals</th>
                </tr>
              </thead>

              <tbody>
                {reports.topSellers.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">#{item.id}</td>
                    <td className="p-4 font-medium text-slate-800">
                      {item.name}
                    </td>
                    <td className="p-4">{item.completed_deals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        {/* Buyer Savings */}
        <ReportSection
          title="Buyer Savings"
          description="Savings calculated from completed deals."
          icon={<Wallet />}
          emptyMessage="No completed deals available."
          isEmpty={reports.buyerSavings.length === 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Request</th>
                  <th className="p-4">Maximum Budget</th>
                  <th className="p-4">Agreed Amount</th>
                  <th className="p-4">Savings</th>
                </tr>
              </thead>

              <tbody>
                {reports.buyerSavings.map((item) => (
                  <tr key={item.request_id} className="border-t">
                    <td className="p-4 font-medium text-slate-800">
                      {item.title}
                    </td>
                    <td className="p-4">
                      {formatCurrency(item.max_budget)}
                    </td>
                    <td className="p-4">
                      {formatCurrency(item.agreed_amount)}
                    </td>
                    <td className="p-4 font-semibold text-green-700">
                      {formatCurrency(item.savings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

      </div>
    </main>
  );
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
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

function ReportSection({
  title,
  description,
  icon,
  emptyMessage,
  isEmpty,
  children
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
        {isEmpty ? (
          <div className="p-8 text-center text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}