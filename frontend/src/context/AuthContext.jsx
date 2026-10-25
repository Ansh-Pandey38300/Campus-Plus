import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'campus_plus_token';
const USER_KEY = 'campus_plus_user';

function normalizeUser(userData) {
  if (!userData || typeof userData !== 'object') {
    return null;
  }

  const id = userData.id ?? userData._id;

  if (!id) {
    return null;
  }

  return {
    ...userData,
    id,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await getCurrentUser(token);

        const currentUser = normalizeUser(
          response?.user ?? response,
        );

        if (!currentUser) {
          throw new Error(
            'The server returned an invalid user profile.',
          );
        }

        if (!cancelled) {
          setUser(currentUser);

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(currentUser),
          );
        }
      } catch (error) {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);

          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function login(userData, token) {
    if (!token) {
      throw new Error('A valid authentication token is required.');
    }

    const normalizedUser = normalizeUser(userData);

    if (!normalizedUser) {
      throw new Error('Valid user information is required.');
    }

    localStorage.setItem(TOKEN_KEY, token);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(normalizedUser),
    );

    setUser(normalizedUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.',
    );
  }

  return context;
}