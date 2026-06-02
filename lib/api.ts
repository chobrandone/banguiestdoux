/**
 * API client — wraps the Express backend.
 * Auth token is the Supabase JWT (access_token) stored in the session.
 */
import axios from 'axios';
import { supabase } from './supabase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request interceptor – attach Supabase JWT ─── */
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response interceptor – handle 401 ────────── */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      if (isAdminPath) {
        await supabase.auth.signOut();
        window.location.href = '/addmin';
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Auth ──────────────────────────────────────── */
export const authAPI = {
  me:           ()              => api.get('/auth/me'),
  logout:       ()              => api.post('/auth/logout'),
  getUsers:     (p?: object)    => api.get('/auth/users', { params: p }),
  updateRole:   (id: string, role: string) => api.put(`/auth/users/${id}/role`, { role }),
};

/* ─── Events ────────────────────────────────────── */
export const eventsAPI = {
  getAll:      (params?: object) => api.get('/events', { params }),
  getAllAdmin:  (params?: object) => api.get('/events', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/events/${slug}`),
  getFeatured: ()                => api.get('/events', { params: { featured: 'true', limit: 6 } }),
  getUpcoming: ()                => api.get('/events', { params: { upcoming: 'true', limit: 8 } }),
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
  getFeatured: ()                => api.get('/restaurants', { params: { featured: 'true', limit: 6 } }),
  create:      (data: object)    => api.post('/restaurants', data),
  update:      (id: string, data: object) => api.put(`/restaurants/${id}`, data),
  delete:      (id: string)      => api.delete(`/restaurants/${id}`),
  addReview:   (id: string, data: object) => api.post(`/restaurants/${id}/review`, data),
};

/* ─── Articles ──────────────────────────────────── */
export const articlesAPI = {
  getAll:      (params?: object) => api.get('/articles', { params }),
  getAllAdmin:  (params?: object) => api.get('/articles', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/articles/${slug}`),
  getFeatured: ()                => api.get('/articles', { params: { featured: 'true', limit: 4 } }),
  create:      (data: object)    => api.post('/articles', data),
  update:      (id: string, data: object) => api.put(`/articles/${id}`, data),
  delete:      (id: string)      => api.delete(`/articles/${id}`),
};

/* ─── Gallery ───────────────────────────────────── */
export const galleryAPI = {
  getAll:      (params?: object) => api.get('/gallery', { params }),
  getFeatured: ()                => api.get('/gallery', { params: { featured: 'true', limit: 12 } }),
  create:      (data: object)    => api.post('/gallery', data),
  update:      (id: string, data: object) => api.put(`/gallery/${id}`, data),
  delete:      (id: string)      => api.delete(`/gallery/${id}`),
};

/* ─── Products ──────────────────────────────────── */
export const productsAPI = {
  getAll:      (params?: object) => api.get('/products', { params }),
  getAllAdmin:  (params?: object) => api.get('/products', { params: { all: 'true', ...params } }),
  getOne:      (slug: string)    => api.get(`/products/${slug}`),
  getFeatured: ()                => api.get('/products', { params: { featured: 'true', limit: 8 } }),
  create:      (data: object)    => api.post('/products', data),
  update:      (id: string, data: object) => api.put(`/products/${id}`, data),
  delete:      (id: string)      => api.delete(`/products/${id}`),
};

/* ─── Orders ────────────────────────────────────── */
export const ordersAPI = {
  create:       (data: object)   => api.post('/orders', data),
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
  getFeatured: ()                => api.get('/talents', { params: { featured: 'true', limit: 6 } }),
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
