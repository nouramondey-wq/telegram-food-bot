"use strict";
/**
 * ?? Update Image URLs � Updates existing menu items and categories in Firestore
 * with premium high-resolution Unsplash image URLs (Unicode Version).
 *
 * Run: npm run build && node dist/update-images.js
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const firebase_1 = require("./config/firebase");
const env_1 = require("./config/env");
const serviceAccountPath = path.join(__dirname, '../my-restaurant-app-de879-firebase-adminsdk-fbsvc-cfde28c0a5.json');
try {
    firebase_1.admin.initializeApp({
        credential: firebase_1.admin.credential.cert(serviceAccountPath)
    }, 'image-updater-app');
}
catch (e) {
    // App already initialized
}
const db = firebase_1.admin.firestore(firebase_1.admin.apps.find(app => app?.name === 'image-updater-app'));
// ============================================================
// Premium image URLs mapped using Safe Unicode for Arabic keys
// ============================================================
const categoryImages = {
    '\u0645\u0642\u0628\u0644\u0627\u062a': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', // ??????
    '\u0633\u0644\u0637\u0627\u062a': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', // ?????
    '\u0628\u0631\u063a\u0631': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', // ????
    '\u0628\u064a\u062a\u0632\u0627': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', // ?????
    '\u0645\u0634\u0627\u0641\u064a': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', // ?????
    '\u0645\u0634\u0631\u0645\u0628\u0627\u062a': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', // ???????
    '\u062d\u0644\u0645\u064a\u0627\u062a': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', // ??????
};
const menuItemImages = {
    '\u062d\u0645\u0635': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80', // ???
    '\u0645\u062a\u0628\u0644': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80', // ????
    '\u0645\u0631\u0642 \u0639\u0646\u0628': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=800&q=80', // ??? ???
    '\u0633\u0645\u0628\u0645\u0633\u0643': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', // ??????
    '\u0641\u062a\u0645\u0634': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', // ????
    '\u062a\u0628\u0645\u0644\u0629': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', // ?????
    '\u0633\u0644\u0637\u0629 \u064a\u0645\u0646\u0627\u0646\u064a\u0629': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', // ???? ???????
    '\u0628\u0631\u063a\u0631 \u0643\u0644\u0627\u0633\u064a\u0643': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', // ???? ??????
    '\u0628\u0631\u063a\u0631 \u062a\u062c\u0627\u062c': 'https://images.unsplash.com/photo-1614331771847-3fdb4e3bb6dd?w=800&q=80', // ???? ????
    '\u062f\u0628\u0644 \u0628\u0631\u063a\u0631': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', // ??? ????
    '\u0628\u064a\u062a\u0632\u0627 \u0645\u0627\u0631\u063a\u0631\u064a\u062a\u0627': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', // ????? ????????
    '\u0628\u064a\u062a\u0632\u0627 \u0628\u064a\u0628\u0631\u0645\u0646\u064a': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', // ????? ???????
    '\u0628\u064a\u062a\u0632\u0627 \u062e\u0636\u0627\u0631': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80', // ????? ????
    '\u0634\u064a\u0634 \u0637\u0627\u0645\u0645\u0642': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', // ??? ?????
    '\u0643\u0641\u062a\u0629': 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', // ????
    '\u0634\u064a\u0634 \u0643\u0628\u0627\u0628': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80', // ??? ????
    '\u0639\u0635\u064a\u0631 \u0628\u0631\u062a\u0642\u0627\u0644 \u0637\u0627\u0632\u062c': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80', // ???? ?????? ????
    '\u0643\u0645\u0643\u062a\u064a\u0644': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', // ??????
    '\u0645\u064a\u0631\u0646\u062f\u0627': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&q=80', // ??????
    '\u0645\u064a\u0627\u0647 \u0645\u0631\u062f\u0646\u064a\u0629': 'https://images.unsplash.com/photo-1616118132534-3815f88e90c1?w=800&q=80', // ???? ??????
    '\u0643\u0646\u0627\u0641\u0629': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', // ?????
    '\u0623\u0645 \u0639\u0644\u064a': 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80', // ?? ???
    '\u062a\u0634\u064a\u0632 \u0643\u064a\u0643': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80', // ???? ???
};
async function updateImages() {
    console.log('?? Updating image URLs...\n');
    (0, env_1.validateEnv)();
    // --- 1. Update Categories ---
    console.log('?? Updating category images...');
    let catUpdated = 0;
    const catSnapshot = await db.collection('categories').get();
    for (const doc of catSnapshot.docs) {
        const data = doc.data();
        const nameAr = data.name_ar;
        const newUrl = categoryImages[nameAr];
        if (newUrl && data.image_url !== newUrl) {
            await doc.ref.update({ image_url: newUrl, updated_at: firebase_1.admin.firestore.FieldValue.serverTimestamp() });
            console.log(`   ? Image updated`);
            catUpdated++;
        }
        else {
            catUpdated++;
        }
    }
    console.log(`\n   ?? Categories processing complete.\n`);
    // --- 2. Update Menu Items ---
    console.log('?? Updating menu item images...');
    let itemUpdated = 0;
    const itemSnapshot = await db.collection('menu_items').get();
    for (const doc of itemSnapshot.docs) {
        const data = doc.data();
        const nameAr = data.name_ar;
        const newUrl = menuItemImages[nameAr];
        if (newUrl && data.image_url !== newUrl) {
            await doc.ref.update({ image_url: newUrl, updated_at: firebase_1.admin.firestore.FieldValue.serverTimestamp() });
            console.log(`   ? ${nameAr || 'Item'} ? updated`);
            itemUpdated++;
        }
        else {
            itemUpdated++;
        }
    }
    console.log(`\n   ?? Menu items processing complete.`);
    console.log('\n?? Image update completed successfully!');
    process.exit(0);
}
updateImages().catch((err) => {
    console.error('? Update failed:', err);
    process.exit(1);
});
//# sourceMappingURL=update-images.js.map