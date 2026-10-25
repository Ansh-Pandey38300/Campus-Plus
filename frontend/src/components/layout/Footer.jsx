import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router';

// Shared footer displayed at the bottom of public pages.
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        {/* Footer brand */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap size={21} className="text-blue-600" />

          <span className="font-bold text-slate-800">
            Campus<span className="text-blue-600">Plus</span>
          </span>
        </Link>

        {/* Copyright notice */}
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Campus Plus. Built for campus life.
        </p>

        {/* Quick navigation */}
        <div className="flex gap-4 text-sm text-slate-500">
          <Link to="/login" className="hover:text-blue-600">
            Login
          </Link>

          <Link to="/register" className="hover:text-blue-600">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}