# 🧑‍💻 Developer Checklist - Security Implementation

## Pre-Deployment Checklist

### Phase 1: Local Development Setup ✅

- [ ] Clone/download the project
- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env` file exists with all variables
- [ ] Start backend: `npm run dev`
- [ ] Verify server message: "Server is running on port 3001"
- [ ] Return to root: `cd ..`
- [ ] Install frontend dependencies: `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Visit: `http://localhost:5173`
- [ ] Verify page loads without errors

### Phase 2: Authentication Testing ✅

- [ ] Navigate to: `/admin`
- [ ] See login form displayed
- [ ] Try invalid credentials: `test@test.com` / `wrong`
- [ ] See error: "Invalid credentials"
- [ ] Login with default: `admin@bintalyemen.com` / `admin123`
- [ ] See success redirect to `/admin/dashboard`
- [ ] Verify user email shown in header

### Phase 3: Dashboard Functionality ✅

- [ ] Verify dashboard loads with statistics
- [ ] Check product list tab shows products
- [ ] Check orders tab (should be empty initially)
- [ ] Click "Add Product" button
- [ ] Fill in product form
- [ ] Submit product
- [ ] Verify product appears in list
- [ ] Edit a product
- [ ] Delete a product
- [ ] Verify all operations work smoothly

### Phase 4: Security Features Testing ✅

#### Token Expiry Test:
- [ ] Login to admin panel
- [ ] Wait 5 minutes (or modify code for 5 second test)
- [ ] See warning: "You'll logout in 5 min" (if exactly 5 min remaining)
- [ ] Wait for token to expire (2 hours total)
- [ ] See auto-logout with message
- [ ] Redirected to login page

#### Protected Route Test:
- [ ] Clear localStorage manually
- [ ] Try accessing `/admin/dashboard` directly
- [ ] Should redirect to `/admin` login
- [ ] Try accessing invalid URL like `/admin/fakepage`
- [ ] Should not show anything sensitive

#### CORS Test:
- [ ] Open browser dev console
- [ ] Try making request from different origin:
  ```javascript
  // From console in any domain
  fetch('http://localhost:3001/api/products')
    .catch(e => console.log('CORS blocked:', e))
  ```
- [ ] See CORS error (expected, correct behavior)

#### Password Security Test:
- [ ] Open SQLite database: `backend/database/store.db`
- [ ] Query admins table
- [ ] Verify password field is hashed (starts with $2a$ or $2b$)
- [ ] NOT plaintext "admin123"

### Phase 5: API Testing ✅

#### Public Endpoints:
- [ ] Test GET `/api/products` (should work)
  ```bash
  curl http://localhost:3001/api/products
  ```
- [ ] Test GET `/api/categories` (should work)
  ```bash
  curl http://localhost:3001/api/categories
  ```

#### Protected Endpoints (No Token):
- [ ] Test POST `/api/products` (should fail with 403)
  ```bash
  curl -X POST http://localhost:3001/api/products
  ```
- [ ] Should receive: `{"message":"No token provided","code":"NO_TOKEN"}`

#### Protected Endpoints (With Valid Token):
- [ ] Get token from login API
- [ ] Test GET `/api/orders` with token
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:3001/api/orders
  ```
- [ ] Should receive orders list (might be empty initially)

### Phase 6: Frontend Storage ✅

- [ ] Login to admin
- [ ] Open Dev Tools → Application → LocalStorage
- [ ] Find key: `bint-alyemen-admin`
- [ ] Verify contains: `isLoggedIn`, `token`, `adminEmail`, `tokenExpiry`
- [ ] Token should be a long JWT string starting with `eyJ`
- [ ] tokenExpiry should be future timestamp

### Phase 7: Session Management ✅

- [ ] Login to admin
- [ ] Click "Logout" button
- [ ] Verify redirected to login page
- [ ] Check localStorage is cleared (no bint-alyemen-admin key)
- [ ] Try accessing `/admin/dashboard` without login
- [ ] Should redirect to `/admin` login

### Phase 8: Product Management ✅

#### Create Product:
- [ ] Add new product with all fields
- [ ] Verify it appears in product list
- [ ] Verify image uploads correctly

#### Update Product:
- [ ] Click edit on a product
- [ ] Change some fields
- [ ] Save changes
- [ ] Verify changes reflected

#### Delete Product:
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify product removed from list

### Phase 9: Order Management ✅

#### Create Order (Customer):
- [ ] Go to storefront: `/`
- [ ] Browse products
- [ ] Add product to cart
- [ ] Click checkout
- [ ] Fill customer info
- [ ] Verify order created

#### View Orders (Admin):
- [ ] Go to admin dashboard
- [ ] Click "Orders" tab
- [ ] Verify customer order appears
- [ ] Check order details match

#### Update Order Status:
- [ ] Click on order
- [ ] Change status from "Pending" to "Processing"
- [ ] Verify change saved
- [ ] Try all status options

### Phase 10: Error Handling ✅

#### Test various error scenarios:
- [ ] Send invalid JSON to API
- [ ] Try to access non-existent product
- [ ] Try to delete non-existent product
- [ ] Send request with expired token
- [ ] Send request with invalid token format
- [ ] Verify proper error messages returned

---

## Production Deployment Checklist

### Pre-Production Configuration

#### Environment Variables:
- [ ] Change `JWT_SECRET` to random strong string
  ```
  # Generate with: openssl rand -base64 32
  JWT_SECRET=<new_random_secret>
  ```
- [ ] Change `ADMIN_EMAIL` if needed
- [ ] Change `ADMIN_PASSWORD` to secure password
- [ ] Set `NODE_ENV=production`
- [ ] Set `CORS_ORIGIN=https://yourdomain.com`

#### Database:
- [ ] Delete old `store.db` file (to re-seed with new admin)
- [ ] Run: `npm run seed`
- [ ] Verify admin user created with new password
- [ ] Backup database configuration

#### Security:
- [ ] Install HTTPS certificate
- [ ] Update all HTTP to HTTPS
- [ ] Add security headers (CSP, HSTS)
- [ ] Enable rate limiting on login endpoint
- [ ] Set up server-side logging
- [ ] Enable database encryption (optional)

#### Dependencies:
- [ ] Run `npm audit` in both folders
- [ ] Fix vulnerabilities: `npm audit fix`
- [ ] Update all dependencies to latest versions
- [ ] Remove unused packages

### Server Deployment

#### Backend:
- [ ] Deploy to production server
- [ ] Configure Node.js production process manager (PM2/Forever)
- [ ] Set up auto-restart on crash
- [ ] Configure log rotation
- [ ] Set up monitoring/alerting

#### Frontend:
- [ ] Build frontend: `npm run build`
- [ ] Deploy to CDN or web server
- [ ] Configure HTTPS on frontend
- [ ] Add gzip compression
- [ ] Set cache headers appropriately

#### Database:
- [ ] Use managed database if possible
- [ ] Set up automated backups
- [ ] Test backup restoration
- [ ] Monitor database performance
- [ ] Set up alerting for issues

### Verification

- [ ] Test login with new credentials
- [ ] Verify token expiry works
- [ ] Test all admin operations
- [ ] Test CORS from production domain
- [ ] Check HTTPS certificate is valid
- [ ] Monitor for errors/warnings in logs
- [ ] Test from different browsers
- [ ] Test on mobile devices
- [ ] Verify analytics/monitoring working

---

## Code Review Checklist

### Backend Code Review

#### Security:
- [ ] No plaintext passwords in code or commits
- [ ] No hardcoded API keys or secrets
- [ ] All environment variables in .env
- [ ] JWT_SECRET is long and random
- [ ] Password hashing uses bcryptjs
- [ ] JWT expiry is 2 hours
- [ ] All admin routes protected with middleware

#### Code Quality:
- [ ] Proper error handling on all routes
- [ ] Input validation on all endpoints
- [ ] Proper HTTP status codes
- [ ] No SQL injection vulnerabilities
- [ ] No unhandled promise rejections
- [ ] Consistent code style
- [ ] Comments where needed

#### Testing:
- [ ] Manual API testing done
- [ ] CORS configuration tested
- [ ] Token expiry tested
- [ ] Protected routes tested
- [ ] Error scenarios tested

### Frontend Code Review

#### Security:
- [ ] No tokens exposed in UI
- [ ] Token not logged to console
- [ ] localStorage key is obscured
- [ ] Routes properly protected
- [ ] No hardcoded API endpoints
- [ ] CORS errors handled gracefully

#### Code Quality:
- [ ] Components properly structured
- [ ] Error handling in all API calls
- [ ] Loading states shown
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Accessibility considered

#### Testing:
- [ ] Login/logout works
- [ ] Protected routes protected
- [ ] Token expiry handled
- [ ] Error messages shown
- [ ] Mobile tested

---

## Documentation Review

- [ ] `SECURITY_REPORT.md` - Complete and accurate
- [ ] `SETUP_GUIDE.md` - Clear instructions
- [ ] `SECURITY_QUICKREF.md` - Quick reference correct
- [ ] `ARCHITECTURE_DIAGRAMS.md` - Diagrams accurate
- [ ] `IMPLEMENTATION_COMPLETE.md` - Status updated
- [ ] `.env.example` - All variables documented
- [ ] Code comments - Clear and helpful

---

## Monitoring & Maintenance

### Daily:
- [ ] Monitor error logs
- [ ] Check for failed login attempts
- [ ] Verify system uptime
- [ ] Review security alerts

### Weekly:
- [ ] Check database size
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Check for updates

### Monthly:
- [ ] Security audit
- [ ] Performance review
- [ ] Database optimization
- [ ] Update dependencies

### Quarterly:
- [ ] Security assessment
- [ ] Penetration testing (if budget allows)
- [ ] Documentation review
- [ ] Credential rotation

---

## Common Issues & Solutions

### Issue: "JWT_SECRET not set"
**Solution**: 
```bash
echo "JWT_SECRET=your-secret" >> backend/.env
```

### Issue: "CORS error on requests"
**Solution**:
```bash
# Check CORS_ORIGIN in .env matches your frontend URL
grep CORS_ORIGIN backend/.env
```

### Issue: "Token expired" too often
**Solution**:
```javascript
// In backend/routes/auth.js, change:
expiresIn: '2h'  // Increase to '24h' if needed (not recommended)
```

### Issue: Admin can't login
**Solution**:
```bash
# Re-seed the database
cd backend
npm run seed
# Then try default credentials: admin@bintalyemen.com / admin123
```

### Issue: Token not being saved
**Solution**:
```javascript
// Check adminStore.ts login method is being called
// Verify localStorage is not disabled in browser
// Check browser console for errors
```

---

## Before Going Live Checklist

- [ ] All security features tested
- [ ] Code reviewed by second developer
- [ ] No console errors or warnings
- [ ] All documentation complete
- [ ] Credentials changed from defaults
- [ ] HTTPS configured
- [ ] CORS restricted to production domain
- [ ] Database backed up
- [ ] Monitoring set up
- [ ] Incident response plan documented
- [ ] Team trained on security procedures
- [ ] Legal review completed
- [ ] Privacy policy updated

---

## Sign-Off

**Developer**: ___________________  
**Date**: ___________________  
**Environment**: ☐ Development  ☐ Staging  ☐ Production  

**Checklist Status**:
- ☐ All items completed
- ☐ All tests passed
- ☐ Ready for deployment
- ☐ Documentation complete

---

## Emergency Contacts

**Security Issues**: security@company.com  
**Technical Support**: support@company.com  
**Management**: admin@company.com  

---

**Version**: 1.0  
**Last Updated**: January 27, 2026  
**Status**: Ready for Use
