import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request interceptor – attach JWT ─────────── */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('bed_token');
      const token = raw ? JSON.parse(raw) : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response interceptor – handle 401 ────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      if (isAdminPath) {
        localStorage.removeItem('bed_token');
        localStorage.removeItem('bed_user');
        window.location.href = '/addmin';
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Auth ──────────────────────────────────────── */
export const authAPI = {
  login:    (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  me:       () => api.get('/auth/me'),
  logout:   () => api.post('/auth/logout'),
  getUsers: (params?: object) => api.get('/auth/users', { params }),
};

/* ─── Events ────────────────────────────────────── */
export const eventsAPI = {
  getAll:      (params?: object) => api.get('/events', { params }),
  getAllAdmin:  (params?: object) => api.get('/events', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/events/${slug}`),
  getFeatured: ()                => api.get('/events?featured=true&limit=6'),
  getUpcoming: ()                => api.get('/events?upcoming=true&limit=8'),
  create:      (data: object)    => api.post('/events', data),
  update:      (id: string, data: object) => api.put(`/events/${id}`, data),
  delete:      (id: string)      => api.delete(`/events/${id}`),
  rsvp:        (id: string)      => api.post(`/events/${id}/rsvp`),
};

/* ─── Restaurants ───────────────────────────────── */
export const restaurantsAPI = {
  getAll:      (params?: object) => api.get('/restaurants', { params }),
  getAllAdmin:  (params?: object) => api.get('/restaurants', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/restaurants/${slug}`),
  getFeatured: ()                => api.get('/restaurants?featured=true&limit=6'),
  create:      (data: object)    => api.post('/restaurants', data),
  update:      (id: string, data: object) => api.put(`/restaurants/${id}`, data),
  delete:      (id: string)      => api.delete(`/restaurants/${id}`),
};

/* ─── Articles ──────────────────────────────────── */
export const articlesAPI = {
  getAll:      (params?: object) => api.get('/articles', { params }),
  getAllAdmin:  (params?: object) => api.get('/articles', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/articles/${slug}`),
  getFeatured: ()                => api.get('/articles?featured=true&limit=4'),
  create:      (data: object)    => api.post('/articles', data),
  update:      (id: string, data: object) => api.put(`/articles/${id}`, data),
  delete:      (id: string)      => api.delete(`/articles/${id}`),
};

/* ─── Gallery ───────────────────────────────────── */
export const galleryAPI = {
  getAll:      (params?: object) => api.get('/gallery', { params }),
  getFeatured: ()                => api.get('/gallery?featured=true&limit=12'),
  create:      (data: object)    => api.post('/gallery', data),
  update:      (id: string, data: object) => api.put(`/gallery/${id}`, data),
  delete:      (id: string)      => api.delete(`/gallery/${id}`),
};

/* ─── Products ──────────────────────────────────── */
export const productsAPI = {
  getAll:      (params?: object) => api.get('/products', { params }),
  getAllAdmin:  (params?: object) => api.get('/products', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/products/${slug}`),
  getFeatured: ()                => api.get('/products?featured=true&limit=8'),
  create:      (data: object)    => api.post('/products', data),
  update:      (id: string, data: object) => api.put(`/products/${id}`, data),
  delete:      (id: string)      => api.delete(`/products/${id}`),
};

/* ─── Orders ────────────────────────────────────── */
export const ordersAPI = {
  create:       (data: object)   => api.post('/orders', data),
  createGuest:  (data: object)   => api.post('/orders', data),
  getMyOrders:  ()               => api.get('/orders/me'),
  getAll:       (params?: object) => api.get('/orders', { params }),
  getOne:       (id: string)     => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

/* ─── Talents ───────────────────────────────────── */
export const talentsAPI = {
  getAll:      (params?: object) => api.get('/talents', { params }),
  getAllAdmin:  (params?: object) => api.get('/talents', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/talents/${slug}`),
  getFeatured: ()                => api.get('/talents?featured=true&limit=6'),
  create:      (data: object)    => api.post('/talents', data),
  update:      (id: string, data: object) => api.put(`/talents/${id}`, data),
  delete:      (id: string)      => api.delete(`/talents/${id}`),
};

/* ─── Partners ──────────────────────────────────── */
export const partnersAPI = {
  getAll:  (params?: object) => api.get('/partners', { params }),
  create:  (data: object)    => api.post('/partners', data),
  update:  (id: string, data: object) => api.put(`/partners/${id}`, data),
  delete:  (id: string)      => api.delete(`/partners/${id}`),
};

/* ─── Messages ──────────────────────────────────── */
export const messagesAPI = {
  send:    (data: object)    => api.post('/messages', data),
  getAll:  (params?: object) => api.get('/messages', { params }),
  markRead:(id: string)      => api.put(`/messages/${id}/read`),
  delete:  (id: string)      => api.delete(`/messages/${id}`),
};

/* ─── Settings ──────────────────────────────────── */
export const settingsAPI = {
  get:    () => api.get('/settings'),
  update: (data: object) => api.put('/settings', data),
};

/* ─── Analytics ─────────────────────────────────── */
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;
