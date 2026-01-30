# ✅ Production Deployment Checklist

## قبل النشر (Pre-Deployment)

### 1. الاختبار المحلي
- [ ] `npm run build` ينجح بدون أخطاء
- [ ] `npm --prefix backend start` يعمل بدون مشاكل
- [ ] اختبر الفرونتند على `http://localhost:3001`
- [ ] اختبر لوحة الإدارة: login/products/orders
- [ ] اختبر API endpoints يدويًا

### 2. الأمان
- [ ] جميع API endpoints لديها CORS محمي
- [ ] JWT_SECRET قوي وعشوائي
- [ ] لا توجد كلمات مرور مكتوبة في الكود
- [ ] Node env متغيرات في .env (ليس في الكود)

### 3. الملفات الضرورية
- [ ] `dist/` موجود وليس فارغ
- [ ] `backend/server.js` يحتوي على CORS و static files handling
- [ ] `Procfile` موجود
- [ ] `render.yaml` أو `railway.json` موجود
- [ ] `.env.production.example` موجود

### 4. Github
- [ ] Repository عام (public) على GitHub
- [ ] اسم واضح مثل `bint-alyemen-store`
- [ ] README.md موجود
- [ ] جميع الملفات مرفوعة

---

## أثناء النشر (Deployment)

### على Render:
1. [ ] سجّل على [render.com](https://render.com)
2. [ ] اضغط "New +" → "Web Service"
3. [ ] اختر repository من GitHub
4. [ ] ملأ Build & Start Commands
5. [ ] أضف Environment Variables
6. [ ] اضغط "Deploy"

### على Railway (البديل):
1. [ ] ثبت Railway CLI: `npm i -g @railway/cli`
2. [ ] سجّل: `railway login`
3. [ ] انشر: `railway up`

---

## بعد النشر (Post-Deployment)

### 1. الاختبار الأساسي
- [ ] الرابط الرئيسي يفتح بدون مشاكل
- [ ] لا توجد أخطاء console
- [ ] الصور تظهر بشكل صحيح

### 2. الوظائف
- [ ] صفحة المتجر تحمل المنتجات
- [ ] لوحة الإدارة تفتح
- [ ] يمكن تسجيل الدخول
- [ ] يمكن إضافة/تعديل المنتجات
- [ ] يمكن عرض الطلبات

### 3. API endpoints
- [ ] `/api/health` يعود 200 OK
- [ ] `/api/products` يعود JSON
- [ ] `/api/auth/login` يعمل
- [ ] Admin endpoints محمية

### 4. قاعدة البيانات
- [ ] البيانات محفوظة
- [ ] لا توجد أخطاء database
- [ ] النسخ الاحتياطية تعمل

### 5. Performance
- [ ] الموقع يحمل بسرعة معقولة
- [ ] لا توجد timeouts
- [ ] Memory usage معقول

---

## استكشاف المشاكل

### المشكلة: Build يفشل
```bash
# افحص logs على Render/Railway
# تحقق من:
npm run build  # محليًا
npm --prefix backend install  # حديثة
```

### المشكلة: الموقع لا يفتح
```bash
# افحص:
curl https://your-app.render.com/api/health
```

### المشكلة: الفرونتند يرى صفحة فارغة
```bash
# تحقق من:
# 1. dist/ موجود ومليء
# 2. VITE_API_URL محدد صحيح
```

### المشكلة: لا يمكن تسجيل الدخول
```bash
# افحص:
# 1. ADMIN_EMAIL و ADMIN_PASSWORD محددة
# 2. قاعدة البيانات بُنيت
# 3. JWT_SECRET موجود
```

---

## البيانات الضرورية

### للنشر على Render:
- [ ] GitHub Account
- [ ] Email للتحقق
- [ ] Render Account (مجاني)

### Environment Variables (املأها على Render):
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-random-secret-here
ADMIN_EMAIL=admin@bintalyemen.com
ADMIN_PASSWORD=your-password
FRONTEND_URL=https://your-app-name.render.com
CORS_ORIGIN=https://your-app-name.render.com
```

---

## الدعم والمساعدة

| المشكلة | الحل |
|--------|------|
| Build fails | افحص logs، تأكد من dependencies |
| 404 errors | تحقق من CORS و static files setup |
| DB errors | قاعدة البيانات تُنشأ تلقائيًا |
| Slow performance | Plan مجاني يوقف نفسه بعد 15 دقيقة بدون activity |

---

## الخطوات النهائية

1. [ ] اختبر جميع الوظائف على production
2. [ ] احفظ الرابط النهائي
3. [ ] أخبر الزملاء/المديرين برابط الموقع
4. [ ] راقب logs الأولى 24 ساعة
5. [ ] أعد النسخ الاحتياطية

---

## معلومات مهمة

- الخطة المجانية من Render توقف الخدمة بعد 15 دقيقة بدون requests (تستيقظ عند الطلب)
- لتجنب التوقف: استخدم uptime monitor مثل UptimeRobot (مجاني)
- قاعدة البيانات SQLite تعمل محليًا فقط (مشكلة في الخوادم الموزعة - الحل: PostgreSQL مستقبلاً)

---

**تم النشر بنجاح! 🎉**

الرابط: `https://your-app-name.render.com`
