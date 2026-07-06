// Configuration Firebase
// Remplacez ces valeurs par celles fournies dans votre console Firebase
const FIREBASE_CONFIG = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
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
