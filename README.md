# Court Booking Platform (MERN Stack)

A full-stack sports facility **court booking system** supporting:

* Multi-resource booking (court + equipment + coach)
* Dynamic pricing (peak hours, weekends, indoor premium, resource fees)
* Admin dashboard for configuration
* Atomic booking logic with equipment availability

---

## 🚀 Features

### **User Features**

* Browse available badminton courts (indoor/outdoor)
* View real-time slot availability
* Book:

  * Court
  * Optional equipment (rackets, shoes)
  * Optional coach
* Live price calculation based on:

  * Peak hours
  * Weekend multiplier
  * Indoor premium pricing
  * Equipment & coach add-ons
* Booking confirmation

### **Admin Features**

* Secure admin login (JWT)
* Manage:

  * Courts (CRUD)
  * Coaches
  * Equipment inventory
  * Pricing rules (enable/disable)
* View all bookings

---

## 🧱 Tech Stack

### **Frontend**

* React + Vite
* Axios
* TailwindCSS
* Context-based auth

### **Backend**

* Node.js + Express
* MongoDB + Mongoose
* JWT Authentication
* Modular pricing + booking engine
* Reservation locks to prevent double booking

---

## 🗄️ Project Structure

```
root
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── utils
│   ├── seed
│   └── server.js
└── frontend
    ├── src
    │   ├── components
    │   ├── pages
    │   ├── context
    │   └── main.jsx
    └── vite.config.js
```

---

## 🛠️ Installation & Setup

### **1. Clone Repository**

```
git clone <repo-url>
cd project-root
```

### **2. Backend Setup**

```
cd server
npm install
```

Create `.env`:

```
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<your-secret>
PORT=4000
```

Start backend:

```
npm run dev
```

### **Seed Initial Data**

```
npm run seed
```

This creates:

* 4 courts
* 3 coaches
* Equipment inventory
* Base pricing rules
* Admin account

### **Admin Login Credentials**

```
email: admin@example.com
password: Admin@123
```

---

## 🎨 Frontend Setup

```
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`

---

## 🧠 Core System Logic

### **Multi-Resource Availability Check**

The booking flow checks:

* Court overlap
* Coach overlap
* Equipment quantity overlap
  All must pass; otherwise booking fails.

### **Dynamic Pricing Engine**

Pricing rules include:

* Peak hours multiplier
* Weekend multiplier
* Indoor court premium
* Equipment fees
* Coach hourly rate

The system returns a full pricing breakdown.

---

## 🔐 API Overview

### **Auth**

* `POST /api/auth/login`

### **Courts**

* `GET /api/courts`
* `POST /api/admin/courts`

### **Availability**

* `GET /api/availability?date=YYYY-MM-DD&startHour=6&endHour=22&slotMinutes=60`

### **Bookings**

* `POST /api/bookings/create`
* `POST /api/bookings/price-preview`

---

## 📦 Deployment

* Backend → Render
* Frontend → Vercel/Netlify

Set environment variables:

```
MONGO_URI
JWT_SECRET
NODE_ENV=production
```

---

## 📹 Demo Assets

Provide:

* Live deployed link
* API screenshots
* Admin dashboard demo
* Booking flow demo

---

## 📝 Author

Created as part of a MERN full-stack assignment.

---

## 🧾 License

MIT
