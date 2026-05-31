# Bangui est Doux — Premium Lifestyle Media Platform

A world-class, fully responsive full-stack web application for **Bangui est Doux**, the premier lifestyle media and tourism platform for Bangui, Central African Republic.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Animations  | Framer Motion · CSS animations                  |
| State       | Redux Toolkit · React Context API               |
| Backend     | Node.js · Express.js · MongoDB · Mongoose       |
| Auth        | JWT (JSON Web Tokens) · bcryptjs                |
| Storage     | Firebase Storage                                |
| Payments    | Stripe                                          |
| Email       | Nodemailer                                      |
| Charts      | Recharts                                        |

---

## Project Structure

```
website/
├── frontend/                    # Next.js 14 application
│   ├── app/                     # App Router pages
│   │   ├── page.tsx             # Home page
│   │   ├── events/              # Events listing & detail
│   │   ├── restaurants/         # Restaurants & nightlife
│   │   ├── cinema/              # Cinema & culture
│   │   ├── discover/            # Discover Bangui guide
│   │   ├── practical/           # Practical information
│   │   ├── talents/             # Talents & interviews
│   │   ├── gallery/             # Media gallery
│   │   ├── shop/                # E-commerce store
│   │   ├── contact/             # Contact page
│   │   ├── auth/                # Login & register
│   │   └── admin/               # Admin dashboard (protected)
│   ├── components/
│   │   ├── layout/              # Navbar, Footer
│   │   ├── home/                # All home page sections
│   │   ├── admin/               # Admin sidebar & header
│   │   ├── shop/                # Cart drawer, product cards
│   │   └── providers/           # Redux provider
│   ├── contexts/                # Theme, Auth, Cart, Language
│   ├── store/                   # Redux store & slices
│   ├── lib/                     # API client, utilities
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript type definitions
│
└── backend/                     # Express.js API
    ├── server.js                # Entry point
    └── src/
        ├── config/              # MongoDB & Firebase config
        ├── models/              # Mongoose schemas
        │   ├── User.js          # Authentication
        │   ├── Event.js         # Events with RSVP
        │   ├── Restaurant.js    # Restaurants with reviews
        │   ├── Article.js       # CMS articles
        │   ├── Gallery.js       # Media gallery
        │   ├── Product.js       # E-commerce products
        │   ├── Order.js         # Orders with Stripe
        │   ├── Talent.js        # Talents & interviews
        │   ├── Message.js       # Contact messages
        │   └── Setting.js       # Site settings
        ├── controllers/         # Business logic
        ├── routes/              # REST API routes
        └── middleware/          # Auth, error handler
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials

npm install
npm run dev
# API runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local – set NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm install
npm run dev
# App runs on http://localhost:3000
```

### 3. Admin Access

Default admin credentials (created automatically on first run):
- **Email**: `admin@banguiestdoux.com`
- **Password**: `Admin@2025!`

Admin dashboard: `http://localhost:3000/admin`

---

## API Endpoints

### Authentication
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| POST   | `/api/auth/register`    | Register new user      |
| POST   | `/api/auth/login`       | Login                  |
| GET    | `/api/auth/me`          | Get current user       |
| PUT    | `/api/auth/profile`     | Update profile         |
| PUT    | `/api/auth/password`    | Change password        |

### Events
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| GET    | `/api/events`           | List events (paginated)|
| GET    | `/api/events/:slug`     | Get event by slug      |
| POST   | `/api/events`           | Create event (admin)   |
| PUT    | `/api/events/:id`       | Update event (admin)   |
| DELETE | `/api/events/:id`       | Delete event (admin)   |
| POST   | `/api/events/:id/rsvp`  | RSVP for event (auth)  |

### Restaurants, Articles, Talents, Gallery, Products, Orders
Same CRUD pattern with appropriate auth restrictions.

### Contact
| Method | Endpoint           | Description      |
|--------|-------------------|------------------|
| POST   | `/api/messages`   | Send message     |
| GET    | `/api/messages`   | List (admin)     |

### Analytics
| Method | Endpoint                   | Description       |
|--------|---------------------------|-------------------|
| GET    | `/api/analytics/dashboard` | Dashboard stats   |

---

## Features

### Public Platform
- **Home** – Cinematic hero with video/slider, featured events, restaurants, articles, talents, gallery, newsletter
- **Events** – Interactive listings with categories, filters, RSVP system
- **Restaurants & Nightlife** – Discovery with ratings, reviews, hours, map
- **Cinema & Culture** – Film screenings, cultural agenda, urban art
- **Discover Bangui** – Travel guide, neighborhoods, photo spots
- **Practical Info** – Airport, transport, safety, health, accommodation
- **Talents** – Video interviews, creator showcases
- **Gallery** – Masonry grid with lightbox, video support
- **Shop** – E-commerce with cart, checkout, Stripe payments
- **Contact** – Form with WhatsApp integration

### Admin Dashboard
- Real-time analytics with charts (Recharts)
- Full CRUD for all content types
- Message inbox with read/reply
- Role-based access control (user / admin / superadmin)
- Settings management (SEO, social, colors, API keys)
- Quick actions panel

### UX/UI
- **Dark / Light mode** toggle
- **Bilingual** FR / EN with full translations
- Glassmorphism effects
- Framer Motion page transitions & micro-interactions
- Mobile-first responsive (xs, sm, md, lg, xl)
- PWA-ready (manifest, service worker ready)
- Skeleton loading states
- Premium typography (Playfair Display + Inter + DM Sans)

---

## Design System

| Token      | Value      |
|------------|------------|
| Gold       | `#C9A84C`  |
| Night/Black| `#0A0A0A`  |
| Beige      | `#F5F0E8`  |
| Display font | Playfair Display |
| Body font  | Inter      |
| Accent font| DM Sans    |

---

## Deployment

### Frontend (Vercel recommended)
```bash
cd frontend
npm run build
# Deploy to Vercel via CLI or GitHub integration
```

### Backend (Railway / Render / VPS)
```bash
cd backend
npm start
# Set NODE_ENV=production in environment variables
```

### Environment Variables (Production)
- Set `MONGODB_URI` to MongoDB Atlas connection string
- Set `JWT_SECRET` to a strong random string
- Set `FRONTEND_URL` to your production domain
- Configure Firebase Storage credentials
- Add Stripe keys for payments

---

## Contact

- **Email**: banguiestdouxx@gmail.com
- **WhatsApp**: +236 72 63 71 71
- **Instagram**: @banguiestdoux

---

*Built with ❤️ for Bangui — La belle*
