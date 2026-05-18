/**
 * 📸 Update Image URLs — Updates existing menu items and categories in Firestore
 * with premium high-resolution Unsplash image URLs.
 *
 * Run: npx ts-node src/update-images.ts
 */

import { initFirebase, getFirestore, admin } from './config/firebase';
import { validateEnv } from './config/env';

// ============================================================
// New premium image URLs (w=800&q=80 for crisp, fast-loading images)
// ============================================================

const categoryImages: Record<string, string> = {
  'مقبلات': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'سلطات': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'برغر': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  'بيتزا': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'مشاوي': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  'مشروبات': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
  'حلويات': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
};

const menuItemImages: Record<string, string> = {
  'حمص': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80',
  'متبل': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
  'ورق عنب': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=800&q=80',
  'سمبوسك': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  'فتوش': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
  'تبولة': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'سلطة يونانية': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'برغر كلاسيك': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  'برغر دجاج': 'https://images.unsplash.com/photo-1614331771847-3fdb4e3bb6dd?w=800&q=80',
  'دبل برغر': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
  'بيتزا مارغريتا': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'بيتزا بيبروني': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
  'بيتزا خضار': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
  'شيش طاووق': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  'كفتة': 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
  'شيش كباب': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
  'عصير برتقال طازج': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80',
  'كوكتيل': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
  'ميرندا': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&q=80',
  'مياه معدنية': 'https://images.unsplash.com/photo-1616118132534-3815f88e90c1?w=800&q=80',
  'كنافة': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'أم علي': 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80',
  'تشيز كيك': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80',
};

// ============================================================
// Update Logic
// ============================================================

async function updateImages() {
  console.log('📸 Updating image URLs...\n');

  validateEnv();
  initFirebase();
  const db = getFirestore();

  // ─── 1. Update Categories ───
  console.log('📁 Updating category images...');
  let catUpdated = 0;
  const catSnapshot = await db.collection('categories').get();

  for (const doc of catSnapshot.docs) {
    const data = doc.data();
    const nameAr: string = data.name_ar;
    const newUrl = categoryImages[nameAr];

    if (newUrl && data.image_url !== newUrl) {
      await doc.ref.update({ image_url: newUrl, updated_at: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`   ✅ ${nameAr} → image updated`);
      catUpdated++;
    } else if (data.image_url !== newUrl) {
      console.log(`   ⏭️ ${nameAr} → no match found, skipped`);
    } else {
      console.log(`   ✅ ${nameAr} → already up to date`);
      catUpdated++;
    }
  }
  console.log(`\n   📊 ${catUpdated}/${catSnapshot.docs.length} categories updated\n`);

  // ─── 2. Update Menu Items ───
  console.log('🍔 Updating menu item images...');
  let itemUpdated = 0;
  const itemSnapshot = await db.collection('menu_items').get();

  for (const doc of itemSnapshot.docs) {
    const data = doc.data();
    const nameAr: string = data.name_ar;
    const newUrl = menuItemImages[nameAr];

    if (newUrl && data.image_url !== newUrl) {
      await doc.ref.update({ image_url: newUrl, updated_at: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`   ✅ ${nameAr} → image updated`);
      itemUpdated++;
    } else if (data.image_url === newUrl) {
      console.log(`   ✅ ${nameAr} → already up to date`);
      itemUpdated++;
    } else {
      console.log(`   ⏭️ ${nameAr} → no match found, skipped`);
    }
  }
  console.log(`\n   📊 ${itemUpdated}/${itemSnapshot.docs.length} menu items updated`);

  console.log('\n🎉 Image update completed successfully!');
  process.exit(0);
}

updateImages().catch((err) => {
  console.error('❌ Update failed:', err);
  process.exit(1);
});
