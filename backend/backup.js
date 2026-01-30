/**
 * Database Backup Script
 * 
 * يوفر هذا الملف وظائف النسخ الاحتياطي اليدوية والتلقائية لقاعدة بيانات SQLite
 * 
 * الاستخدام:
 * - للنسخ الاحتياطي اليدوي: node backup.js
 * - للتكامل التلقائي: يتم استدعاؤه من server.js كل يوم الساعة 2 صباحًا
 */

const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, 'database', 'store.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

/**
 * إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجودًا
 */
function ensureBackupDirExists() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ تم إنشاء مجلد النسخ الاحتياطية: ${BACKUP_DIR}`);
  }
}

/**
 * الحصول على اسم الملف مع التاريخ الحالي
 * بصيغة: backup-YYYY-MM-DD-HH-MM-SS.sqlite
 */
function getBackupFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `backup-${year}-${month}-${day}-${hours}-${minutes}-${seconds}.sqlite`;
}

/**
 * تنفيذ النسخة الاحتياطية
 * ينسخ قاعدة البيانات إلى ملف منفصل مع معالجة الأخطاء
 */
async function performBackup() {
  try {
    // التأكد من وجود قاعدة البيانات
    if (!fs.existsSync(DB_PATH)) {
      console.error(`❌ خطأ: لم يتم العثور على قاعدة البيانات في ${DB_PATH}`);
      return false;
    }

    // إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجودًا
    ensureBackupDirExists();

    // الحصول على اسم الملف مع التاريخ والوقت
    const backupFileName = getBackupFileName();
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // نسخ الملف
    fs.copyFileSync(DB_PATH, backupPath);

    console.log(`✅ تم النسخ الاحتياطي بنجاح: ${backupFileName}`);
    console.log(`   المسار: ${backupPath}`);
    console.log(`   حجم الملف: ${getFileSizeInMB(backupPath)} MB`);

    // تنظيف النسخ القديمة (أكثر من 30 يوم)
    cleanOldBackups();

    return true;
  } catch (error) {
    console.error(`❌ خطأ أثناء النسخ الاحتياطي: ${error.message}`);
    return false;
  }
}

/**
 * الحصول على حجم الملف بوحدة MB
 */
function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

/**
 * حذف النسخ الاحتياطية القديمة (أكثر من 30 يوم)
 */
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    files.forEach((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  تم حذف النسخة القديمة: ${file}`);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ تم حذف ${deletedCount} نسخ احتياطية قديمة`);
    }
  } catch (error) {
    console.warn(`⚠️  تحذير عند تنظيف النسخ القديمة: ${error.message}`);
  }
}

/**
 * قائمة النسخ الاحتياطية الموجودة
 */
function listBackups() {
  try {
    ensureBackupDirExists();
    const files = fs.readdirSync(BACKUP_DIR).sort().reverse();

    if (files.length === 0) {
      console.log('لا توجد نسخ احتياطية حالية');
      return;
    }

    console.log('\n📋 قائمة النسخ الاحتياطية الموجودة:\n');
    files.forEach((file, index) => {
      const filePath = path.join(BACKUP_DIR, file);
      const fileStats = fs.statSync(filePath);
      const size = getFileSizeInMB(filePath);
      const date = fileStats.mtime.toLocaleString('ar-SA');
      console.log(`${index + 1}. ${file}`);
      console.log(`   التاريخ: ${date}`);
      console.log(`   الحجم: ${size} MB\n`);
    });
  } catch (error) {
    console.error(`❌ خطأ عند قائمة النسخ الاحتياطية: ${error.message}`);
  }
}

/**
 * استرجاع نسخة احتياطية
 * @param {string} backupFileName - اسم ملف النسخة الاحتياطية
 */
function restoreBackup(backupFileName) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // التحقق من وجود الملف
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ لم يتم العثور على النسخة الاحتياطية: ${backupFileName}`);
      listBackups();
      return false;
    }

    // إنشاء نسخة احتياطية من الملف الحالي قبل الاستعادة
    const timestamp = Date.now();
    const originalBackup = path.join(BACKUP_DIR, `store-before-restore-${timestamp}.db`);
    fs.copyFileSync(DB_PATH, originalBackup);
    console.log(`✅ تم حفظ نسخة احتياطية من الملف الحالي: store-before-restore-${timestamp}.db`);

    // استعادة النسخة الاحتياطية
    fs.copyFileSync(backupPath, DB_PATH);
    console.log(`✅ تم استعادة النسخة الاحتياطية بنجاح: ${backupFileName}`);
    console.log(`⚠️  يرجى إعادة تشغيل السيرفر لتفعيل التغييرات`);

    return true;
  } catch (error) {
    console.error(`❌ خطأ أثناء استعادة النسخة الاحتياطية: ${error.message}`);
    return false;
  }
}

/**
 * عرض شرح الاستخدام
 */
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         أداة النسخ الاحتياطي لقاعدة البيانات              ║
╚════════════════════════════════════════════════════════════╝

الأوامر المتاحة:

  node backup.js                    - تنفيذ نسخة احتياطية جديدة
  node backup.js list               - عرض قائمة النسخ الاحتياطية
  node backup.js restore <filename> - استعادة نسخة احتياطية

أمثلة:
  node backup.js
  node backup.js list
  node backup.js restore backup-2026-01-28-02-00-00.sqlite

الميزات:
  ✅ نسخ احتياطي تلقائي يومي الساعة 2 صباحًا
  ✅ حذف النسخ الأقدم من 30 يوم تلقائيًا
  ✅ دعم استعادة النسخ الاحتياطية
  ✅ معالجة أخطاء آمنة
  ✅ عدم التأثير على أداء السيرفر

ملاحظة:
  يجب إعادة تشغيل السيرفر بعد استعادة نسخة احتياطية.
  `);
}

// تنفيذ الأوامر من سطر الأوامر
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // الحالة الافتراضية: تنفيذ نسخة احتياطية جديدة
    console.log('🔄 جاري تنفيذ النسخ الاحتياطي...\n');
    performBackup();
  } else if (args[0] === 'list') {
    listBackups();
  } else if (args[0] === 'restore' && args[1]) {
    console.log(`🔄 جاري استعادة النسخة الاحتياطية: ${args[1]}\n`);
    restoreBackup(args[1]);
  } else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
  } else {
    console.log('❌ أمر غير معروف\n');
    showHelp();
  }
}

// تصدير الدوال للاستخدام من ملفات أخرى
module.exports = {
  performBackup,
  ensureBackupDirExists,
  listBackups,
  restoreBackup,
  getBackupFileName
};
