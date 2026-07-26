# GearUp 🏋️ — Backend API

**"Rent Sports & Outdoor Gear Instantly"**

GearUp is a backend REST API for a sports and outdoor equipment rental service. Customers can browse gear, place rental orders, and pay via Stripe. Providers manage their gear inventory and fulfill orders. Admins oversee the platform.

---

## 🔗 Links

| Resource            | Link |
|---------------------|------|
| Backend Repo        | https://github.com/your-username/gearup-backend |
| Live API            | https://your-app.vercel.app |
| API Docs (Postman)  | https://documenter.getpostman.com/view/xxx |
| Demo Video          | https://drive.google.com/xxx |

**Admin Credentials**
- Email: `admin@gearup.com`
- Password: `admin123`

---

## 🛠️ Tech Stack

| Technology           | Purpose |
|-----------------------|---------|
| Node.js + Express     | REST API |
| TypeScript            | Type safety |
| PostgreSQL + Prisma   | Database + ORM |
| JWT                   | Authentication |
| Stripe                | Payment processing |
| Zod                    | Input validation |

---

## 👥 Roles

- **Customer** — Browse gear, place rental orders, pay, track status, leave reviews
- **Provider** — Manage gear inventory, view/update incoming orders
- **Admin** — Manage users, oversee all rentals and gear listings

Role is selected during registration.

---

## ⚙️ Setup Instructions

1. Clone the repo

```bash
git clone https://github.com/your-username/gearup-backend.git
cd gearup-backend
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root with:

```
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
PORT=5000
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📋 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user (protected) |

### Categories

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | /api/categories | Get all categories |
| POST | /api/categories | Create category (protected) |

### Gear (Public)

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | /api/gear | Get all gear (filters: category, brand, minPrice, maxPrice, available) |
| GET | /api/gear/:id | Get gear details |

### Rental Orders

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/rentals | Create rental order (Customer) |
| GET | /api/rentals | Get own rental orders |
| GET | /api/rentals/:id | Get rental order details |

### Payments (Stripe)

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/payments/create | Create payment intent |
| POST | /api/payments/confirm | Confirm payment status |
| GET | /api/payments | Get payment history |
| GET | /api/payments/:id | Get payment details |

### Provider

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/provider/gear | Add gear |
| PUT | /api/provider/gear/:id | Update own gear |
| DELETE | /api/provider/gear/:id | Delete own gear |
| GET | /api/provider/gear | Get own gear listings |
| GET | /api/provider/orders | Get incoming orders |
| PATCH | /api/provider/orders/:id | Update order status |

### Reviews

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/reviews | Create review (after RETURNED order) |

### Admin

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | /api/admin/users | Get all users |
| PATCH | /api/admin/users/:id | Suspend/activate user |
| GET | /api/admin/gear | Get all gear listings |
| GET | /api/admin/rentals | Get all rental orders |

---

## 📦 Rental Order Status Flow

```
PLACED -> CONFIRMED -> PAID -> PICKED_UP -> RETURNED
   |
   -> CANCELLED
```

---

## ✅ Key Features

- JWT-based authentication with role-based access control
- Server-side input validation (Zod) on all endpoints
- Consistent error response format: `{ success, message, errorDetails }`
- Real Stripe payment integration (test mode)
- Gear availability & stock checks before order creation
- Ownership checks (providers can only manage their own gear/orders)
