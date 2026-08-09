# PiaraPakistan — Multivendor Services & Products Marketplace

**Phase 1 (is package mein shamil):** Poori tarah kaam karne wala **Authentication & Registration System** —
Buyer, Seller (services), aur Shop (products) teeno k liye. ID card verification, phone OTP,
JWT login, security middleware sab tayyar hai.

---

## 📁 Project Structure

```
piarapakistan/
├── backend/              → Node.js + Express + MongoDB API
│   ├── config/db.js
│   ├── models/            (User, Otp)
│   ├── controllers/       (authController)
│   ├── routes/            (authRoutes)
│   ├── middleware/         (auth guard, file upload)
│   ├── utils/              (JWT, OTP, Email, SMS)
│   ├── uploads/            (ID cards, profile pictures)
│   └── server.js
└── frontend/              → React (Vite) app
    ├── src/pages/          (Home, Register, VerifyOtp, Login)
    ├── src/components/     (Navbar)
    ├── src/context/        (AuthContext)
    └── src/styles/         (brand-colored global.css)
```

---

## 🎨 Brand

Colors ek lightened, beautiful palette mein hain:
- Orange `#FF9D4D` (accent: `#F0812A`)
- Green `#34A866` (accent: `#1F7D4C`)
- Cream background `#FDFCFA`

Logo `frontend/public/logo.png` mein already daal diya hai.

### 🔧 Maintainability — Colors aur Units ek hi jagah se

Taake **rang badalna** ya **spacing edit karna** aasan rahe (poore codebase mein dhoondhte na phirna pade), do rules follow kiye hain:

1. **Sirf `px` units** — har jagah sizing, spacing, gaps, radius, font-size sab `px` mein hain (koi `rem`/`em` mix nahi). Sirf 2 jagah `%` aur `vh` use hui hai — wo bhi zaroori hain kyunke wo container/screen ko "poora bharne" (fill) ke liye hain, fixed size ke liye nahi (agar `px` daal dete to chhoti/badi screen par layout toot jata).
2. **Colors sirf 2 jagah define hain:**
   - `frontend/src/styles/global.css` ke `:root { }` mein (CSS variables — 90% UI yahan se rang leta hai)
   - `frontend/src/theme.js` mein (JavaScript mein jahan CSS variable use nahi ho sakta, jaise map ke pins ki SVG) — **inn dono jagah ki values hamesha match honi chahiye.**

   Koi bhi rang badalne ke liye bas `global.css` ke `:root` mein value badal dein — poori website mein automatically update ho jayega. Agar map pins ka rang bhi badalna hai to `theme.js` mein wahi value daal dein.

---

## 🆕 Phase 2 mein kya add hua (Categories + Listings + Search)

1. **Categories** — 11 built-in categories (Electrician, AC Sale/Repair, Plumber,
   Carpenter, Painter, Home Shifting, Electronics Shop, Mobile Repair, Tailor,
   Grocery, Other). List `backend/utils/categories.js` mein hai, yahan se edit karein.
2. **Listings** — Seller apni **services**, Shop apne **products** add/edit/delete/pause
   kar sakta hai (photos, price PKR mein, price type: fixed / hourly / starting-at,
   shop ke liye stock quantity).
3. **Search & Browse** — Keyword, category, city, price range, aur service/product
   type se filter. "Mere qareeb dikhayein" button browser location le kar **nearby-first
   sorting** karta hai (MongoDB geospatial query).
4. **Seller/Shop Dashboard** — apni saari listings, orders count, rating, aur
   active/paused status ek table mein, edit/delete/pause ke buttons ke saath.
5. **KYC Gate** — jab tak seller/shop ka ID card admin approve nahi karta (`kycStatus:
   "approved"`), wo listing add nahi kar sakta — fraud rokne ke liye.

### Admin ke liye pehla KYC approval (temporary, poora Admin Panel Phase 5 mein aayega)

Chunke abhi poora Admin Panel nahi bana, testing k liye pehla admin account is tarah banayein:

```bash
cd backend
node seedAdmin.js
```

Ye ek admin account bana dega (default: `admin@piarapakistan.com` / `ChangeMe123!` — `.env`
mein `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD` set kar ke customize kar sakte hain).
Admin login kar ke in endpoints se seller/shop KYC approve kar sakta hai:

- `GET /api/admin/pending-kyc` — pending sellers/shops ki list
- `PUT /api/admin/kyc/:userId/approve`
- `PUT /api/admin/kyc/:userId/reject`

(Phase 5 mein ye sab ek proper Admin Panel UI mein aa jayega.)

---

## ✅ Is Phase mein kya kaam karta hai

1. **Register** (Buyer / Seller / Shop) — name, email, phone, password, CNIC number,
   ID card front + back tasveer, address, city, area, aur seller/shop k liye
   category + bank account details.
2. **Phone OTP verification** (SMS) — account tabhi active hota hai jab OTP verify ho.
3. **Login** — email ya phone + password, JWT token based session.
4. **Security**: password hashing (bcrypt), rate-limiting (brute-force se bachao),
   Helmet security headers, role-based access control, suspended-account blocking.
5. Seller/Shop ka `kycStatus` field automatically `"pending"` set hota hai — admin
   panel (Phase 5) mein isay approve/reject kiya ja sakega.

---

## 🚀 Local mein chalane ka tareeqa

### Backend
```bash
cd backend
cp .env.example .env      # phir .env file mein apni values daalein
npm install
npm run dev                # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

`.env` mein zaroori cheezein:
- **MONGO_URI** — MongoDB Atlas ka free cluster bana lein (mongodb.com/atlas), connection string yahan daalein.
- **JWT_SECRET** — koi bhi lamba random string.
- **SMTP_*** — email OTP/receipts k liye (Gmail App Password ya koi bhi SMTP provider).
- **TWILIO_*** — SMS OTP k liye. *(Note: Pakistan k liye Twilio ki jagah local gateway jaise eSMS.pk ya Telenor/Jazz SMS API zyada sasta aur reliable hota hai — `backend/utils/sendSMS.js` mein sirf ye function replace karna hoga, baqi code same rahega)*.

Agar `.env` mein Twilio/SMTP set nahi hai to app crash nahi hoga — OTP terminal mein console log ho jayega (development mode), taake aap testing kar sakein bina real SMS bheje.

---

## 🌐 Hostinger par Deploy karna

Aapne bataya k Hostinger se hosting li hui hai — is baat ka khayal rakhein:

- **Shared Hosting** (cPanel wali basic hosting) **Node.js apps ko support nahi karti** WordPress ki tarah. Agar aapka plan **Hostinger Cloud / Business / VPS** hai jisme "Node.js" ka option cPanel mein dikhta hai, to hum wahan directly deploy kar sakte hain (Hostinger ke "Setup Node.js App" feature se).
- Agar sirf basic Shared Hosting hai, to best tareeqa ye hai:
  1. **Frontend** (React build) → Hostinger ki shared hosting par `public_html` mein daal dein (ye static files hain, koi masla nahi).
  2. **Backend** (Node/Express API) → kisi Node-supporting server par host karein: Hostinger VPS, Railway, Render, ya DigitalOcean. Phir apna domain `www.piarapakistan.com` → frontend static files, aur `api.piarapakistan.com` (subdomain) → backend server ki taraf point karein.
  3. **Database** → MongoDB Atlas (free tier available) — Hostinger par database khud host karne ki zaroorat nahi.

Jab hum is stage par pohanchein, main aapko exact step-by-step (screenshots ki tarah) guide karwa dunga k Hostinger control panel mein kya click karna hai — abhi ye batayein k aapka plan Cloud/VPS hai ya sirf Shared Hosting, taake sahi tareeqa bata sakoon.

---

## 🐙 GitHub par Upload karna

Is zip mein `.git` folder pehle se maujood hai (ek local repo, pehle commit ke saath), taake aap seedha GitHub par push kar sakein — dobara `git init` karne ki zaroorat nahi.

1. **GitHub par naya repository banayein** — github.com par login karein → "New repository" → naam dein (jaise `piarapakistan`) → **"Add a README file" ka option UNCHECK rakhein** (kyunke hamari zip mein pehle se README hai) → "Create repository".
2. GitHub aapko ek URL dega jaisa: `https://github.com/aapka-username/piarapakistan.git`
3. Apne computer par terminal/Git Bash khol kar is zip ko extract karein, phir folder ke andar ye commands chalayein:
   ```bash
   cd piarapakistan
   git remote add origin https://github.com/aapka-username/piarapakistan.git
   git push -u origin main
   ```
4. GitHub username/password mangega — password ki jagah aapko **Personal Access Token (PAT)** use karna hoga (GitHub ab plain password se push allow nahi karta). Token banane ka tareeqa: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → `repo` scope select karein → generate → is token ko password ki jagah paste karein.
5. Push ho jane ke baad aapka pura code GitHub repository mein nazar aayega.

⚠️ Agar aapke paas terminal/Git install nahi hai, GitHub ki website se bhi seedha **"uploading an existing file"** (drag-and-drop) se files upload ho sakti hain — lekin us tareeqe mein `.git` history nahi jaati, sirf files jati hain (deployment ke liye ye bhi kaafi hai).

## 🔗 Hostinger ko GitHub se Connect karna

Ye sirf tab kaam karta hai jab aapka Hostinger plan **Cloud, Business, ya VPS** ho (Node.js support wala) — Shared Hosting mein ye option nahi hota.

1. Hostinger **hPanel** → **Advanced** → **"Setup Node.js App"** kholein.
2. "Create Application" par click karein → Node.js version select karein (18 ya 20) → Application root folder set karein (jaise `piarapakistan-backend`).
3. Wahan ek option hota hai **"Git"** ya **"Connect to Git repository"** — ismein apna GitHub repo URL daalein aur branch `main` select karein.
4. Startup file set karein: `backend/server.js` (agar aapne pura repo connect kiya hai) ya sirf `server.js` (agar backend folder ko alag repo banaya).
5. Environment variables (.env values) hPanel ke Node.js app settings mein manually add karni hongi — MongoDB URI, JWT secret, JazzCash/Easypaisa credentials, etc. (`.env` file khud GitHub par push NAHI hoti, security ke liye `.gitignore` mein hai).
6. Frontend (React build) ke liye: `frontend` folder mein `npm run build` chalayein → `frontend/dist` ka content Hostinger ke `public_html` mein daal dein (ya isi Git connection se static deploy setup karein, agar Hostinger support karta ho).
7. Domain `www.piarapakistan.com` ko frontend (static `dist`) se point karein, aur ek subdomain jaisa `api.piarapakistan.com` ko backend Node app se point karein.

**Aapko batana hai:** jab aap Hostinger hPanel khol kar "Setup Node.js App" section dekh len (Advanced ke neeche) — agar wo option maujood hai to Cloud/VPS confirm ho jayega aur main step-by-step (exact clicks) guide kar dunga.

---

## 🗺️ Agle Phases (roadmap)

| Phase | Kya banega | Status |
|---|---|---|
| **1** | Auth, Registration, KYC upload, OTP, Login | ✅ Done |
| **2** | Categories, Service/Product listing, Search (nearby-first), Seller & Shop dashboards | ✅ Done |
| **3** | Visual Map — pins on Search page + Listing detail, location capture on Register | ✅ Done |
| **4** | Cart, Order flow, Commission system (admin-controlled %), Ratings/Reviews, Email/SMS receipts | ✅ Done |
| **5** | Full Admin Panel — KYC approval UI, fraud flagging, complaint/help-center resolution, full control | ✅ Done |
| **6** | Live chat + chatbot, Urdu/English language toggle, online payment gateway (JazzCash/Easypaisa) integration | ✅ Done |

Sab 6 phases mukammal hain — ye ab ek full-featured multivendor marketplace hai, jaisa aapne shuru mein manga tha. Baqi jo bacha hai wo hai: **real payment gateway merchant account** haasil karna (JazzCash/Easypaisa se), aur **Hostinger par deploy** karna.

## 💬 Phase 6 mein kya add hua (Live Chat + Language + Payments)

- **Live Chat** — Buyer kisi bhi listing se seedha seller ko message kar sakta hai (real-time,
  Socket.io se). Navbar mein "Messages" icon se poora inbox milta hai. Ek **Quick Help Assistant**
  bhi hai (keyword-based FAQ bot, koi external AI cost nahi) jo common sawalon (order kaise karein,
  seller kaise banein, commission kya hai, waghera) ka fori jawab deta hai.
- **Urdu/English Toggle** — Navbar mein globe/language icon se poori site Urdu (proper script,
  right-to-left) ya English mein switch ho sakti hai. Translation system `src/i18n/translations.js`
  mein hai — naye strings translate karne ke liye bas wahan add karein.
- **Online Payment (JazzCash / Easypaisa)** — Checkout par ab "Online Payment" fully kaam karta hai:
  - **JazzCash**: hosted checkout (secure hash ke sath) — buyer ko seedha JazzCash ke payment page
    par bhej deta hai.
  - **Easypaisa**: Mobile Account (MA) transaction — buyer apna Easypaisa number daalta hai.
  - **Real merchant credentials abhi nahi hain** — jab tak `.env` mein `JAZZCASH_*` ya
    `EASYPAISA_*` values nahi daalte, system khud-b-khud **Test/Mock Mode** mein chalta hai
    (ek "Simulate Payment" screen dikhati hai) taake poora checkout flow test kiya ja sake.
    Real JazzCash/Easypaisa merchant account milte hi, `.env` mein credentials daal dein — baqi
    code already tayyar hai, kuch aur badalna nahi paray ga.

## 💰 Commission — Percent ya Fixed PKR (dono options)

Admin ab commission **do tareeqon** mein se koi bhi choose kar sakta hai (Admin Panel → Commission):
- **Percentage (%)** — jaise har order ka 10%
- **Fixed Amount (Rs.)** — jaise har order par flat Rs. 50, order chota ho ya bara

Ye **sirf admin (website owner) hi set/edit** kar sakta hai — global default ke alawa kisi khaas
seller ke liye alag override bhi laga sakte hain. **Commission sirf admin aur us seller ko dikhta hai
jis ka wo order hai** — buyer ko order ki koi bhi jagah (order history, email/SMS receipt) commission
nazar nahi ata, sirf total amount dikhta hai. Ye automatically har order par calculate ho kar seller
ke "Orders" dashboard mein khud show ho jata hai, koi extra step nahi.

## 🛡️ Phase 5 mein kya add hua (Admin Panel)

`node seedAdmin.js` se bane admin account se login karein — Navbar mein **"Admin Panel"** link
dikhega (`/admin`). Ab poora control ek jagah se:

- **Dashboard** — total users, buyers/sellers/shops ka breakdown, active listings, orders,
  aur sab se important: **platform ki total commission earning** aur total sales volume (GMV).
- **KYC Approvals** — pending sellers/shops ki ID card (front + back) seedhi dekh kar
  **Approve / Reject** karein — ab admin controller se hi manually MongoDB mein jaane ki
  zaroorat nahi (Phase 2 ka temporary tareeqa yahan replace ho gaya).
- **Users** — sab users search/filter karein (role se), kisi ko **suspend/unsuspend** karein
  (fraud pakde jaane par) — suspend hote hi wo login nahi kar sakta.
- **Listings** — koi bhi listing pause/activate ya delete karein (moderation).
- **Orders** — poori platform ke saare orders ek jagah, status aur commission breakdown ke sath.
- **Commission** — global default % set karein, ya kisi khaas seller ke liye alag % (override) set karein.
- **Help Center** — users ki complaints/fraud reports dekhein, jawab dein, **resolved** mark karein.
  Har logged-in user apna complaint `/contact` (ab "Help" page) se file kar sakta hai aur uska
  status track kar sakta hai.

> Suspend hone wale user ko login karne par saaf message milta hai; unke active orders/listings
> khud delete nahi hote — admin decide karega unka kya karna hai (Listings/Orders panel se).


## 🛒 Phase 4 mein kya add hua (Cart + Orders + Commission)

- **Cart** — Buyer products cart mein add kar sakta hai (quantity ke sath), services k liye
  "Abhi Book Karein" seedha booking bana deta hai. Cart abhi browser mein (`localStorage`)
  save hoti hai — jab tak checkout nahi karte, koi backend record nahi banta.
- **Checkout** — Delivery address, city, notes, aur payment method (**Cash on Delivery** abhi
  live hai; **Online Payment — JazzCash/Easypaisa** ka option UI mein dikhta hai lekin "jald
  aa raha hai" — asal gateway integration Phase 6 mein hoga).
- **Order flow** — Har order ka apna `orderNumber` (e.g. `PP-000123`), status pipeline: **pending
  → confirmed → in_progress → completed** (ya **cancelled**). Seller apne "Orders" dashboard se
  status update karta hai; buyer ko har change par SMS jata hai.
- **Commission (PKR)** — Har order par automatically calculate hoti hai:
  - Pehle seller ka individual override check hota hai (`User.commissionPercent`)
  - Warna platform ka **global default** (`PlatformSettings`, shuru mein 10%) use hota hai
  - Admin dono ko in endpoints se control kar sakta hai:
    - `GET/PUT /api/admin/commission` — global default
    - `PUT /api/admin/users/:userId/commission` — kisi specific seller ke liye override
  - Seller apne dashboard mein har order par apna **exact payout** (total − commission) dekh sakta hai.
- **Receipts** — Order place hote hi buyer ko **email (HTML receipt)** aur **SMS** dono jate hain
  (order number, item, total, payment method, address ke sath) — jaisa aapne mangwaya tha.
- **Ratings/Reviews** — Sirf **completed** order par, sirf ek dafa, buyer 1-5 stars + comment de
  sakta hai. Listing aur seller ki overall rating automatically update hoti hai.
- **Stock handling** — Product order hone par stock khud kam hota hai; order cancel hone par
  wapas stock mein add ho jata hai.

> Payment abhi sirf **Cash on Delivery** se pura kaam karta hai. Online payment (JazzCash/Easypaisa)
> ka button UI mein hai lekin disabled — Phase 6 mein real gateway lagayenge.


## 🗺️ Phase 3 mein kya add hua (Map)

- **Leaflet + OpenStreetMap** use kiya hai — bilkul **free**, koi API key ya billing setup
  nahi chahiye (Google Maps ki tarah paid nahi). Production mein zyada traffic par chahein to
  ek paid tile provider (MapTiler / Mapbox) laga sakte hain — sirf `MapView.jsx` mein tile URL
  badalna hoga, baqi code same rahega.
- **Register page** ab location detect karta hai (button: "Map par apni location set karein") —
  isi location se listing ka pin set hota hai taake nearby-search sahi kaam kare.
- **Search page** par **List / Map toggle** — Map view mein sab listings apni city/area ke
  pins ke sath dikhte hain, pin click kar ke seedha listing par ja sakte hain.
- **Listing detail page** par bhi ek chota map hai jo us service/shop ki exact location dikhata hai.

> Note: agar koi purana test-user bina location ke register hua tha, uski listing map par nahi
> dikhegi jab tak wo profile update kar ke location set na kare — ye normal hai.

Har phase complete hone ke baad main isi tarah working code, test karke, deliver karunga.

---

## 🔒 Security Notes (important)

- Is package mein `uploads/` folder **publicly accessible** hai testing k liye. **Production mein ID card images ko private rakhna zaroori hai** — sirf admin access kar sake. Phase 5 (Admin Panel) mein isay secure route ke zariye serve karenge (public static serving hata denge).
- `.env` file kabhi bhi GitHub ya kisi public jagah share na karein.
- CNIC number aur bank account number database mein plaintext hain filhal — production se pehle inhein encrypt karna recommend karta hoon (Phase 5 mein add karunga).
