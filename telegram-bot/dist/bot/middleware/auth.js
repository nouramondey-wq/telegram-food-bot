"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCustomer = ensureCustomer;
exports.isCustomerBlocked = isCustomerBlocked;
const firebase_1 = require("../../config/firebase");
const firebase_2 = require("../../config/firebase");
/**
 * Customer middleware - ensures every user has a Firestore customer record.
 * Creates new customers on first interaction, updates existing ones.
 */
async function ensureCustomer(ctx, next) {
    const chatId = ctx.chat?.id?.toString();
    if (!chatId) {
        await next();
        return;
    }
    try {
        const db = (0, firebase_1.getFirestore)();
        const customersRef = db.collection('customers');
        // Indexed query for fast lookup
        const snapshot = await customersRef
            .where('telegram_chat_id', '==', chatId)
            .limit(1)
            .get();
        if (snapshot.empty) {
            // First interaction — create customer record
            const firstName = ctx.from?.first_name || '';
            const username = ctx.from?.username || '';
            const languageCode = ctx.from?.language_code || 'ar';
            const newCustomer = {
                telegram_chat_id: chatId,
                telegram_username: username,
                first_name: firstName,
                language_code: languageCode,
                phone_number: '',
                total_orders: 0,
                total_spent: 0,
                is_blocked: false,
                notes: '',
                first_interaction_at: firebase_2.admin.firestore.FieldValue.serverTimestamp(),
                last_interaction_at: firebase_2.admin.firestore.FieldValue.serverTimestamp(),
                created_at: firebase_2.admin.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase_2.admin.firestore.FieldValue.serverTimestamp(),
            };
            const docRef = await customersRef.add(newCustomer);
            ctx.session = { customerId: docRef.id, chatId };
            console.log(`🆕 New customer: ${firstName} (@${username || 'no-username'})`);
        }
        else {
            // Returning customer — update last interaction
            const doc = snapshot.docs[0];
            ctx.session = { customerId: doc.id, chatId };
            // Update profile info silently (no extra write needed for same data)
            const updateData = {
                last_interaction_at: firebase_2.admin.firestore.FieldValue.serverTimestamp(),
            };
            // Only update name/username if they changed
            const currentData = doc.data();
            if (ctx.from?.first_name && ctx.from.first_name !== currentData.first_name) {
                updateData.first_name = ctx.from.first_name;
            }
            if (ctx.from?.username && ctx.from.username !== currentData.telegram_username) {
                updateData.telegram_username = ctx.from.username;
            }
            await doc.ref.update(updateData);
        }
    }
    catch (error) {
        // Don't crash the bot if customer middleware fails
        // The customer record will be created on next interaction
        console.error('⚠️ ensureCustomer error:', error);
        // Still allow the request to proceed
        ctx.session = { chatId };
    }
    await next();
}
/**
 * Check if a customer is blocked (abuse prevention)
 */
async function isCustomerBlocked(customerId) {
    try {
        const db = (0, firebase_1.getFirestore)();
        const doc = await db.collection('customers').doc(customerId).get();
        return doc.data()?.is_blocked === true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=auth.js.map