/**
 * Logique d'Administration (PIN Code et Upload)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const CORRECT_PIN = '2006'; // PIN Code de démonstration

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const logoutBtn = document.getElementById('btn-logout');
    const uploadForm = document.getElementById('upload-form');
    const adminGallery = document.getElementById('admin-gallery');
    const lookForm = document.getElementById('look-form');
    const adminLooks = document.getElementById('admin-looks');
    const pinBoxes = document.querySelectorAll('.pin-box');

    // Vérifier l'état de connexion
    function checkAuth() {
        if (sessionStorage.getItem('isMakeupAdmin') === 'true') {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadAdminGallery();
            loadAdminLooks();
        } else {
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
            if(pinBoxes.length > 0) pinBoxes[0].focus();
        }
    }

    // Gérer l'UI du PIN Code
    if(pinBoxes.length > 0) {
        pinBoxes.forEach((box, index) => {
            box.addEventListener('input', (e) => {
                if (e.target.value.length === 1) {
                    if (index < pinBoxes.length - 1) {
                        pinBoxes[index + 1].focus();
                    } else {
                        // Dernier chiffre entré, on valide
                        validatePin();
                    }
                }
            });

            // Gérer le retour arrière
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    pinBoxes[index - 1].focus();
                }
            });
        });
    }

    function validatePin() {
        let enteredPin = '';
        pinBoxes.forEach(box => enteredPin += box.value);
        
        if (enteredPin === CORRECT_PIN) {
            sessionStorage.setItem('isMakeupAdmin', 'true');
            checkAuth();
        } else {
            alert('Code PIN incorrect.');
            pinBoxes.forEach(box => box.value = '');
            pinBoxes[0].focus();
        }
    }

    // Gérer la déconnexion
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isMakeupAdmin');
            pinBoxes.forEach(box => box.value = '');
            checkAuth();
        });
    }

    // Charger les images dans le tableau de bord
    async function loadAdminGallery() {
        if(!adminGallery) return;
        const items = await DataStore.getGallery();
        
        if(items.length === 0) {
            adminGallery.innerHTML = '<p style="grid-column: 1/-1;">Aucune image dans le portfolio.</p>';
            return;
        }

        adminGallery.innerHTML = items.map(item => {
            let thumbUrl = item.url;
            let isVideo = item.type === 'video';
            if (isVideo) {
                if (item.url.includes('youtube.com/watch?v=')) {
                    const videoId = item.url.split('v=')[1].split('&')[0];
                    thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                } else if (item.url.includes('youtu.be/')) {
                    const videoId = item.url.split('youtu.be/')[1].split('?')[0];
                    thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                } else {
                    thumbUrl = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80';
                }
            }

            return `
            <div class="admin-item">
                <span class="type-badge">${item.type === 'video' ? 'Vidéo' : 'Photo'}</span>
                <img src="${thumbUrl}" alt="${item.title}">
                <div class="item-title">${item.title}</div>
                <button class="btn-delete" title="Supprimer" data-id="${item.id}" onclick="deleteItem('${item.id}')">&times;</button>
            </div>
            `;
        }).join('');
    }

    // Fonction globale pour supprimer un item
    window.deleteItem = async function(id) {
        if(confirm('Supprimer définitivement cette réalisation ?')) {
            const btn = document.querySelector(`button[data-id="${id}"]`);
            if (btn) { btn.innerHTML = '...'; btn.disabled = true; }
            try {
                await DataStore.removeItem(id);
                await loadAdminGallery();
            } catch (err) {
                alert("Erreur lors de la suppression.");
                if (btn) { btn.innerHTML = '&times;'; btn.disabled = false; }
            }
        }
    }

    // Gérer l'ajout d'une nouvelle réalisation
    if(uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = uploadForm.querySelector('button');
            btn.innerText = 'Ajout en cours...';
            btn.disabled = true;

            const title = document.getElementById('item-title').value;
            const type = document.getElementById('item-type').value;
            const urlInput = document.getElementById('item-url').value;
            const fileInput = document.getElementById('item-file');

            let finalUrl = urlInput;
            
            try {
                if (type === 'image' && fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    // Convertir le fichier local en Base64
                    finalUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = (err) => reject(err);
                        reader.readAsDataURL(file);
                    });
                }

                if (!finalUrl) {
                    alert("Veuillez soit sélectionner un fichier sur votre ordinateur, soit coller une URL.");
                    btn.innerText = 'Ajouter au Portfolio';
                    btn.disabled = false;
                    return;
                }

                await DataStore.addItem({ title, url: finalUrl, type });
                uploadForm.reset();
                await loadAdminGallery();
            } catch (err) {
                alert("Impossible d'ajouter le média. (Fichier trop lourd ou erreur réseau)");
            } finally {
                btn.innerText = 'Ajouter au Portfolio';
                btn.disabled = false;
            }
        });
    }

    // Charger les looks
    async function loadAdminLooks() {
        if(!adminLooks) return;
        const looks = await DataStore.getLooks();
        
        if(looks.length === 0) {
            adminLooks.innerHTML = '<p style="grid-column: 1/-1;">Aucun look signature.</p>';
            return;
        }

        adminLooks.innerHTML = looks.map(look => {
            return `
            <div class="admin-item" style="border: 1px solid var(--or-discret); padding: 10px; border-radius: 8px;">
                <img src="${look.heroImageUrl}" alt="${look.title}">
                <div class="item-title" style="margin-top: 10px; font-weight: bold;">${look.subtitle}</div>
                <div style="font-size: 0.85em; color: var(--gris-pierre); margin-bottom: 10px;">${look.title}</div>
                <button class="btn-delete" title="Supprimer" data-look-id="${look.id}" onclick="deleteLook('${look.id}')" style="position: static; margin-top: auto;">Supprimer ce Look</button>
            </div>
            `;
        }).join('');
    }

    // Fonction globale pour supprimer un look
    window.deleteLook = async function(id) {
        if(confirm('Supprimer définitivement ce look signature ?')) {
            const btn = document.querySelector(`button[data-look-id="${id}"]`);
            if (btn) { btn.innerText = '...'; btn.disabled = true; }
            try {
                await DataStore.removeLook(id);
                await loadAdminLooks();
            } catch (err) {
                alert("Erreur lors de la suppression.");
                if (btn) { btn.innerText = 'Supprimer ce Look'; btn.disabled = false; }
            }
        }
    }

    // Gérer l'ajout d'un nouveau look
    if(lookForm) {
        lookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = lookForm.querySelector('button');
            btn.innerText = 'Ajout en cours...';
            btn.disabled = true;

            const newLook = {
                title: document.getElementById('look-title').value,
                subtitle: document.getElementById('look-subtitle').value,
                description: document.getElementById('look-description').value,
                heroImageUrl: document.getElementById('look-hero-url').value,
                detailImage1Url: document.getElementById('look-detail1-url').value,
                detailImage2Url: document.getElementById('look-detail2-url').value,
                tags: document.getElementById('look-tags').value
            };

            try {
                await DataStore.addLook(newLook);
                lookForm.reset();
                await loadAdminLooks();
            } catch (err) {
                alert("Impossible d'ajouter le look.");
            } finally {
                btn.innerText = 'Ajouter le Look';
                btn.disabled = false;
            }
        });
    }

    // Init
    checkAuth();

});
