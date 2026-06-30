---
name: KindWave Extension
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#5c5f61'
  on-tertiary: '#ffffff'
  tertiary-container: '#a9acae'
  on-tertiary-container: '#3d4042'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter-table: 16px
  sidebar-width: 260px
  margin-sm: 8px
  margin-md: 16px
  margin-lg: 24px
---

## Brand & Style

This design system is engineered for high-utility dashboard environments where information density and clarity are paramount. The brand personality is professional, efficient, and reliable, aiming to evoke a sense of focused productivity. 

The visual style draws heavily from **Modern Corporate** and **Minimalist** movements. It prioritizes content over container, utilizing subtle borders and distinct surface-container tiers to organize complex data without adding visual noise. The aesthetic is inspired by the precision of financial interfaces, using white space strategically to prevent cognitive overload while maintaining the compactness required for expert-level tools.

## Colors

The palette is anchored by the primary brand green, used sparingly for primary actions and "Success" states to maintain its impact. 

- **Primary:** `#22C55E` serves as the core action color.
- **Surface-Container Strategy:** We utilize a high-contrast neutral scale. The base background is white (`#FFFFFF`), while the side navigation and secondary panels use a light gray (`#F8FAFC`) to create a clear structural hierarchy.
- **Borders:** A consistent, subtle border color (`#E2E8F0`) is used to define containers and table rows, ensuring elements are distinct without being heavy.
- **Status Colors:** Functional colors are tuned for high legibility against white and light gray backgrounds, ensuring status badges are immediately recognizable.

## Typography

This design system relies exclusively on **Inter** to provide a systematic, utilitarian feel. The type scale is optimized for information density, favoring smaller sizes (13px and 14px) for data-heavy views to maximize content visibility.

- **Headlines:** Use tighter letter-spacing and semi-bold weights to anchor page sections.
- **Body Text:** Standardized at 14px for optimal balance between readability and space efficiency.
- **Labels:** Used for table headers and metadata, often employing a slight uppercase treatment to differentiate from interactive data.
- **Monospaced elements:** While not the primary font, numerical data in tables should utilize tabular num features of Inter to ensure vertical alignment.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. The side navigation is fixed at 260px, while the main content area occupies the remaining width with a maximum container limit to ensure readability on ultra-wide monitors.

- **Rhythm:** A 4px baseline grid governs all spacing.
- **Side Navigation:** Uses 16px horizontal padding for items and 8px vertical spacing between menu groups.
- **Data Tables:** Cell padding is set to 12px vertically and 16px horizontally to maintain high density while providing enough "breathing room" for the eye to track rows.
- **Breakpoints:**
  - **Desktop (1280px+):** Full side navigation expanded.
  - **Tablet (768px - 1279px):** Side navigation collapses to icons or moves to a top-level menu; margins reduce to 16px.
  - **Mobile (<767px):** Single column stack; table headers may hide secondary columns.

## Elevation & Depth

This design system avoids heavy shadows in favor of **Tonal Layering** and **Subtle Outlines**. This creates a "flat-plus" look that emphasizes clarity.

- **Level 0 (Background):** Base surface (`#FFFFFF`).
- **Level 1 (Side Nav / Secondary Panels):** Tonal surface (`#F8FAFC`) with a subtle right-side border (`1px solid #E2E8F0`).
- **Level 2 (Cards / Modals):** White surface with a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.1)) and a 1px border.
- **Interactions:** Hover states on list items or table rows use a subtle background tint (`#F1F5F9`) rather than elevation changes.

## Shapes

To maintain a professional and "engineered" feel, the design system utilizes **Soft** roundedness. 

- **Components:** Standard buttons, input fields, and cards use a `0.25rem` (4px) radius.
- **Status Badges:** Use a slightly higher radius (`rounded-lg` or 8px) to distinguish them from interactive buttons.
- **Selection Indicators:** Pill-shaped indicators are reserved only for active navigation states or focus rings.

## Components

### Data Tables
- **Header:** Light gray background (`#F8FAFC`), 12px uppercase labels, 1px bottom border.
- **Rows:** White background, 1px bottom border (`#F1F5F9`). Hover state: `#F8FAFC`.
- **Alignment:** Text is left-aligned; numerical data and currency are right-aligned for easy comparison.

### Side Navigation
- **Default State:** Transparent background, `#64748B` text/icon color.
- **Active State:** `#F1F5F9` background with `#0F172A` text and a 2px vertical "primary green" bar on the left edge.
- **Icons:** 20px size, stroke-based, consistent 1.5px weight.

### Status Badges
Badges use a "Tinted Ghost" style: a subtle background tint with high-contrast text.
- **Active:** Background `rgba(34, 197, 94, 0.1)`, Text `#166534`.
- **Pending:** Background `rgba(245, 158, 11, 0.1)`, Text `#92400E`.
- **Completed:** Background `rgba(59, 130, 246, 0.1)`, Text `#1E40AF`.

### Input Fields
- **Default:** White background, `#E2E8F0` border, 14px Inter text.
- **Focus:** Border color changes to `#22C55E` with a 2px soft green glow (ring).

### Buttons
- **Primary:** Solid `#22C55E` background, white text, no border.
- **Secondary:** White background, `#E2E8F0` border, `#0F172A` text. Hover: `#F8FAFC`.