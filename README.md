# NOIR RIDE - Premium Chauffeur Service

A luxury chauffeur service platform with **minimal, high-end aesthetic**.

## 🏗️ Project Structure

This is a **monorepo** containing:

```
noir-ride/
├── frontend/          # Next.js 14 (React, SCSS, TypeScript)
├── backend/           # NestJS (Node.js, TypeScript)
└── package.json       # Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- npm 10.x or higher

### Installation

```bash
# Install dependencies for both apps
npm run install:all

# Or install concurrently for root scripts
npm install
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:frontend    # Frontend: http://localhost:3000
npm run dev:backend     # Backend: http://localhost:3001
```

### Build

```bash
# Build both apps
npm run build

# Or build separately:
npm run build:frontend
npm run build:backend
```

### Production

```bash
# Start both apps in production mode
npm start
```

---

## 📦 Frontend (Next.js 14)

Premium Next.js application with luxury dark theme.

**Tech Stack:**
- **Framework**: Next.js 14 (App Router)
- **Styling**: SCSS with CSS Modules
- **i18n**: next-intl (RU + EN)
- **Language**: TypeScript

**Features:**
- ✨ Luxury dark theme (black, graphite, gold)
- 🌍 Multi-language support (Russian + English)
- 📱 Fully responsive design
- 🎬 Video background with parallax effect
- 💎 Glass-morphism UI components
- ⚡ Optimized performance with GPU acceleration

**Pages:**
- Home - Hero with booking, services, fleet
- Routes - Intercity rides (Moscow ↔ Saint Petersburg)
- Airport - Airport transfer pricing
- Hourly - Hourly rental rates
- Account - Booking history

**Location:** `./frontend/`

[See Frontend README](./frontend/README.md) for more details.

---

## 🛡️ Backend (NestJS)

RESTful API for booking management, payments, and business logic.

**Tech Stack:**
- **Framework**: NestJS
- **Language**: TypeScript
- **Architecture**: Modular, SOLID principles

**Features:**
- 🔐 Authentication & Authorization
- 📊 Booking management
- 💳 Payment processing
- 🚗 Fleet management
- 📍 Route management

**Location:** `./backend/`

[See Backend README](./backend/README.md) for more details.

---

## 🎨 Design System

### Color Palette
- **Primary**: `#0B0B0B` (Deep Black)
- **Secondary**: `#1A1A1A` (Graphite)
- **Accent**: `#C9A15D` (Gold) — used sparingly (~5%)
- **Text**: `#EAEAEA` (Soft White)

### Typography
- **Font**: Inter (all weights 300-900)
- **Headlines**: Extra Bold (800), tight letter-spacing
- **Body**: Regular (400-600)

### Layout
- **Max Width**: 1200px
- **Padding**: 24-32px
- **Section Spacing**: 100-140px
- **Mobile-first**: Responsive breakpoints

---

## 📚 Documentation

- [Frontend Architecture](./frontend/SCSS_ARCHITECTURE.md)
- [Design System](./frontend/DESIGN_SYSTEM.md)
- [Development Guide](./frontend/DEVELOPMENT.md)

---

## 🛠️ Scripts Reference

### Root Level
- `npm run dev` - Run both frontend & backend
- `npm run build` - Build both apps
- `npm run start` - Start production servers
- `npm run install:all` - Install all dependencies

### Frontend Only
- `npm run dev:frontend` - Start Next.js dev server
- `npm run build:frontend` - Build Next.js app

### Backend Only
- `npm run dev:backend` - Start NestJS dev server
- `npm run build:backend` - Build NestJS app

---

## 📝 Environment Variables

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend `.env`
```env
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

---

## 📄 License

© 2026 NOIR RIDE. All rights reserved.

---

## 🔗 Links

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **API Docs**: [http://localhost:3001/api](http://localhost:3001/api)
