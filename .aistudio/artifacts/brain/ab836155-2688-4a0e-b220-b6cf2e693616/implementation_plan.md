# Alex Rivera | Performance Marketing & SEO Growth Portfolio

A comprehensive, production-grade personal brand and client acquisition web application for senior growth marketer Alex Rivera. Replicates and unifies the five complete design screens (Home, About, Services, Works, Blog/Insights) into a high-performance responsive application featuring instant view switching, a full-screen proof lightbox, interactive category filtering, an interactive ROAS & Growth ROI calculator, and a multi-step growth audit diagnostic booking modal.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive interview:
> - **Navigation Architecture**: Seamless multi-view tab switching across `Home`, `About`, `Services`, `Works`, `Blog`, and `Contact` with instant state preservation and URL hash synchronisation.
> - **Interactive Capabilities**: Built-in proof lightbox modal for inspecting high-resolution creative posters, verified Google Search Console snapshots, and GA4 telemetry; interactive filter chips for case studies and visual assets; plus a client-facing ROAS & Acquisition ROI Calculator.
> - **Audit & Consultation Flow**: "Hire Me" and "Book a Free 30-Min Growth Audit" CTAs launch an interactive 3-step diagnostic booking modal (Channel Intake & Goals $\rightarrow$ Metric Baselines & Spend $\rightarrow$ Calendar Scheduling & Confirmation).

---

## 1. Overview & Core Concept

- **What It Does**: Presents an authoritative, data-backed personal brand portfolio demonstrating tangible marketing ROI through real case studies, Google Search Console logs, Meta/Google ad creatives, and live-ranked client sites. Visitors can inspect deliverables in full resolution, model expected campaign returns using an interactive ROAS calculator, and submit diagnostic audit requests.
- **Target Audience / Persona**: Growth-stage startup founders (Series A–B), DTC brand executives, CMOs, and venture operators looking to audit, scale, or troubleshoot their customer acquisition engines.
- **Key Value**: Replaces vague marketing buzzwords with quantitative proof, verifiable SERP trajectories, and transparent unit economics.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Executive Overview (Home View)**: Hero section with dynamic proof badges (+120% Traffic, 4.5x ROAS), 4-metric growth bar, full-funnel capability previews, featured case studies, 5-stage methodology, verified marketing stack chips, client endorsements, and conversion CTA.
2. **Detailed Capabilities & Process (Services View)**: 6 detailed service cards (Technical SEO, Paid Advertising, Social Strategy, Content Marketing, Email Lifecycle, Analytics & CRO) with expandable deliverables, interactive 4-phase execution roadmap with progress indicators, and an interactive FAQ accordion.
3. **Deep Proof & Artifact Exploration (Works View)**: Filterable masonry gallery across 8 categories (`All`, `Case Studies`, `Posters`, `Analytics`, `SEO Sites`, `Social Media`, `Ads`, `Email`) with full-screen keyboard-accessible lightbox (`ESC`, arrows), before/after metric strips, and verified SERP ranking highlights.
4. **Strategic Background (About View)**: Bio with quantitative track record, 4-principle engineering philosophy, 3-milestone career timeline, core marketing proficiency breakdown, daily tool armory, industry certifications, and personal balance sections.
5. **Interactive Tools (ROAS Calculator & Audit Booking)**:
   - *ROAS & CAC Growth Calculator*: Interactive sliders for monthly ad budget, current conversion rate, and average order value/deal size, outputting blended ROAS, estimated new revenue, and CAC payback timeline.
   - *3-Step Growth Audit Modal*: Multi-step intake collecting company URL, primary growth challenge, monthly budget tier, and preferred calendar timeslot with immediate summary confirmation.

### Visual Identity & Theme Tokens
- **Design Constitution**: Follows the *Corporate Modern with Tactile Elevation* design system from the specification:
  - **Page Canvas**: `#F5F5F5` / `#FBF9F8` creating physical separation beneath floating island panels.
  - **Surface Elements**: Crisp pure white `#FFFFFF` floating containers (`rounded-3xl` / 24px) with soft ambient drop shadows and subtle `1px` rings (`ring-1 ring-neutral-200/80`).
  - **Primary Blue Accent**: `#2563EB` (hover: `#1D4ED8`, active: `#1E40AF`) with glowing blue-tinted button shadows (`0 4px 14px rgba(37,99,235,0.35)`).
  - **Accent Green**: `#16A34A` / `#DCFCE7` reserved exclusively for validated growth statistics, ROAS indicators, and positive SERP movements.
  - **Dark Anchor Base**: `#0F172A` / `#111827` grounded dark footer and closing contrast strips.
- **Typography**: Universal **Inter** font hierarchy with tight negative display tracking (`-0.02em` on Display H1, tabular numerals `tabular-nums` on all financial figures and metrics).
- **Zero-Pill Restraint**: Static metadata uses clean inline typographic separators (`·` / `/`), reserving pill buttons strictly for interactive filter controls and status badges.

---

## 3. Key Product Decisions & Trade-Offs

- **Multi-View State Model**:
  - *Chosen*: Single-page view router driven by React state synchronized with `window.location.hash`.
  - *Why*: Eliminates page reload flicker, enables seamless state persistence (e.g. calculator numbers and filter preferences remain intact when navigating), and allows direct links to `#works`, `#services`, or `#about`.
- **Integrated Assets & Zero External Dependency Failure**:
  - *Chosen*: Hotlink verified Google CDN image URLs provided in the reference HTML screens (`lh3.googleusercontent.com`), backed with robust styled fallback SVG/gradient containers.
  - *Why*: Guarantees high-fidelity visual fidelity identical to the approved screens without risk of external CDN outages or broken image frames.
- **Local Storage for Audit Diagnostic Inquiries**:
  - *Chosen*: Submissions in the 3-step audit booking modal store diagnostic state in `localStorage` and trigger email pre-fill links.
  - *Why*: Provides instant client feedback and reviewable submission history without requiring external cloud databases or third-party webhooks.

---

## 4. Technical Architecture & Data Strategy

### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App Container                             │
│       ┌────────────────────────────────────────────────────────┐       │
│       │         Top Navigation Bar (1-Row, 3-Zone Contract)    │       │
│       │  [Brand Wordmark] ── [Nav Links] ── ["Hire Me" CTA]    │       │
│       └────────────────────────────────────────────────────────┘       │
│                                   │                                    │
│                 ┌─────────────────┴─────────────────┐                  │
│                 ▼                                   ▼                  │
│     ┌───────────────────────┐           ┌───────────────────────┐      │
│     │    View Orchestrator  │           │   Global Overlay Hub  │      │
│     │  (Home/About/Services/│           │ ┌───────────────────┐ │      │
│     │     Works/Blog/Audit) │           │ │ Proof Lightbox    │ │      │
│     └───────────────────────┘           │ ├───────────────────┤ │      │
│                 │                       │ │ 3-Step Audit Modal│ │      │
│                 ▼                       │ └───────────────────┘ │      │
│  ┌───────────────────────────────────────────────────────────┐  │      │
│  │                     Active View Screen                    │  │      │
│  │  ┌───────────────┐ ┌────────────────┐ ┌────────────────┐  │  │      │
│  │  │ HomeView      │ │ ServicesView   │ │ WorksView      │  │  │      │
│  │  │ - Hero Split  │ │ - 6 Solution   │ │ - 8 Filters    │  │  │      │
│  │  │ - Metric Bar  │ │   Cards        │ │ - Proof Tiles  │  │  │      │
│  │  │ - ROAS Tool   │ │ - 4-Phase Flow │ │ - SERP Strip   │  │  │      │
│  │  │ - Case Grid   │ │ - FAQ Accordion│ │ - Testimonial  │  │  │      │
│  │  └───────────────┘ └────────────────┘ └────────────────┘  │  │      │
│  │  ┌───────────────┐ ┌────────────────┐ ┌────────────────┐  │  │      │
│  │  │ AboutView     │ │ BlogView       │ │ ContactView    │  │  │      │
│  │  │ - Bio & Visual│ │ - Articles     │ │ - Form Intake  │  │  │      │
│  │  │ - Timeline    │ │ - Read Times   │ │ - Direct Info  │  │  │      │
│  │  │ - Tech Armory │ │ - Topic Hubs   │ │ - Social Hub   │  │  │      │
│  │  └───────────────┘ └────────────────┘ └────────────────┘  │  │      │
│  └───────────────────────────────────────────────────────────┘  │      │
│                                   │                                    │
│       ┌───────────────────────────▼────────────────────────────┐      │
│       │        Dark Footer (#0F172A) & Newsletter Capture      │      │
│       └────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

| Component | Key State & Props | Event Handlers & User Interactions |
| :--- | :--- | :--- |
| `App` / `Navbar` | `currentView: TabId`, `isAuditModalOpen: boolean` | `onNavigate(view)`, `onOpenAudit()`, hash listener sync |
| `WorksView` | `activeFilter: string`, `selectedImageIndex: number` | Category chip filtering, click-to-preview lightbox trigger |
| `LightboxModal` | `isOpen: boolean`, `currentIndex: number` | Previous/Next navigation, `Escape` key close, keyboard arrows |
| `ServicesView` | `expandedFaqId: string \| null` | Accordion collapse/expand micro-interaction |
| `RoasCalculator` | `budget: number`, `cvr: number`, `aov: number` | Real-time mathematical recalculation of ROAS, ARR and CAC |
| `AuditBookingModal`| `step: 1\|2\|3`, `formData: AuditFormData`, `isSubmitted: boolean` | Diagnostic form field updates, step validation, `localStorage` storage |

---

## 5. Execution Steps (Upon Approval)

1. **HTML & Metadata Synchronization**: Update `/index.html` with accurate OpenGraph, favicon, title ("Alex Rivera | Growth Marketer - Performance Portfolio"), and `/metadata.json`.
2. **Design Tokens & Theme Styling**: Configure typography and Tailwind utilities in `/src/index.css` following the design specification.
3. **Data Assets & Portfolio Content**: Consolidate structured portfolio items, case studies, client rankings, and testimonial records into typed data definitions.
4. **Interactive Component Architecture**:
   - `Navbar` & `Footer` with 1-row, 3-zone contract.
   - `HomeView` with hero split, interactive metric counters, ROAS estimator, and case studies.
   - `ServicesView` with 6 detailed capability cards, process milestones, and FAQ accordion.
   - `WorksView` with 8 filter tabs, before/after metric comparisons, and SERP Hall of Fame.
   - `AboutView` with career timeline, domain proficiencies, and armory grid.
   - `BlogView` with tactical growth playbooks.
   - `LightboxModal` with smooth transitions and keyboard navigation.
   - `AuditBookingModal` with multi-step diagnostic intake.
5. **Compilation & Verification**: Execute `compile_applet` to ensure pristine TypeScript compilation and zero console errors.
