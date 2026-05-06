# NOIR RIDE - API Documentation

## Overview

Backend API built with NestJS, PostgreSQL, and TypeORM. Provides complete booking system with pricing management, seat control, and admin panel.

## Base URL

```
Development: http://localhost:3001
```

## Endpoints

### Pricing

#### Get Hourly Pricing
```
GET /pricing/hourly
```

**Response:**
```json
[
  {
    "id": "uuid",
    "vehicleClass": "business",
    "vehicleName": "E-Class / BMW 5",
    "pricePerHour": 3000,
    "minimumHours": 3,
    "isActive": true
  }
]
```

#### Get Airport Pricing
```
GET /pricing/airport
GET /pricing/airport/:code  (e.g., /pricing/airport/SVO)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "airportCode": "SVO",
    "airportName": "Sheremetyevo",
    "vehicleClass": "business",
    "vehicleName": "E-Class / BMW 5",
    "price": 6000,
    "direction": "to_airport",
    "isActive": true
  }
]
```

#### Get Intercity Pricing
```
GET /pricing/intercity
```

**Response:**
```json
[
  {
    "id": "uuid",
    "vehicleClass": "business",
    "vehicleName": "E-Class / BMW 5",
    "pricePerKm": 80,
    "isActive": true
  }
]
```

#### Seed Pricing Data
```
GET /pricing/seed
```

---

### Bookings

#### Create Booking
```
POST /bookings
Content-Type: application/json
```

**Request Body:**
```json
{
  "serviceType": "intercity",
  "from": "Москва",
  "to": "Санкт-Петербург",
  "departureDate": "2026-05-15",
  "departureTime": "08:00",
  "vehicleType": "Business",
  "passengers": 2,
  "customerName": "Иван Иванов",
  "customerEmail": "ivan@example.com",
  "customerPhone": "+79991234567",
  "notes": "Optional notes",
  "routeId": "uuid" // Optional, for intercity routes
}
```

**Response:**
```json
{
  "id": "uuid",
  "serviceType": "intercity",
  "from": "Москва",
  "to": "Санкт-Петербург",
  "departureDate": "2026-05-15",
  "departureTime": "08:00",
  "vehicleType": "Business",
  "passengers": 2,
  "price": 20000,
  "status": "pending",
  "customerName": "Иван Иванов",
  "customerEmail": "ivan@example.com",
  "customerPhone": "+79991234567",
  "notes": "Optional notes",
  "routeId": "uuid",
  "createdAt": "2026-05-05T14:00:00.000Z",
  "updatedAt": "2026-05-05T14:00:00.000Z"
}
```

#### Get All Bookings
```
GET /bookings
```

#### Get Booking by ID
```
GET /bookings/:id
```

#### Update Booking Status
```
PATCH /bookings/:id/status
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed" // pending, confirmed, cancelled, completed
}
```

#### Delete Booking
```
DELETE /bookings/:id
```

---

### Routes

#### Get All Routes
```
GET /bookings/routes
```

**Response:**
```json
[
  {
    "id": "uuid",
    "from": "Москва",
    "to": "Санкт-Петербург",
    "distanceKm": 700,
    "pricePerSeat": 10000,
    "totalSeats": 4,
    "isActive": true
  }
]
```

#### Get Available Seats
```
GET /bookings/availability?routeId=uuid&date=2026-05-15
```

**Response:**
```json
{
  "routeId": "uuid",
  "date": "2026-05-15",
  "totalSeats": 4,
  "bookedSeats": 1,
  "availableSeats": 3
}
```

#### Seed Routes
```
GET /bookings/routes/seed
```

---

### Admin Panel (Protected with JWT)

All admin endpoints require JWT authentication. Add the token to the `Authorization` header:

```
Authorization: Bearer <token>
```

#### Login
```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@noirride.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "email": "admin@noirride.com",
    "name": "Admin"
  }
}
```

#### Get Statistics
```
GET /admin/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalBookings": 15,
  "pendingBookings": 5,
  "confirmedBookings": 8,
  "completedBookings": 2,
  "totalRevenue": 150000
}
```

#### Get All Bookings (Admin)
```
GET /admin/bookings
GET /admin/bookings?status=pending
Authorization: Bearer <token>
```

#### Update Booking (Admin)
```
PATCH /admin/bookings/:id
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "confirmed",
  "price": 25000
  // ... any booking field
}
```

#### Delete Booking (Admin)
```
DELETE /admin/bookings/:id
Authorization: Bearer <token>
```

#### Manage Routes (Admin)
```
GET /admin/routes
POST /admin/routes
PATCH /admin/routes/:id
DELETE /admin/routes/:id
Authorization: Bearer <token>
```

#### Update Pricing (Admin)
```
PATCH /admin/pricing/hourly/:id
PATCH /admin/pricing/airport/:id
PATCH /admin/pricing/intercity/:id
Authorization: Bearer <token>
```

**Request Body Example:**
```json
{
  "price": 7000,
  "isActive": true
}
```

---

## Data Models

### VehicleClass Enum
- `business` - E-Class, BMW 5
- `premium` - S-Class 222, BMW 7
- `minivan` - Mercedes V-Class
- `luxury` - S-Class W223, G-Class

### ServiceType Enum
- `intercity` - Intercity rides
- `airport` - Airport transfers
- `hourly` - Hourly rental

### BookingStatus Enum
- `pending` - Awaiting confirmation
- `confirmed` - Confirmed by admin
- `cancelled` - Cancelled
- `completed` - Trip completed

---

## Initial Data

### Default Admin User
```
Email: admin@noirride.com
Password: admin123456
```

**⚠️ IMPORTANT: Change this password in production!**

### Pricing Data

**Hourly Rental:**
- Business (E-Class / BMW 5): 3000₽/hour (minimum 3 hours)
- Minivan (Mercedes V-Class): 5000₽/hour
- Luxury (G-Class / S-Class): 8000₽/hour

**Airport Transfer (SVO):**
- Business (E-Class / BMW 5): 6000₽
- Premium (S-Class 222 / BMW 7): 8000₽
- Minivan (Mercedes V-Class): 10000₽
- Luxury (S-Class W223 / G-Class): 12500₽

**Intercity:**
- Business: 80₽/km
- Premium: 100₽/km
- Minivan: 120₽/km
- Luxury: 150₽/km

### Default Routes
- Москва → Санкт-Петербург (700км, 10000₽ per seat, 4 seats)
- Санкт-Петербург → Москва (700км, 10000₽ per seat, 4 seats)

---

## Frontend Integration

### Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API Client

The frontend includes a TypeScript API client at `frontend/lib/api/client.ts` with full type safety.

**Example Usage:**
```typescript
import { apiClient } from '@/lib/api/client';

// Get pricing
const hourlyPricing = await apiClient.getHourlyPricing();

// Create booking
const booking = await apiClient.createBooking({
  serviceType: 'intercity',
  from: 'Moscow',
  to: 'Saint Petersburg',
  // ...
});

// Check seat availability
const availability = await apiClient.getAvailableSeats(routeId, '2026-05-15');
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Phone Number Validation

Phone numbers must be in E.164 format:
- Start with `+` (optional)
- 1-15 digits
- Examples: `+79991234567`, `79991234567`

---

## Database

### PostgreSQL Connection
```
Host: localhost
Port: 5432
Database: noir_ride
Username: noir_admin
Password: noir_password_2026
```

### pgAdmin
```
URL: http://localhost:5050
Email: admin@noirride.com
Password: admin
```

### Docker Commands
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f

# Reset database (WARNING: deletes all data)
docker-compose down -v && docker-compose up -d
```

---

## Development

### Start Services
```bash
# Start database
docker-compose up -d

# Start backend (port 3001)
cd backend
npm run start:dev

# Start frontend (port 3000)
cd frontend
npm run dev
```

### Seed Initial Data
```bash
# Pricing data
curl http://localhost:3001/pricing/seed

# Routes
curl http://localhost:3001/bookings/routes/seed

# Admin user
curl http://localhost:3001/auth/seed-admin
```

---

## Security Notes

1. **Change default admin password** in production
2. **Update JWT_SECRET** in `backend/.env`
3. **Enable HTTPS** in production
4. **Set up rate limiting** for public endpoints
5. **Validate all user input** on both frontend and backend
6. **Use environment-specific CORS** settings

---

## Next Steps

1. **Admin Panel UI** - Create React admin dashboard for managing bookings, routes, and pricing
2. **Email Notifications** - Send confirmation emails to customers
3. **SMS Notifications** - Send SMS to customers and drivers
4. **Payment Integration** - Add Stripe/PayPal for online payments
5. **Driver Management** - Add driver accounts and assignment system
6. **Analytics Dashboard** - Revenue, popular routes, customer metrics
7. **Multi-language Support** - Extend translations for all messages
8. **File Uploads** - Allow customers to upload documents
9. **Real-time Updates** - WebSocket support for live booking status
10. **Mobile App** - React Native app for customers and drivers
