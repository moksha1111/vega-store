# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vega Store is a full-stack e-commerce application with a React frontend (Vite) and an Express/MongoDB backend. The project is split into two separate npm workspaces: `client/` and `server/`.

## Development Commands

### Client (run from `client/`)
```bash
npm run dev      # Vite dev server on port 5173
npm run build    # Production build to dist/
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Server (run from `server/`)
```bash
npm run dev      # Nodemon with hot reload
npm start        # Production (node server.js)
npm run seed     # Seed MongoDB with initial data
```

Both servers must run simultaneously during development. The Vite dev server proxies `/api/*` requests to `http://localhost:5000`.

## Architecture

### Client (`client/src/`)

- **`App.jsx`** — Router root. Public routes use `ShopLayout` (Navbar + Footer); admin routes use `AdminLayout` under `/admin`.
- **`context/`** — Global state via React Context API only (no Redux):
  - `AuthContext`: stores user + JWT in `localStorage` under key `vega_user`
  - `CartContext`: API-backed cart state, re-fetches on auth change
- **`utils/axios.js`** — Configured Axios instance; JWT interceptor attaches `Authorization: Bearer <token>` to every request automatically.
- **`pages/admin/`** — Full admin panel (Dashboard, Products, Orders, Users).

### Server (`server/`)

- **`server.js`** — Express entry point; mounts all routes under `/api`.
- **`middleware/auth.js`** — Two guards: `protect` (JWT required) and `admin` (role === 'admin').
- **`models/`** — Mongoose schemas: `User`, `Product` (with embedded reviews), `Cart`, `Order`.
- **`routes/`** — REST endpoints: `auth`, `products`, `cart`, `orders`, `users`.
- **`config/db.js`** — MongoDB connection via Mongoose.
- **`seed.js`** — Standalone script to populate the database.

### API Route Summary

| Resource | Base Path | Notes |
|----------|-----------|-------|
| Auth | `/api/auth` | `/register`, `/login`, `/me` |
| Products | `/api/products` | Public GET; admin-only POST/PUT/DELETE; `/featured`, `/categories`, `/:id/reviews` |
| Cart | `/api/cart` | Fully protected; per-user cart |
| Orders | `/api/orders` | `/myorders` for users; admin gets all; status update via `PUT /:id/status` |
| Users | `/api/users` | Admin user management |

## Key Conventions

- **Authentication flow**: Login returns user object with token → stored in localStorage → Axios interceptor injects token → server `protect` middleware validates.
- **Admin guard**: Routes requiring admin access use both `protect` and `admin` middleware in sequence.
- **Tailwind theming**: Custom brand colors (indigo palette) and Inter font defined in `client/tailwind.config.js`.
- **Animations**: `client/src/hooks/useInView.js` uses IntersectionObserver for scroll-triggered fade-up effects.
- **Notifications**: Use `react-hot-toast` for all user-facing feedback.
- **No test framework** is currently configured.
