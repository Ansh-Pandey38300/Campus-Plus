
import { useEffect, useState } from 'react';

import {
  UserRound,
  FileText,
  HandCoins,
  Star,
  MapPin,
  Calendar,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

import { Link } from 'react-router';

import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';

function formatDate(date) {
  if (!date) return 'Not available';

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatPrice(price) {
  return Number(price || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={24} />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-slate-900">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, count }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
        {count}
      </span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError('');

        const response = await getMyProfile();

        if (!cancelled) {
          setProfileData(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Unable to load your profile.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-slate-600">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Unable to load profile
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!profileData) return null;

  const {
    profile,
    stats,
    my_requests,
    my_offers,
    rating
  } = profileData;

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* PAGE HEADING */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your Campus Plus activity and reputation.
          </p>
        </div>

        {/* USER INFORMATION */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserRound size={40} />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-slate-500">
                {profile.email}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {profile.role}
              </span>
            </div>

            <div className="text-sm text-slate-500">
              User ID: #{profile.id}
            </div>

          </div>
        </section>

        {/* STATISTICS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={FileText}
            title="My Requests"
            value={stats.total_requests}
          />

          <StatCard
            icon={HandCoins}
            title="My Offers"
            value={stats.total_offers}
          />

          <StatCard
            icon={Star}
            title="Average Rating"
            value={`${Number(stats.average_rating).toFixed(2)} / 5`}
          />

          <StatCard
            icon={UserRound}
            title="Total Ratings"
            value={stats.total_ratings}
          />

        </section>

        {/* MY REQUESTS */}
        <section className="mt-10">

          <SectionHeading
            title="My Requests"
            count={my_requests.length}
          />

          {my_requests.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FileText
                size={35}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 font-bold text-slate-800">
                No requests yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                You have not created any requests.
              </p>

              <Link
                to="/requests/create"
                className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Create Request
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2">

              {my_requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <h3 className="font-bold text-slate-900">
                      {request.title}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                      {request.status}
                    </span>

                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {request.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">

                    <p className="flex items-center gap-2">
                      <IndianRupee size={16} />
                      Budget: {formatPrice(request.max_budget)}
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      {request.pickup_location_name || 'Not specified'}
                    </p>

                    <p className="flex items-center gap-2">
                      <Calendar size={16} />
                      Created: {formatDate(request.created_at)}
                    </p>

                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-blue-700">
                      {request.total_offers} Offers received
                    </p>
                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

        {/* MY OFFERS */}
        <section className="mt-12">

          <SectionHeading
            title="My Offers"
            count={my_offers.length}
          />

          {my_offers.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <HandCoins
                size={35}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 font-bold text-slate-800">
                No offers submitted
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your submitted offers will appear here.
              </p>

              <Link
                to="/requests"
                className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Explore Requests
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2">

              {my_offers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <h3 className="font-bold text-slate-900">
                    {offer.request_title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Request #{offer.request_id}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">

                    <p>
                      Offered Price:{' '}
                      <strong className="text-blue-700">
                        {formatPrice(offer.offered_price)}
                      </strong>
                    </p>

                    <p>
                      Buyer's Name: {offer.buyer_name}
                    </p>

                    <p>
                      Request Status:{' '}
                      <span className="capitalize">
                        {offer.request_status}
                      </span>
                    </p>

                    <p>
                      Offer Date: {formatDate(offer.created_at)}
                    </p>

                    <p>
                      Deal Status:{' '}
                      <span className="capitalize">
                        {offer.deal_status || 'Not selected'}
                      </span>
                    </p>

                  </div>

                  {offer.offer_note && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500">
                        Your Offer Note
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {offer.offer_note}
                      </p>
                    </div>
                  )}

                </article>
              ))}

            </div>
          )}

        </section>

        {/* MY RATINGS */}
        <section className="mt-12">

          <SectionHeading
            title="My Rating"
            count={rating.total_ratings}
          />

          {/* AVERAGE RATING */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              <div>
                <p className="text-sm text-slate-500">
                  Your Average Seller Rating
                </p>

                <h3 className="mt-2 text-4xl font-extrabold text-slate-900">
                  {Number(rating.average_rating).toFixed(2)}
                  <span className="text-lg text-slate-400">
                    /5
                  </span>
                </h3>
              </div>

              <div>
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={25}
                      fill={
                        star <= Math.round(Number(rating.average_rating))
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  ))}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Based on {rating.total_ratings} reviews
                </p>
              </div>

            </div>

          </div>

          {/* CUSTOMER REVIEWS */}
          <div className="mt-5">

            {rating.reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <Star
                  size={35}
                  className="mx-auto text-slate-400"
                />

                <h3 className="mt-3 font-bold text-slate-800">
                  No ratings yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Ratings from buyers will appear here after completed deals.
                </p>

              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">

                {rating.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-center justify-between">

                      <h3 className="font-bold text-slate-900">
                        {review.reviewer_name}
                      </h3>

                      <span className="text-sm font-semibold text-yellow-600">
                        {review.stars}/5
                      </span>

                    </div>

                    <div className="mt-3 flex gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={17}
                          fill={
                            star <= review.stars
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {review.comment || 'No written comment.'}
                    </p>

                    <p className="mt-4 text-xs text-slate-400">
                      {formatDate(review.created_at)}
                    </p>

                  </article>
                ))}

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}
