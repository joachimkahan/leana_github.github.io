// DataStore: Gère la connexion transparente entre Firebase (si configuré) et LocalStorage (Fallback)

const DEFAULT_GALLERY = [
    { id: '1', title: 'Mariage Bohème', url: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=800&q=80', type: 'image' },
    { id: '2', title: 'Soirée Glamour', url: 'https://images.unsplash.com/photo-1512496115851-a1c8e04ce0ce?auto=format&fit=crop&w=800&q=80', type: 'image' },
    { id: '3', title: 'Shooting Éditorial', url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80', type: 'image' },
    { id: '4', title: 'Tuto Glowy', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video' }, // Lien vidéo exemple
    { id: '5', title: 'Lèvres Parfaites', url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80', type: 'image' },
    { id: '6', title: 'Regard Intense', url: 'https://images.unsplash.com/photo-1506452814421-570a2569eeb7?auto=format&fit=crop&w=800&q=80', type: 'image' }
];

const DEFAULT_LOOKS = [
    {
        id: 'teint-radiant',
        title: "L'éclat d'une peau qui respire",
        subtitle: "Look N°01 — Le Teint Radiant",
        description: "Ma spécialité : un teint si lumineux qu'on croirait que la lumière vient de l'intérieur. Skin prep approfondie, fond de teint seconde peau, highlight stratégique — chaque étape est pensée pour que votre peau rayonne avec naturel.",
        heroImageUrl: "https://images.unsplash.com/photo-1512496115851-a1c8e04ce0ce?auto=format&fit=crop&w=1200&q=80",
        detailImage1Url: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=600&q=80",
        detailImage2Url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        tags: "Fond de teint fluide, Highlight liquide, Blush crème, Setting spray"
    },
    {
        id: 'regard-fume',
        title: "La douceur d'un smoky qui envoûte",
        subtitle: "Look N°02 — Regard Fumé Éthéré",
        description: "Un smoky eye n'a pas besoin d'être dur pour être intense. Ma version : des fondus de matière qui capturent la lumière, un dégradé de chaleur autour du regard, et cette profondeur qui attire sans jamais écraser.",
        heroImageUrl: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1200&q=80",
        detailImage1Url: "https://images.unsplash.com/photo-1588767768106-1b20e51d9d68?auto=format&fit=crop&w=600&q=80",
        detailImage2Url: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=600&q=80",
        tags: "Ombres satinées, Liner estompé, Mascara volumateur"
    },
    {
        id: 'mariee-solaire',
        title: "Rayonner le plus beau jour",
        subtitle: "Look N°03 — Mariée Solaire",
        description: "Le maquillage mariage est un exercice d'équilibre : assez présent pour les photos, assez fin pour l'émotion. Je crée un éclat qui dure du matin aux larmes de joie, avec des produits longue tenue et une lumière douce qui magnifie chaque sourire.",
        heroImageUrl: "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=1200&q=80",
        detailImage1Url: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=600&q=80",
        detailImage2Url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        tags: "Longue tenue 12h, Waterproof, Teint rosé, Essai inclus"
    },
    {
        id: 'editorial',
        title: "Le maquillage comme langage visuel",
        subtitle: "Look N°04 — Editorial Parisien",
        description: "Pour les shootings mode et beauté, je compose des looks graphiques qui racontent une histoire. Contrastes assumés, textures inattendues, couleurs précises — chaque détail est pensé pour l'image, pour le mouvement, pour l'émotion brute.",
        heroImageUrl: "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1200&q=80",
        detailImage1Url: "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=600&q=80",
        detailImage2Url: "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?auto=format&fit=crop&w=600&q=80",
        tags: "Graphique, Contrastes, Pigments purs"
    },
    {
        id: 'no-makeup',
        title: "L'art de l'invisible",
        subtitle: "Look N°05 — No-Makeup Makeup",
        description: "Le plus difficile en maquillage, c'est de faire croire qu'il n'y en a pas. Ce look demande une maîtrise technique absolue : corriger sans couvrir, illuminer sans briller, structurer sans dessiner. Le résultat ? Vous, en mieux.",
        heroImageUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=1200&q=80",
        detailImage1Url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80",
        detailImage2Url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
        tags: "Technique invisible, Teinté hydratant, Brow gel, Lip balm teinté"
    }
];

const DEFAULT_BEFORE_AFTER = [
    {
        id: 'ba-1',
        title: 'Teint Naturel Sublimé',
        beforeUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80'
    }
];

const DEFAULT_PRESTATIONS = [
    {
        id: 'presta-1',
        icon: '💍',
        title: 'Maquillage Mariage',
        description: "Essai complet en amont pour définir votre style, et mise en beauté le jour J. Produits haut de gamme longue tenue pour rayonner jusqu'au bout de la nuit.",
        price: 'À partir de 280€'
    },
    {
        id: 'presta-2',
        icon: '✨',
        title: 'Teint Lumineux',
        description: "Un maquillage frais, naturel et sophistiqué mettant l'accent sur l'éclat de la peau. Skin Prep approfondie incluse. Idéal pour un événement ou une soirée.",
        price: 'À partir de 95€'
    },
    {
        id: 'presta-3',
        icon: '📸',
        title: 'Shooting & Éditorial',
        description: "Accompagnement sur plateau pour un rendu impeccable sous les flashs professionnels et les lumières de studio. Retouches continues incluses.",
        price: 'Demi-journée : 350€'
    }
];

const COLLECTION_NAME = 'portfolio';
const LOCAL_KEY = 'leana_makeup_gallery_v2';
const LOOKS_COLLECTION_NAME = 'looks_signature';
const LOOKS_LOCAL_KEY = 'leana_looks_signature_v1';
const BA_COLLECTION_NAME = 'before_after';
const BA_LOCAL_KEY = 'leana_before_after_v1';
const PRESTA_COLLECTION_NAME = 'prestations';
const PRESTA_LOCAL_KEY = 'leana_prestations_v1';

const DataStore = {
    initLocal: function() {
        if (!localStorage.getItem(LOCAL_KEY)) {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_GALLERY));
        }
        if (!localStorage.getItem(LOOKS_LOCAL_KEY)) {
            localStorage.setItem(LOOKS_LOCAL_KEY, JSON.stringify(DEFAULT_LOOKS));
        }
        if (!localStorage.getItem(BA_LOCAL_KEY)) {
            localStorage.setItem(BA_LOCAL_KEY, JSON.stringify(DEFAULT_BEFORE_AFTER));
        }
        if (!localStorage.getItem(PRESTA_LOCAL_KEY)) {
            localStorage.setItem(PRESTA_LOCAL_KEY, JSON.stringify(DEFAULT_PRESTATIONS));
        }
    },
    
    // --- Portfolio Gallery ---
    getGallery: async function() {
        if (window.firebaseDb) {
            try {
                const snapshot = await window.firebaseDb.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get();
                const items = [];
                snapshot.forEach(doc => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                return items;
            } catch (error) {
                console.error("Erreur Firebase Get Gallery:", error);
                return [];
            }
        } else {
            this.initLocal();
            return JSON.parse(localStorage.getItem(LOCAL_KEY));
        }
    },

    addItem: async function(item) {
        if (window.firebaseDb) {
            try {
                item.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await window.firebaseDb.collection(COLLECTION_NAME).add(item);
            } catch (err) {
                console.error("Erreur ajout Firebase Gallery:", err);
                throw err;
            }
        } else {
            const gallery = await this.getGallery();
            gallery.unshift({ ...item, id: Date.now().toString() });
            localStorage.setItem(LOCAL_KEY, JSON.stringify(gallery));
        }
    },

    removeItem: async function(id) {
        if (window.firebaseDb) {
            try {
                await window.firebaseDb.collection(COLLECTION_NAME).doc(id).delete();
            } catch (err) {
                console.error("Erreur suppression Firebase Gallery:", err);
                throw err;
            }
        } else {
            const gallery = await this.getGallery();
            const newGallery = gallery.filter(item => item.id !== id);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(newGallery));
        }
    },

    // --- Looks Signature ---
    getLooks: async function() {
        if (window.firebaseDb) {
            try {
                const snapshot = await window.firebaseDb.collection(LOOKS_COLLECTION_NAME).orderBy('createdAt', 'asc').get();
                const items = [];
                snapshot.forEach(doc => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                return items.length > 0 ? items : DEFAULT_LOOKS; // Retourne par défaut si vide sur firebase
            } catch (error) {
                console.error("Erreur Firebase Get Looks:", error);
                return DEFAULT_LOOKS; // Fallback
            }
        } else {
            this.initLocal();
            return JSON.parse(localStorage.getItem(LOOKS_LOCAL_KEY));
        }
    },

    addLook: async function(look) {
        if (window.firebaseDb) {
            try {
                look.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await window.firebaseDb.collection(LOOKS_COLLECTION_NAME).add(look);
            } catch (err) {
                console.error("Erreur ajout Firebase Look:", err);
                throw err;
            }
        } else {
            const looks = await this.getLooks();
            looks.push({ ...look, id: 'look-' + Date.now().toString() });
            localStorage.setItem(LOOKS_LOCAL_KEY, JSON.stringify(looks));
        }
    },

    removeLook: async function(id) {
        if (window.firebaseDb) {
            try {
                await window.firebaseDb.collection(LOOKS_COLLECTION_NAME).doc(id).delete();
            } catch (err) {
                console.error("Erreur suppression Firebase Look:", err);
                throw err;
            }
        } else {
            const looks = await this.getLooks();
            const newLooks = looks.filter(item => item.id !== id);
            localStorage.setItem(LOOKS_LOCAL_KEY, JSON.stringify(newLooks));
        }
    },

    // --- Avant / Après ---
    getBeforeAfter: async function() {
        if (window.firebaseDb) {
            try {
                const snapshot = await window.firebaseDb.collection(BA_COLLECTION_NAME).orderBy('createdAt', 'desc').get();
                const items = [];
                snapshot.forEach(doc => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                return items.length > 0 ? items : DEFAULT_BEFORE_AFTER;
            } catch (error) {
                console.error("Erreur Firebase Get BeforeAfter:", error);
                return DEFAULT_BEFORE_AFTER;
            }
        } else {
            this.initLocal();
            return JSON.parse(localStorage.getItem(BA_LOCAL_KEY));
        }
    },

    addBeforeAfter: async function(item) {
        if (window.firebaseDb) {
            try {
                item.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await window.firebaseDb.collection(BA_COLLECTION_NAME).add(item);
            } catch (err) {
                console.error("Erreur ajout Firebase BeforeAfter:", err);
                throw err;
            }
        } else {
            const items = await this.getBeforeAfter();
            items.unshift({ ...item, id: 'ba-' + Date.now().toString() });
            localStorage.setItem(BA_LOCAL_KEY, JSON.stringify(items));
        }
    },

    removeBeforeAfter: async function(id) {
        if (window.firebaseDb) {
            try {
                await window.firebaseDb.collection(BA_COLLECTION_NAME).doc(id).delete();
            } catch (err) {
                console.error("Erreur suppression Firebase BeforeAfter:", err);
                throw err;
            }
        } else {
            const items = await this.getBeforeAfter();
            const newItems = items.filter(item => item.id !== id);
            localStorage.setItem(BA_LOCAL_KEY, JSON.stringify(newItems));
        }
    },

    // --- Prestations ---
    getPrestations: async function() {
        if (window.firebaseDb) {
            try {
                const snapshot = await window.firebaseDb.collection(PRESTA_COLLECTION_NAME).orderBy('createdAt', 'asc').get();
                const items = [];
                snapshot.forEach(doc => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                return items.length > 0 ? items : DEFAULT_PRESTATIONS;
            } catch (error) {
                console.error("Erreur Firebase Get Prestations:", error);
                return DEFAULT_PRESTATIONS;
            }
        } else {
            this.initLocal();
            return JSON.parse(localStorage.getItem(PRESTA_LOCAL_KEY));
        }
    },

    addPrestation: async function(item) {
        if (window.firebaseDb) {
            try {
                item.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await window.firebaseDb.collection(PRESTA_COLLECTION_NAME).add(item);
            } catch (err) {
                console.error("Erreur ajout Firebase Prestation:", err);
                throw err;
            }
        } else {
            const items = await this.getPrestations();
            items.push({ ...item, id: 'presta-' + Date.now().toString() });
            localStorage.setItem(PRESTA_LOCAL_KEY, JSON.stringify(items));
        }
    },

    removePrestation: async function(id) {
        if (window.firebaseDb) {
            try {
                await window.firebaseDb.collection(PRESTA_COLLECTION_NAME).doc(id).delete();
            } catch (err) {
                console.error("Erreur suppression Firebase Prestation:", err);
                throw err;
            }
        } else {
            const items = await this.getPrestations();
            const newItems = items.filter(item => item.id !== id);
            localStorage.setItem(PRESTA_LOCAL_KEY, JSON.stringify(newItems));
        }
    }
};
