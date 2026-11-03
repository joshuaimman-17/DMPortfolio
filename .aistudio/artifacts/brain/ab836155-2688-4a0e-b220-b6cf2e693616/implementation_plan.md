# Restructuring Alex Rivera Portfolio: Single-Page Home, Hub & Detail Pages

Restructure the application from tab-based switching into a cohesive, high-performance architecture featuring a rich single-page scrolling Home experience (incorporating all 13 sections in order with scroll-spy) complemented by dedicated Hub and Detail pages for Services (`#/services`, `#/services/:slug`), Works (`#/works`, `#/works/:slug`), and Blog (`#/blog`, `#/blog/:slug`), plus a 404 fallback card.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Navigation & Routing Model**:
>   - `#/`: Home page with 13 continuous sections in order: (1) Hero (`#home`), (2) Metrics bar with animated counters, (3) About (`#about`) containing bio, 4 principles, career timeline, skills, tools, certifications, and passions, (4) Services (`#services`) with 6 cards and link to `#/services`, (5) Works & Showcase (`#works`) with 6 mixed items and link to `#/works`, (6) How I Work (`#process`) with 5 steps, (7) Tools I Use, (8) ROAS & Growth ROI Calculator, (9) Testimonials, (10) Blog (`#blog`) with 3 latest posts and link to `#/blog`, (11) FAQ accordion, (12) Contact (`#contact`) with intake form, direct details, and booking, (13) Dark footer with newsletter.
>   - Hub pages: `#/services`, `#/works`, `#/blog`.
>   - Detail pages: `#/services/:slug`, `#/works/:slug`, `#/blog/:slug`.
>   - 404 page: Floating card for unmatched routes with "Back to Home" and "View My Works" buttons.
> - **Navbar & Scroll-Spy Rules**:
>   - Sticky navbar with logo, links (`Home`, `About`, `Services`, `Works`, `Blog`, `Contact`), and "Hire Me" button.
>   - On Home, links smooth-scroll to sections with an offset (accounting for the sticky header) with active link highlighted via `IntersectionObserver` scroll-spy.
>   - On Hub/Detail pages, clicking `About` or `Contact` transitions to Home and smoothly scrolls to the target anchor.
>   - `Services`, `Works`, and `Blog` links remain highlighted on their respective Hub and Detail pages.
>   - Route transitions scroll to top, and returning to Home from a detail page restores the previous scroll position.
> - **Feature Preservation**:
>   - The full-screen proof lightbox, ROAS calculator, 3-step audit booking modal, filter chips, FAQ accordion, and localStorage persistence are preserved and enhanced.
> - **Responsive Geometry (Mobile 375px Breakpoints)**:
>   - Mobile (`< 640px`): Full-width cards (no side margins, 0px border radius, 16px vertical gap, subtle light shadow).
>   - Desktop/Tablet (`≥ 640px`): Floating cards with `rounded-3xl`, tactile drop shadows, and 40px (`2.5rem`) gaps over the `#F5F5F5` canvas.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a unified personal brand and portfolio platform for Alex Rivera. Prospective clients on the homepage experience a comprehensive, seamless narrative from value proposition through proof, methodology, interactive tools, and direct contact. Users wanting deep strategic breakdowns can click into dedicated Hub and Detail pages for individual services, case studies, and editorial playbooks.
- **Target Audience / Persona**: Founders, CMOs, and VP of Growth looking for verifiable performance track records and clear ROI demonstration before booking an advisory sprint.
- **Key Value**: Combines single-page conversion efficiency with multi-page depth and direct URL shareability (`#/works/kinetic-activewear`, `#/services/performance-marketing`, `#/blog/ga4-server-side`).

---

## 2. User Experience & Visual Design

### Page Layouts & User Flows
1. **Home (`#/`)**:
   - Continuous scroll through 13 discrete sections with 40px separation on desktop.
   - Smooth-scrolling anchors with `-80px` header compensation.
   - Animated counter effects for the metrics bar numbers (+120%, 4.5x, ₹50L+, 30+).
   - Integrated "Sites I've Ranked" strip inside the Works section showing domain, target keyword, and rank improvement badges.
2. **Services Hub (`#/services`)**:
   - Header with key stats, 6 comprehensive service cards (with 3 deliverables each and "Learn more" buttons linking to `#/services/:slug`), process execution strip, FAQ accordion, and CTA card.
3. **Service Detail (`#/services/:slug`)**:
   - Breadcrumb navigation (`Home > Services > [Service Title]`) and "← Back to all services".
   - Hero with "Get a Quote" / "Book Audit" button.
   - "What's Included", "Who It's For", 4-stage operational process, 3 related case study cards, transparent pricing approach, and service-specific FAQ.
4. **Works Hub (`#/works`)**:
   - Aggregate track record metrics ($42M+ spend, 180M+ impressions).
   - 8 filter chips (`All`, `Case Studies`, `Posters`, `Analytics`, `SEO Sites`, `Social Media`, `Ads`, `Email`) with mobile horizontal scroll.
   - Masonry showcase of all 12+ items (posters with lightbox zoom, GSC browser logs, CloudPulse SEO before/after, Meta ads KPI panel, phone reel mockup, GA4 revenue ledger).
   - "Load more" interaction, Hall of Fame SERP strip, and CTA card.
5. **Work Detail (`#/works/:slug`)**:
   - Breadcrumbs (`Home > Works > [Client Name]`) and "← Back to full portfolio".
   - Header with client name, industry, engagement duration, service tags, and cover image.
   - 4 quantified result stat cards.
   - Goal & initial challenge, strategic hypothesis, multi-month execution timeline.
   - Proof gallery with high-resolution mockups, client quote, key learnings, and previous/next work navigation.
6. **Blog Hub (`#/blog`)**:
   - Featured marquee article, keyword search input, category chips, responsive article grid, and newsletter capture card.
7. **Blog Detail (`#/blog/:slug`)**:
   - 720px reading container, breadcrumbs, category kicker, author metadata, read time, cover media, rich multi-section prose with pull quotes, sticky desktop Table of Contents, social share buttons, and related articles.
8. **404 Floating Error Card**:
   - Clean, branded error screen with "Back to Home" and "View My Works" buttons.

---

## 3. Key Product Decisions & Trade-Offs

- **Hash Router Implementation**:
  - *Chosen*: Custom lightweight React hash router parsing `window.location.hash` with route regexes (`#/`, `#/services`, `#/services/:slug`, `#/works`, `#/works/:slug`, `#/blog`, `#/blog/:slug`).
  - *Why*: Full refresh resistance in hermetic web preview environments, zero server rewrite dependencies, instant browser back/forward history support, and preserved client memory.
- **Scroll Restoration Mechanism**:
  - *Chosen*: Storing the homepage scroll offset in a ref whenever navigating away from `#/`, and restoring it when navigating back to `#/`. Transitions to hub/detail routes automatically scroll to top (`window.scrollTo({ top: 0 })`).
  - *Why*: Ensures seamless UX so visitors inspecting a case study return exactly to where they were in the Home feed.
- **Consolidated Typed Data Store**:
  - *Chosen*: A single typed data source (`src/data/portfolioData.ts`) defining `services`, `works`, `showcase`, and `posts` with matching slugs, cross-references, and realistic marketing benchmarks.
  - *Why*: Simplifies maintenance, ensures consistent slug references across Hub and Detail pages, and keeps the build lightweight.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│  State: currentRoute, scrollPositionRef, auditModalOpen, lightboxItem  │
│  Hooks: window.addEventListener('hashchange'), useScrollSpy            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    Navbar.tsx    │     │   Active View    │     │    Footer.tsx    │
│ - Sticky Bar     │     │   Router Match   │     │ - Grounded Slate │
│ - Scroll Spy     │     └─────────┬────────┘     │ - Global Links   │
│ - Hash Navigation│               │              │ - Newsletter     │
└──────────────────┘               │              └──────────────────┘
                                   │
  ┌────────────────────────────────┼────────────────────────────────┐
  ▼                                ▼                                ▼
┌────────────────────┐   ┌────────────────────┐   ┌─────────────────────┐
│    Home View (#/)  │   │     Hub Views      │   │    Detail Views     │
│ 13 Stamped Sections│   │ - #/services       │   │ - #/services/:slug  │
│ (Hero → Metrics →  │   │ - #/works          │   │ - #/works/:slug     │
│ About → Services → │   │ - #/blog           │   │ - #/blog/:slug      │
│ Works → Process →  │   └────────────────────┘   └─────────────────────┘
│ Tools → ROAS Calc →│                                       │
│ Testimonials → Blog│                                       ▼
│ → FAQ → Contact)   │                            ┌─────────────────────┐
└────────────────────┘                            │    404 Fallback     │
                                                  │ - "Back to Home"    │
                                                  │ - "View My Works"   │
                                                  └─────────────────────┘
```

### Data Schema Mapping

```typescript
export interface ServiceDetail {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  deliverables: string[];
  whoItsFor: string[];
  process: { phase: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  relatedWorkSlugs: string[];
}

export interface WorkDetail {
  slug: string;
  client: string;
  title: string;
  industry: string;
  duration: string;
  services: string[];
  result: string;
  stats: { label: string; value: string; trend?: string }[];
  goal: string;
  challenge: string;
  strategy: string;
  execution: { step: string; title: string; desc: string }[];
  proofItemIds: string[];
  testimonial: { quote: string; author: string; role: string; avatar?: string };
  learnings: string[];
}

export interface ShowcaseItem {
  id: string;
  type: 'poster' | 'analytics' | 'seo-site' | 'social' | 'ad' | 'email';
  title: string;
  client: string;
  image: string;
  badge?: string;
  source?: string;
  url?: string;
  before?: string;
  after?: string;
  workSlug?: string;
  metrics?: { label: string; value: string }[];
}

export interface BlogPostDetail {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  coverImage: string;
  author: { name: string; role: string; avatar: string };
  toc: { id: string; title: string }[];
  contentBlocks: { heading?: string; paragraphs: string[]; pullQuote?: string }[];
  relatedSlugs: string[];
}
```

---

## 5. Execution Steps

1. **Data Model Expansion (`src/data/portfolioData.ts`)**:
   - Seed 6 complete services with full detail metadata.
   - Seed 6 in-depth works with quantified stats, challenges, strategies, execution timelines, and proof references.
   - Seed 12 diverse showcase items across all 6 formats (poster, analytics, SEO site, social reel, Meta ad, Klaviyo email flow).
   - Seed 6 blog articles with structured content blocks and table of contents.
2. **Router & Scroll-Spy Utility**:
   - Create custom route matcher supporting `#/`, `#/services`, `#/services/:slug`, `#/works`, `#/works/:slug`, `#/blog`, `#/blog/:slug`, and 404 fallback.
   - Implement scroll restoration and `document.title` synchronization per route.
   - Implement intersection-based scroll-spy for Home sections.
3. **Navbar & Footer Updates**:
   - Sticky navbar handling section jumping on Home vs routing from hubs/detail pages.
   - Active route and section highlighting.
   - Full-screen mobile navigation drawer.
4. **Single-Page Home View (`src/components/HomeView.tsx`)**:
   - Assemble all 13 sections in strict order as floating cards (desktop 40px gap, mobile 16px edge-to-edge).
   - Animated metric counters and interactive ROAS calculator.
   - "Sites I've Ranked" strip integrated into Works preview.
5. **Hub Pages Components**:
   - `ServicesHubView.tsx` (`#/services`).
   - `WorksHubView.tsx` (`#/works`) with 8 filter chips, masonry grid, and "Load more".
   - `BlogHubView.tsx` (`#/blog`) with featured article, search, and category chips.
6. **Detail Pages Components**:
   - `ServiceDetailView.tsx` (`#/services/:slug`).
   - `WorkDetailView.tsx` (`#/works/:slug`).
   - `BlogDetailView.tsx` (`#/blog/:slug`) with sticky desktop TOC and 720px column.
7. **404 View Component (`src/components/NotFoundView.tsx`)**:
   - Clean floating card with recovery CTAs.
8. **App Integration & Verification**:
   - Mount router inside `src/App.tsx`.
   - Test acceptance checks: direct URL loading, refresh survival, browser back/forward, mobile responsive styles, lightbox, and calculator persistence.
   - Run `lint_applet` and `compile_applet`.
