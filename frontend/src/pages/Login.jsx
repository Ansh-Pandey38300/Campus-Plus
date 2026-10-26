import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Eye,
  EyeOff,
  Gavel,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { loginUser, getCurrentUser } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const registrationMessage = location.state?.message;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }));

    setServerError('');
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Please enter your password.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Authenticate the student.
      const result = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      const token = result?.token;
      const loginUserData = result?.user;

      if (!token || !loginUserData) {
        throw new Error(
          'Login response is missing the token or user information.'
        );
      }

      // Verify the token and retrieve the student profile.
      const profileResponse = await getCurrentUser(token);

      const currentUser =
        profileResponse?.user ?? profileResponse;

      const userId = currentUser?.id ?? currentUser?._id;

      if (!currentUser || !userId) {
        throw new Error(
          'Unable to retrieve a valid user profile.'
        );
      }

      // Update the shared authentication state.
      login(
        {
          ...loginUserData,
          ...currentUser,
          id: userId,
        },
        token
      );

      // Return to the home page after successful login.
      navigate('/', {
        replace: true,
      });
    } catch (error) {
      console.error('Login error:', error);

      setServerError(
        error.message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10 sm:py-14">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">

        {/* Campus Plus heading */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl font-extrabold text-blue-700"
        >
          <Gavel size={26} />
          Campus Plus
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to explore campus auctions and manage your bids.
          </p>
        </div>

        {/* Registration success message */}
        {registrationMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {registrationMessage}
          </div>
        )}

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 space-y-5"
        >
          {/* Email */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              {/* Forgot Password Link */}
              
            </div>

            <div className="relative">
              <Mail
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'login-email-error' : undefined
                }
                required
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.email
                    ? 'border-red-400'
                    : 'border-slate-200'
                  }`}
              />
            </div>
           

            {errors.email && (
              <p
                id="login-email-error"
                className="mt-1.5 text-xs text-red-600"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? 'login-password-error'
                    : undefined
                }
                required
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.password
                    ? 'border-red-400'
                    : 'border-slate-200'
                  }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p
                id="login-password-error"
                className="mt-1.5 text-xs text-red-600"
              >
                {errors.password}
              </p>
            )}
            <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>

          </div>
           
          {/* API error */}
          {serverError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Registration link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Create account
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-slate-400">
          Campus Plus · Your campus auction marketplace
        </p>
      </section>
    </main>
  );
}