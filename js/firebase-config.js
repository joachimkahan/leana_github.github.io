// Configuration Firebase
// Remplacez ces valeurs par celles fournies dans votre console Firebase
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCcLQRHHknSGt5RLicV4iIaxNqJ4aNlD6Y",
    authDomain: "leana-d0f80.firebaseapp.com",
    projectId: "leana-d0f80",
    storageBucket: "leana-d0f80.firebasestorage.app",
    messagingSenderId: "205839568798",
    appId: "1:205839568798:web:793d43918dc18ac0617fb7",
    measurementId: "G-Z8Z2276K35"
};

// Initialisation de Firebase
// On ne l'initialise que si l'utilisateur a remplacé la clé API.
let db = null;

if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "VOTRE_API_KEY") {
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        console.log("Firebase connecté avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'initialisation Firebase:", error);
    }
} else {
    console.warn("Firebase n'est pas configuré. Utilisation du mode local (localStorage).");
}

// On expose la DB globale
window.firebaseDb = db;
