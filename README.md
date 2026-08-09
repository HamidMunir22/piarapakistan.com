# PiaraPakistan — Multivendor Services & Products Marketplace

A full-featured multivendor marketplace for Pakistan (a Fiverr/Upwork/Zameen.com-style hybrid) — buyers, service-selling sellers, and product-selling shops, all in one platform.

---

## 📁 Project Structure

```
piarapakistan/
├── backend/              → Node.js + Express + MongoDB API
│   ├── config/db.js
│   ├── models/            (User, Otp, Listing, Order, Review, PlatformSettings, Complaint, PaymentIntent, Conversation, Message)
│   ├── controllers/       (authController, listingController, orderController, adminController, complaintController, paymentController, chatController)
│   ├── routes/            (authRoutes, listingRoutes, orderRoutes, adminRoutes, complaintRoutes, paymentRoutes, chatRoutes)
│   ├── middleware/         (auth guard, file upload)
│   ├── utils/              (JWT, OTP, Email, SMS, categories, commission calculator, JazzCash, Easypaisa)
│   ├── uploads/            (ID cards, profile pictures, listing images)
│   └── server.js
└── frontend/              → React (Vite) app
    ├── src/pages/          (Home, Register, VerifyOtp, Login, Categories, Search, ListingDetail, Cart, Checkout, Orders, HelpCenter, Messages, MockPayment, PaymentResult)
    ├── src/pages/dashboard/  (MyListings, ListingForm, SellerOrders)
    ├── src/pages/admin/     (Dashboard, KycApprovals, Users, Listings, Orders, Commission, Complaints)
    ├── src/components/     (Navbar, CategoryCard, ListingCard, Tilt, MapView, ProtectedRoute)
    ├── src/context/        (AuthContext, CartContext, LanguageContext, ChatContext)
    └── src/styles/         (brand-colored global.css)
```

---

## 🎨 Brand

Colors use a lightened, beautiful palette:
- Orange `#FF9D4D` (accent: `#F0812A`)
- Green `#34A866` (accent: `#1F7D4C`)
- Cream background `#FDFCFA`

The logo is already placed at `frontend/public/logo.png`.

### 🔧 Maintainability — Colors and Units from One Place

To make **changing colors** or **editing spacing** easy (without hunting through the whole codebase), two rules are followed throughout:

1. **`px` units only** — all sizing, spacing, gaps, radii, and font-size are in `px` everywhere (no mixing with `rem`/`em`). `%` and `vh` are used in only 2 places, and those are necessary because they're meant to "fill" a container/screen, not represent a fixed size (using `px` there would break the layout on smaller/larger screens).
2. **Colors are defined in only 2 places:**
   - `frontend/src/styles/global.css` inside `:root { }` (CSS variables — 90% of the UI pulls color from here)
   - `frontend/src/theme.js` (for JavaScript contexts where a CSS variable can't be used, like the map pin SVGs) — **the values in both places must always match.**

   To change any color, just update the value in `global.css`'s `:root` — it updates automatically across the whole site. If you also want the map pin color to change, update the same value in `theme.js`.

---

## 🆕 Categories, Listings & Search

1. **Categories** — 11 built-in categories (Electrician, AC Sale/Repair, Plumber,
   Carpenter, Painter, Home Shifting, Electronics Shop, Mobile Repair, Tailor,
   Grocery, Other). The list lives in `backend/utils/categories.js` — edit it from there.
2. **Listings** — Sellers can add/edit/delete/pause their **services**, Shops can do the same for their **products**
   (photos, price in PKR, price type: fixed / hourly / starting-at,
   stock quantity for shops).
3. **Search & Browse** — Filter by keyword, category, city, price range, and service/product
   type. The "Show near me" button uses the browser location for **nearby-first
   sorting** (MongoDB geospatial query).
4. **Seller/Shop Dashboard** — all their listings, order counts, rating, and
   active/paused status in one table, with edit/delete/pause buttons.
5. **KYC Gate** — a seller/shop cannot add a listing until an admin approves their ID card
   (`kycStatus: "approved"`) — this prevents fraud.

### First admin account (for local testing/KYC approval)

To create the first admin account for testing:

```bash
cd backend
node seedAdmin.js
```

This creates an admin account (default: `admin@piarapakistan.com` / `ChangeMe123!` — customize it by
setting `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD` in `.env`).
Once logged in, the admin can manage everything from the full **Admin Panel** (`/admin`) — including approving/rejecting seller and shop KYC submissions.

---

## ✅ What Works

1. **Register** (Buyer / Seller / Shop) — name, email, phone, password, CNIC number,
   front + back ID card photo, address, city, area, and for sellers/shops:
   category + bank account details.
2. **Phone OTP verification** (SMS) — the account only becomes active once the OTP is verified.
3. **Login** — email or phone + password, JWT token-based session.
4. **Security**: password hashing (bcrypt), rate-limiting (brute-force protection),
   Helmet security headers, role-based access control, suspended-account blocking.
5. A seller/shop's `kycStatus` field is automatically set to `"pending"` — it can be
   approved/rejected from the Admin Panel.

---

## 🚀 Running Locally

### Backend
```bash
cd backend
cp .env.example .env      # then fill in your own values in the .env file
npm install
npm run dev                # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

Required things in `.env`:
- **MONGO_URI** — create a free MongoDB Atlas cluster (mongodb.com/atlas) and put the connection string here.
- **JWT_SECRET** — any long random string.
- **SMTP_*** — for email OTP/receipts (Gmail App Password or any SMTP provider).
- **TWILIO_*** — for SMS OTP. *(Note: for Pakistan, a local gateway like eSMS.pk or the Telenor/Jazz SMS API is often cheaper and more reliable than Twilio — you'd only need to swap out this function in `backend/utils/sendSMS.js`, the rest of the code stays the same)*.

If Twilio/SMTP aren't set in `.env`, the app won't crash — the OTP is simply logged to the console (development mode), so you can test without sending real SMS.

---

## 🌐 Deploying to Hostinger

Keep the following in mind since you've purchased hosting from Hostinger:

- **Shared Hosting** (basic cPanel hosting) **does not support Node.js apps**, unlike WordPress. If your plan is **Hostinger Cloud / Business / VPS** with a "Node.js" option visible in cPanel, we can deploy directly there (using Hostinger's "Setup Node.js App" feature).
- If you only have basic Shared Hosting, the best approach is:
  1. **Frontend** (React build) → place it in `public_html` on Hostinger's shared hosting (these are static files, no problem there).
  2. **Backend** (Node/Express API) → host it on a Node-supporting server: Hostinger VPS, Railway, Render, or DigitalOcean. Then point your domain `www.piarapakistan.com` → the frontend static files, and `api.piarapakistan.com` (subdomain) → the backend server.
  3. **Database** → MongoDB Atlas (free tier available) — no need to host a database on Hostinger yourself.

When we reach this stage, I'll walk you through the exact step-by-step (like screenshots) of what to click in the Hostinger control panel — for now, let me know whether your plan is Cloud/VPS or just Shared Hosting, so I can point you to the right approach.

---

## 🐙 Uploading to GitHub

This zip already includes a `.git` folder (a local repo with an initial commit), so you can push straight to GitHub — no need to run `git init` again.

1. **Create a new repository on GitHub** — log in to github.com → "New repository" → give it a name (e.g. `piarapakistan`) → **leave the "Add a README file" option UNCHECKED** (since our zip already has a README) → "Create repository".
2. GitHub will give you a URL like: `https://github.com/your-username/piarapakistan.git`
3. On your computer, open a terminal/Git Bash, extract this zip, then run these commands inside the folder:
   ```bash
   cd piarapakistan
   git remote add origin https://github.com/your-username/piarapakistan.git
   git push -u origin main
   ```
4. It will ask for your GitHub username/password — instead of a password, you'll need to use a **Personal Access Token (PAT)** (GitHub no longer allows pushing with a plain password). To create one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → select the `repo` scope → generate → paste this token in place of the password.
5. Once pushed, your full code will be visible in the GitHub repository.

⚠️ If you don't have terminal/Git installed, you can also upload files directly from the GitHub website using **"uploading an existing file"** (drag-and-drop) — though that method doesn't carry over the `.git` history, only the files themselves (which is still enough for deployment).

## 🔗 Connecting Hostinger to GitHub

This only works if your Hostinger plan is **Cloud, Business, or VPS** (with Node.js support) — this option doesn't exist on Shared Hosting.

1. Open Hostinger **hPanel** → **Advanced** → **"Setup Node.js App"**.
2. Click "Create Application" → select the Node.js version (18 or 20) → set the application root folder (e.g. `piarapakistan-backend`).
3. There's an option there called **"Git"** or **"Connect to Git repository"** — enter your GitHub repo URL and select the `main` branch.
4. Set the startup file: `backend/server.js` (if you connected the whole repo) or just `server.js` (if the backend folder is its own separate repo).
5. Environment variables (the `.env` values) need to be added manually in the hPanel Node.js app settings — MongoDB URI, JWT secret, JazzCash/Easypaisa credentials, etc. (the `.env` file itself is NOT pushed to GitHub, it's in `.gitignore` for security).
6. For the frontend (React build): run `npm run build` inside the `frontend` folder → put the contents of `frontend/dist` into Hostinger's `public_html` (or set up a static deploy through the same Git connection, if Hostinger supports it).
7. Point the domain `www.piarapakistan.com` to the frontend (static `dist`), and a subdomain like `api.piarapakistan.com` to the backend Node app.

**Let me know:** once you open Hostinger hPanel and check whether the "Setup Node.js App" section exists (under Advanced) — if it does, that confirms Cloud/VPS, and I'll guide you through the exact clicks step by step.

---

## 🗺️ Roadmap

| Phase | What It Builds | Status |
|---|---|---|
| **1** | Auth, Registration, KYC upload, OTP, Login | ✅ Done |
| **2** | Categories, Service/Product listing, Search (nearby-first), Seller & Shop dashboards | ✅ Done |
| **3** | Visual Map — pins on Search page + Listing detail, location capture on Register | ✅ Done |
| **4** | Cart, Order flow, Commission system (admin-controlled %), Ratings/Reviews, Email/SMS receipts | ✅ Done |
| **5** | Full Admin Panel — KYC approval UI, fraud flagging, complaint/help-center resolution, full control | ✅ Done |
| **6** | Live chat + chatbot, Urdu/English language toggle, online payment gateway (JazzCash/Easypaisa) integration | ✅ Done |

All 6 phases are complete — this is now a full-featured multivendor marketplace, just as originally envisioned. What's left is: getting a **real payment gateway merchant account** (from JazzCash/Easypaisa), and **deploying to Hostinger**.

## 💬 Live Chat, Language & Payments

- **Live Chat** — A buyer can message a seller directly from any listing (real-time,
  via Socket.io). The "Messages" icon in the navbar opens the full inbox. There's also a **Quick Help Assistant**
  (a keyword-based FAQ bot, no external AI cost) that instantly answers common questions (how to place an order,
  how to become a seller, what commission is, etc.).
- **Urdu/English Toggle** — The globe/language icon in the navbar switches the whole site between Urdu (proper script,
  right-to-left) and English. The translation system lives in `src/i18n/translations.js` —
  to translate new strings, just add them there.
- **Online Payment (JazzCash / Easypaisa)** — Checkout now fully supports "Online Payment":
  - **JazzCash**: hosted checkout (with a secure hash) — takes the buyer straight to JazzCash's payment page.
  - **Easypaisa**: Mobile Account (MA) transaction — the buyer enters their Easypaisa number.
  - **No real merchant credentials yet** — until you fill in `JAZZCASH_*` or
    `EASYPAISA_*` values in `.env`, the system automatically runs in **Test/Mock Mode**
    (it shows a "Simulate Payment" screen) so the full checkout flow can be tested.
    Once you get a real JazzCash/Easypaisa merchant account, just add the credentials to `.env` — the rest of the
    code is already ready, nothing else needs to change.

## 💰 Commission — Percentage or Fixed PKR (Both Options)

Admin can now choose between **two commission methods** (Admin Panel → Commission):
- **Percentage (%)** — e.g. 10% of every order
- **Fixed Amount (Rs.)** — e.g. a flat Rs. 50 per order, regardless of order size

This can be **set/edited only by the admin (website owner)** — besides the global default, a specific
seller can also have a separate override applied. **Commission is only visible to the admin and the seller
whose order it is** — the buyer never sees commission anywhere on the order (order history, email/SMS receipt);
they only see the total amount. It's automatically calculated on every order and shown right in the seller's
"Orders" dashboard, with no extra step needed.

## 🛡️ Admin Panel

Log in with the admin account created via `node seedAdmin.js` — an **"Admin Panel"** link will show
in the navbar (`/admin`). Everything can now be controlled from one place:

- **Dashboard** — total users, breakdown by buyers/sellers/shops, active listings, orders,
  and most importantly: **the platform's total commission earnings** and total sales volume (GMV).
- **KYC Approvals** — view a pending seller's/shop's ID card (front + back) directly and
  **Approve / Reject** them — no more need to go into MongoDB manually (the old
  temporary workaround has been replaced by this).
- **Users** — search/filter all users (by role), **suspend/unsuspend** anyone
  (if fraud is detected) — once suspended, they can no longer log in.
- **Listings** — pause/activate or delete any listing (moderation).
- **Orders** — every order on the platform in one place, with status and commission breakdown.
- **Commission** — set the global default %, or set a separate % (override) for a specific seller.
- **Help Center** — view users' complaints/fraud reports, respond, and mark them **resolved**.
  Any logged-in user can file a complaint from `/contact` (now the "Help" page) and
  track its status.

> A suspended user gets a clear message when trying to log in; their active orders/listings
> aren't automatically deleted — the admin decides what to do with them (from the Listings/Orders panel).


## 🛒 Cart, Orders & Commission

- **Cart** — Buyers can add products to the cart (with quantity); for services,
  "Book Now" creates a booking directly. The cart is currently saved in the browser (`localStorage`) —
  no backend record is created until checkout.
- **Checkout** — Delivery address, city, notes, and payment method (**Cash on Delivery** is
  live; **Online Payment — JazzCash/Easypaisa** is fully integrated too, see above).
- **Order flow** — Every order has its own `orderNumber` (e.g. `PP-000123`), with a status pipeline: **pending
  → confirmed → in_progress → completed** (or **cancelled**). Sellers update
  status from their "Orders" dashboard; the buyer gets an SMS on every change.
- **Commission (PKR)** — Automatically calculated on every order:
  - First, the seller's individual override is checked (`User.commissionType`/`commissionPercent`/`commissionFixedAmount`)
  - Otherwise, the platform's **global default** (`PlatformSettings`, 10% to start) is used
  - Admin can control both via these endpoints:
    - `GET/PUT /api/admin/commission` — global default
    - `PUT /api/admin/users/:userId/commission` — override for a specific seller
  - Sellers can see their **exact payout** (total − commission) for every order in their dashboard.
- **Receipts** — As soon as an order is placed, the buyer gets both an **email (HTML receipt)** and an **SMS**
  (with order number, item, total, payment method, and address).
- **Ratings/Reviews** — Only on a **completed** order, only once, the buyer can leave 1-5 stars + a comment.
  The listing's and seller's overall rating updates automatically.
- **Stock handling** — Stock automatically decreases when a product is ordered; it's added back
  if the order is cancelled.


## 🗺️ Map

- Uses **Leaflet + OpenStreetMap** — completely **free**, no API key
  or billing setup needed (unlike paid Google Maps). If you want to switch to a paid tile
  provider (MapTiler / Mapbox) for higher production traffic later, you'd only need to
  change the tile URL in `MapView.jsx`, the rest of the code stays the same.
- The **Register page** detects location (button: "Set your location on the map") —
  this location is used to set the listing's pin so nearby-search works correctly.
- The **Search page** has a **List / Map toggle** — the Map view shows all listings with
  pins for their city/area, and clicking a pin takes you straight to that listing.
- The **Listing detail page** also has a small map showing that service's/shop's exact location.

> Note: if an old test user registered without a location, their listing won't
> show on the map until they update their profile and set a location — this is normal.

---

## 🔒 Security Notes (important)

- In this package, the `uploads/` folder is **publicly accessible** for testing purposes. **In production, ID card images must be kept private** — accessible only to the admin. This is served through a secure route in the Admin Panel (public static serving has been removed).
- Never share the `.env` file on GitHub or anywhere public.
- CNIC numbers and bank account numbers are currently stored in plaintext in the database — I'd recommend encrypting these before going to production.
