# NOIR RIDE - Premium Chauffeur Service

A luxury chauffeur service website with a **minimal, high-end aesthetic**.

## Design Principles

- **Minimalism** - Clean, uncluttered, no noise
- **Luxury** - Large typography, generous spacing
- **Premium** - Dark theme with gold accents
- **No cheap elements** - No emojis, no colorful icons

## Color System

- **Primary**: #0B0B0B (Black)
- **Secondary**: #1A1A1A (Graphite)
- **Accent**: #C9A15D (Gold) — used sparingly (max 5%)
- **Text**: #EAEAEA (Soft white)

## Layout

- **Max width**: 1200px
- **Padding**: 24-32px
- **Section spacing**: 100-140px
- **Navbar height**: 80px

## Features

- **Next.js 14** with App Router
- **Multi-language** (RU + EN)
- **Minimal UI** - No clutter, premium feel
- **Responsive** - Mobile-first approach

## Pages

- **Home** - Hero + booking card, services, fleet, why us
- **Routes** - Moscow ↔ Saint Petersburg with seat availability
- **Airport** - Clean pricing by car type
- **Hourly** - Simple pricing table
- **Account** - Minimal booking list

## Services & Pricing

### Intercity Routes
- Moscow ↔ Saint Petersburg: 10,000₽ per seat

### Airport Transfer
- Business: 4,000₽
- Minivan: 6,000₽
- G-Class: 10,000₽

### Hourly Rental
- Minimum: 3 hours
- Business: 3,000₽/h
- Minivan: 5,000₽/h
- G-Class: 8,000₽/h

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: SCSS with CSS Modules
- **i18n**: next-intl
- **Language**: TypeScript

## SCSS Architecture

This project uses a structured SCSS architecture with:
- **Variables**: Centralized design tokens (colors, spacing, typography, breakpoints)
- **Mixins**: Reusable patterns (responsive, effects, animations)
- **Functions**: Helper utilities (rem converter, color functions)
- **CSS Modules**: Component-scoped styles with nesting

See [SCSS_ARCHITECTURE.md](./SCSS_ARCHITECTURE.md) for detailed documentation.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Design Details

### Typography
- Headlines: 3-8rem (responsive)
- Body: 1-1.5rem
- Font weight: 300-600

### Spacing
- Sections: 100-140px vertical
- Elements: 24-32px padding
- Generous white space

### Interactions
- Hover transitions: 0.3s
- Subtle glow on hover (gold)
- No heavy animations

### Mobile
- Fully responsive
- Sticky CTA on mobile
- Clean navigation

## Components

- `Navbar` - Transparent with blur, 80px height
- `Hero` - Split layout (text + booking card)
- `Services` - 3 minimal columns
- `Fleet` - Full-width car images with overlay
- `WhyUs` - 3 text blocks, no cards
- `Footer` - Minimal, essential links

## Color Usage

Gold accent (#C9A15D) is used for:
- Logo accent
- CTA buttons
- Hover states
- Price highlights
- Status indicators

Maximum 5% of screen should be gold.

## Philosophy

The design avoids:
- Startup SaaS look
- Generic UI templates
- Clutter and noise
- Bright colors
- Heavy animations

The design embraces:
- High-end luxury brands
- Minimal elegance
- Professional aesthetic
- Generous spacing
- Premium feel

## License

© 2026 NOIR RIDE. All rights reserved.