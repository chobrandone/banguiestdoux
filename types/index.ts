/* ─── Shared types ───────────────────────────────── */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  avatar?: string;
  phone?: string;
  createdAt: string;
  token?: string;
}

export interface Event {
  _id: string;
  title: string;
  titleFr?: string;
  slug: string;
  description: string;
  descriptionFr?: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  time?: string;
  location: string;
  address?: string;
  image: string;
  gallery?: string[];
  video?: string;
  ticketPrice?: number;
  ticketUrl?: string;
  isFeatured: boolean;
  isFree: boolean;
  capacity?: number;
  rsvpCount?: number;
  tags?: string[];
  organizer?: string;
  createdAt: string;
}

export type EventCategory =
  | 'concerts'
  | 'festivals'
  | 'cinema'
  | 'pool-parties'
  | 'jazz-nights'
  | 'sports'
  | 'exhibitions'
  | 'restaurant-openings'
  | 'theatre'
  | 'art'
  | 'other';

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  descriptionFr?: string;
  category: RestaurantCategory;
  cuisine?: string[];
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  image: string;
  gallery?: string[];
  menu?: MenuItem[];
  openingHours?: OpeningHours[];
  priceRange: 1 | 2 | 3 | 4;
  rating?: number;
  reviewCount?: number;
  isFeatured: boolean;
  coordinates?: { lat: number; lng: number };
  instagram?: string;
  facebook?: string;
  reservationUrl?: string;
  tags?: string[];
  createdAt: string;
}

export type RestaurantCategory =
  | 'restaurant'
  | 'bar'
  | 'rooftop'
  | 'lounge'
  | 'fast-food'
  | 'street-food'
  | 'cafe'
  | 'nightclub'
  | 'other';

export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface Article {
  _id: string;
  title: string;
  titleFr?: string;
  slug: string;
  excerpt: string;
  excerptFr?: string;
  content: string;
  contentFr?: string;
  category: ArticleCategory;
  image: string;
  gallery?: string[];
  author: string | User;
  tags?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  readTime?: number;
  views?: number;
  publishedAt: string;
  createdAt: string;
}

export type ArticleCategory =
  | 'news'
  | 'culture'
  | 'nightlife'
  | 'gastronomy'
  | 'travel'
  | 'lifestyle'
  | 'interview'
  | 'guide'
  | 'other';

export interface GalleryItem {
  _id: string;
  title?: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  category?: string;
  event?: string;
  tags?: string[];
  isFeatured: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  nameFr?: string;
  slug: string;
  description: string;
  descriptionFr?: string;
  category: ProductCategory;
  price: number;
  comparePrice?: number;
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  stock: number;
  sku?: string;
  isFeatured: boolean;
  isLimited: boolean;
  tags?: string[];
  createdAt: string;
}

export type ProductCategory =
  | 't-shirts'
  | 'caps'
  | 'tote-bags'
  | 'glassware'
  | 'accessories'
  | 'limited-editions'
  | 'other';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  _id: string;
  user?: string | User;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: Address;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  stripeSessionId?: string;
  createdAt: string;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  country: string;
  postalCode?: string;
  phone?: string;
}

export interface Talent {
  _id: string;
  name: string;
  slug: string;
  title: string;
  titleFr?: string;
  bio: string;
  bioFr?: string;
  category: TalentCategory;
  image: string;
  coverImage?: string;
  gallery?: string[];
  videoUrl?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  isFeatured: boolean;
  tags?: string[];
  createdAt: string;
}

export type TalentCategory =
  | 'artist'
  | 'musician'
  | 'entrepreneur'
  | 'influencer'
  | 'athlete'
  | 'creator'
  | 'chef'
  | 'other';

export interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  category?: string;
  isFeatured: boolean;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  taglineFr?: string;
  logo?: string;
  favicon?: string;
  heroVideo?: string;
  heroImages?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  contact?: {
    email: string;
    phone: string;
    address?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface Language {
  code: 'fr' | 'en';
  label: string;
  flag: string;
}

export type Theme = 'light' | 'dark';
