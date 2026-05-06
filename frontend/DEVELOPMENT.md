# NOIR RIDE - Deployment & Development Notes

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - will auto-redirect to `/ru`

## Project Status: ✅ COMPLETE

All requested features have been implemented:

### ✅ Completed Features

1. **Next.js 14 with App Router** - Modern React framework
2. **TailwindCSS 4** - Luxury dark theme (black, graphite, gold)
3. **Multi-language (RU/EN)** - Using next-intl
4. **Responsive Design** - Mobile-first approach
5. **All Pages Created**:
   - Home (Hero, Services, Fleet, Booking)
   - Routes (Intercity transportation)
   - Airport Transfer
   - Hourly Rental
   - Account (Bookings, Profile, Settings)
6. **API Routes**:
   - `/api/booking` - Booking management
   - `/api/payment` - Payment processing (mock)
7. **Pricing Logic** - Calculated in `lib/pricing.ts`
8. **Clean Architecture** - Reusable components, type safety

## Color Scheme

- **Primary**: Black (#0a0a0a)
- **Secondary**: Graphite (#2a2a2a)
- **Accent**: Gold (#d4af37)
- **Text**: Light gray (#f5f5f5)

## Services & Pricing

### Intercity Routes
- Moscow ↔ Saint Petersburg
- **Price**: 10,000₽ per seat
- **Duration**: 8 hours (700 km)

### Airport Transfer
- **Business**: 4,000₽
- **Premium**: 6,000₽  
- **Luxury**: 10,000₽

### Hourly Rental
- **Minimum**: 3 hours
- **Business**: 3,000₽/h
- **Premium**: 5,000₽/h
- **Luxury**: 8,000₽/h

## Known Notes

- Dev server runs on port 3000
- Middleware deprecation warning (Next.js 16 transition) - non-critical
- All pages are fully functional
- Booking form posts to API successfully
- Language switching works perfectly

## Design Philosophy

Inspired by **Peaky Blinders** aesthetic:
- Minimalistic and elegant
- Dark luxury theme
- Gold accents for premium feel
- Smooth animations
- Professional typography

## Next Steps (Optional Enhancements)

- Add database integration (PostgreSQL/MongoDB)
- Implement authentication (NextAuth.js)
- Add payment gateway (Stripe/PayPal)
- Create admin panel
- Add email notifications
- Implement booking confirmation emails
- Add real-time availability checking
- SEO optimization
- Performance monitoring

## File Structure

```
noir-ride/
├── app/
│   ├── [locale]/        # Localized pages
│   ├── api/             # API endpoints
│   ├── components/      # Reusable UI components
│   └── globals.css      # Global styles
├── lib/                 # Utility functions
├── types/               # TypeScript definitions
├── messages/            # i18n translations
├── i18n.ts             # i18n config
└── middleware.ts       # Locale routing
```

## Technologies Used

- **Next.js 16.2.4** (App Router)
- **React 19.2.4**
- **TypeScript 5**
- **TailwindCSS 4**
- **next-intl** (i18n)
- **Node.js 22.4.0**

---

**Status**: Ready for development/deployment
**Last Updated**: April 28, 2026
