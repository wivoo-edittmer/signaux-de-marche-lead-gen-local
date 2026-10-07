# Frontend Design Principles - B2BMax

## Overview

This document outlines the design principles, patterns, and guidelines for the B2BMax Next.js frontend application. The application provides market signal analysis through an AI-powered chat interface with data visualization.

---

## Core Design Principles

### 1. Clarity Over Complexity
- **Priority**: Information hierarchy is critical for B2B decision-makers
- **Action**: Every element must have a clear purpose
- **Rule**: If a user doesn't understand it in 3 seconds, simplify it

### 2. Data-First UX
- **Priority**: Data visualization and insights are the product
- **Action**: Design around data, not around aesthetics
- **Rule**: Never obscure data with visual flourish

### 3. B2B Professional Aesthetic
- **Tone**: Clean, professional, trustworthy
- **Colors**: Corporate palette (blues, grays, accent colors)
- **Typography**: Readable, professional fonts
- **Avoid**: Playful elements, animations, gradations

### 4. Performance as Feature
- **Target**: < 1s TTI (Time to Interactive)
- **Strategy**: Code-splitting, lazy loading, optimized bundles
- **Rule**: Every performance budget violation must be justified

### 5. Accessibility Compliance
- **Standard**: WCAG 2.1 AA minimum
- **Requirements**: Keyboard navigation, screen reader support, color contrast
- **Testing**: Automated + manual accessibility testing

### 6. Responsive by Default
- **Breakpoints**: Mobile-first, tablet, desktop, large desktop
- **Approach**: Progressive enhancement
- **Rule**: Test on actual devices, not just emulators

---

## Design System

### Color Palette

#### Primary Colors
```
--primary-500: #2563EB (Blue - Trust, Professionalism)
--primary-600: #1D4ED8
--primary-700: #1E40AF
```

#### Secondary Colors
```
--secondary-500: #059669 (Green - Growth, Positive signals)
--secondary-600: #047857
```

#### Warning/Error Colors
```
--warning-500: #D97706 (Orange - Attention needed)
--error-500: #DC2626 (Red - Negative trends, errors)
--error-600: #B91C1C
```

#### Neutral Colors
```
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

### Typography

#### Font Families
```
--font-sans: 'Inter', system-ui, -apple-system, sans-serif
--font-mono: 'Fira Code', 'Monaco', monospace
```

#### Type Scale
```
--text-xs: 0.75rem   (12px)  - Captions, labels
--text-sm: 0.875rem (14px)  - Secondary text
--text-base: 1rem    (16px)  - Body text
--text-lg: 1.125rem (18px)  - Large text
--text-xl: 1.25rem  (20px)  - Headings
--text-2xl: 1.5rem  (24px)  - Section headings
--text-3xl: 1.875rem (30px) - Page titles
--text-4xl: 2.25rem  (36px) - Hero titles
```

#### Font Weights
```
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System

Using 4px base unit:
```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-5: 1.25rem  (20px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-10: 2.5rem   (40px)
--space-12: 3rem     (48px)
--space-16: 4rem     (64px)
```

---

## Component Library

### 1. Chat Interface (Core Feature)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Header: B2BMax Logo + User Menu]                            │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │                     │  │                                 │ │
│  │   CHAT AREA        │  │     DATA VISUALIZATION        │ │
│  │   (Left Panel)     │  │         (Right Panel)         │ │
│  │                     │  │                                 │ │
│  │ - Message history  │  │ - Market trend charts         │ │
│  │ - User input       │  │ - Sector breakdown            │ │
│  │ - Suggestions      │  │ - Geographic heatmaps        │ │
│  │                     │  │ - Interactive filters        │ │
│  └─────────────────────┘  └─────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────┤
│  [Action Bar: Quick actions, Export, Share]                    │
└─────────────────────────────────────────────────────────────┘
```

**Chat Message Components:**
- User message: Right-aligned, blue bubble
- AI message: Left-aligned, gray bubble
- Data cards: Special formatted cards for structured data
- Action buttons: For follow-up actions from AI responses

### 2. Data Visualization Components

#### Chart Types
- **Line Charts**: Market trends over time
- **Bar Charts**: Sector comparisons
- **Pie Charts**: Market share by sector
- **Heatmaps**: Geographic distribution (using Mapbox)
- **Tables**: Detailed data views with sorting/filtering

#### Chart Design Principles
- **Color Coding**: Consistent color mapping across all charts
  - Green: Growth, positive trends
  - Red: Decline, negative trends
  - Blue: Neutral, information
  - Orange: Warnings, attention needed
- **Responsiveness**: Charts must reflow on mobile
- **Accessibility**: Color + pattern for colorblind users
- **Interactivity**: Hover for details, click to drill down

### 3. Market Signal Cards

```
┌─────────────────────────────────────────┐
│  📈 Sector: Restaurant                         │
│  ───────────────────────────────────────── │
│                                                     │
│  +12%    ↑ 23% vs last quarter                │
│  47 new companies in your zone                │
│                                                     │
│  [View Details] [Export] [Set Alert]          │
└─────────────────────────────────────────┘
```

### 4. Navigation Pattern

**Primary Navigation:**
- Left sidebar (collapsible on mobile)
- Top bar for main sections
- Breadcrumb navigation for drill-downs

**Sections:**
1. **Dashboard** - Overview of all signals
2. **Chat** - Main AI interaction
3. **Markets** - Browse by sector/zone
4. **Alerts** - Configure notifications
5. **Reports** - Generated reports
6. **Settings** - User preferences

---

## Page Layouts

### 1. Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo, Search, User Menu                                │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  KPI Cards        │  │  Quick Actions    │                │
│  │  - Total signals  │  │  - New search      │                │
│  │  - Alerts         │  │  - Recent reports  │                │
│  │  - Trends         │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Main Content Area                                      │ │
│  │  - Primary charts and data visualizations               │ │
│  │  - Responsive grid layout                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. Chat Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header: B2BMax, Current Chat Context                           │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │                     │  │                                 │ │
│  │   CHAT PANEL       │  │   VISUALIZATION PANEL        │ │
│  │                     │  │                                 │ │
│  │  ┌───────────────┐  │  │  ┌─────────────────────┐   │ │
│  │  │ User Message  │  │  │  │  Chart: Market Trend   │   │ │
│  │  └───────────────┘  │  │  │  (Interactive)        │   │ │
│  │                     │  │  └─────────────────────┘   │ │
│  │  ┌───────────────┐  │  │  ┌─────────────────────┐   │ │
│  │  │ AI Response   │  │  │  │  Map: Geographic Data │   │ │
│  │  │ + Data Card   │──┼──┤  │  (Mapbox integration) │   │ │
│  │  └───────────────┘  │  │  └─────────────────────┘   │ │
│  │                     │  │                                 │ │
│  │  [Input Area]        │  │                                 │ │
│  └─────────────────────┘  └─────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Next.js Specific Guidelines

### 1. Project Structure
```
b2bmax/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main app pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Dashboard
│   │   ├── chat/
│   │   │   └── page.tsx # Chat interface
│   │   ├── markets/
│   │   │   └── page.tsx # Market explorer
│   │   └── settings/
│   │       └── page.tsx # User settings
│   ├── api/             # API routes
│   └── globals.css      # Global styles
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ChartContainer.tsx
│   ├── chat/            # Chat-specific components
│   │   ├── MessageBubble.tsx
│   │   └── DataCard.tsx
│   ├── visualization/    # Data visualization
│   │   ├── Chart.tsx
│   │   ├── Map.tsx
│   │   └── TrendIndicator.tsx
│   └── layout/          # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/        # Supabase client
│   ├── api/             # API utilities
│   └── hooks/           # React hooks
├── types/               # TypeScript types
├── public/              # Static assets
└── docs/                # Documentation
```

### 2. Styling Approach

**Framework**: Tailwind CSS (recommended)
- **Why**: Rapid development, utility-first, consistent
- **Config**: Customize theme in `tailwind.config.js`

**Alternative**: CSS Modules or styled-components if preferred

**Global Styles:**
- Reset styles in `globals.css`
- Define custom CSS variables
- Use system fonts for performance

### 3. State Management

**Recommended Stack:**
- **Local state**: React useState/useReducer
- **Server state**: React Query or SWR
- **Global state**: Zustand (lightweight) or Jotai
- **Supabase realtime**: Use Supabase realtime subscriptions

**Avoid**: Redux (overkill for this project)

### 4. Performance Optimizations

```typescript
// Code splitting for heavy components
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  ssr: false,
  loading: () => <ChartLoader />
})

// Image optimization
import Image from 'next/image'

// Font optimization
import { Inter, Fira_Code } from 'next/font/google'
```

---

## Responsive Design Guidelines

### Breakpoints
```
sm: 640px   - Mobile
md: 768px   - Tablet
lg: 1024px  - Small desktop
xl: 1280px  - Desktop
2xl: 1536px - Large desktop
```

### Mobile-First Approach
1. Design for mobile first
2. Add responsive classes: `md:`, `lg:`, `xl:`
3. Test on actual devices

### Mobile-Specific Considerations
- **Chat on mobile**: Full-width chat, visualization below
- **Touch targets**: Minimum 44x44px
- **Viewport**: Proper meta tags
- **Input**: Optimized for touch keyboards

---

## Accessibility Guidelines

### 1. Keyboard Navigation
- All interactive elements must be focusable
- Logical tab order
- Visible focus indicators
- Skip to content link

### 2. Screen Reader Support
- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA labels where needed
- Alt text for images
- Descriptive link text

### 3. Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Test with contrast checker tools

### 4. Color Blindness
- Never convey information by color alone
- Use patterns + colors
- Test with color blind simulators

---

## Animation & Micro-interactions

**Principle**: Subtle and purposeful

### Allowed Animations
- Smooth transitions (max 200ms)
- Loading spinners
- Hover states on interactive elements
- Toast notifications (slide in/out)

### Forbidden Animations
- Auto-playing videos
- Flashing content
- Scroll-triggered animations that move content
- Complex entrance animations

### Performance Impact
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid `margin`, `padding`, `width`, `height` animations
- Use `will-change` sparingly

---

## Testing Requirements

### 1. Unit Testing
- Jest + React Testing Library
- Test all custom hooks
- Test utility functions
- Target: >80% coverage

### 2. Integration Testing
- Test component interactions
- Test API integration
- Test authentication flows

### 3. E2E Testing
- Cypress or Playwright
- Test critical user journeys:
  - Login flow
  - Chat interaction
  - Data visualization
  - Report generation

### 4. Visual Regression
- Percy or Chromatic
- Catch unintended visual changes

---

## Deployment Guidelines

### Environment Variables
```
# Required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAPBOX_TOKEN

# Optional
NEXT_PUBLIC_ANALYTICS_ID
NEXT_PUBLIC_APP_URL
```

### Build Process
```bash
npm run build  # Next.js production build
npm run test   # Run all tests
npm run lint   # Run ESLint
```

### CI/CD
- GitHub Actions recommended
- Run on every PR to main
- Required: Build, test, lint
- Optional: Preview deployments

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Chart.tsx` |
| Pages | kebab-case | `markets/page.tsx` |
| Utilities | kebab-case | `format-date.ts` |
| Hooks | usePascalCase | `useChartData.ts` |
| Types | PascalCase | `Company.ts` |
| Constants | SCREAMING_SNAKE | `API_ENDPOINTS.ts` |
| CSS | kebab-case | `chart.module.css` |

---

## Code Review Checklist

Before merging any frontend PR:

- [ ] Follows design principles above
- [ ] Responsive on all breakpoints
- [ ] Accessible (keyboard, screen reader, contrast)
- [ ] Performance optimized
- [ ] No console warnings/errors
- [ ] TypeScript types are correct
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Environment variables documented

---

## Next Steps

1. **Set up Next.js project** with the structure above
2. **Configure Tailwind CSS** with custom theme
3. **Create base components** (Button, Card, Input, etc.)
4. **Set up Supabase client** for data access
5. **Integrate Mapbox** for geographic visualizations
6. **Build chat UI** with message components
7. **Add data visualization** components

This document will be updated as the project evolves.
