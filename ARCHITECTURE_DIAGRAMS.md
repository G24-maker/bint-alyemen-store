# 🔐 Security Architecture Diagrams

## 1. Authentication Flow (Login)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                               │
│  User Input: email + password                                │
│       ↓                                                       │
│  AdminLogin Component                                        │
│       ↓                                                       │
│  api.post('/auth/login', { email, password })               │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
          ┌────────────────────────────────┐
          │  CORS Check                    │
          │  ✅ Origin: localhost:5173?   │
          │  ✅ Allowed headers?           │
          └────────────────────┬───────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
│                                                               │
│  POST /api/auth/login                                        │
│       ↓                                                       │
│  1. Extract { email, password }                              │
│  2. Query DB: SELECT * FROM admins WHERE email = ?           │
│       ↓                                                       │
│  Admin found?                                                │
│  ├─ NO  → Return 401 "Invalid credentials"                  │
│  └─ YES → Continue                                          │
│       ↓                                                       │
│  3. bcrypt.compare(password, admin.password)                │
│       ↓                                                       │
│  Password valid?                                             │
│  ├─ NO  → Return 401 "Invalid credentials"                  │
│  └─ YES → Continue                                          │
│       ↓                                                       │
│  4. Generate JWT Token                                       │
│     jwt.sign(                                                 │
│       { id, email },                                         │
│       JWT_SECRET,                                             │
│       { expiresIn: '2h' }                                    │
│     )                                                         │
│       ↓                                                       │
│  5. Return { accessToken, email, expiresIn: '2h' }          │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                               │
│  Receive: { accessToken, email, expiresIn }                 │
│       ↓                                                       │
│  Store in adminStore:                                        │
│  - token = accessToken                                       │
│  - adminEmail = email                                        │
│  - tokenExpiry = Date.now() + (2 * 60 * 60 * 1000)          │
│  - isLoggedIn = true                                         │
│       ↓                                                       │
│  Redirect to: /admin/dashboard                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Protected Route Access Flow

```
┌─────────────────────────────────────────────────────────────┐
│              User visits /admin/dashboard                    │
│                                                               │
│  Browser Navigation                                          │
│       ↓                                                       │
│  React Router Check                                          │
│       ↓                                                       │
│  ProtectedRoute Component                                    │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
         ┌────────────────────────────────┐
         │  Check: isLoggedIn?            │
         │  ✅ YES → Continue             │
         │  ❌ NO  → Redirect /admin      │
         └────────────────┬───────────────┘
                          ↓
         ┌────────────────────────────────┐
         │  Show: Loading spinner         │
         │  Call: validateToken()         │
         └────────────────┬───────────────┘
                          ↓
                  (Parallel checks)
                   /                \
                  /                  \
            Client-side           Server-side
                 ↓                     ↓
         ┌─────────────────┐  ┌──────────────────┐
         │ Check expiry:   │  │ POST /auth/verify│
         │ Date.now()      │  │                  │
         │ > tokenExpiry?  │  │ Validate JWT:    │
         │                 │  │ - Check signature│
         │ YES → Invalid   │  │ - Check expiry   │
         │ NO  → Valid     │  │ - Return user    │
         └────────┬────────┘  └────────┬─────────┘
                  │                    │
                  └─────────┬──────────┘
                            ↓
                  ┌───────────────────┐
                  │  Both valid?      │
                  │  ✅ YES → Render  │
                  │  ❌ NO  → Clear   │
                  │  & Redirect       │
                  └───────────────────┘
```

---

## 3. API Request with Token

```
┌─────────────────────────────────────────────────────────────┐
│              Admin wants to add product                      │
│                                                               │
│  ProductForm Component                                       │
│       ↓                                                       │
│  api.post('/products', productData, token)                  │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
         ┌────────────────────────────────┐
         │  Build Request Headers:        │
         │  - Content-Type: application/json
         │  - Authorization: Bearer {token}
         └────────────────┬───────────────┘
                          ↓
          ┌────────────────────────────────┐
          │  CORS Check                    │
          │  ✅ Origin: localhost:5173?   │
          │  ✅ Allowed headers?           │
          └────────────────┬───────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
│                                                               │
│  POST /api/products                                          │
│       ↓                                                       │
│  verifyToken middleware                                      │
│       ├─ Extract header: Authorization                       │
│       ├─ Get token: split ' '[1]                             │
│       ├─ Validate: jwt.verify()                              │
│       │    ├─ Check signature                                │
│       │    ├─ Check expiry                                   │
│       │    └─ Extract { id, email }                          │
│       │                                                       │
│       ├─ Token invalid?                                      │
│       │    └─ Return 401 "Invalid token"                     │
│       │                                                       │
│       ├─ Token expired?                                      │
│       │    └─ Return 401 "Token expired"                     │
│       │                                                       │
│       └─ Attach to req: req.userId, req.admin                │
│              Continue to route handler                       │
│       ↓                                                       │
│  Route Handler (now authenticated)                           │
│       ↓                                                       │
│  1. Validate input data                                      │
│  2. Insert to database                                       │
│  3. Return success response                                  │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                               │
│  Receive success response                                    │
│       ↓                                                       │
│  Update UI / Refresh list                                    │
│       ↓                                                       │
│  Show success message                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Token Expiry Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│         AdminDashboard mounted (after login)                 │
│                                                               │
│  useEffect runs:                                             │
│  - tokenExpiry = 2026-01-27 23:15:00 (example)              │
│  - setInterval(checkExpiry, 60000)  // Every 60 seconds     │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
        Every 60 seconds:
            ↓
        ┌──────────────────────────────┐
        │  Calculate timeRemaining:    │
        │  tokenExpiry - Date.now()    │
        └────────────────┬─────────────┘
                         ↓
        ┌──────────────────────────────┐
        │  If time remaining == 5 min: │
        │  - Show warning toast:       │
        │    "You'll logout in 5 min"  │
        │  - Continue loop             │
        └────────────────┬─────────────┘
                         ↓
        ┌──────────────────────────────┐
        │  If time remaining <= 0:     │
        │  - Call logout()             │
        │  - Clear all auth state      │
        │  - Redirect to /admin        │
        │  - Show error toast:         │
        │    "Session expired"         │
        │  - Stop interval             │
        └──────────────────────────────┘

TIMELINE EXAMPLE:
├─ T+0h:00m - User logs in
├─ T+1h:59m - System checks, all good
├─ T+1h:55m - ⚠️ Warning: 5 minutes remaining
├─ T+1h:56m - System keeps checking
├─ T+1h:57m - System keeps checking
├─ T+1h:58m - System keeps checking
├─ T+1h:59m - System keeps checking
├─ T+2h:00m - 🔴 Token expires, auto-logout
└─ User redirected to login page
```

---

## 5. Password Security (bcryptjs)

```
REGISTRATION / INITIAL SETUP:
┌────────────────────────────┐
│  Admin password: admin123  │
└────────────┬───────────────┘
             ↓
   ┌────────────────────────┐
   │ bcrypt.hashSync()      │
   │ Salt rounds: 10        │
   │                        │
   │ Input:  "admin123"     │
   │         ↓              │
   │ $2a$10$wI2....$8V...   │
   │         ↑              │
   │ Output: (hashed)       │
   └────────────┬───────────┘
                ↓
   ┌────────────────────────┐
   │  Database storage:     │
   │  (NEVER plaintext!)    │
   │  $2a$10$wI2....$8V...  │
   └────────────────────────┘

LOGIN VERIFICATION:
┌────────────────────────────┐
│  User enters: admin123     │
└────────────┬───────────────┘
             ↓
   ┌────────────────────────────┐
   │ bcrypt.compare()           │
   │                            │
   │ Compare:                   │
   │ - "admin123" (user input)  │
   │ - "$2a$10$..." (from DB)   │
   │                            │
   │ Hashing algorithm:         │
   │ - Applies same salt        │
   │ - Creates new hash         │
   │ - Compares byte-by-byte    │
   │                            │
   │ Result:                    │
   │ - Match    → isMatch=true  │
   │ - No match → isMatch=false │
   └────────────┬───────────────┘
                ↓
     ┌──────────────────────┐
     │  Generate JWT token  │
     │  if isMatch = true   │
     └──────────────────────┘
```

---

## 6. Database Security

```
BEFORE (Vulnerable):
┌───────────────────────────────────┐
│  admins table                      │
├─────────┬───────────────────────────┤
│ id      │ email                     │
├─────────┼───────────────────────────┤
│ 1       │ admin@bintalyemen.com    │
│ password│ admin123  ← VULNERABLE!   │
└─────────┴───────────────────────────┘

AFTER (Secure):
┌──────────────────────────────────────────┐
│  admins table                             │
├─────────┬──────────────────────────────────┤
│ id      │ email                            │
├─────────┼──────────────────────────────────┤
│ 1       │ admin@bintalyemen.com           │
│ password│ $2a$10$wI2H1qS8WJz7tV4k9... ✅  │
└─────────┴──────────────────────────────────┘

ATTACK SIMULATION:
┌──────────────────────────────────┐
│ Attacker gains DB access         │
│                                  │
│ Reads password field:            │
│ "admin123"  ← VULNERABLE!        │
│             ← Can login directly │
│                                  │
│ vs                               │
│                                  │
│ Reads hashed password:           │
│ "$2a$10$..."  ← SAFE!            │
│               ← Cannot reverse   │
│               ← Need plaintext   │
└──────────────────────────────────┘
```

---

## 7. CORS Protection

```
ATTACK SCENARIO:
┌─────────────────────────┐
│  Attacker's Domain:     │
│  evil.com               │
│                         │
│  JavaScript runs:       │
│  fetch('http://loc      │
│  alhost:3001/api/...')  │
└────────────────┬────────┘
                 ↓
        Browser CORS Check
         ↓
    ┌─────────────────┐
    │ Is Origin       │
    │ evil.com in     │
    │ Allowed list?   │
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ Allowed:        │
    │ only localhost  │
    │ :5173           │
    └────────┬────────┘
             ↓
        🔴 BLOCKED!
         ↓
    ┌──────────────────────────────┐
    │ CORS error in console:       │
    │ "Access to XMLHttpRequest    │
    │ blocked by CORS policy"      │
    └──────────────────────────────┘

LEGITIMATE REQUEST:
┌─────────────────────────────┐
│  Your Frontend:             │
│  localhost:5173             │
│                             │
│  JavaScript runs:           │
│  api.get('/products')       │
└────────────────┬────────────┘
                 ↓
        Browser CORS Check
         ↓
    ┌─────────────────┐
    │ Is Origin       │
    │ localhost:5173  │
    │ in Allowed list?│
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ YES!            │
    │ Matches exactly │
    └────────┬────────┘
             ↓
        ✅ REQUEST ALLOWED
         ↓
    API response received
```

---

## 8. Complete Security Stack

```
┌────────────────────────────────────────────────────────────┐
│                    APPLICATION FLOW                        │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  User Browser                                              │
│  │                                                          │
│  ├─ CORS Protection Layer                                 │
│  │  └─ Only localhost:5173 allowed                        │
│  │                                                          │
│  ├─ Frontend (React)                                       │
│  │  ├─ ProtectedRoute Component                           │
│  │  │  └─ Token validation before rendering admin         │
│  │  │                                                      │
│  │  ├─ AdminStore                                         │
│  │  │  ├─ Token storage (localStorage)                    │
│  │  │  ├─ Expiry tracking (tokenExpiry)                   │
│  │  │  └─ Auto-logout logic                               │
│  │  │                                                      │
│  │  └─ Components                                         │
│  │     ├─ AdminDashboard (Monitors expiry)               │
│  │     └─ AdminLogin (Gets token)                        │
│  │                                                          │
│  └─ HTTP Request with Token                               │
│     ├─ Authorization: Bearer {JWT}                        │
│     └─ Header sent to API                                 │
│                                                              │
│  ═══════════════════════════════════════════════          │
│  Network / Internet                                        │
│  ═══════════════════════════════════════════════          │
│                                                              │
│  Backend Server (Node.js)                                  │
│  │                                                          │
│  ├─ CORS Middleware                                       │
│  │  └─ Validates origin, methods, headers                 │
│  │                                                          │
│  ├─ Route: POST /api/auth/login                          │
│  │  ├─ Extract email, password                            │
│  │  ├─ Query database for admin                           │
│  │  ├─ bcrypt.compare() - password hashing               │
│  │  └─ Generate JWT token (2h expiry)                     │
│  │                                                          │
│  ├─ JWT Auth Middleware                                   │
│  │  ├─ Extract token from header                          │
│  │  ├─ Verify JWT signature                               │
│  │  ├─ Check expiry time                                  │
│  │  └─ Attach user to request                             │
│  │                                                          │
│  ├─ Protected Routes                                      │
│  │  ├─ GET /api/products (public)                         │
│  │  ├─ POST /api/products (protected)                     │
│  │  ├─ PUT /api/products/:id (protected)                  │
│  │  ├─ DELETE /api/products/:id (protected)               │
│  │  ├─ GET /api/orders (protected)                        │
│  │  └─ PUT /api/orders/:id/status (protected)             │
│  │                                                          │
│  └─ Database (SQLite)                                     │
│     ├─ admins table                                       │
│     │  ├─ id (PK)                                         │
│     │  ├─ email                                           │
│     │  └─ password (HASHED with bcryptjs)                 │
│     │                                                      │
│     └─ Other tables                                       │
│        ├─ products                                        │
│        ├─ orders                                          │
│        ├─ categories                                      │
│        └─ order_items                                     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## Legend

```
┌─────────┐
│ Process │     = Processing step
└─────────┘

      ↓         = Flow direction

├─ Item        = Part of component

✅ YES        = Success path
❌ NO         = Failure path
🔴 BLOCKED    = Security blocked
⚠️ WARNING    = Warning condition
```

---

**Created**: January 27, 2026  
**Version**: 1.0  
**Status**: ✅ Complete
