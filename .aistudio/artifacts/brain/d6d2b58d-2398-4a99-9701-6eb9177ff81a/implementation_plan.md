# Porting Alex Rivera Growth Portfolio to Next.js 16 App Router

A complete, production-grade architectural migration porting the existing React 19 + Vite 8 portfolio into Next.js 16 App Router in-place at the project root, maintaining 100% visual and behavioral parity while unlocking Server-Side Rendering (SSR), cached server-only data fetching via `firebase-admin`, secured server API routes, and optimized typography and imagery.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural approach incorporates your specific preferences confirmed in Phase 1:

- **Confirmed Decision: In-Place Root Migration**: The Next.js 16 App Router will replace the Vite development entry in-place at the repository root, ensuring the AI Studio dev server (`npm run dev`) and production build (`npm run build`) execute directly without subdirectory friction.
- **Confirmed Decision: Server-Side Firebase Admin Credentials**: Server-side data fetching functions strictly require service account credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) to connect to Firestore; when unconfigured, server queries fail safely to allow explicit environment variable configuration.
- **Confirmed Decision: Caching Strategy**: Data fetching in `src/lib/data.ts` uses Next.js `unstable_cache` wrapped around `firebase-admin` queries with discrete cache tags (`services`, `works`, `showcase`, `posts`, `testimonials`, `settings`) and tag-based on-demand revalidation.

---

## 1. Overview & Core Concept

- **What It Does**: A performance marketing portfolio and client acquisition platform for senior growth marketer Alex Rivera. Provides a single-page scrolling Home view (`#home`, `#about`, `#services`, `#works`, `#process`, `#blog`, `#contact`) with active scroll-spy, dedicated Hub and Detail pages for Services, Case Studies, and Field Notes, interactive ROAS calculators, growth audit booking modals, lightbox media inspection, and a protected administrative CMS.
- **Target Audience / Persona**: High-growth B2B SaaS founders, D2C CMOs, and venture-backed marketing leads seeking full-funnel acquisition, organic search dominance, and server-side tracking architecture.
- **Key Value**: Delivers instantaneous page loads with Server-Rendered HTML, zero layout shifts, secure server-side Google Apps Script proxying (never leaking web app secrets), and real-time content management backed by Firebase and Next.js revalidation.

---

## 2. User Experience & Visual Design

- **Visual Identity & Theme**:
  - *Color Palette*: Strictly preserved from reference tokens in `src/app/globals.css`:
    - Canvas: `--surface` (`#fbf9f8`)
    - Surfaces: `--surface-container-lowest` (`#ffffff`), `--surface-container` (`#efeded`), `--surface-container-high` (`#eae8e7`)
    - Text: `--on-surface` (`#1b1c1c`), `--on-surface-variant` (`#434655`)
    - Primary Accent: `--primary` (`#004ac6`), `--primary-container` (`#2563eb`)
    - Secondary Uplift: `--secondary` (`#006e2d`), `--secondary-container` (`#7cf994`)
  - *Typography*: Inter loaded via `next/font/google` (`display: 'swap'`), paired with Google Material Symbols Outlined stylesheet for clean functional icons and tabular numerals (`tabular-nums`) across all metrics and audit estimates.
  - *Anti-Slop Discipline*: Zero static pill badges on metadata (unboxed text with subtle typographic separators `·`), single-line top-bar navigation contract, and strict 60-30-10 color distribution.
- **Key User Flows**:
  1. *Single-Page Home Exploration*: Visitor browses hero metrics, verifies SERP screenshots in the lightbox, calculates custom ad spend ROAS, and launches the growth audit modal.
  2. *Deep Hub & Detail Navigation*: Visitor navigates `/services/[slug]`, `/works/[slug]`, or `/blog/[slug]`. Server components pre-render content while URL search params (`?type=...`) filter showcase items seamlessly.
  3. *Admin Management*: Administrator authenticates via Google OAuth (client-side Firebase SDK), manages testimonials, works, services, posts, and settings, and automatically triggers on-demand cache revalidation via `/api/revalidate`.

---

## 3. Key Product Decisions & Trade-Offs

- **Client/Server Boundary**:
  - *Server Components by Default*: All page layouts, article bodies, case study copy, and service grids render on the server with zero client bundle overhead.
  - *Granular Client Wrappers*: Framer Motion animations (`motion/react`), Navbar scroll-spy, Lightbox modal, ROAS slider, and form submissions are isolated into dedicated `'use client'` wrapper components.
- **Security & Secret Isolation**:
  - `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`, and `FIREBASE_PRIVATE_KEY` remain strictly server-side.
  - Client components only ever communicate with `/api/forms`, `/api/upload`, and `/api/revalidate`.
- **Image Delivery**:
  - Custom `next/image` wrapper supporting Google Drive thumbnail URLs (`drive.google.com/thumbnail?id=...&sz=w...`), `lh3.googleusercontent.com`, and local assets with automatic SVG/CSS gradient fallbacks if loading fails.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                           │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   App Pages (RSC)    │  │       Interactive Client Islands       │  │
│  │  /                   │  │  - Navbar (scroll-spy, mobile drawer)  │  │
│  │  /services, /[slug]  │  │  - MotionReveal (motion/react wrapper) │  │
│  │  /works, /[slug]     │  │  - LightboxModal                       │  │
│  │  /blog, /[slug]      │  │  - RoasCalculator                      │  │
│  │  /admin (Client CMS) │  │  - AuditBookingModal & FormIsland      │  │
│  └──────────┬───────────┘  └───────────────────┬────────────────────┘  │
│             │                                  │                       │
│             ▼                                  ▼                       │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │    src/lib/data.ts   │  │               API Routes               │  │
│  │   (unstable_cache +  │  │  - POST /api/forms (Inbound/Newsletter)│  │
│  │    firebase-admin)   │  │  - POST /api/upload (Drive upload)     │  │
│  └──────────┬───────────┘  │  - POST /api/revalidate (Tags purge)   │  │
│             │              └───────────────────┬────────────────────┘  │
└─────────────┼──────────────────────────────────┼───────────────────────┘
              ▼                                  ▼
┌─────────────────────────┐          ┌───────────────────────────────────┐
│     Firebase Admin      │          │        Google Apps Script         │
│ Firestore (Server-Side) │          │     (Sheets, Gmail, Drive)        │
└─────────────────────────┘          └───────────────────────────────────┘
```

### Route & File Organization

- `src/app/layout.tsx`: Root HTML layout with Inter font and global theme tokens.
- `src/app/page.tsx`: Single-page scrolling Home with sections `#home`, `#about`, `#services`, `#works`, `#process`, `#blog`, `#contact`.
- `src/app/services/page.tsx` & `src/app/services/[slug]/page.tsx`: Services Hub & Detail pages.
- `src/app/works/page.tsx` & `src/app/works/[slug]/page.tsx`: Works Hub & Detail pages with `?type=` filter support.
- `src/app/blog/page.tsx` & `src/app/blog/[slug]/page.tsx`: Blog Hub & Detail pages.
- `src/app/admin/page.tsx`: Client-rendered administrative console.
- `src/app/not-found.tsx`: 404 handler with direct navigation links.
- `src/app/sitemap.ts` & `src/app/robots.ts`: Automated SEO generation.
- `src/app/api/forms/route.ts`: Server-side form handling and validation with honeypot guard.
- `src/app/api/upload/route.ts`: Server-side Drive upload router validating admin ID token.
- `src/app/api/revalidate/route.ts`: Cache tag revalidation endpoint.

### Migration & Verification Step Sequence

1. **Step 1: Next.js Foundation & Dependencies**
   - Install `next`, `firebase-admin`, `server-only` alongside existing dependencies.
   - Configure `next.config.ts` (remote image patterns for `drive.google.com` & `lh3.googleusercontent.com`).
   - Setup `src/app/globals.css` with reference CSS variables and Tailwind utilities.
   - Verify initial build with `npm run build`.
2. **Step 2: Server Data Layer & Cache (`src/lib/data.ts`)**
   - Implement `firebase-admin` initialization with strict environment variable checks.
   - Implement cached fetchers with `unstable_cache` and collection-specific tags (`services`, `works`, `showcase`, `posts`, `testimonials`, `settings`).
   - Provide client-side service (`src/lib/admin-service.ts`) using Firebase client SDK for write operations.
3. **Step 3: API Routes Implementation**
   - Implement `/api/forms`, `/api/upload`, and `/api/revalidate`.
   - Verify request schemas, bot honeypot protection, and admin authorization checks.
4. **Step 4: Presentation Components & App Router Pages**
   - Port all views into App Router pages with `generateMetadata` for rich SEO and JSON-LD structured data.
   - Separate server content from motion wrappers (`motion/react`).
   - Wire up `next/link`, `next/image`, and URL filter parameters.
5. **Step 5: Admin CMS & Revalidation Workflow**
   - Port Admin Dashboard under `src/app/admin`.
   - Wire post-save revalidation requests to `/api/revalidate`.
6. **Step 6: Build Verification & Dev Server Validation**
   - Run full `npm run build` to confirm zero lint or type errors.
   - Ensure `npm run dev` boots cleanly on port 3000.
