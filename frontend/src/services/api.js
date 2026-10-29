const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

// Shared function for sending requests to the Campus Plus backend.
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  // Handle JSON responses and unexpected text responses.
  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.message || data.error
        : '';

    throw new Error(
      message || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

// Register a new student account.
export function registerUser({ name, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// Log in with an existing account.
export function loginUser({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Get the current user's profile using the JWT access token.
export function getCurrentUser(token) {
  return request('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Check whether the current user has administrator access.
export function checkAdminAccess(token) {
  return request('/api/admin/check', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


// Request APIs.

// Fetch all available categories.
export function getRequestCategories() {
  return request('/api/requests/categories');
}

// Fetch all requests.
export function getRequests() {
  return request('/api/requests');
}

// Fetch available pickup locations.
export function getPickupLocations() {
  return request('/api/requests/pickup-locations');
}

// Create a request using the saved JWT.
export function createRequest(payload) {
  const token = localStorage.getItem('campus_plus_token');

  if (!token) {
    throw new Error('Please sign in before creating a request.');
  }

  return request('/api/requests', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}