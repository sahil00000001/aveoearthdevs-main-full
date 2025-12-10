# Aveoearth Design System Guide

## Project Overview
**Aveoearth** is a sustainable ecommerce marketplace featuring:
- **User Types**: Buyers, Suppliers, and Admins
- **Core Features**: ESG traceability, AI concierge (Aveomind), marketplace functionality
- **Tech Stack**: Next.js 15.5.0, React 19.1.0, Tailwind CSS v4

---

## Design System Structure

### 1. Design Tokens

#### Current Token Implementation
Located in: `src/app/globals.css`

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

#### Expanded Token System

**Colors**
```css
:root {
  /* Brand Colors - Sustainable Theme */
  --color-green-primary: #2d5d31;      /* Deep forest green */
  --color-green-secondary: #4a7c59;     /* Medium green */
  --color-green-accent: #6b9080;        /* Sage green */
  --color-green-light: #a4c3b2;         /* Light sage */
  --color-green-subtle: #eaf4f4;        /* Very light green */

  /* Neutral Colors */
  --color-neutral-900: #0a0a0a;         /* Almost black */
  --color-neutral-800: #171717;         /* Dark gray */
  --color-neutral-700: #404040;         /* Medium dark */
  --color-neutral-500: #737373;         /* Medium gray */
  --color-neutral-400: #a3a3a3;         /* Light gray */
  --color-neutral-200: #e5e5e5;         /* Very light */
  --color-neutral-100: #f5f5f5;         /* Off white */
  --color-neutral-50: #fafafa;          /* Near white */

  /* Semantic Colors */
  --color-success: #16a34a;             /* Green success */
  --color-warning: #ca8a04;             /* Amber warning */
  --color-error: #dc2626;               /* Red error */
  --color-info: #2563eb;                /* Blue info */

  /* Background & Surface */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-surface-elevated: #ffffff;

  /* Text */
  --color-text-primary: #171717;
  --color-text-secondary: #525252;
  --color-text-tertiary: #a3a3a3;
}
```

**Typography Scale**
```css
:root {
  /* Font Families */
  --font-sans: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: var(--font-geist-mono), 'SF Mono', Consolas, monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

**Spacing Scale**
```css
:root {
  /* Spacing tokens following 8px grid */
  --spacing-0: 0;
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
  --spacing-20: 5rem;      /* 80px */
  --spacing-24: 6rem;      /* 96px */
}
```

### 2. Component Architecture

#### Directory Structure
```
src/
├── components/
│   ├── ui/           # Basic UI components
│   ├── forms/        # Form-specific components
│   ├── layout/       # Layout components
│   ├── esg/          # ESG-specific components
│   └── ai/           # AI concierge components
├── styles/
│   ├── globals.css   # Global styles & tokens
│   └── components/   # Component-specific styles
└── assets/
    ├── icons/        # SVG icons
    └── images/       # Static images
```

#### Component Categories

**1. Foundation Components**
- Button variations (primary, secondary, ghost, danger)
- Input fields (text, email, password, textarea)
- Form controls (checkbox, radio, select)
- Typography components (heading, paragraph, caption)

**2. Layout Components**
- Header/Navigation (Buyer, Supplier, Admin variants)
- Footer
- Sidebar
- Grid system
- Container/Section wrappers

**3. Business Components**
- Product cards
- ESG certification badges
- Order status indicators
- AI chat widget
- User dashboards
- Analytics charts

### 3. Styling Approach

**Current**: Tailwind CSS v4 with CSS custom properties
**Benefits**: 
- Utility-first approach
- Custom design tokens integration
- Dark mode support via CSS variables
- Excellent performance with Tailwind v4

#### Implementation Patterns

**Component Pattern**:
```jsx
// Button component example
export function Button({ variant = 'primary', size = 'md', children, ...props }) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors rounded-lg";
  const variants = {
    primary: "bg-green-primary text-white hover:bg-green-secondary",
    secondary: "bg-green-light text-green-primary hover:bg-green-accent",
    ghost: "text-green-primary hover:bg-green-subtle"
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 4. Asset Management

#### Current Assets (in `/public/`)
- `next.svg` - Next.js logo
- `vercel.svg` - Vercel logo  
- `file.svg`, `globe.svg`, `window.svg` - UI icons

#### Recommended Icon System
```
public/
├── icons/
│   ├── ui/           # Interface icons (menu, close, search)
│   ├── actions/      # Action icons (edit, delete, save)
│   ├── status/       # Status icons (success, warning, error)
│   └── esg/          # ESG-specific icons (leaf, recycle, certificate)
└── images/
    ├── avatars/      # User profile images
    ├── products/     # Product imagery
    └── brand/        # Brand assets
```

#### Icon Usage Pattern
```jsx
// Icon component with consistent sizing
export function Icon({ name, size = 16, className = "" }) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={className}
    />
  );
}
```

### 5. Responsive Design Strategy

#### Breakpoint System (Tailwind defaults)
- `sm`: 640px and up (tablet)
- `md`: 768px and up (small laptop)  
- `lg`: 1024px and up (desktop)
- `xl`: 1280px and up (large desktop)

#### Mobile-First Approach
```jsx
// Example responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  <ProductCard />
  <ProductCard />
  <ProductCard />
</div>
```

### 6. User Experience Patterns

#### Buyer Flow Patterns
- **Product Discovery**: Card grids, filters, search
- **ESG Verification**: Modal overlays, certificate badges
- **Checkout**: Multi-step forms, progress indicators

#### Supplier Flow Patterns  
- **Dashboard**: Metric cards, charts, data tables
- **Product Management**: Form sections, image upload, bulk actions
- **ESG Management**: Document upload, status tracking

#### Admin Flow Patterns
- **Data Management**: Tables with sorting, filtering, pagination
- **Approval Workflows**: Review cards, action buttons
- **Analytics**: Charts, KPI cards, export functions

---

## Figma Integration Guidelines

### 1. Design Token Sync
When importing designs from Figma:
1. Extract color variables and map to CSS custom properties
2. Convert typography scales to CSS font size/weight tokens  
3. Map spacing values to the 8px grid system
4. Document any new tokens in `globals.css`

### 2. Component Documentation
For each Figma component:
- Document component variants (states, sizes, types)
- Note interaction behaviors
- Specify responsive breakpoint behaviors
- Map to appropriate React component structure

### 3. Asset Export Guidelines
- **Icons**: Export as SVG, optimize with SVGO
- **Images**: Use appropriate formats (WebP for photos, SVG for graphics)
- **Illustrations**: Export at 2x for retina displays

### 4. Accessibility Requirements
- Ensure color contrast ratios meet WCAG AA standards
- Include focus states for interactive elements
- Document keyboard navigation patterns
- Specify screen reader friendly text alternatives

---

## Development Workflow

### 1. Adding New Components
1. Create component in appropriate `src/components/` directory
2. Follow established naming conventions
3. Use Tailwind classes mapped to design tokens
4. Include accessibility attributes
5. Add to component library documentation

### 2. Design Updates
1. Update design tokens in `globals.css` first
2. Update affected components
3. Test across user flows (Buyer, Supplier, Admin)
4. Verify responsive behavior
5. Test accessibility compliance

### 3. Quality Checklist
- [ ] Component follows design token system
- [ ] Responsive design tested on all breakpoints  
- [ ] Accessibility attributes included
- [ ] Dark mode compatibility verified
- [ ] Performance impact considered
- [ ] Cross-browser compatibility checked

---

## Sustainability Theme Guidelines

### Visual Identity
- **Primary Color**: Deep forest green (#2d5d31) - represents growth and sustainability
- **Accent Colors**: Sage and earth tones - natural, organic feel
- **Typography**: Clean, modern fonts (Geist) for professional credibility
- **Imagery**: Natural textures, organic shapes, environmental themes

### ESG-Specific Design Elements
- **Certification Badges**: Consistent style across all user types
- **Sustainability Scores**: Visual progress indicators, color-coded ratings  
- **Environmental Impact**: Icons and graphics emphasizing eco-friendliness
- **Trust Indicators**: Professional design conveying reliability and transparency

### User Role Differentiation
- **Buyers**: Consumer-friendly, product-focused interface
- **Suppliers**: Business-oriented, data-rich dashboard design
- **Admins**: Functional, information-dense management interface

---

## Implementation Priority

### Phase 1: Foundation
1. Complete design token implementation
2. Build core UI component library
3. Establish layout components

### Phase 2: Business Logic
1. Implement user-specific components
2. Build ESG verification interface
3. Create AI chat component

### Phase 3: Advanced Features
1. Advanced analytics dashboards
2. Complex form workflows  
3. Mobile-optimized experiences

---

This design guide should be treated as a living document, updated as the design system evolves and new requirements emerge.
