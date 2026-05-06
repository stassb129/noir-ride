<p align="center">
  <h1 align="center">NOIR RIDE Backend API</h1>
</p>

<p align="center">NestJS REST API for premium chauffeur service</p>

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📦 Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Runtime**: Node.js 22+

## 🛠️ Scripts

- `npm run start` - Start in production mode
- `npm run start:dev` - Start with hot-reload
- `npm run start:debug` - Start with debugger
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests

## 📁 Project Structure

```
src/
├── app.controller.ts    # Main controller
├── app.module.ts        # Root module
├── app.service.ts       # Main service
└── main.ts             # Entry point
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3001
```

### Endpoints (Coming soon)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking
- `GET /api/routes` - Get available routes
- `GET /api/fleet` - Get fleet info
- `POST /api/payments` - Process payment

## 🔐 Environment Variables

Create `.env` file:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
```

## 📚 Documentation

Visit [http://localhost:3001/api](http://localhost:3001/api) for Swagger API docs (when implemented).

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

© 2026 NOIR RIDE. All rights reserved.
