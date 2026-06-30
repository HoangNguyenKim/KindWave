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
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#9d4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff8e4d'
  on-tertiary-container: '#6d2d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1280px
---

## Brand & Style
The design system is built on the pillars of transparency, collective action, and radical empathy. It adopts a **Corporate Modern** aesthetic infused with **Minimalist** clarity to ensure that the mission—helping others—remains the focal point without visual clutter.

The target audience spans from individual grassroots donors to large-scale non-profit organizers. The UI evokes a sense of "optimistic reliability," using wide apertures of whitespace and a vibrant, nature-inspired palette to signal growth and safety. Every interaction is designed to feel effortless and honest, reinforcing the platform's commitment to traceable, impactful giving.

## Colors
The color strategy employs **Kindness Green** (#22C55E) as the primary driver for success states, primary actions, and financial growth indicators. **Trust Blue** (#3B82F6) supports the infrastructure, used for links, information callouts, and verification badges to instill a sense of institutional stability. **Action Orange** (#F97316) is reserved exclusively for high-urgency triggers, such as "Donate Now" or "Ending Soon" countdowns.

The background uses a cool-toned Slate (#F8FAFC) to provide a soft contrast against pure white cards. In dark mode, the system pivots to a deep navy foundation to maintain readability and reduce eye strain during long-form reading of campaign stories.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic and highly legible interface. The typographic scale is "airy," prioritizing generous line heights (1.5x for body text) to make campaign descriptions easy to digest. 

Headlines use tighter letter spacing and heavier weights to anchor the page, while labels utilize a slightly increased tracking and medium weight to distinguish metadata (like "Goal Reached" or "Days Left") from standard body prose. For mobile, display sizes are scaled down aggressively to prevent awkward text wrapping in campaign titles.

## Layout & Spacing
The design system follows a **Fixed Grid** model on desktop, centered within a 1280px container to ensure readability on ultra-wide monitors. It utilizes a 12-column structure with 24px gutters.

- **Mobile (< 768px):** 4-column grid, 16px side margins. Elements stack vertically.
- **Tablet (768px - 1024px):** 8-column grid, 24px margins. Sidebar content typically reflows below primary campaign details.
- **Desktop (> 1024px):** 12-column grid. Layout focuses on a "Primary + Sidebar" split for donation flows (8 cols for story, 4 cols for the donation card).

Spacing follows a strict 8px linear scale. Large sections (like the transition from a hero header to the campaign grid) use `xl` (80px) padding to create a distinct "breathable" separation.

## Elevation & Depth
Depth in this design system is communicated through **Ambient Shadows** and tonal layering. The goal is to make interactive elements feel "lifted" and approachable.

- **Level 0 (Background):** #F8FAFC. The canvas.
- **Level 1 (Cards/Surface):** White background with a 1px stroke (#E2E8F0) and a very soft, diffused shadow (Y: 4px, Blur: 20px, Opacity: 4% Black).
- **Level 2 (Active/Hover):** When a user interacts with a card, the shadow deepens (Y: 8px, Blur: 30px, Opacity: 8% Black) to simulate the card moving toward the user.
- **Sticky Elements:** The navbar uses a backdrop-blur (12px) with a semi-transparent white fill (80% opacity) to maintain context of the content scrolling beneath it while remaining legible.

## Shapes
The shape language is defined by **Rounded** geometry (16px / 1rem for main cards). This high degree of corner rounding softens the "corporate" edge of the platform, making it feel more community-oriented and friendly.

- **Small elements (Checkboxes, Tags):** 4px (0.25rem)
- **Buttons and Inputs:** 8px (0.5rem)
- **Campaign Cards & Modals:** 16px (1rem)
- **Progress Bar Containers:** 100px (Pill-shaped) to represent fluidity and momentum.

## Components
- **Buttons:** Primary buttons use a solid Kindness Green fill with white text and 8px rounded corners. The "Donate" button specifically may use Action Orange.
- **Progress Bars:** A thick, 12px height track in light grey (#F1F5F9) with a Kindness Green fill indicating the percentage. Include a subtle glow on the tip of the filled area.
- **Statistic Cards:** Simplified cards with a `label-sm` header, a `headline-lg` numeric value, and a small sparkline or icon indicating trend.
- **Modern Tables:** Remove all vertical borders. Use 1px horizontal dividers. Header row should be in `label-sm` with a light grey background.
- **Sticky Navbar:** 72px height, blur effect, containing the logo, search bar, and a prominent "Start a Wave" call-to-action button.
- **Facebook-style Comments:** Threaded layout with circular avatars (32px). Background of the comment bubble should be a light neutral (#F1F5F9) to separate it from the white card surface.
- **Verification Badges:** Small 16px blue circles with a white checkmark, placed adjacent to organizer names to signify "Trust."