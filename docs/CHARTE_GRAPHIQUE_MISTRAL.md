# Charte Graphique Mistral - Adapted for B2BMax

This document extracts and adapts Mistral AI's graphic charter for the B2BMax project, based on the provided logo files.

---

## Source Files
- `logo/logo-b2bmax-charte-mistral.svg` - Orange version with Mistral charter
- `logo/logo-b2bmax-charte-mistral.png` - PNG version
- `logo/logo-b2bmax-version-verte.svg` - Green alternative version
- `logo/logo-b2bmax-version-verte.png` - PNG version

**Logo Description:** Pixel art "M" shape with gradient colors, forming a structured pattern.

---

## Official Mistral Color Palette

### Primary Palette (Orange Version - "Charte Mistral")

Based on the SVG comment: _"B2BMax - charte Mistral : pixels orange, M en degrade jaune-orange"_

| Color | Hex Code | Usage | Description |
|-------|----------|-------|-------------|
| **Orange Primary** | `#FF7000` | Primary brand color | Main orange for pixel grid |
| **Yellow Light** | `#F5D90A` | Gradient start | Light yellow for "M" gradient |
| **Yellow-Orange** | `#FAA42B` | Gradient middle | Transition color |
| **Orange-Yellow** | `#FF9E00` | Gradient middle | Transition color |
| **Orange** | `#FF7000` | Gradient end | Matches primary |

**Gradient Formula:**
```
Linear gradient from #F5D90A (light yellow) to #FF7000 (orange)
Through intermediate steps: #FAA42B → #FF9E00 → #FF7000
```

### Alternative Palette (Green Version - "Version Verte")

Based on the SVG comment: _"B2BMax - version verte : M en degrade vert clair -> vert profond"_

| Color | Hex Code | Usage | Description |
|-------|----------|-------|-------------|
| **Green Primary** | `#16A34A` | Primary brand color | Main green for pixel grid |
| **Green Very Light** | `#A3E635` | Gradient start | Lightest green |
| **Green Light** | `#65C547` | Gradient middle | Light green |
| **Green Medium** | `#22C55E` | Gradient middle | Medium green |
| **Green** | `#16A34A` | Gradient middle | Matches primary |
| **Green Dark** | `#15803D` | Gradient end | Dark green |

**Gradient Formula:**
```
Linear gradient from #A3E635 (light green) to #15803D (dark green)
Through intermediate steps: #65C547 → #22C55E → #16A34A → #15803D
```

---

## Design System Adaptation

### Color Roles for B2BMax

#### Brand Colors
```css
:root {
  /* Primary Brand - Orange (Mistral Charter) */
  --brand-primary: #FF7000;
  --brand-primary-light: #F5D90A;
  --brand-primary-dark: #FAA42B;
  
  /* Accent - Green (for positive signals) */
  --brand-accent: #16A34A;
  --brand-accent-light: #A3E635;
  --brand-accent-dark: #15803D;
  
  /* Gradient Definitions */
  --gradient-brand: linear-gradient(to right, #F5D90A, #FAA42B, #FF9E00, #FF7000);
  --gradient-accent: linear-gradient(to right, #A3E635, #65C547, #22C55E, #16A34A, #15803D);
}
```

#### Semantic Colors
```css
:root {
  /* Success/Growth (use green palette) */
  --success-50: #A3E635;
  --success-100: #65C547;
  --success-500: #22C55E;
  --success-700: #16A34A;
  --success-900: #15803D;
  
  /* Warning/Attention (use orange palette) */
  --warning-50: #F5D90A;
  --warning-100: #FAA42B;
  --warning-500: #FF9E00;
  --warning-700: #FF7000;
  
  /* Error/Danger */
  --error-500: #DC2626;
  --error-700: #B91C1C;
  
  /* Neutral */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
}
```

### Color Usage Guidelines

#### For Market Signals
| Signal Type | Color | Hex | Usage |
|-------------|-------|-----|-------|
| **Strong Growth** | Green 700 | `#16A34A` | Sector growing >10% |
| **Moderate Growth** | Green 500 | `#22C55E` | Sector growing 5-10% |
| **Stable** | Gray 500 | `#6B7280` | Sector change <5% |
| **Moderate Decline** | Orange 500 | `#FF9E00` | Sector declining -5 to -10% |
| **Strong Decline** | Orange 700 | `#FF7000` | Sector declining >10% |

#### For UI Elements
| Element | Color | Hex |
|---------|-------|-----|
| Primary buttons | Brand Primary | `#FF7000` |
| Secondary buttons | Gray 700 | `#374151` |
| Success buttons | Green 700 | `#16A34A` |
| Warning buttons | Orange 500 | `#FF9E00` |
| Danger buttons | Error 500 | `#DC2626` |
| Links | Brand Primary | `#FF7000` |

---

## Typography System

The Mistral charter uses clean, modern typography. Based on the logo's pixel-grid aesthetic:

### Font Stack
```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'Monaco', monospace;
}
```

### Type Scale (Matches Pixel Grid Aesthetic)
```css
:root {
  --text-xs: 0.75rem;   /* 12px - Captions */
  --text-sm: 0.875rem;  /* 14px - Secondary */
  --text-base: 1rem;    /* 16px - Body */
  --text-lg: 1.125rem;  /* 18px - Large text */
  --text-xl: 1.25rem;   /* 20px - Headings */
  --text-2xl: 1.5rem;   /* 24px - Section headings */
  --text-3xl: 1.875rem; /* 30px - Page titles */
}
```

### Font Weights
```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

---

## Spacing System

The logo uses a **16px pixel grid** (each square is 16x16 with 2px rounded corners).

### Spacing Scale (4px base, matching 16px grid)
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px - Base unit (matches logo grid) */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

---

## Logo Usage

### Primary Logo (Orange)
- **File**: `logo-b2bmax-charte-mistral.svg`
- **Use**: Main brand identity
- **Colors**: Orange palette (#FF7000 primary)
- **M Shape**: Gradient from yellow to orange

### Alternative Logo (Green)
- **File**: `logo-b2bmax-version-verte.svg`
- **Use**: For contexts where green is more appropriate (growth, success)
- **Colors**: Green palette (#16A34A primary)
- **M Shape**: Gradient from light green to dark green

### Logo Sizes
- **Default**: 526 x 130px
- **Small**: Scale proportionally
- **Minimum**: 100px width

### Logo Clear Space
- Maintain **16px** padding around logo (matches grid unit)
- No other elements in this space

---

## Component Styles Based on Charter

### Buttons
```css
/* Primary Button - Mistral Orange */
.btn-primary {
  background: var(--brand-primary);
  color: white;
  border-radius: 0.25rem; /* 4px - matches logo corner radius */
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-medium);
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: var(--brand-primary-dark);
}

/* Secondary Button - Green */
.btn-secondary {
  background: var(--brand-accent);
  color: white;
  border-radius: 0.25rem;
  padding: var(--space-2) var(--space-4);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 0.5rem; /* 8px */
  padding: var(--space-4);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid var(--gray-200);
}

/* Market Signal Card */
.card-signal {
  border-left: 4px solid var(--brand-primary);
}

.card-signal.growth {
  border-left-color: var(--success-700);
}

.card-signal.decline {
  border-left-color: var(--warning-700);
}
```

### Chat Bubble
```css
/* User Message */
.chat-bubble-user {
  background: var(--brand-primary);
  color: white;
  border-radius: 0.5rem;
  padding: var(--space-3);
  margin-left: auto;
  max-width: 80%;
}

/* AI Message */
.chat-bubble-ai {
  background: var(--gray-100);
  color: var(--gray-800);
  border-radius: 0.5rem;
  padding: var(--space-3);
  margin-right: auto;
  max-width: 80%;
}

/* Data Card in Chat */
.chat-data-card {
  background: linear-gradient(135deg, var(--brand-primary-light), var(--brand-primary));
  color: white;
  border-radius: 0.5rem;
  padding: var(--space-4);
  margin: var(--space-2) 0;
}
```

---

## Adaptation Notes for B2BMax

### What to Keep from Mistral Charter
1. **Orange primary color** (#FF7000) - Strong brand identity
2. **Pixel grid aesthetic** - Clean, structured, technical
3. **Gradient M shape** - Recognizable brand element
4. **Professional tone** - B2B appropriate

### What to Adapt
1. **Green palette** - Use for positive market signals (growth)
2. **Orange palette** - Use for warnings and attention states
3. **Neutral grays** - For balance and readability
4. **Semantic colors** - Map to market signal meanings

### What to Avoid
1. **Overusing gradients** - Use sparingly for emphasis
2. **Too many colors** - Stick to primary palettes
3. **Playful elements** - Maintain professional B2B tone
4. **Complex animations** - Keep interactions subtle

---

## Implementation Checklist

- [ ] Update `FRONTEND_DESIGN_PRINCIPLES.md` with Mistral colors
- [ ] Create Tailwind CSS config with custom palette
- [ ] Add logo files to `/public` directory
- [ ] Implement color variables in CSS/SCSS
- [ ] Create component library with charter styles
- [ ] Test color contrast for accessibility
- [ ] Document logo usage guidelines

---

## References

- **Mistral AI Brand**: https://mistral.ai/
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Tailwind CSS**: https://tailwindcss.com/
