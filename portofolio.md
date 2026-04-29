## 🍽️ E-Kantin — Digital Canteen Ordering System

**Tech Stack:** Laravel 12 · PHP 8.2 · React 19 · TypeScript · Inertia.js (SPA) · Tailwind CSS v4 · Filament v3 · MySQL · Midtrans Snap API · Laravel Sanctum · Google OAuth (Socialite) · Vite · Radix UI

---

**Description:**

E-Kantin is a full-stack **multi-tenant digital canteen marketplace** built for the Faculty of Engineering at Universitas Jenderal Soedirman. It replaces cash-based, queue-heavy canteen transactions with a Single Page Application that connects students, lecturers, and staff to multiple food stalls — all within one unified checkout flow. The system integrates a production-grade payment gateway, automated order lifecycle management, and a dedicated Filament admin panel for each stall operator.

---

**Impact:**

- Eliminates cash handling at the point of sale by providing fully digital payment via QRIS, e-wallets (GoPay, ShopeePay, OVO), and virtual bank transfers through the Midtrans Snap API
- Reduces order abandonment with an automated 1-hour countdown timer that cancels unpaid orders and restores stock automatically, removing the need for manual operator intervention
- Enables a paperless, real-time inventory workflow across multiple stalls, lowering operational overhead for canteen staff
- Delivers a cross-device responsive UI (mobile + desktop) with instant search and real-time cart updates, reducing friction in the ordering experience for ~hundreds of campus users

---

**Key Contributions & Features:**

- **Multi-tenant marketplace architecture** — multiple independent stalls operate under one platform, each with isolated management panels; supports multi-store checkout in a single transaction
- **Midtrans Snap integration** — full payment gateway pipeline: token generation, Snap popup, and automated webhook-based payment verification with status reconciliation
- **Google OAuth SSO** — frictionless one-click login and registration via `laravel/socialite` and `@react-oauth/google`, alongside conventional email/password auth secured by Laravel Sanctum
- **Automated order lifecycle** — queue-driven auto-cancellation of pending orders after 1 hour with atomic stock rollback, implemented via Laravel Jobs and Actions
- **Real-time cart & search** — client-side cart state management with group-by-store rendering, select-all multi-item checkout, and instant menu/stall search without page reloads
- **Rating, review & like system** — per-menu star ratings with review CRUD, like/favorite toggle, and aggregate display of average rating and total sold
- **Filament v3 admin panel** — role-separated dashboards with widgets for daily orders, revenue totals, order-status pie charts, and best-selling menu bar charts; resource management for Shops, Menus, Orders, Transactions, Expenses, and Settlements
- **Image optimization pipeline** — server-side image processing via `spatie/laravel-image-optimizer` to keep page load times low
- **Type-safe frontend** — full TypeScript coverage with strict ESLint (typescript-eslint) and Prettier enforced on all React components; Radix UI primitives used for accessible, unstyled component foundations
- **Trend analytics** — sales trend data via `flowframe/laravel-trend` surfaced in the admin dashboard with chart visualizations
