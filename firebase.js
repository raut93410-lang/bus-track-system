// ==========================================
// BUS TRACKING SYSTEM - FIREBASE CONFIG
// ==========================================

// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// Firebase Authentication
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// Firebase Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyC_srFcX0FvzzlFD6ueQ_IHd7yAJLoQnQM",

    authDomain:
        "bus-trecking.firebaseapp.com",

    projectId:
        "bus-trecking",

    storageBucket:
        "bus-trecking.firebasestorage.app",

    messagingSenderId:
        "894596698390",

    appId:
        "1:894596698390:web:4d4c916f4e8d515aa34037",

    measurementId:
        "G-NF48PP6H3V"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(firebaseConfig);


// ==========================================
// INITIALIZE AUTHENTICATION
// ==========================================

const auth =
    getAuth(app);


// ==========================================
// INITIALIZE FIRESTORE
// ==========================================

const db =
    getFirestore(app);


// ==========================================
// EXPORT
// ==========================================

export {
    auth,
    db
};