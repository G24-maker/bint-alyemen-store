# 🚀 Deployment Guide - Bint Alyemen Store

## خطوات النشر على Render (المجاني)

### الخطوة 1: إنشاء حساب على Render
- اذهب إلى [render.com](https://render.com)
- سجّل حساب جديد (مجاني)
- تحقق من بريدك الإلكتروني

### الخطوة 2: إعداد المشروع محليًا

```bash
# 1. تأكد من بناء الفرونتند
npm run build

# 2. افحص المجلدات
ls -la dist/          # يجب أن تجد index.html
ls backend/           # يجب أن تجد server.js
```

### الخطوة 3: رفع على GitHub (مطلوب لـ Render)

```bash
# 1. إنشاء repository على GitHub
# 2. أضف ملفات المشروع
git init
git add .
git commit -m "Initial commit - production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bint-alyemen.git
git push -u origin main
```

### الخطوة 4: ربط مع Render

1. اذهب إلى dashboard Render
2. اضغط "New +" → "Web Service"
3. اختر "Deploy from Git"
4. اختر repository الخاص بك (bint-alyemen)
5. ملأ المعلومات:
   - **Name:** bint-alyemen-store
   - **Branch:** main
   - **Build Command:** 
     ```
     cd backend && npm install && cd .. && npm install && npm run build
     ```
   - **Start Command:**
     ```
     npm --prefix backend start
     ```
   - **Region:** Singapore (أو أقرب منطقة)
   - **Plan:** Free

6. اضغط "Create Web Service"

### الخطوة 5: إضافة Environment Variables

في Render Dashboard:
1. اذهب إلى "Environment"
2. أضف المتغيرات:

```
ODE_ENV=production
PORT=3001
JWT_SECRET=generate-random-string-here
ADMIN_EMAIL=admin@bintalyemen.com
ADMIN_PASSWORD=your-secure-password
FRONTEND_URL=https://your-app-name.render.com
CORS_ORIGIN=https://your-app-name.render.comN
```

### الخطوة 6: الانتظار والاختبار

- الانتظار 5-10 دقائق للبناء والنشر
- سيظهر الرابط: `https://bint-alyemen-store.render.com`
- اختبر الرابط في المتصفح

---

## النشر على Railway (بديل مجاني)

### الخطوة 1: إعداد Railway

```bash
# 1. ثبت Railway CLI
npm i -g @railway/cli

# 2. تسجيل الدخول
railway login

# 3. إنشاء مشروع جديد
railway init
```

### الخطوة 2: النشر

```bash
railway up
```

---

## الاختبار بعد النشر

### 1. اختبر الفرونتند
```
https://your-app-name.render.com/
```
يجب أن ترى المتجر الرئيسي

### 2. اختبر لوحة الإدارة
```
https://your-app-name.render.com/admin
```
يجب أن تتمكن من تسجيل الدخول بـ:
- Email: admin@bintalyemen.com
- Password: (الكلمة التي أضفتها)

### 3. اختبر API
```
curl https://your-app-name.render.com/api/health
```
يجب أن ترد: `{"status":"ok","timestamp":"..."}`

### 4. اختبر المنتجات
```
https://your-app-name.render.com/api/products
```

---

## المشاكل الشائعة والحلول

### المشكلة: "Build failed"
**الحل:**
- افحص logs على Render
- تأكد من `npm run build` يعمل محليًا
- تأكد من جميع dependencies مثبتة

### المشكلة: "Cannot find dist"
**الحل:**
```bash
# قم بـ build محليًا
npm run build
# ثم push على GitHub
git add dist/
git commit -m "Add build dist"
git push
```

### المشكلة: "API not responding"
**الحل:**
- افحص `NODE_ENV=production` موجود
- افحص `PORT=3001` موجود
- افحص logs: Render Dashboard → Logs

### المشكلة: "Database not found"
**الحل:**
- قاعدة البيانات تُنشأ تلقائيًا عند أول تشغيل
- اختبر: `curl https://your-app.render.com/api/products`

---

## الأوامر السريعة

| الأمر | الفائدة |
|------|---------|
| `npm run build` | بناء الفرونتند للإنتاج |
| `npm --prefix backend start` | تشغيل السيرفر |
| `npm run dev:backend` | تشغيل البيكند في development |
| `git push` | رفع التحديثات |

---

## متغيرات البيئة الحساسة

⚠️ **لا تضع هذه في الكود - استخدم Render Dashboard:**
- `JWT_SECRET` - غيّره إلى قيمة عشوائية قوية
- `ADMIN_PASSWORD` - غيّره إلى كلمة مرور آمنة
- `CORS_ORIGIN` - اجعله رابط موقعك الفعلي

---

## النسخة النهائية - الرابط

بعد النشر الناجح، رابطك سيكون:
```
https://bint-alyemen-store.render.com
```

---

## الخطوات التالية (اختيارية)

1. **شراء نطاق مخصص:**
   - اشتري domain من GoDaddy أو Namecheap
   - ربطه مع Render

2. **إضافة SSL:**
   - Render يوفره مجانًا تلقائيًا

3. **إضافة CDN:**
   - Cloudflare (مجاني)

4. **النسخ الاحتياطية:**
   - تُعمل تلقائيًا يوميًا في backend

---

**استفسارات؟ اقرأ README.md أو اراجع الدعم الفني.**

