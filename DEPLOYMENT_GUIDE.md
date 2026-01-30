# دليل النشر - متجر بنت اليمن Implementation Guide

هذا الدليل يشرح كيفية رفع المتجر (Frontend + Backend) بشكل منفصل واحترافي.

## 1. Backend Deployment (Railway)

السيرفر وقاعدة البيانات سيتم استضافتهم على Railway.

### الخطوات:
1. قم بإنشاء حساب في [Railway](https://railway.app/).
2. اضغط **New Project** -> **Deploy from GitHub repo**.
3. اختر مستودع المشروع الخاص بك.
4. اذهب إلى **Settings** -> **Root Directory** واكتب: `/backend`
5. اذهب إلى **Variables** وأضف المتغيرات التالية:
    - `NODE_ENV`: `production`
    - `PORT`: `3001` (أو اتركه وهو سيأخذ البورت الافتراضي)
    - `JWT_SECRET`: (اكتب نص عشوائي طويل وقوي)
    - `ADMIN_EMAIL`: (إيميل الدخول للوحة التحكم)
    - `ADMIN_PASSWORD`: (كلمة مرور لوحة التحكم)
    - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app` (بعد رفع الفرونت إند، ارجع وعدلها هنا)

سيقوم Railway تلقائياً بتثبيت `npm install` وتشغيل `npm start` بناءً على ملف `package.json` داخل مجلد `backend`.

---

## 2. Frontend Deployment (Vercel)

واجهة المتجر سيتم استضافتها على Vercel لسرعة التصفح.

### الخطوات:
1. قم بإنشاء حساب في [Vercel](https://vercel.com/).
2. اضغط **Add New** -> **Project**.
3. استورد نفس مستودع المشروع من GitHub.
4. في **Framework Preset**، تأكد أنه اختار **Vite**.
5. في **Environment Variables**، أضف:
    - `VITE_API_URL`: (رابط الباك اند من Railway)
      - مثال: `https://bint-alyemen-production.up.railway.app/api`
6. اضغط **Deploy**.

---

## 3. الربط النهائي (Final Connection)

1. بعد أن ينتهي Vercel من الرفع، انسخ رابط موقعك (مثال: `https://bint-alyemen.vercel.app`).
2. ارجع إلى **Railway** -> **Variables**.
3. عدل قيمة `CORS_ORIGIN` لتكون رابط Vercel الخاص بك.
4. سيقوم Railway بإعادة تشغيل السيرفر تلقائياً.

---

## 4. التحقق من العمل

1. افتح رابط المتجر.
2. تأكد أن المنتجات تظهر (يعني الاتصال بالسيرفر ناجح).
3. جرب تسجيل الدخول كأدمن من الرابط `/admin`.
