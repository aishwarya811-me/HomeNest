<div align="center">

# 🏠 HomeNest — House Rental System
### Version 2.0

**A full-stack web application connecting property owners with renters.**
Find your perfect home or list your property — zero brokerage, zero middlemen.

<br/>

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232A)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=1a1a2e)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white&labelColor=1a1a1a)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white&labelColor=1a1a1a)](https://sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=1a1a1a)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white&labelColor=1a1a1a)](https://jwt.io/)
[![Version](https://img.shields.io/badge/Version-2.0.0-EA580C?style=flat-square)](/)

<br/>

[🚀 Getting Started](#-getting-started) •
[✨ Features](#-features) •
[🛠 Tech Stack](#-tech-stack) •
[📡 API Reference](#-api-reference) •
[📁 Project Structure](#-project-structure) •
[🆕 What's New in v2.0](#-whats-new-in-v20)

</div>

---

## 📌 About The Project

**HomeNest** is a full-stack rental platform built to connect property owners directly with renters — without any broker involvement. Version 2.0 brings major upgrades including email OTP verification, ratings & reviews, real-time notifications, advanced filters, rent calculator, camera upload, and much more.

```
Owner  →  Lists property with photos, rules, amenities & special features
Renter →  Browses, filters, bookmarks, reviews & contacts owner directly
Result →  Zero brokerage. Direct connection. Smarter decisions.
```

---

## 🆕 What's New in v2.0

| Feature | Description |
|---------|-------------|
| 📧 Email OTP Verification | 6-digit OTP on register & password reset (dev mode shows OTP on screen) |
| 🔑 Forgot / Reset Password | OTP-based secure password recovery flow |
| 👤 Profile Page | View & edit name, phone, change password |
| ⭐ Ratings & Reviews | Renters rate properties 1–5 stars, owners can reply |
| 🔔 Notification Bell | Real-time badge for contact requests and new reviews |
| 🔗 Share Property | WhatsApp share + copy link button on every listing |
| 🚩 Report Property | Flag fake or misleading listings |
| 🕐 Recently Viewed | Last 5 visited properties shown on Browse page |
| 🏘 Similar Properties | Related listings shown at bottom of property detail |
| 🎛 Advanced Filters | Bachelor Friendly, Pet Friendly, Near Metro filters |
| 🧮 Rent Calculator | Split rent & deposit fairly between roommates |
| 📸 Camera Upload | Capture photos directly from device camera when uploading |
| 2-Step Registration | Step indicator with OTP verification before account activation |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🏡 For Property Owners
- ➕ Add / Edit / Delete property listings
- 📸 Upload up to 10 photos (drag & drop or camera)
- 📋 Set rules: ✅ Allowed / ❌ Not Allowed / ℹ️ General
- 🏷 Add amenities from preset list or custom
- 👨‍💼 Mark as Bachelor / Pet / Metro friendly
- 🔄 Toggle listing availability instantly
- 📊 Owner dashboard with stats overview
- 💬 View all contact requests from renters
- 🔔 Notification bell for new reviews & messages
- ⭐ Reply to renter reviews

</td>
<td width="50%">

### 🔎 For Renters
- 🗺 Browse all verified listings
- 🎛 Advanced filters (city, rent, BHK, type, furnishing)
- 🔍 Special filters (bachelor, pet, metro friendly)
- 🖼 Image gallery with thumbnail navigation
- ❤️ Bookmark / save favourite properties
- ⭐ Rate and review properties
- 📩 Send message directly to property owner
- 📞 View owner phone & email from listing
- 🔗 Share listing via WhatsApp or copy link
- 🕐 Recently viewed properties on Browse page
- 🧮 Rent calculator for splitting costs

</td>
</tr>
</table>

---

## 🛠 Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| ⚛️ Frontend | React.js | 18.2.0 | UI framework |
| ⚡ Build Tool | Vite | 5.x | Dev server + bundler |
| 🎨 Styling | Tailwind CSS | 3.4.x | Utility-first CSS |
| 🧭 Routing | React Router | v6 | Client-side navigation |
| 📡 HTTP | Axios | 1.6.x | API requests + interceptors |
| 🔣 Icons | Lucide React | 0.363.x | Icon library |
| 🖥 Backend | Node.js + Express | 4.18.x | REST API server |
| 🔐 Auth | JWT + bcryptjs | 9.x / 2.4.x | Authentication |
| 🗄 Database | SQLite3 | 5.1.x | File-based database |
| 📁 Uploads | Multer | 1.4.x | Image file handling |
| 🔤 Fonts | Fraunces + Plus Jakarta Sans | — | Typography |

---

## 🚀 Getting Started

### Prerequisites

```bash
node --version   # v18.0.0 or higher
npm --version    # v9.0.0 or higher
```

### Installation

**1. Setup the Backend**

```bash
cd homenest/backend
npm install
```

Create `.env` file inside `backend/`:

```env
PORT=5000
JWT_SECRET=homenest_super_secret_2024
JWT_EXPIRES_IN=7d
DB_PATH=./database/homenest.db
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

> ✅ Should print:
> ```
> ✅ Database connected
> ✅ Schema ready
> 🚀 HomeNest v2.0 running on http://localhost:5000
> ```

**2. Setup the Frontend**

Open a **new terminal**:

```bash
cd homenest/frontend
npm install
npm run dev
```

> ✅ Should print: `VITE ready → Local: http://localhost:5173`

**3. Open the app**

```
http://localhost:5173
```

> ⚠️ **Both terminals must stay running simultaneously.**

---

## 📁 Project Structure

```
homenest/
│
├── backend/
│   ├── server.js                        # App entry point (v2.0)
│   ├── .env
│   ├── package.json
│   │
│   ├── config/
│   │   └── database.js                  # SQLite + 11 table schema
│   │
│   ├── middleware/
│   │   ├── auth.js                      # JWT verify + requireRole
│   │   └── upload.js                    # Multer (5MB, images only)
│   │
│   ├── controllers/
│   │   ├── authController.js            # Auth + OTP + Profile + Reset
│   │   ├── propertyController.js        # Full CRUD + bookmarks + contacts
│   │   ├── reviewController.js          # 🆕 NEW — Reviews + Report
│   │   └── notificationController.js    # 🆕 NEW — Notifications
│   │
│   ├── routes/
│   │   ├── auth.js                      # /api/auth/*
│   │   ├── properties.js                # /api/properties/*
│   │   ├── reviews.js                   # 🆕 NEW
│   │   └── notifications.js             # 🆕 NEW
│   │
│   └── uploads/
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    │
    └── src/
        ├── main.jsx
        ├── App.jsx                       # All routes incl. new pages
        ├── index.css
        │
        ├── utils/api.js
        ├── context/AuthContext.jsx
        │
        ├── components/
        │   ├── Navbar.jsx                # Updated — bell + profile + calculator
        │   ├── Footer.jsx
        │   ├── PropertyCard.jsx
        │   ├── NotificationBell.jsx      # 🆕 Real-time notification dropdown
        │   ├── RatingStars.jsx           # 🆕 Interactive + display stars
        │   ├── ShareButton.jsx           # 🆕 WhatsApp + copy link
        │   ├── SimilarProperties.jsx     # 🆕 Related listings
        │   └── RecentlyViewed.jsx        # 🆕 Last 5 visited (localStorage)
        │
        └── pages/
            ├── Home.jsx
            ├── Login.jsx                 # Updated — handles unverified accounts
            ├── Register.jsx              # Updated — 2-step with OTP
            ├── Browse.jsx                # Updated — advanced filters + recently viewed
            ├── PropertyDetail.jsx        # Updated — reviews, share, report, similar
            ├── Bookmarks.jsx
            ├── PropertyForm.jsx          # Updated — bachelor/pet/metro checkboxes
            ├── OwnerDashboard.jsx
            ├── AddProperty.jsx
            ├── EditProperty.jsx
            ├── ManageImages.jsx          # Updated — camera capture + gallery
            ├── ContactRequests.jsx
            ├── Profile.jsx               # 🆕 View/edit profile + change password
            ├── ForgotPassword.jsx        # 🆕 OTP-based forgot password
            ├── ResetPassword.jsx         # 🆕 OTP + new password form
            └── RentCalculator.jsx        # 🆕 Split rent between roommates
```

---

## 🗄 Database Schema

SQLite database auto-created at `backend/database/homenest.db`. No setup needed.

| Table | Description | Key Fields |
|-------|-------------|-----------|
| `users` | Owners and renters | id, name, email, role, phone, is_verified |
| `properties` | All listings | id, owner_id, title, city, rent, bachelor_friendly, pet_friendly, near_metro |
| `property_images` | Uploaded photos | id, property_id, filename, is_primary |
| `property_rules` | Rules per property | id, property_id, rule_text, rule_type |
| `amenities` | Amenity tags | id, property_id, name |
| `bookmarks` | Saved properties | renter_id, property_id |
| `contact_requests` | Renter messages | renter_id, property_id, message, is_read |
| `reviews` 🆕 | Ratings & reviews | renter_id, property_id, rating, comment, owner_reply |
| `notifications` 🆕 | User alerts | user_id, title, message, type, is_read |
| `otp_tokens` 🆕 | OTP for email/reset | email, otp, type, expires_at, used |
| `reported_properties` 🆕 | Flagged listings | reporter_id, property_id, reason |

---

## 📡 API Reference

### 🔐 Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register (returns OTP in dev mode) |
| `POST` | `/api/auth/verify-email` | ❌ | Verify email with OTP |
| `POST` | `/api/auth/resend-otp` | ❌ | Resend OTP |
| `POST` | `/api/auth/login` | ❌ | Login + receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `PUT` | `/api/auth/profile` | ✅ | Update name & phone |
| `PUT` | `/api/auth/change-password` | ✅ | Change password |
| `POST` | `/api/auth/forgot-password` | ❌ | Send reset OTP |
| `POST` | `/api/auth/reset-password` | ❌ | Reset with OTP + new password |

### 🏠 Property Routes — `/api/properties`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/properties` | Public | Browse all (with filters) |
| `GET` | `/api/properties/:id` | Public | Get single property |
| `POST` | `/api/properties` | Owner | Create listing |
| `PUT` | `/api/properties/:id` | Owner | Update listing |
| `DELETE` | `/api/properties/:id` | Owner | Delete listing |
| `GET` | `/api/properties/owner/mine` | Owner | Owner's listings |
| `POST` | `/api/properties/:id/images` | Owner | Upload photos |
| `DELETE` | `/api/properties/:id/images/:imageId` | Owner | Delete photo |
| `POST` | `/api/properties/:id/bookmark` | Renter | Toggle bookmark |
| `GET` | `/api/properties/renter/bookmarks` | Renter | Saved listings |
| `POST` | `/api/properties/:id/contact` | Renter | Message owner |
| `GET` | `/api/properties/owner/contacts` | Owner | Contact requests |

### ⭐ Review Routes — `/api/properties/:id` 🆕

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/properties/:id/reviews` | Public | Get reviews + avg rating |
| `POST` | `/api/properties/:id/reviews` | Renter | Add review |
| `PUT` | `/api/properties/:id/reviews/:reviewId/reply` | Owner | Reply to review |
| `DELETE` | `/api/properties/:id/reviews/:reviewId` | Renter | Delete own review |
| `POST` | `/api/properties/:id/report` | Any | Report listing |

### 🔔 Notification Routes — `/api/notifications` 🆕

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/notifications` | ✅ | Get all + unread count |
| `PUT` | `/api/notifications/read-all` | ✅ | Mark all as read |
| `PUT` | `/api/notifications/:id/read` | ✅ | Mark one as read |
| `DELETE` | `/api/notifications/:id` | ✅ | Delete notification |

### 🔍 Query Filters — `GET /api/properties`

```
?city=Mumbai
?state=Maharashtra
?min_rent=10000
?max_rent=50000
?bedrooms=2
?property_type=apartment
?furnished=fully
?bachelor_friendly=1
?pet_friendly=1
?near_metro=1
```

---

## 🗺 Pages & Routes

| Route | Page | Access | Notes |
|-------|------|--------|-------|
| `/` | Home | Public | — |
| `/login` | Login | Public | Handles unverified email |
| `/register` | Register | Public | 2-step OTP verification |
| `/forgot-password` | Forgot Password | Public | 🆕 OTP flow |
| `/reset-password` | Reset Password | Public | 🆕 OTP + new password |
| `/browse` | Browse | Public | Advanced filters + recently viewed |
| `/property/:id` | Property Detail | Public | Reviews, share, report, similar |
| `/calculator` | Rent Calculator | Public | 🆕 Split rent tool |
| `/profile` | My Profile | 🔒 Any | 🆕 Edit profile + password |
| `/bookmarks` | Bookmarks | 🔒 Renter | — |
| `/owner/dashboard` | Dashboard | 🔒 Owner | — |
| `/owner/add` | Add Property | 🔒 Owner | Bachelor/pet/metro options |
| `/owner/edit/:id` | Edit Property | 🔒 Owner | Bachelor/pet/metro options |
| `/owner/images/:id` | Manage Images | 🔒 Owner | Camera capture option |
| `/owner/contacts` | Contact Requests | 🔒 Owner | — |

---

## 🔐 Security

- 🔑 Passwords hashed with **bcryptjs** (10 salt rounds)
- 🪙 JWT tokens expire after **7 days**
- 📧 OTP tokens expire after **10 minutes** and are single-use
- 🛡 Role-based middleware — owners & renters cannot access each other's routes
- 📁 Multer validates — only `jpg`, `jpeg`, `png`, `webp` accepted
- 📏 File size limited to **5MB** per image
- 🌐 CORS restricted to frontend URL in `.env`
- 🔗 SQLite **foreign keys enforced**

---

## 🔧 Troubleshooting

<details>
<summary><b>❌ node-gyp / build error on Windows</b></summary>

This project uses `sqlite3` not `better-sqlite3`. Ensure `backend/package.json` has:
```json
"sqlite3": "^5.1.7"
```
</details>

<details>
<summary><b>❌ File name differs only in casing (SimilarProperties)</b></summary>

Windows casing issue. Rename the file in two steps:
1. `SimilarProperties.jsx` → `Temp.jsx`
2. `Temp.jsx` → `SimilarProperties.jsx`
</details>

<details>
<summary><b>❌ OTP not received / not showing</b></summary>

In dev mode the OTP is shown on screen in an amber box AND printed in the backend terminal. Look for:
```
🔑 OTP for email@example.com: 123456
```
</details>

<details>
<summary><b>❌ CORS error in browser</b></summary>

Make sure `.env` has the exact frontend URL:
```
FRONTEND_URL=http://localhost:5173
```
</details>

<details>
<summary><b>❌ Notifications not updating</b></summary>

Notifications poll the API every 30 seconds automatically. Make sure the backend is running and you are logged in.
</details>

<details>
<summary><b>❌ @tailwind / @apply warnings in VS Code</b></summary>

Not real errors. Install **Tailwind CSS IntelliSense** extension to remove the warnings.
</details>

<details>
<summary><b>❌ Images not loading after upload</b></summary>

Make sure `backend/uploads/` folder exists. It is auto-created on server start but you can create it manually if missing.
</details>

---

## ⚙ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `JWT_SECRET` | `homenest_super_secret_2024` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `DB_PATH` | `./database/homenest.db` | SQLite file path |
| `UPLOAD_DIR` | `./uploads` | Image upload folder |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## 🔮 Roadmap

### ✅ Completed in v2.0
- [x] Email OTP verification on register
- [x] Forgot / reset password via OTP
- [x] Profile page with edit + password change
- [x] Ratings & reviews with owner replies
- [x] Notification bell with unread count
- [x] Share via WhatsApp + copy link
- [x] Report property feature
- [x] Recently viewed properties
- [x] Similar properties suggestion
- [x] Advanced filters (bachelor, pet, metro)
- [x] Rent split calculator
- [x] Camera capture for image upload
- [x] 2-step registration with OTP

### 🔜 Planned for v3.0
- [ ] Real email sending (Gmail SMTP / SendGrid)
- [ ] Google Maps integration for property location
- [ ] Real-time chat between renter and owner
- [ ] Property comparison (side by side)
- [ ] Admin panel for platform management
- [ ] Dark mode
- [ ] PostgreSQL support for production
- [ ] Mobile app via Capacitor (Android + iOS)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using React.js · Node.js · Express · SQLite · Tailwind CSS**

⭐ **Star this repo if you found it helpful!** ⭐

**HomeNest v2.0** · Zero Brokerage · Direct Connections · Smarter Renting

</div>
