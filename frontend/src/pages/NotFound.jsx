import { Link } from 'react-router';
import { ArrowLeft, SearchX } from 'lucide-react';

// Display a friendly message when a page does not exist.
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <SearchX size={32} />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-blue-600">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
          Page not found
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>
      </div>
    </main>
  );
}