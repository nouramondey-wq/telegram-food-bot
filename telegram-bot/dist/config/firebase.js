"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
exports.initFirebase = initFirebase;
exports.getFirestore = getFirestore;
exports.getAuth = getAuth;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const env_1 = require("./env");
let firebaseApp;
function initFirebase() {
    if (firebaseApp)
        return firebaseApp;
    firebaseApp = firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: env_1.env.firebase.projectId,
            privateKey: env_1.env.firebase.privateKey,
            clientEmail: env_1.env.firebase.clientEmail,
        }),
        databaseURL: `https://${env_1.env.firebase.projectId}.firebaseio.com`,
    });
    console.log('🔥 Firebase Admin initialized');
    return firebaseApp;
}
function getFirestore() {
    return firebase_admin_1.default.firestore();
}
function getAuth() {
    return firebase_admin_1.default.auth();
}
//# sourceMappingURL=firebase.js.map