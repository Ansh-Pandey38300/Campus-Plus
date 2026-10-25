
import { Route, Routes } from 'react-router';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import RequestList from './pages/RequestList';
import CreateRequest from './pages/CreateRequest';

function ForgotPasswordPlaceholder() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Forgot Password
        </h1>
        <p className="mt-3 text-slate-600">
          Password recovery will be available soon.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <Routes>
        {/* Public home page */}
        <Route path="/" element={<Home />} />

        {/* Pages available only to logged-out visitors */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPlaceholder />}
          />
        </Route>

        {/* Pages available only to authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<RequestList />} />
          <Route
            path="/requests/create"
            element={<CreateRequest />}
          />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}
