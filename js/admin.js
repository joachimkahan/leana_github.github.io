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
    const baForm = document.getElementById('ba-form');
    const adminBeforeAfter = document.getElementById('admin-before-after');
    const prestaForm = document.getElementById('presta-form');
    const adminPrestations = document.getElementById('admin-prestations');
    const pinBoxes = document.querySelectorAll('.pin-box');

    // Helper function to compress images using Canvas API before uploading
    async function compressImage(file, maxWidth = 1000, quality = 0.6) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if necessary
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Export to JPEG with specified quality
                    // This dramatically reduces file size while maintaining visual quality
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Vérifier l'état de connexion
    function checkAuth() {
        if (sessionStorage.getItem('isMakeupAdmin') === 'true') {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadAdminGallery();
            loadAdminLooks();
            loadAdminBeforeAfter();
            loadAdminPrestations();
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
                    // Compresser l'image avant de l'enregistrer en Base64
                    finalUrl = await compressImage(file);
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

            try {
                const heroImageUrl = await resolveImageUrl(
                    document.getElementById('look-hero-file'),
                    document.getElementById('look-hero-url')
                );
                const detailImage1Url = await resolveImageUrl(
                    document.getElementById('look-detail1-file'),
                    document.getElementById('look-detail1-url')
                );
                const detailImage2Url = await resolveImageUrl(
                    document.getElementById('look-detail2-file'),
                    document.getElementById('look-detail2-url')
                );

                if (!heroImageUrl || !detailImage1Url || !detailImage2Url) {
                    alert("Veuillez fournir une image principale et deux images de détail (fichier ou URL).");
                    btn.innerText = 'Ajouter le Look';
                    btn.disabled = false;
                    return;
                }

                const newLook = {
                    title: document.getElementById('look-title').value,
                    subtitle: document.getElementById('look-subtitle').value,
                    description: document.getElementById('look-description').value,
                    heroImageUrl: heroImageUrl,
                    detailImage1Url: detailImage1Url,
                    detailImage2Url: detailImage2Url,
                    tags: document.getElementById('look-tags').value
                };

                await DataStore.addLook(newLook);
                lookForm.reset();
                await loadAdminLooks();
            } catch (err) {
                alert("Impossible d'ajouter le look. (Fichier trop lourd ou erreur réseau)");
            } finally {
                btn.innerText = 'Ajouter le Look';
                btn.disabled = false;
            }
        });
    }

    // ═══════════════════════════════════
    //  AVANT / APRÈS — CRUD Admin
    // ═══════════════════════════════════

    // Helper: résoudre une URL à partir d'un file input ou d'un champ URL
    async function resolveImageUrl(fileInput, urlInput) {
        if (fileInput && fileInput.files && fileInput.files[0]) {
            return await compressImage(fileInput.files[0]);
        }
        if (urlInput && urlInput.value && urlInput.value.trim() !== '') {
            return urlInput.value.trim();
        }
        return null;
    }

    // Charger les avant/après dans le dashboard admin
    async function loadAdminBeforeAfter() {
        if (!adminBeforeAfter) return;
        const items = await DataStore.getBeforeAfter();

        if (items.length === 0) {
            adminBeforeAfter.innerHTML = '<p style="grid-column: 1/-1;">Aucun avant/après.</p>';
            return;
        }

        adminBeforeAfter.innerHTML = items.map(item => {
            return `
            <div class="admin-item admin-ba-item" style="aspect-ratio: auto; border: 1px solid var(--champagne); border-radius: 8px; overflow: hidden;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; height: 160px;">
                    <div style="position: relative; overflow: hidden;">
                        <img src="${item.beforeUrl}" alt="Avant" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; bottom:4px; left:4px; background:rgba(28,25,22,0.7); color:#FAF7F2; font-size:0.6rem; padding:2px 8px; letter-spacing:0.1em; text-transform:uppercase;">Avant</span>
                    </div>
                    <div style="position: relative; overflow: hidden;">
                        <img src="${item.afterUrl}" alt="Après" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; bottom:4px; right:4px; background:rgba(201,169,110,0.85); color:#FAF7F2; font-size:0.6rem; padding:2px 8px; letter-spacing:0.1em; text-transform:uppercase;">Après</span>
                    </div>
                </div>
                <div style="padding: 12px; text-align: center;">
                    <div style="font-weight: 500; font-size: 0.85rem; margin-bottom: 8px;">${item.title}</div>
                    <button class="btn-delete" title="Supprimer" data-ba-id="${item.id}" onclick="deleteBeforeAfter('${item.id}')" style="position: static; border-radius: 4px; width: auto; height: auto; padding: 6px 16px; font-size: 0.75rem;">Supprimer</button>
                </div>
            </div>
            `;
        }).join('');
    }

    // Fonction globale pour supprimer un avant/après
    window.deleteBeforeAfter = async function(id) {
        if (confirm('Supprimer définitivement cet avant/après ?')) {
            const btn = document.querySelector(`button[data-ba-id="${id}"]`);
            if (btn) { btn.innerText = '...'; btn.disabled = true; }
            try {
                await DataStore.removeBeforeAfter(id);
                await loadAdminBeforeAfter();
            } catch (err) {
                alert("Erreur lors de la suppression.");
                if (btn) { btn.innerText = 'Supprimer'; btn.disabled = false; }
            }
        }
    }

    // Gérer l'ajout d'un nouvel avant/après
    if (baForm) {
        baForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = baForm.querySelector('button[type="submit"]');
            btn.innerText = 'Ajout en cours...';
            btn.disabled = true;

            try {
                const title = document.getElementById('ba-title').value;
                const beforeUrl = await resolveImageUrl(
                    document.getElementById('ba-before-file'),
                    document.getElementById('ba-before-url')
                );
                const afterUrl = await resolveImageUrl(
                    document.getElementById('ba-after-file'),
                    document.getElementById('ba-after-url')
                );

                if (!beforeUrl || !afterUrl) {
                    alert("Veuillez fournir une image AVANT et une image APRÈS (fichier ou URL).");
                    btn.innerText = "Ajouter l'Avant / Après";
                    btn.disabled = false;
                    return;
                }

                await DataStore.addBeforeAfter({ title, beforeUrl, afterUrl });
                baForm.reset();
                await loadAdminBeforeAfter();
            } catch (err) {
                alert("Impossible d'ajouter l'avant/après. (Fichier trop lourd ou erreur réseau)");
            } finally {
                btn.innerText = "Ajouter l'Avant / Après";
                btn.disabled = false;
            }
        });
    }

    // ═══════════════════════════════════
    //  PRESTATIONS — CRUD Admin
    // ═══════════════════════════════════

    // Charger les prestations dans le dashboard admin
    async function loadAdminPrestations() {
        if (!adminPrestations) return;
        const items = await DataStore.getPrestations();

        if (items.length === 0) {
            adminPrestations.innerHTML = '<p style="grid-column: 1/-1;">Aucune prestation.</p>';
            return;
        }

        adminPrestations.innerHTML = items.map(item => {
            // Tronquer la description pour l'aperçu
            const shortDesc = item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description;
            return `
            <div class="admin-item" style="aspect-ratio: auto; border: 1px solid var(--champagne); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                <div style="padding: 20px; text-align: center; background: var(--blanc-art); flex: 1;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">${item.icon}</div>
                    <div style="font-weight: 500; font-size: 0.95rem; margin-bottom: 6px; font-family: var(--font-display); font-size: 1.15rem;">${item.title}</div>
                    <div style="font-size: 0.78rem; color: var(--gris-pierre); margin-bottom: 10px; line-height: 1.5;">${shortDesc}</div>
                    <div style="font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--terracotta-pale); padding: 5px 12px; border: 1px solid var(--champagne); display: inline-block;">${item.price}</div>
                </div>
                <div style="padding: 10px; text-align: center; border-top: 1px solid var(--champagne);">
                    <button class="btn-delete" title="Supprimer" data-presta-id="${item.id}" onclick="deletePrestation('${item.id}')" style="position: static; border-radius: 4px; width: auto; height: auto; padding: 6px 16px; font-size: 0.75rem;">Supprimer</button>
                </div>
            </div>
            `;
        }).join('');
    }

    // Fonction globale pour supprimer une prestation
    window.deletePrestation = async function(id) {
        if (confirm('Supprimer définitivement cette prestation ?')) {
            const btn = document.querySelector(`button[data-presta-id="${id}"]`);
            if (btn) { btn.innerText = '...'; btn.disabled = true; }
            try {
                await DataStore.removePrestation(id);
                await loadAdminPrestations();
            } catch (err) {
                alert("Erreur lors de la suppression.");
                if (btn) { btn.innerText = 'Supprimer'; btn.disabled = false; }
            }
        }
    }

    // Gérer l'ajout d'une nouvelle prestation
    if (prestaForm) {
        prestaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = prestaForm.querySelector('button[type="submit"]');
            btn.innerText = 'Ajout en cours...';
            btn.disabled = true;

            try {
                const newPresta = {
                    icon: document.getElementById('presta-icon').value,
                    title: document.getElementById('presta-title').value,
                    description: document.getElementById('presta-description').value,
                    price: document.getElementById('presta-price').value
                };

                await DataStore.addPrestation(newPresta);
                prestaForm.reset();
                await loadAdminPrestations();
            } catch (err) {
                alert("Impossible d'ajouter la prestation.");
            } finally {
                btn.innerText = 'Ajouter la Prestation';
                btn.disabled = false;
            }
        });
    }

    // Init
    checkAuth();

});
