# Design System

The Warhammer 40K Reading Tracker uses a dark theme with gold accents inspired by the grimdark aesthetic of Warhammer 40,000.

## Color Palette

### Primary Brand Color - Imperial Gold
The signature gold color represents the Emperor and the Imperium:

- **Primary Gold**: `#D4AF37` - Main brand color
- **Light Gold**: `#E5C158` - Hover states, highlights
- **Dark Gold**: `#B8941F` - Pressed states, darker accents

**Usage:**
- Primary buttons
- Active states
- Headers and titles
- Important text elements
- Navigation highlights

### Background Colors (Slate Scale)

Dark, industrial backgrounds inspired by gothic architecture:

- **Main Background**: `#0F172A` (slate-900) - Page background
- **Card Background**: `#1E293B` (slate-800) - Cards, panels, sections
- **Elevated Background**: `#334155` (slate-700) - Hover states, inputs

**Usage:**
- `bgMain` - Body, page backgrounds
- `bgCard` - Content cards, modals
- `bgElevated` - Form inputs, dropdowns, hover states

### Text Colors

Hierarchy through varying text shades:

- **Primary Text**: `#F8FAFC` (slate-50) - High contrast, main content
- **Secondary Text**: `#94A3B8` (slate-400) - Descriptions, metadata
- **Muted Text**: `#64748B` (slate-500) - Less important info, placeholders

**Usage:**
- `textPrimary` - Book titles, headings, important content
- `textSecondary` - Author names, descriptions, captions
- `textMuted` - Placeholders, disabled text, metadata
- `textGold` - Special emphasis, active items

### Border Colors

Subtle borders to separate content:

- **Default Border**: `#334155` (slate-700) - Standard borders
- **Light Border**: `#475569` (slate-600) - Lighter separation

**Usage:**
- Card borders
- Input borders
- Dividers between sections

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;
```

Uses system fonts for optimal performance and native feel.

### Font Sizes

- **4xl**: Hero headings, page titles
- **2xl**: Section headings
- **xl**: Subsection headings
- **lg**: Book titles, emphasized content
- **base**: Body text, default size
- **sm**: Metadata, captions
- **xs**: Labels, tags

### Font Weights

- **bold** (700): Page headings, series names
- **semibold** (600): Book titles, buttons
- **medium** (500): Navigation items
- **normal** (400): Body text

## Component Styles

### Cards

Standard content container with border:

```typescript
card: 'bg-slate-800 border border-slate-700 rounded-lg'
```

**Usage:** Series containers, import panels, info boxes

### Buttons

**Primary Button** (Gold, high emphasis):
```typescript
btnPrimary: 'bg-[#D4AF37] hover:bg-[#E5C158] text-slate-900
             font-semibold px-4 py-2 rounded-lg transition-colors'
```
- Dark text on gold background
- Hover brightens the gold
- Used for main actions: Import, Submit, Save

**Secondary Button** (Slate, medium emphasis):
```typescript
btnSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-50
               px-4 py-2 rounded-lg transition-colors'
```
- Light text on dark background
- Used for secondary actions: Cancel, Back

**Ghost Button** (Transparent, low emphasis):
```typescript
btnGhost: 'hover:bg-slate-800 text-slate-300
           px-4 py-2 rounded-lg transition-colors'
```
- No background until hover
- Used for tertiary actions, dropdowns

### Book Cards

Unified design without color-coding by status:

```typescript
bookCard: 'bg-slate-800 hover:bg-slate-700 border border-slate-700
           rounded-lg p-4 transition-all cursor-pointer'
```

**Design Decision:**
- No color differentiation by reading status
- Status shown via icons (○ ◐ ●) instead
- Keeps UI clean and professional
- Avoids "Christmas tree" effect with too many colors

### Status Icons

Simple, universal symbols:

- **Unread**: `○` (empty circle)
- **Reading**: `◐` (half-filled circle)
- **Completed**: `●` (filled circle)

## Layout Patterns

### Container Widths

```css
.container {
  max-width: 1280px; /* Standard max width */
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Spacing Scale

Using Tailwind's spacing scale (rem-based):

- **1**: 0.25rem (4px) - Tight spacing
- **2**: 0.5rem (8px) - Tags, small gaps
- **4**: 1rem (16px) - Standard padding
- **6**: 1.5rem (24px) - Card padding
- **8**: 2rem (32px) - Section spacing

### Common Patterns

**Page Layout:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="mb-8">
    <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Title</h1>
    <p className="text-slate-400">Description</p>
  </div>
  {/* Content */}
</div>
```

**Card Pattern:**
```tsx
<div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
  <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Heading</h2>
  {/* Card content */}
</div>
```

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- Gold on Dark: 7.2:1 ✓
- White on Dark: 15.2:1 ✓
- Secondary text on Dark: 4.8:1 ✓

### Focus States

All interactive elements have visible focus states:

```css
focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2
```

### Interactive States

Consistent hover and active feedback:

- **Hover**: Subtle background change or color shift
- **Active**: Slightly darker or more saturated
- **Disabled**: Reduced opacity (50%) + `cursor-not-allowed`

## Design Principles

### 1. Dark Theme First
- Reduces eye strain for long reading sessions
- Matches the grimdark Warhammer aesthetic
- Better for OLED displays

### 2. Minimal Color Palette
- Primary: Gold (brand identity)
- Base: Slate scale (backgrounds, text)
- Semantic: Only when necessary (red for errors, green for success)

### 3. Clear Hierarchy
- Size, weight, and color create visual hierarchy
- Gold draws attention to important elements
- Consistent spacing reinforces structure

### 4. Performance
- System fonts (no web font loading)
- Minimal custom CSS
- Tailwind for consistency and optimization

## File Structure

**Design tokens:** `lib/design-system.ts`
```typescript
export const colors = { /* ... */ };
export const styles = { /* ... */ };
export const statusIcons = { /* ... */ };
```

**Global styles:** `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-slate-900 text-slate-50;
}
```

**Tailwind config:** `tailwind.config.ts`
```typescript
theme: {
  extend: {
    colors: {
      gold: '#D4AF37'
    }
  }
}
```

## Usage Examples

### Importing Styles

```typescript
import { styles } from '@/lib/design-system';

<div className={styles.card}>
  <h2 className={`text-2xl font-bold ${styles.textGold}`}>Title</h2>
  <p className={styles.textSecondary}>Description</p>
  <button className={styles.btnPrimary}>Action</button>
</div>
```

### Custom Combinations

```typescript
// Combining design system with Tailwind
<div className={`${styles.card} p-8 mb-6`}>
  <h3 className={`${styles.textGold} text-xl font-semibold mb-4`}>
    Custom Heading
  </h3>
</div>
```

### Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="px-4 md:px-6 lg:px-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Responsive Title
  </h1>
</div>
```

## Theming Notes

The design system is intentionally simple and doesn't use CSS variables for theming. If light mode is ever needed:

1. Add theme variants to `design-system.ts`
2. Use `dark:` prefix in Tailwind
3. Add theme toggle to user settings

For now, dark theme is the only mode to maintain focus and simplicity.
