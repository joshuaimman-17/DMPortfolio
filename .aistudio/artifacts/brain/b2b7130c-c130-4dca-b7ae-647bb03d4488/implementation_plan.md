# Editable Brand Identity & Comprehensive Per-Page Metadata Management Plan

A complete architectural and visual design blueprint to support editing the portfolio owner's name across all public components and introduce a dedicated "SEO & Metadata" management console in the Admin Dashboard with strict adherence to standard OpenGraph (`PageOpenGraph`), Twitter (`PageTwitter`), and canonical metadata contracts.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via Phase 1 clarification:
>
> 1. **Brand & Name Editing Location**: **Dedicated field in Site Settings**. The brand/person name (e.g. "Alex Rivera") will be configurable in a prominent "Brand & Personal Identity" section inside Site Settings and synchronized across the top navigation wordmark, hero eyebrow/intro, about section, footer copyright, admin header, and OpenGraph `siteName`.
> 2. **Manageable Page Scope**: **Core hub pages plus individual services, works, and blog articles**. The Metadata tab will list all routes with filtering by category:
>    - Hub pages: Home (`/`), Services (`/services`), Works (`/works`), Blog (`/blog`)
>    - Practice area detail pages: `/services/[slug]`
>    - Case study teardowns: `/works/[slug]`
>    - Field notes & articles: `/blog/[slug]`
> 3. **OpenGraph Image Workflow**: **Upload with auto-configured 1200x630 dimensions**. Image upload or URL selection will automatically enforce standard OpenGraph dimensions (`width: 1200`, `height: 630`) alongside customizable accessibility alt text and live social card previews (Google SERP, LinkedIn/Facebook OpenGraph, and Twitter/X summary cards).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Gives portfolio administrators full control over their brand name without modifying code, propagating changes throughout public layouts and structured metadata.
  2. Introduces a comprehensive, high-density SEO & Social Metadata management suite in the Admin Console (`/admin`) where every public route can have custom `<title>`, `<meta name="description">`, `canonical`, OpenGraph (`og:title`, `og:description`, `og:image`, `og:site_name`, `og:type`), and Twitter (`summary_large_image`) cards.
  3. Ensures all page `generateMetadata()` calls dynamically read from Firestore with on-demand ISR revalidation.
- **Target Audience / Persona**: Growth marketers and agency founders managing client perception, social sharing click-through rates, and algorithmic search ranking.
- **Key Value**: Guarantees rich, professional link previews across Twitter/X, LinkedIn, Slack, and Google search results without touching configuration files or code deployments.

---

## 2. User Experience & Visual Design

### Admin "SEO & Metadata" Console Experience
- **Two-Pane High-Density Architecture**:
  - **Left Pane (Page Directory)**:
    - Quick search bar to filter by page title or route path.
    - Category filter chips: `All Pages`, `Core Hubs`, `Services`, `Case Studies`, `Field Notes`.
    - Compact rows indicating route path (`/services/performance-marketing`), current status (`Customized` vs `Auto-Default`), and last updated timestamp.
  - **Right Pane (Metadata Editor & Live Card Previews)**:
    - **Header**: Active route path badge, page category, and "Save Metadata" button.
    - **Form Controls**:
      - `Page Title`: Live character counter with recommended 50–60 character guideline.
      - `Meta Description`: Live character counter with 150–160 character snippet guidance.
      - `Canonical URL / Path`: Auto-formatted to route canonical.
      - `OpenGraph Image`: Drag-and-drop upload / URL field with preset `width: 1200`, `height: 630`, and `alt` accessibility text.
      - `Quick Sync Button`: "Copy Page Title & Description to OpenGraph / Twitter" for 1-click workflow.
    - **Live Social Link Previews**:
      - *Google Search SERP Preview*: Simulated desktop/mobile Google search result with blue link, green/gray breadcrumb URL, and meta description snippet.
      - *Facebook / LinkedIn OpenGraph Card*: 1200x630 banner image preview with hostname pill, bold headline, and muted description.
      - *Twitter/X Summary Card*: Large media card with domain footer and title.

### Public Identity Synchronization
- Header wordmark (`Navbar.tsx`): Displays dynamic `settings.name || 'Alex Rivera'`.
- Footer copyright (`Footer.tsx`): Displays dynamic `© 2026 ${settings.name}. All rights reserved.`
- Hero headline and about lockup reflect the configured identity.
- Admin header reflects configured brand name.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firestore Collection for Page Metadata (`pages_metadata`)**
  - *Chosen Approach*: Store each route's metadata as a separate document in `pages_metadata` using normalized route slugs (e.g., `home`, `services`, `services__seo-growth`, `works__fintech-app`, `blog__cro-playbook`).
  - *Why*: Decouples SEO metadata from content models while allowing detail pages to inherit defaults if no explicit override exists.
  - *Alternatives Considered*: Storing metadata inside each individual work or service document. Rejected because it fragments metadata management across 4 different tabs instead of a unified single-pane SEO control center.

- **Decision 2: Type Contract Alignment (`PageMetadata`)**
  - *Chosen Approach*: Exact implementation of the user's TypeScript definitions:
    ```typescript
    export type PageOpenGraphImage = {
      url: string;
      width: number;
      height: number;
      alt: string;
    };

    export type PageOpenGraph = {
      title: string;
      description: string;
      url: string;
      siteName: string;
      locale: 'en_US';
      type: 'website';
      images: PageOpenGraphImage[];
    };

    export type PageTwitter = {
      card: 'summary_large_image';
      title: string;
      description: string;
      images: string[];
    };

    export type PageMetadata = {
      title: string;
      description: string;
      alternates: { canonical: string };
      openGraph: PageOpenGraph;
      twitter: PageTwitter;
    };
    ```
  - *Why*: Provides 100% strict compatibility with the user's explicit architecture requirement.

- **Decision 3: Server Data Fetcher with Tagged Caching & On-Demand Invalidation**
  - *Chosen Approach*: `getPageMetadata(routeKey, fallback)` wrapped in `unstable_cache` with tag `['metadata']` and `revalidate: false`. When metadata is saved in admin, `triggerRevalidation(['metadata'], [routePath])` is called immediately.
  - *Why*: Preserves sub-100ms static ISR page serving while guaranteeing immediate update on save.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADMIN CMS: METADATA TAB                         │
│  - Lists all core pages + dynamic services, works, blog posts          │
│  - Edits PageMetadata (Title, Description, Canonical, OG, Twitter)     │
│  - 1200x630 card dimension preset & Live SERP / Social Previews        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 1. Saves to Firestore 'pages_metadata'
                 2. Calls triggerRevalidation(['metadata'], [path])
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  FIRESTORE: /pages_metadata/{routeId}                  │
│  - Document ID: normalized route (e.g., 'home', 'services_slug')       │
│  - Full PageMetadata JSON payload                                      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                       unstable_cache (tag: 'metadata')
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                SERVER METADATA GETTER: getPageMetadata()               │
│  - Returns custom PageMetadata or dynamic fallback                     │
│  - Feeds generateMetadata() in page.tsx, services/[slug], works, blog  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PUBLIC NEXT.JS HEAD & HTML                        │
│  - <title>                                                             │
│  - <meta name="description">                                           │
│  - <link rel="canonical" href="...">                                   │
│  - <meta property="og:title|description|image|site_name|type">         │
│  - <meta name="twitter:card|title|description|image">                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Route-to-Document ID Mapping Table

| Public URL Path | Page Title / Description Target | Firestore Document ID | Revalidation Target |
| :--- | :--- | :--- | :--- |
| `/` | Portfolio Homepage | `route_home` | `/` |
| `/services` | Growth Practice Areas Hub | `route_services` | `/services` |
| `/services/[slug]` | Individual Service Practice (e.g. SEO, Paid Media) | `route_service_${slug}` | `/services/${slug}` |
| `/works` | Proof of Work & Case Studies Hub | `route_works` | `/works` |
| `/works/[slug]` | Deep Case Study Teardown | `route_work_${slug}` | `/works/${slug}` |
| `/blog` | Field Notes & Growth Playbooks Hub | `route_blog` | `/blog` |
| `/blog/[slug]` | Growth Article & Analysis | `route_post_${slug}` | `/blog/${slug}` |

---

## 5. Verification & Completed Deliverables

- [x] **Editable Personal / Brand Name**:
  - Added `name` to `SiteSettings` in `src/types/settings.ts` and `src/lib/portfolioService.ts`.
  - Added dedicated "Brand & Personal Identity" section in `src/components/admin/AdminSettings.tsx`.
  - Synchronized `settings.name` dynamically into `Navbar.tsx`, `Footer.tsx`, `src/app/page.tsx` (Hero & About), and `getPageMetadata` OpenGraph `siteName`.
- [x] **Full `PageMetadata` Contract Compliance**:
  - Implemented exact types: `PageOpenGraphImage`, `PageOpenGraph`, `PageTwitter`, `PageMetadata`.
  - Implemented `getPageMetadata(routeId, fallback)` in `src/lib/data.ts` pulling custom configurations from Firestore `pages_metadata` with dynamic fallbacks.
- [x] **Admin "SEO & Metadata" Console**:
  - Created `src/components/admin/AdminMetadata.tsx` with two-pane layout.
  - Page inventory lists Core Hubs (`/`, `/services`, `/works`, `/blog`) + all dynamic Services, Works, and Blog posts.
  - Form allows full editing of title, description, canonical, OpenGraph, and Twitter cards.
  - 1200x630 dimension preset with image upload and live Google SERP, LinkedIn/Facebook OG, and Twitter card previews.
  - Integrated into `src/components/admin/AdminDashboard.tsx` with dedicated navigation tab.
- [x] **Dynamic Metadata Generation Across All Public Routes**:
  - `src/app/page.tsx` (`route_home`)
  - `src/app/services/page.tsx` (`route_services`)
  - `src/app/services/[slug]/page.tsx` (`route_service_${slug}`)
  - `src/app/works/page.tsx` (`route_works`)
  - `src/app/works/[slug]/page.tsx` (`route_work_${slug}`)
  - `src/app/blog/page.tsx` (`route_blog`)
  - `src/app/blog/[slug]/page.tsx` (`route_post_${slug}`)
- [x] **On-Demand ISR Revalidation**:
  - All admin save/delete actions trigger precise revalidation of affected page paths, hub pages, and home page via `/api/revalidate`.
- [x] **Build & TypeScript Verification**:
  - `compile_applet`: Succeeded.
  - `lint_applet` (`tsc --noEmit`): 0 errors.
