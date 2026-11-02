import { useEffect, useState } from 'react';
import { Search, Users, RefreshCw, Unlock, } from 'lucide-react';
import { getAdminUsers, unblockAdminUser } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

      const response = await getAdminUsers(search);

      setUsers(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnblock(user) {
    const confirmed = window.confirm(
      `Are you sure you want to unblock ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setError('');

      await unblockAdminUser(user.id);

      window.alert(
        `${user.name} has been unblocked successfully.`
      );

      await loadUsers();

    } catch (err) {
      setError(
        err.message || 'Unable to unblock this user.'
      );
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main className="min-h-screen flex-1 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">

        <div className="flex items-center gap-3">
          <Users size={32} className="text-blue-600" />

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              User Management
            </h1>

            <p className="mt-1 text-slate-500">
              View and monitor registered Campus Plus users.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">

          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or user ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={loadUsers}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-2xl border bg-white shadow-sm">

          <table className="w-full text-left">

            <thead className="bg-slate-100 text-sm text-slate-600">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">

                    <td className="p-4 font-medium">
                      #{user.id}
                    </td>

                    <td className="p-4 font-semibold">
                      {user.name}
                    </td>

                    <td className="p-4 text-slate-600">
                      {user.email}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_blocked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                        }`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-slate-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="p-4">

                      {user.is_blocked && user.role !== 'admin' ? (

                        <button
                          onClick={() => handleUnblock(user)}
                          className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-200"
                        >
                          <Unlock size={15} />
                          Unblock
                        </button>

                      ) : user.is_blocked ? (

                        <span className="text-xs text-slate-400">
                          Admin account
                        </span>

                      ) : (

                        <span className="text-xs text-slate-400">
                          No action required
                        </span>

                      )}

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing {users.length} users (maximum 100 results).
        </p>

      </div>
    </main>
  );
}