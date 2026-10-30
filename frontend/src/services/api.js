
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

const TOKEN_KEY = 'campus_plus_token';

// Shared API request handler.
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

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

// Attach the logged-in user's JWT.
function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('Please sign in to continue.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// Authentication APIs.
export function registerUser({ name, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function loginUser({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser(token) {
  return request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function checkAdminAccess(token) {
  return request('/api/admin/check', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Request APIs.
export function getRequestCategories() {
  return request('/api/requests/categories');
}

export function getRequests() {
  return request('/api/requests');
}

export function getRequestById(requestId) {
  return request(
    `/api/requests/${encodeURIComponent(requestId)}`,
  );
}

export function getPickupLocations() {
  return request('/api/requests/pickup-locations');
}

export function createRequest(payload) {
  return request('/api/requests', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// Seller item APIs.
export function getSellerItemCategories() {
  return getRequestCategories();
}

export function getSellerItems(category) {
  const query = category
    ? `?category=${encodeURIComponent(category)}`
    : '';

  return request(`/api/seller-items${query}`);
}

export function getMySellerItems() {
  return request('/api/seller-items/my', {
    headers: authHeaders(),
  });
}

export function createSellerItem(payload) {
  return request('/api/seller-items', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// Offer APIs.
export function getOffersForRequest(requestId) {
  return request(
    `/api/offers/requests/${encodeURIComponent(requestId)}`,
    { headers: authHeaders() },
  );
}

export function getMyOfferForRequest(requestId) {
  return request(
    `/api/offers/requests/${encodeURIComponent(requestId)}/mine`,
    { headers: authHeaders() },
  );
}

export function submitOffer(requestId, payload) {
  return request(
    `/api/offers/requests/${encodeURIComponent(requestId)}`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
}

export function getOfferHistory(offerId) {
  return request(
    `/api/offers/${encodeURIComponent(offerId)}/history`,
    { headers: authHeaders() },
  );
}

// Select an offer as the buyer.
export function selectOffer(offerId) {
  return request(
    `/api/offers/${encodeURIComponent(offerId)}/select`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
  );
}

// Deal and handover APIs.
export function getDealDetails(dealId) {
  return request(`/api/deals/${encodeURIComponent(dealId)}`, {
    headers: authHeaders(),
  });
}

export function markDealHandedOver(dealId) {
  return request(
    `/api/deals/${encodeURIComponent(dealId)}/handover`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
  );
}

export function confirmDealHandover(dealId) {
  return request(
    `/api/deals/${encodeURIComponent(dealId)}/confirm-handover`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
  );
}

export function getMyDeals() {
  return request('/api/deals/my', {
    headers: authHeaders(),
  });
}

export function markPaymentCompleted(dealId, paymentMethod) {
  return request(`/api/deals/${encodeURIComponent(dealId)}/payment-completed`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_method: paymentMethod }),
  });
}

export function confirmPaymentReceived(dealId) {
  return request(`/api/deals/${encodeURIComponent(dealId)}/confirm-payment`, {
    method: 'POST',
    headers: authHeaders(),
  });
}
