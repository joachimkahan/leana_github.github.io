# Projet Portfolio - Léana Beauté 💄✨

Ce projet est un site vitrine "Haut de Gamme" développé en HTML, CSS et Javascript pur (Vanilla), sans dépendances complexes, avec une interface d'administration intégrée.

## 🚀 Comment lancer le projet en local

1. **Aucune installation requise !** Le projet utilise la technologie HTML/JS native.
2. Ouvrez le dossier du projet dans votre explorateur de fichiers.
3. Double-cliquez sur le fichier `index.html` pour l'ouvrir dans votre navigateur web (Chrome, Safari, Firefox).
4. Pour accéder à l'interface d'administration, cliquez sur le lien "Espace Pro" tout en bas du site (Code PIN : 2006).

## 🛠 Configuration de la Base de Données (Firebase)

Par défaut, le site utilise le `localStorage` de votre navigateur pour sauvegarder le portfolio. Pour que les modifications soient visibles en ligne par tout le monde, connectez-le à Firebase (Gratuit) :

1. Allez sur [Firebase Console](https://console.firebase.google.com/) et créez un nouveau projet.
2. Ajoutez une application Web (`</>`) à votre projet.
3. Copiez l'objet de configuration `firebaseConfig` fourni par Google.
4. Ouvrez le fichier `js/firebase-config.js` dans ce projet et remplacez les valeurs de `FIREBASE_CONFIG` par les vôtres.
5. Dans Firebase, allez dans **Firestore Database** -> Créer une base de données -> Démarrez en mode "Test" (pour faciliter le développement initial).

## 📧 Configuration du Formulaire de Contact (Formspree)

Le formulaire de contact utilise Formspree pour vous envoyer des emails sans avoir besoin de coder un serveur backend :

1. Créez un compte gratuit sur [Formspree.io](https://formspree.io/).
2. Créez un nouveau formulaire (Project) et copiez son URL (ressemble à `https://formspree.io/f/xyzabc`).
3. Ouvrez le fichier `index.html`.
4. À la ligne du formulaire (`<form id="contact-form" action="...">`), remplacez l'URL `action` par la vôtre.
5. C'est tout ! Tous les messages arriveront dans votre boîte mail.

## 🌍 Comment déployer sur Internet (GitHub Pages / Vercel / Netlify)

### Méthode 1 : Avec GitHub et Vercel/Netlify (Recommandé)

1. Créez un compte sur [GitHub](https://github.com/).
2. Créez un nouveau "Repository" public ou privé.
3. Uploadez tous les fichiers de ce projet dans le repository.
4. Allez sur [Vercel](https://vercel.com/) ou [Netlify](https://www.netlify.com/).
5. Connectez votre compte GitHub et importez votre Repository.
6. Cliquez sur "Deploy". Le site est en ligne avec une URL gratuite (et un certificat SSL Sécurisé) !

### Méthode 2 : Ligne de commande GitHub (Pour les devs)
```bash
git init
git add .
git commit -m "Initial commit - Léana Beauté"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM/VOTRE_REPO.git
git push -u origin main
```

## ✨ Fonctionnalités Incluses

* **Design Premium** : Esthétique soignée, couleurs chaleureuses, typographie luxueuse.
* **Responsive 100%** : S'adapte à tous les écrans (Mobile, Tablette, PC).
* **Lightbox Médias** : Affichage élégant des photos et intégration fluide des vidéos (Youtube).
* **Mode Admin Sécurisé par PIN** : Gestion autonome du portfolio sans toucher au code.
* **Support Base de données (Firebase)** et **Stockage Local**.
