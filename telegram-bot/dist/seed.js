"use strict";
/**
 * 🌱 Seed Script — Add sample categories and menu items to Firestore
 *
 * Run: npx ts-node src/seed.ts
 * Or:  npm run seed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("./config/firebase");
const env_1 = require("./config/env");
const categories = [
    { name_ar: 'مقبلات', name_en: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', sort_order: 1, is_active: true },
    { name_ar: 'سلطات', name_en: 'Salads', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', sort_order: 2, is_active: true },
    { name_ar: 'برغر', name_en: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', sort_order: 3, is_active: true },
    { name_ar: 'بيتزا', name_en: 'Pizza', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', sort_order: 4, is_active: true },
    { name_ar: 'مشاوي', name_en: 'Grilled', image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', sort_order: 5, is_active: true },
    { name_ar: 'مشروبات', name_en: 'Drinks', image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', sort_order: 6, is_active: true },
    { name_ar: 'حلويات', name_en: 'Desserts', image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', sort_order: 7, is_active: true },
];
const menuItems = [
    // ── مقبلات ──
    { category_name_ar: 'مقبلات', name_ar: 'حمص', name_en: 'Hummus', description_ar: 'حمص بالطحينة مع زيت الزيتون', description_en: 'Chickpeas with tahini and olive oil', price: 15, image_url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400', is_available: true, is_featured: true, sort_order: 1, has_addons: false },
    { category_name_ar: 'مقبلات', name_ar: 'متبل', name_en: 'Mutabbal', description_ar: 'باذنجان مشوي مع الطحينة', description_en: 'Grilled eggplant with tahini', price: 18, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', is_available: true, is_featured: false, sort_order: 2, has_addons: false },
    { category_name_ar: 'مقبلات', name_ar: 'ورق عنب', name_en: 'Stuffed Grape Leaves', description_ar: 'ورق عنب محشي أرز وخضار', description_en: 'Grape leaves stuffed with rice and vegetables', price: 22, image_url: 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
    { category_name_ar: 'مقبلات', name_ar: 'سمبوسك', name_en: 'Samosas', description_ar: 'سمبوسك مقلي بحشوة اللحم والجبنة (4 حبات)', description_en: 'Fried samosas with meat and cheese filling (4 pcs)', price: 16, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', is_available: true, is_featured: false, sort_order: 4, has_addons: false },
    // ── سلطات ──
    { category_name_ar: 'سلطات', name_ar: 'فتوش', name_en: 'Fattoush', description_ar: 'سلطة خضار مع خبز مقرمش', description_en: 'Vegetable salad with crispy bread', price: 20, image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', is_available: true, is_featured: false, sort_order: 1, has_addons: false },
    { category_name_ar: 'سلطات', name_ar: 'تبولة', name_en: 'Tabbouleh', description_ar: 'برغل مع بقدونس وطماطم', description_en: 'Bulgur with parsley and tomatoes', price: 18, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', is_available: true, is_featured: true, sort_order: 2, has_addons: false },
    { category_name_ar: 'سلطات', name_ar: 'سلطة يونانية', name_en: 'Greek Salad', description_ar: 'خس، طماطم، خيار، زيتون وجبنة فيتا', description_en: 'Lettuce, tomatoes, cucumber, olives and feta cheese', price: 22, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
    // ── برغر ──
    { category_name_ar: 'برغر', name_ar: 'برغر كلاسيك', name_en: 'Classic Burger', description_ar: 'لحم بقري 200 جرام مع جبن وخس وطماطم', description_en: '200g beef patty with cheese, lettuce and tomato', price: 35, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', is_available: true, is_featured: true, sort_order: 1, has_addons: true, addons: [
            { name_ar: 'جبنة إضافية', price: 3, is_required: false, max_select: 2 },
            { name_ar: 'لحم إضافي', price: 12, is_required: false, max_select: 1 },
            { name_ar: 'بطاطس', price: 5, is_required: false, max_select: 1 },
        ] },
    { category_name_ar: 'برغر', name_ar: 'برغر دجاج', name_en: 'Chicken Burger', description_ar: 'صدر دجاج مقرمش مع مايونيز وخس', description_en: 'Crispy chicken breast with mayo and lettuce', price: 32, image_url: 'https://images.unsplash.com/photo-1614331771847-3fdb4e3bb6dd?w=400', is_available: true, is_featured: false, sort_order: 2, has_addons: true, addons: [
            { name_ar: 'جبنة', price: 3, is_required: false, max_select: 1 },
            { name_ar: 'بطاطس', price: 5, is_required: false, max_select: 1 },
        ] },
    { category_name_ar: 'برغر', name_ar: 'دبل برغر', name_en: 'Double Burger', description_ar: 'طبقتين لحم بقري مع جبن مزدوج', description_en: 'Double beef patty with double cheese', price: 45, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
    // ── بيتزا ──
    { category_name_ar: 'بيتزا', name_ar: 'بيتزا مارغريتا', name_en: 'Margherita Pizza', description_ar: 'صلصة طماطم، موزاريلا، ريحان', description_en: 'Tomato sauce, mozzarella, basil', price: 40, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', is_available: true, is_featured: true, sort_order: 1, has_addons: false },
    { category_name_ar: 'بيتزا', name_ar: 'بيتزا بيبروني', name_en: 'Pepperoni Pizza', description_ar: 'صلصة طماطم، موزاريلا، بيبروني', description_en: 'Tomato sauce, mozzarella, pepperoni', price: 45, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', is_available: true, is_featured: false, sort_order: 2, has_addons: false },
    { category_name_ar: 'بيتزا', name_ar: 'بيتزا خضار', name_en: 'Vegetable Pizza', description_ar: 'فلفل، زيتون، مشروم، بصل', description_en: 'Peppers, olives, mushrooms, onions', price: 42, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
    // ── مشاوي ──
    { category_name_ar: 'مشاوي', name_ar: 'شيش طاووق', name_en: 'Shish Tawook', description_ar: 'أسياخ دجاج مشوية مع الخضار', description_en: 'Grilled chicken skewers with vegetables', price: 38, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', is_available: true, is_featured: true, sort_order: 1, has_addons: false },
    { category_name_ar: 'مشاوي', name_ar: 'كفتة', name_en: 'Kofta', description_ar: 'كفتة لحم مشوية على الفحم', description_en: 'Grilled minced meat kofta', price: 35, image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400', is_available: true, is_featured: false, sort_order: 2, has_addons: false },
    { category_name_ar: 'مشاوي', name_ar: 'شيش كباب', name_en: 'Shish Kebab', description_ar: 'لحم بقري مشوي مع الأرز', description_en: 'Grilled beef with rice', price: 42, image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
    // ── مشروبات ──
    { category_name_ar: 'مشروبات', name_ar: 'عصير برتقال طازج', name_en: 'Fresh Orange Juice', description_ar: 'عصير برتقال طبيعي 100%', description_en: '100% natural orange juice', price: 12, image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', is_available: true, is_featured: false, sort_order: 1, has_addons: false },
    { category_name_ar: 'مشروبات', name_ar: 'كوكتيل', name_en: 'Fruit Cocktail', description_ar: 'كوكتيل فواكه مشكلة', description_en: 'Mixed fruit cocktail', price: 15, image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', is_available: true, is_featured: false, sort_order: 2, has_addons: false },
    { category_name_ar: 'مشروبات', name_ar: 'ميرندا', name_en: 'Mirinda', description_ar: 'مشروب غازي بنكهة البرتقال', description_en: 'Orange flavored soda', price: 5, image_url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
    { category_name_ar: 'مشروبات', name_ar: 'مياه معدنية', name_en: 'Mineral Water', description_ar: 'مياه معدنية 500 مل', description_en: 'Mineral water 500ml', price: 3, image_url: 'https://images.unsplash.com/photo-1616118132534-3815f88e90c1?w=400', is_available: true, is_featured: false, sort_order: 4, has_addons: false },
    // ── حلويات ──
    { category_name_ar: 'حلويات', name_ar: 'كنافة', name_en: 'Kunafa', description_ar: 'كنافة نابلسية بالجبن', description_en: 'Nablus-style cheese kunafa', price: 25, image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', is_available: true, is_featured: true, sort_order: 1, has_addons: false },
    { category_name_ar: 'حلويات', name_ar: 'أم علي', name_en: 'Om Ali', description_ar: 'حلى أم علي بالعجين والمكسرات', description_en: 'Egyptian bread pudding with nuts', price: 22, image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', is_available: true, is_featured: false, sort_order: 2, has_addons: false },
    { category_name_ar: 'حلويات', name_ar: 'تشيز كيك', name_en: 'Cheesecake', description_ar: 'تشيز كيك طبقة علوية من التوت', description_en: 'Cheesecake with berry topping', price: 28, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', is_available: true, is_featured: false, sort_order: 3, has_addons: false },
];
// ============================================================
// Seed Logic
// ============================================================
async function seed() {
    console.log('🌱 Starting seed...\n');
    // Initialize Firebase
    (0, env_1.validateEnv)();
    (0, firebase_1.initFirebase)();
    const db = (0, firebase_1.getFirestore)();
    console.log('✅ Firebase initialized\n');
    // 1. Seed Categories
    console.log('📁 Creating categories...');
    const categoryRefs = {};
    for (const cat of categories) {
        const docRef = await db.collection('categories').add({
            ...cat,
            created_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        categoryRefs[cat.name_ar] = docRef.id;
        console.log(`   ✅ ${cat.name_ar} (${docRef.id})`);
    }
    console.log(`\n   ✅ ${categories.length} categories created\n`);
    // 2. Seed Menu Items
    console.log('🍔 Creating menu items...');
    for (const item of menuItems) {
        const categoryId = categoryRefs[item.category_name_ar];
        if (!categoryId) {
            console.warn(`   ⚠️ Category "${item.category_name_ar}" not found for item "${item.name_ar}"`);
            continue;
        }
        const { category_name_ar, ...itemData } = item;
        await db.collection('menu_items').add({
            ...itemData,
            category_id: categoryId,
            created_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`   ✅ ${item.name_ar} — ${item.price} ر.س`);
    }
    console.log(`\n   ✅ ${menuItems.length} menu items created\n`);
    console.log('🎉 Seed completed successfully!');
    console.log(`   📊 ${categories.length} categories, ${menuItems.length} menu items`);
    process.exit(0);
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map