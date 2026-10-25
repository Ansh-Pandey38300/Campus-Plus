import {
  ArrowRight,
  Gavel,
  Search,
  Tag,
  TrendingUp,
  UserRound,
  Wallet,
} from 'lucide-react';

import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

const dashboardActions = [
  {
    title: 'Browse Auctions',
    description:
      'Discover items listed by students and explore available auctions.',
    icon: Search,
    iconStyle: 'bg-blue-100 text-blue-700',
    link: '/auctions',
    buttonText: 'Explore Auctions',
  },
  {
    title: 'My Listings',
    description:
      'View and manage the items you have listed for auction.',
    icon: Tag,
    iconStyle: 'bg-purple-100 text-purple-700',
    link: '/my-listings',
    buttonText: 'View My Listings',
  },
  {
    title: 'My Bids',
    description:
      'Keep track of the auctions you have placed bids on.',
    icon: Gavel,
    iconStyle: 'bg-emerald-100 text-emerald-700',
    link: '/my-bids',
    buttonText: 'View My Bids',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  const displayName = user?.name || 'Student';
  const firstName = displayName.trim().split(/\s+/)[0];

  return (
    <main className="flex-1 bg-slate-50">
      {/* Welcome banner */}
      <section className="bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
                <Gavel size={15} />
                CAMPUS PLUS MARKETPLACE
              </span>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Welcome back, {firstName}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                Discover campus deals, place bids on interesting
                items, and manage your own auction listings.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <Gavel size={34} strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* Profile summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserRound size={27} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-slate-900">
                {displayName}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {user?.email || 'Email not available'}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {user?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Marketplace actions */}
        <div className="mt-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Your Marketplace
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Everything you need to buy, sell, and participate
              in campus auctions.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dashboardActions.map((action) => {
              const Icon = action.icon;

              return (
                <article
                  key={action.title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.iconStyle}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {action.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>

                  <Link
                    to={action.link}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {action.buttonText}
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* Sell an item */}
        <div className="mt-8 rounded-2xl bg-blue-600 p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex">
              <TrendingUp size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Have something to sell?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                List your items on Campus Plus and let fellow
                students participate in your auction.
              </p>
            </div>
          </div>

          <Link
            to="/create-listing"
            className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:mt-0"
          >
            <Wallet size={17} />
            Create Listing
            <ArrowRight size={16} />
          </Link>
        </div>

      </section>
    </main>
  );
}