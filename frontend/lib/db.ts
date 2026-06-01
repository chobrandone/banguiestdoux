/**
 * Data access layer — queries Supabase and maps snake_case DB rows
 * to the camelCase TypeScript types used across all components/pages.
 *
 * This lets us keep every existing component unchanged while still
 * getting real, live data from Supabase PostgreSQL.
 */

import { supabase } from './supabase';
import type {
  Event,
  Restaurant,
  Article,
  GalleryItem,
  Talent,
  Product,
  Partner,
  Message,
  Order,
} from '@/types';

/* ── Field transformers ─────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toEvent(row: any): Event {
  return {
    _id:          row.id,
    title:        row.title,
    titleFr:      row.title_fr,
    slug:         row.slug,
    description:  row.description,
    descriptionFr: row.description_fr,
    category:     row.category,
    date:         row.event_date,
    endDate:      row.end_date,
    time:         row.event_time,
    location:     row.location,
    address:      row.address,
    image:        row.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    gallery:      row.gallery || [],
    video:        row.video,
    ticketPrice:  row.ticket_price ?? 0,
    ticketUrl:    row.ticket_url,
    isFeatured:   row.is_featured ?? false,
    isFree:       row.is_free ?? false,
    capacity:     row.capacity,
    rsvpCount:    row.rsvp_count ?? 0,
    tags:         row.tags || [],
    organizer:    row.organizer,
    createdAt:    row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toRestaurant(row: any): Restaurant {
  return {
    _id:            row.id,
    name:           row.name,
    slug:           row.slug,
    description:    row.description,
    descriptionFr:  row.description_fr,
    category:       row.category,
    cuisine:        row.cuisine || [],
    address:        row.address,
    phone:          row.phone,
    email:          row.email,
    website:        row.website,
    image:          row.image || 'https://images.unsplash.com/photo-1566717153027-aa70e8df07c4?w=800',
    gallery:        row.gallery || [],
    openingHours:   row.opening_hours || [],
    priceRange:     row.price_range ?? 2,
    rating:         row.rating ?? 0,
    reviewCount:    row.review_count ?? 0,
    isFeatured:     row.is_featured ?? false,
    coordinates:    row.coordinates,
    instagram:      row.instagram,
    facebook:       row.facebook,
    reservationUrl: row.reservation_url,
    tags:           row.tags || [],
    createdAt:      row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toArticle(row: any): Article {
  return {
    _id:         row.id,
    title:       row.title,
    titleFr:     row.title_fr,
    slug:        row.slug,
    excerpt:     row.excerpt,
    excerptFr:   row.excerpt_fr,
    content:     row.content,
    contentFr:   row.content_fr,
    category:    row.category,
    image:       row.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    gallery:     row.gallery || [],
    author:      row.author_id || 'Bangui est Doux',
    tags:        row.tags || [],
    isFeatured:  row.is_featured ?? false,
    readTime:    row.read_time ?? 5,
    views:       row.views ?? 0,
    publishedAt: row.published_at || row.created_at,
    createdAt:   row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toGalleryItem(row: any): GalleryItem {
  return {
    _id:       row.id,
    title:     row.title,
    type:      row.type,
    url:       row.url,
    thumbnail: row.thumbnail,
    category:  row.category,
    event:     row.event_id,
    tags:      row.tags || [],
    isFeatured: row.is_featured ?? false,
    createdAt:  row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toTalent(row: any): Talent {
  return {
    _id:        row.id,
    name:       row.name,
    slug:       row.slug,
    title:      row.title,
    titleFr:    row.title_fr,
    bio:        row.bio,
    bioFr:      row.bio_fr,
    category:   row.category,
    image:      row.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    coverImage: row.cover_image,
    gallery:    row.gallery || [],
    videoUrl:   row.video_url,
    instagram:  row.instagram,
    facebook:   row.facebook,
    twitter:    row.twitter,
    youtube:    row.youtube,
    isFeatured: row.is_featured ?? false,
    tags:       row.tags || [],
    createdAt:  row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProduct(row: any): Product {
  return {
    _id:          row.id,
    name:         row.name,
    nameFr:       row.name_fr,
    slug:         row.slug,
    description:  row.description,
    descriptionFr: row.description_fr,
    category:     row.category,
    price:        row.price,
    comparePrice: row.compare_price,
    images:       row.images || [],
    sizes:        row.sizes || [],
    colors:       row.colors || [],
    stock:        row.stock ?? 0,
    sku:          row.sku,
    isFeatured:   row.is_featured ?? false,
    isLimited:    row.is_limited ?? false,
    tags:         row.tags || [],
    createdAt:    row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPartner(row: any): Partner {
  return {
    _id:       row.id,
    name:      row.name,
    logo:      row.logo,
    website:   row.website,
    category:  row.category,
    isFeatured: row.is_active ?? true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toMessage(row: any): Message {
  return {
    _id:      row.id,
    name:     row.name,
    email:    row.email,
    phone:    row.phone,
    subject:  row.subject,
    message:  row.message,
    isRead:   row.is_read ?? false,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toOrder(row: any): Order {
  return {
    _id:            row.id,
    user:           row.user_id,
    items:          row.order_items?.map((oi: any) => ({
      product: { _id: oi.product_id, name: oi.name, price: oi.price, images: [oi.image], slug: '', description: '', category: 'other', stock: 0, isFeatured: false, isLimited: false, createdAt: '' },
      quantity: oi.quantity,
      size:     oi.size,
      color:    oi.color,
    })) || [],
    total:          row.total,
    status:         row.status,
    shippingAddress: row.shipping_address,
    paymentMethod:  row.payment_method,
    paymentStatus:  row.payment_status,
    stripeSessionId: row.stripe_session_id,
    createdAt:      row.created_at,
    // extra fields used by admin dashboard
    // @ts-expect-error — extended fields not in base type
    customerName:   row.customer_name,
    // @ts-expect-error
    customerPhone:  row.customer_phone,
    // @ts-expect-error
    customerEmail:  row.customer_email,
  };
}

/* ── Query helpers ──────────────────────────────────────────────── */

export interface QueryOptions {
  limit?:    number;
  offset?:   number;
  category?: string;
  featured?: boolean;
  search?:   string;
  all?:      boolean; // include unpublished (admin)
}

/* ── Events ────────────────────────────────────────────────────── */

export async function getEvents(opts: QueryOptions = {}): Promise<Event[]> {
  let q = supabase.from('events').select('*').order('event_date', { ascending: false });
  if (!opts.all) q = q.eq('is_published', true);
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.search)   q = q.ilike('title', `%${opts.search}%`);
  if (opts.limit)    q = q.limit(opts.limit);
  if (opts.offset)   q = q.range(opts.offset, opts.offset + (opts.limit || 20) - 1);
  const { data, error } = await q;
  if (error) { console.error('getEvents:', error); return []; }
  return (data || []).map(toEvent);
}

export async function getEvent(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return toEvent(data);
}

export async function getFeaturedEvents(limit = 6): Promise<Event[]> {
  return getEvents({ featured: true, limit, all: false });
}

export async function getUpcomingEvents(limit = 8): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('events').select('*')
    .eq('is_published', true)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(limit);
  if (error) { console.error('getUpcomingEvents:', error); return []; }
  return (data || []).map(toEvent);
}

/* ── Restaurants ───────────────────────────────────────────────── */

export async function getRestaurants(opts: QueryOptions = {}): Promise<Restaurant[]> {
  let q = supabase.from('restaurants').select('*').order('name');
  if (!opts.all) q = q.eq('is_published', true);
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.search)   q = q.ilike('name', `%${opts.search}%`);
  if (opts.limit)    q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getRestaurants:', error); return []; }
  return (data || []).map(toRestaurant);
}

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return toRestaurant(data);
}

export async function getFeaturedRestaurants(limit = 6): Promise<Restaurant[]> {
  return getRestaurants({ featured: true, limit });
}

/* ── Articles ──────────────────────────────────────────────────── */

export async function getArticles(opts: QueryOptions = {}): Promise<Article[]> {
  let q = supabase.from('articles').select('*').order('published_at', { ascending: false });
  if (!opts.all) q = q.eq('is_published', true);
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.search)   q = q.ilike('title', `%${opts.search}%`);
  if (opts.limit)    q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getArticles:', error); return []; }
  return (data || []).map(toArticle);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return toArticle(data);
}

export async function getFeaturedArticles(limit = 4): Promise<Article[]> {
  return getArticles({ featured: true, limit });
}

/* ── Gallery ───────────────────────────────────────────────────── */

export async function getGallery(opts: QueryOptions = {}): Promise<GalleryItem[]> {
  let q = supabase.from('gallery').select('*').order('created_at', { ascending: false });
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.limit)    q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getGallery:', error); return []; }
  return (data || []).map(toGalleryItem);
}

export async function getFeaturedGallery(limit = 12): Promise<GalleryItem[]> {
  return getGallery({ featured: true, limit });
}

/* ── Talents ───────────────────────────────────────────────────── */

export async function getTalents(opts: QueryOptions = {}): Promise<Talent[]> {
  let q = supabase.from('talents').select('*').order('name');
  if (!opts.all) q = q.eq('is_published', true);
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.search)   q = q.ilike('name', `%${opts.search}%`);
  if (opts.limit)    q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getTalents:', error); return []; }
  return (data || []).map(toTalent);
}

export async function getTalent(slug: string): Promise<Talent | null> {
  const { data, error } = await supabase
    .from('talents').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return toTalent(data);
}

export async function getFeaturedTalents(limit = 6): Promise<Talent[]> {
  return getTalents({ featured: true, limit });
}

/* ── Products ──────────────────────────────────────────────────── */

export async function getProducts(opts: QueryOptions = {}): Promise<Product[]> {
  let q = supabase.from('products').select('*').eq('is_active', true).order('name');
  if (opts.featured) q = q.eq('is_featured', true);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.search)   q = q.ilike('name', `%${opts.search}%`);
  if (opts.limit)    q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getProducts:', error); return []; }
  return (data || []).map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return toProduct(data);
}

/* ── Partners ──────────────────────────────────────────────────── */

export async function getPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners').select('*').eq('is_active', true).order('sort_order');
  if (error) { console.error('getPartners:', error); return []; }
  return (data || []).map(toPartner);
}

/* ── Messages ──────────────────────────────────────────────────── */

export async function sendMessage(payload: {
  name: string; email: string; phone?: string; subject?: string; message: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('messages').insert([payload]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getMessages(opts: { limit?: number; unreadOnly?: boolean } = {}): Promise<Message[]> {
  let q = supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (opts.unreadOnly) q = q.eq('is_read', false);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getMessages:', error); return []; }
  return (data || []).map(toMessage);
}

export async function markMessageRead(id: string): Promise<void> {
  await supabase.from('messages').update({ is_read: true }).eq('id', id);
}

export async function deleteMessage(id: string): Promise<void> {
  await supabase.from('messages').delete().eq('id', id);
}

/* ── Orders (admin) ────────────────────────────────────────────── */

export async function getOrders(opts: { limit?: number } = {}): Promise<Order[]> {
  let q = supabase.from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error('getOrders:', error); return []; }
  return (data || []).map(toOrder);
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await supabase.from('orders').update({ status }).eq('id', id);
}

/* ── Analytics (admin dashboard) ─────────────────────────────── */

export interface DashboardStats {
  totalEvents:      number;
  totalRestaurants: number;
  totalArticles:    number;
  totalTalents:     number;
  totalProducts:    number;
  totalOrders:      number;
  pendingOrders:    number;
  totalMessages:    number;
  unreadMessages:   number;
  totalRevenue:     number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    { count: totalEvents },
    { count: totalRestaurants },
    { count: totalArticles },
    { count: totalTalents },
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalMessages },
    { count: unreadMessages },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('talents').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
  ]);

  const totalRevenue = (revenueData || []).reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);

  return {
    totalEvents:      totalEvents ?? 0,
    totalRestaurants: totalRestaurants ?? 0,
    totalArticles:    totalArticles ?? 0,
    totalTalents:     totalTalents ?? 0,
    totalProducts:    totalProducts ?? 0,
    totalOrders:      totalOrders ?? 0,
    pendingOrders:    pendingOrders ?? 0,
    totalMessages:    totalMessages ?? 0,
    unreadMessages:   unreadMessages ?? 0,
    totalRevenue,
  };
}

/* ── Admin CRUD helpers ─────────────────────────────────────────── */

/** Generic upsert helper — returns the saved row mapped through a transformer */
export async function upsertRow<T>(
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformer: (row: any) => T
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return transformer(data);
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
