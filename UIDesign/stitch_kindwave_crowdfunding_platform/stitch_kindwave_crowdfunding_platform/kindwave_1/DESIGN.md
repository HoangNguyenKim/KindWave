---
name: KindWave
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#006b5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00c1ad'
  on-tertiary-container: '#004940'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style
The design system is built for a crowdfunding platform that balances emotional connection with financial rigor. The brand personality is optimistic, transparent, and highly functional. 

The aesthetic draws heavily from **Corporate / Modern** and **Stripe-inspired utility**. It prioritizes clarity through generous whitespace, precise alignment, and a sophisticated use of depth. The goal is to evoke a sense of momentum and security, ensuring users feel confident when contributing to or managing campaigns.

## Colors
The palette is centered around "KindWave Green," a vibrant, growth-oriented primary color. 

- **Primary (#22C55E):** Used for main actions, progress bars, and success states.
- **Secondary/Tertiary:** A range of emeralds and teals provide depth to data visualizations and accented UI elements.
- **Surface (Light):** Uses white (`#FFFFFF`) for primary surfaces and a subtle off-white (`#F8FAFC`) for background fills to define layout sections.
- **Surface (Dark):** Shifts to a deep Slate (`#0F172A`) for backgrounds with slightly lighter Navy (`#1E293B`) for elevated cards.
- **Neutrals:** A scale of Blue-Grays ensures that text and borders remain legible and professional without feeling "muddy."

## Typography
Inter is utilized across all levels to maintain a systematic and utilitarian feel. 

For high-level displays, tight letter spacing and bold weights create a sense of authority. Body text utilizes a standard 1.5x line-height ratio to ensure maximum readability during long campaign descriptions. Labels and "all-caps" utility text should use the defined letter spacing tokens to improve legibility at small sizes.

## Layout & Spacing
The spacing system follows a strict 4px/8px baseline grid. 

- **Desktop:** A 12-column fluid grid with 24px (1.5rem) gutters. Maximum content width is capped at 1280px for readability.
- **Tablet:** 8-column grid with 24px gutters.
- **Mobile:** 4-column grid with 16px (1rem) gutters and side margins.

Vertical rhythm is maintained by using the `md` (16px) and `lg` (24px) spacing units for most component gaps, ensuring a clean, breathable interface.

## Elevation & Depth
Depth is communicated through **Soft Ambient Shadows** and **Low-Contrast Outlines**. 

In Light Mode, cards and containers use a 1px border (`#E2E8F0`) combined with a multi-layered shadow (e.g., `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)`). This "Stripe-like" elevation makes elements appear to sit just above the surface without feeling heavy.

In Dark Mode, shadows are swapped for subtle tonal changes. The background is the darkest layer, and elevated elements use a slightly lighter slate fill with a subtle 1px border (`#334155`) to define edges.

## Shapes
The design system adopts a **Round Eight** philosophy. This 8px (0.5rem) base radius provides a modern, approachable feel that is softer than sharp corporate styles but more professional than fully rounded "bubble" designs.

- **Standard Buttons & Inputs:** 8px (rounded-md).
- **Cards & Large Containers:** 16px (rounded-lg).
- **Outer Shells/Modals:** 24px (rounded-xl).
- **Search Bars/Badges:** Pill-shaped (9999px) where maximum approachability is required.

## Components

### Buttons
Primary buttons use KindWave Green with white text. Hover states shift the background 10% darker. Secondary buttons use a white background with a 1px border and grey text. All buttons feature a subtle inner-glow or shadow to give them a tactile, clickable appearance.

### Input Fields
Inputs are 44px height (large) or 36px (small). They feature an 8px radius and a 1px border. On focus, the border shifts to KindWave Green with a subtle 3px outer glow (ring) of the primary color at 20% opacity.

### Cards
Campaign cards are the heart of the system. They use the `rounded-lg` (16px) radius, white background, and the standard ambient shadow. Content within cards is padded by `lg` (24px) spacing.

### Progress Bars
Used for fundraising goals. The track is a light neutral (`#F1F5F9`), while the indicator is a solid KindWave Green. For campaigns exceeding 100%, use the Secondary Teal color to indicate the "stretch goal" territory.

### Chips & Badges
Small, low-contrast indicators for categories (e.g., "Education," "Health"). Use semi-transparent versions of the accent colors (10% opacity background) with full-saturation text for high legibility and a modern look.

### Icons
Use Lucide icons at a 2px stroke width. Icons should always be sized to a 20px or 24px bounding box to maintain alignment within text and buttons.