-- =============================================================
-- BANGUI EST DOUX — Supabase PostgreSQL Schema
-- Migration: 001_initial_schema
-- =============================================================

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================
-- PROFILES (extends auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','superadmin')),
  avatar      TEXT,
  phone       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- EVENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  title_fr       TEXT,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT NOT NULL,
  description_fr TEXT,
  category       TEXT NOT NULL CHECK (category IN (
    'concerts','festivals','cinema','pool-parties','jazz-nights',
    'sports','exhibitions','restaurant-openings','theatre','art','other'
  )),
  event_date     TIMESTAMPTZ NOT NULL,
  end_date       TIMESTAMPTZ,
  event_time     TEXT,
  location       TEXT NOT NULL,
  address        TEXT,
  coordinates    JSONB DEFAULT '{}',
  image          TEXT NOT NULL,
  gallery        TEXT[] DEFAULT '{}',
  video          TEXT,
  ticket_price   NUMERIC(10,2) DEFAULT 0,
  ticket_url     TEXT,
  is_free        BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_published   BOOLEAN NOT NULL DEFAULT TRUE,
  capacity       INTEGER,
  rsvp_count     INTEGER NOT NULL DEFAULT 0,
  tags           TEXT[] DEFAULT '{}',
  organizer      TEXT,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_events_date        ON public.events(event_date);
CREATE INDEX idx_events_category    ON public.events(category);
CREATE INDEX idx_events_is_featured ON public.events(is_featured);
CREATE INDEX idx_events_slug        ON public.events(slug);
CREATE INDEX idx_events_published   ON public.events(is_published);

-- RSVP join table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =============================================================
-- RESTAURANTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT NOT NULL,
  description_fr   TEXT,
  category         TEXT NOT NULL CHECK (category IN (
    'restaurant','bar','rooftop','lounge','fast-food','street-food','cafe','nightclub','other'
  )),
  cuisine          TEXT[] DEFAULT '{}',
  address          TEXT NOT NULL,
  phone            TEXT,
  email            TEXT,
  website          TEXT,
  instagram        TEXT,
  facebook         TEXT,
  reservation_url  TEXT,
  image            TEXT NOT NULL,
  gallery          TEXT[] DEFAULT '{}',
  opening_hours    JSONB DEFAULT '[]',
  price_range      INTEGER DEFAULT 2 CHECK (price_range BETWEEN 1 AND 4),
  rating           NUMERIC(3,2) DEFAULT 0,
  review_count     INTEGER DEFAULT 0,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_published     BOOLEAN NOT NULL DEFAULT TRUE,
  coordinates      JSONB DEFAULT '{}',
  tags             TEXT[] DEFAULT '{}',
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_restaurants_category   ON public.restaurants(category);
CREATE INDEX idx_restaurants_featured   ON public.restaurants(is_featured);
CREATE INDEX idx_restaurants_rating     ON public.restaurants(rating DESC);

CREATE TABLE IF NOT EXISTS public.restaurant_menu_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2),
  category      TEXT,
  image         TEXT,
  sort_order    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.restaurant_reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ARTICLES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  title_fr     TEXT,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT NOT NULL,
  excerpt_fr   TEXT,
  content      TEXT NOT NULL,
  content_fr   TEXT,
  category     TEXT NOT NULL CHECK (category IN (
    'news','culture','nightlife','gastronomy','travel','lifestyle','interview','guide','other'
  )),
  image        TEXT NOT NULL,
  gallery      TEXT[] DEFAULT '{}',
  author_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags         TEXT[] DEFAULT '{}',
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  read_time    INTEGER DEFAULT 5,
  views        INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_articles_category    ON public.articles(category);
CREATE INDEX idx_articles_featured    ON public.articles(is_featured);
CREATE INDEX idx_articles_published   ON public.articles(published_at DESC);

-- =============================================================
-- GALLERY
-- =============================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT,
  type        TEXT NOT NULL CHECK (type IN ('image','video')),
  url         TEXT NOT NULL,
  thumbnail   TEXT,
  category    TEXT NOT NULL DEFAULT 'events',
  event_id    UUID REFERENCES public.events(id) ON DELETE SET NULL,
  tags        TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- TALENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.talents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  title_fr     TEXT,
  bio          TEXT NOT NULL,
  bio_fr       TEXT,
  category     TEXT NOT NULL CHECK (category IN (
    'artist','musician','entrepreneur','influencer','athlete','creator','chef','other'
  )),
  image        TEXT NOT NULL,
  cover_image  TEXT,
  gallery      TEXT[] DEFAULT '{}',
  video_url    TEXT,
  instagram    TEXT,
  facebook     TEXT,
  twitter      TEXT,
  youtube      TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  tags         TEXT[] DEFAULT '{}',
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER talents_updated_at
  BEFORE UPDATE ON public.talents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- PRODUCTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  name_fr         TEXT,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT NOT NULL,
  description_fr  TEXT,
  category        TEXT NOT NULL CHECK (category IN (
    't-shirts','caps','tote-bags','glassware','accessories','limited-editions','other'
  )),
  price           NUMERIC(10,2) NOT NULL,
  compare_price   NUMERIC(10,2),
  images          TEXT[] NOT NULL DEFAULT '{}',
  sizes           TEXT[] DEFAULT '{}',
  colors          JSONB DEFAULT '[]',
  stock           INTEGER NOT NULL DEFAULT 0,
  sku             TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_limited      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  tags            TEXT[] DEFAULT '{}',
  weight          NUMERIC(6,2),
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_phone    TEXT,
  customer_email    TEXT,
  guest_email       TEXT,
  shipping_address  JSONB DEFAULT '{}',
  subtotal          NUMERIC(10,2) NOT NULL,
  shipping_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','confirmed','processing','shipped','delivered','cancelled'
  )),
  payment_method    TEXT DEFAULT 'stripe',
  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending','paid','failed','refunded'
  )),
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  promo_code        TEXT,
  discount          NUMERIC(10,2),
  notes             TEXT,
  tracking_number   TEXT,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity >= 1),
  size        TEXT,
  color       TEXT,
  image       TEXT
);

-- =============================================================
-- PARTNERS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.partners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  logo        TEXT NOT NULL,
  website     TEXT,
  category    TEXT DEFAULT 'general',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- MESSAGES (contact form)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- SETTINGS (key-value store)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       JSONB,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Default settings
INSERT INTO public.settings (key, value) VALUES
  ('site_name',          '"Bangui est Doux"'),
  ('site_tagline_fr',    '"La vie à Bangui, sublimée."'),
  ('site_tagline_en',    '"Life in Bangui, elevated."'),
  ('contact_email',      '"banguiestdouxx@gmail.com"'),
  ('contact_phone',      '"+236 72 63 71 71"'),
  ('social_instagram',   '"banguiestdoux"'),
  ('social_facebook',    '"banguiestdoux"'),
  ('maintenance_mode',   'false'),
  ('hero_video_url',     'null')
ON CONFLICT (key) DO NOTHING;

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Profiles: public read, self-update, admin full access
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings          ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin/superadmin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── Profiles ──────────────────────────────────────────────────
CREATE POLICY "profiles_public_read"  ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_self_update"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL USING (public.is_admin());

-- ── Events ────────────────────────────────────────────────────
CREATE POLICY "events_public_read"    ON public.events FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "events_admin_write"    ON public.events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "events_admin_update"   ON public.events FOR UPDATE USING (public.is_admin());
CREATE POLICY "events_admin_delete"   ON public.events FOR DELETE USING (public.is_admin());

-- ── Event RSVPs ───────────────────────────────────────────────
CREATE POLICY "rsvp_read_own"         ON public.event_rsvps FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "rsvp_insert_auth"      ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvp_delete_own"       ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ── Restaurants ───────────────────────────────────────────────
CREATE POLICY "restaurants_public_read"  ON public.restaurants FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "restaurants_admin_write"  ON public.restaurants FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "restaurants_admin_update" ON public.restaurants FOR UPDATE USING (public.is_admin());
CREATE POLICY "restaurants_admin_delete" ON public.restaurants FOR DELETE USING (public.is_admin());
CREATE POLICY "menu_public_read"         ON public.restaurant_menu_items FOR SELECT USING (TRUE);
CREATE POLICY "menu_admin_write"         ON public.restaurant_menu_items FOR ALL USING (public.is_admin());
CREATE POLICY "reviews_public_read"      ON public.restaurant_reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_auth_insert"      ON public.restaurant_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Articles ──────────────────────────────────────────────────
CREATE POLICY "articles_public_read"  ON public.articles FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "articles_admin_write"  ON public.articles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "articles_admin_update" ON public.articles FOR UPDATE USING (public.is_admin());
CREATE POLICY "articles_admin_delete" ON public.articles FOR DELETE USING (public.is_admin());

-- ── Gallery ───────────────────────────────────────────────────
CREATE POLICY "gallery_public_read"   ON public.gallery FOR SELECT USING (TRUE);
CREATE POLICY "gallery_admin_write"   ON public.gallery FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "gallery_admin_update"  ON public.gallery FOR UPDATE USING (public.is_admin());
CREATE POLICY "gallery_admin_delete"  ON public.gallery FOR DELETE USING (public.is_admin());

-- ── Talents ───────────────────────────────────────────────────
CREATE POLICY "talents_public_read"   ON public.talents FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "talents_admin_write"   ON public.talents FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "talents_admin_update"  ON public.talents FOR UPDATE USING (public.is_admin());
CREATE POLICY "talents_admin_delete"  ON public.talents FOR DELETE USING (public.is_admin());

-- ── Products ──────────────────────────────────────────────────
CREATE POLICY "products_public_read"  ON public.products FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "products_admin_write"  ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "products_admin_update" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE USING (public.is_admin());

-- ── Orders ────────────────────────────────────────────────────
CREATE POLICY "orders_own_read"       ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_insert_any"     ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "orders_admin_update"   ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "order_items_read"      ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "order_items_insert"    ON public.order_items FOR INSERT WITH CHECK (TRUE);

-- ── Partners ──────────────────────────────────────────────────
CREATE POLICY "partners_public_read"  ON public.partners FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "partners_admin_write"  ON public.partners FOR ALL USING (public.is_admin());

-- ── Messages ──────────────────────────────────────────────────
CREATE POLICY "messages_insert_any"   ON public.messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "messages_admin_read"   ON public.messages FOR SELECT USING (public.is_admin());
CREATE POLICY "messages_admin_update" ON public.messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "messages_admin_delete" ON public.messages FOR DELETE USING (public.is_admin());

-- ── Settings ──────────────────────────────────────────────────
CREATE POLICY "settings_public_read"  ON public.settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_write"  ON public.settings FOR ALL USING (public.is_admin());

-- =============================================================
-- STORAGE BUCKETS  (run in Supabase dashboard OR via CLI)
-- =============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('events',      'events',      TRUE),
--   ('restaurants', 'restaurants', TRUE),
--   ('articles',    'articles',    TRUE),
--   ('gallery',     'gallery',     TRUE),
--   ('talents',     'talents',     TRUE),
--   ('products',    'products',    TRUE),
--   ('avatars',     'avatars',     TRUE),
--   ('partners',    'partners',    TRUE)
-- ON CONFLICT (id) DO NOTHING;
