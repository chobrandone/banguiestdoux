import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Browser / client-side Supabase client.
 * Uses the anon key — RLS policies apply.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bed_supabase_session',
  },
});

export type Database = {
  public: {
    Tables: {
      profiles:             { Row: Profile };
      events:               { Row: Event };
      event_rsvps:          { Row: EventRsvp };
      restaurants:          { Row: Restaurant };
      restaurant_menu_items:{ Row: MenuItemRow };
      restaurant_reviews:   { Row: ReviewRow };
      articles:             { Row: Article };
      gallery:              { Row: GalleryItem };
      talents:              { Row: Talent };
      products:             { Row: Product };
      orders:               { Row: Order };
      order_items:          { Row: OrderItem };
      partners:             { Row: Partner };
      messages:             { Row: Message };
      settings:             { Row: Setting };
    };
  };
};

/* ── Type aliases ─────────────────────────────── */
export interface Profile {
  id: string; name: string; role: 'user'|'admin'|'superadmin';
  avatar?: string; phone?: string; is_active: boolean;
  last_login?: string; created_at: string; updated_at: string;
}
export interface Event {
  id: string; title: string; title_fr?: string; slug: string;
  description: string; description_fr?: string;
  category: string; event_date: string; end_date?: string; event_time?: string;
  location: string; address?: string; coordinates?: {lat:number;lng:number};
  image: string; gallery: string[]; video?: string;
  ticket_price: number; ticket_url?: string; is_free: boolean;
  is_featured: boolean; is_published: boolean;
  capacity?: number; rsvp_count: number; tags: string[]; organizer?: string;
  created_by?: string; created_at: string; updated_at: string;
}
export interface EventRsvp { id: string; event_id: string; user_id: string; created_at: string; }
export interface Restaurant {
  id: string; name: string; slug: string; description: string; description_fr?: string;
  category: string; cuisine: string[]; address: string;
  phone?: string; email?: string; website?: string;
  instagram?: string; facebook?: string; reservation_url?: string;
  image: string; gallery: string[]; opening_hours: unknown[];
  price_range: number; rating: number; review_count: number;
  is_featured: boolean; is_published: boolean;
  coordinates?: {lat:number;lng:number}; tags: string[];
  created_by?: string; created_at: string; updated_at: string;
}
export interface MenuItemRow { id: string; restaurant_id: string; name: string; description?: string; price?: number; category?: string; image?: string; sort_order: number; }
export interface ReviewRow { id: string; restaurant_id: string; user_id?: string; rating: number; comment?: string; created_at: string; }
export interface Article {
  id: string; title: string; title_fr?: string; slug: string;
  excerpt: string; excerpt_fr?: string; content: string; content_fr?: string;
  category: string; image: string; gallery: string[];
  author_id?: string; tags: string[];
  is_featured: boolean; is_published: boolean;
  read_time: number; views: number; published_at: string;
  created_at: string; updated_at: string;
}
export interface GalleryItem { id: string; title?: string; type: 'image'|'video'; url: string; thumbnail?: string; category: string; event_id?: string; tags: string[]; is_featured: boolean; uploaded_by?: string; created_at: string; updated_at: string; }
export interface Talent { id: string; name: string; slug: string; title: string; title_fr?: string; bio: string; bio_fr?: string; category: string; image: string; cover_image?: string; gallery: string[]; video_url?: string; instagram?: string; facebook?: string; twitter?: string; youtube?: string; is_featured: boolean; is_published: boolean; tags: string[]; created_by?: string; created_at: string; updated_at: string; }
export interface Product { id: string; name: string; name_fr?: string; slug: string; description: string; description_fr?: string; category: string; price: number; compare_price?: number; images: string[]; sizes: string[]; colors: {name:string;hex:string}[]; stock: number; sku?: string; is_featured: boolean; is_limited: boolean; is_active: boolean; tags: string[]; weight?: number; created_by?: string; created_at: string; updated_at: string; }
export interface Order { id: string; user_id?: string; customer_name?: string; customer_phone?: string; customer_email?: string; guest_email?: string; shipping_address: unknown; subtotal: number; shipping_cost: number; total: number; status: string; payment_method: string; payment_status: string; stripe_session_id?: string; promo_code?: string; discount?: number; notes?: string; tracking_number?: string; delivered_at?: string; created_at: string; updated_at: string; }
export interface OrderItem { id: string; order_id: string; product_id?: string; name: string; price: number; quantity: number; size?: string; color?: string; image?: string; }
export interface Partner { id: string; name: string; logo: string; website?: string; category: string; is_active: boolean; sort_order: number; created_at: string; updated_at: string; }
export interface Message { id: string; name: string; email: string; phone?: string; subject: string; message: string; is_read: boolean; replied_at?: string; created_at: string; }
export interface Setting { id: string; key: string; value: unknown; updated_at: string; }
