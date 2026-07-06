/**
 * Léana Beauté — Expérience Éditoriale Haut de Gamme
 * Direction Artistique : Vogue / Harper's Bazaar
 * 
 * Features:
 * - Custom cursor (desktop only)
 * - Page transition voile
 * - Scroll reveal (IntersectionObserver)
 * - Navbar scroll behavior
 * - Mobile menu
 * - Editorial tabs (Looks Signature)
 * - Glow Slider (avant/après)
 * - Testimonials carousel (drag-to-scroll)
 * - Parallax
 * - Dynamic gallery (DataStore)
 * - Lightbox
 * - Admin login modal
 * - Contact form (AJAX)
 * - Magnetic buttons
 */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    /* ─────────────────────────────────────────
       0. PAGE TRANSITION VOILE
    ───────────────────────────────────────── */
    const voile = document.getElementById('page-voile');
    if (voile) {
        requestAnimationFrame(() => {
            setTimeout(() => voile.classList.add('hidden'), 100);
            setTimeout(() => voile.remove(), 600);
        });
    }

    /* ─────────────────────────────────────────
       1. CUSTOM CURSOR
    ───────────────────────────────────────── */
    const cursorDot = document.getElementById('cursor-dot');

    if (cursorDot && !isTouchDevice) {
        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        // Smooth follow with RAF
        function animateCursor() {
            dotX += (cursorX - dotX) * 0.15;
            dotY += (cursorY - dotY) * 0.15;
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover state on clickable elements
        const hoverTargets = 'a, button, .gallery-item, .looks-tab, .glow-slider-wrapper, .testimonial-card, input, select, textarea, [role="tab"]';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursorDot.classList.add('hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursorDot.classList.remove('hover');
            }
        });

        // Click flash
        document.addEventListener('mousedown', () => {
            cursorDot.classList.add('click');
        });
        document.addEventListener('mouseup', () => {
            cursorDot.classList.remove('click');
        });

        // Hide default cursor
        document.documentElement.style.cursor = 'none';
        document.querySelectorAll('a, button, input, select, textarea, [role="tab"]').forEach(el => {
            el.style.cursor = 'none';
        });
    } else if (cursorDot) {
        cursorDot.remove();
    }


    /* ─────────────────────────────────────────
       2. SCROLL REVEAL (IntersectionObserver)
    ───────────────────────────────────────── */
    if (!prefersReducedMotion) {
        const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
            el.classList.add('visible');
        });
    }


    /* ─────────────────────────────────────────
       3. NAVBAR (Scroll + Mobile)
    ───────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    hamburger?.addEventListener('click', () => {
        navLinks?.classList.toggle('active');
        hamburger.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks?.classList.remove('active');
            hamburger?.classList.remove('open');
        });
    });


    /* ─────────────────────────────────────────
       4. EDITORIAL TABS (Looks Signature)
    ───────────────────────────────────────── */
    // --- Initialisation dynamique des Looks Signature ---
    async function initDynamicLooks() {
        const tabsContainer = document.getElementById('looks-tabs');
        const panelsContainer = document.getElementById('looks-panels');
        if (!tabsContainer || !panelsContainer) return;

        // On utilise la collection par défaut si DataStore n'est pas prêt ou erreur
        let looks = [];
        if (typeof DataStore !== 'undefined' && typeof DataStore.getLooks === 'function') {
            try {
                looks = await DataStore.getLooks();
            } catch (err) {
                console.error("Erreur lors de la récupération des looks:", err);
            }
        }

        if (looks.length === 0) {
            panelsContainer.innerHTML = '<p style="text-align:center;">Aucun look disponible.</p>';
            return;
        }

        // Génération des onglets
        tabsContainer.innerHTML = looks.map((look, i) => `
            <button class="looks-tab ${i === 0 ? 'active' : ''}" data-tab="${look.id}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}">${look.subtitle.split('—')[1]?.trim() || look.subtitle}</button>
        `).join('');

        // Génération des panneaux
        panelsContainer.innerHTML = looks.map((look, i) => `
            <div class="look-panel ${i === 0 ? 'active' : ''}" data-panel="${look.id}" role="tabpanel">
                <div class="look-card">
                    <img class="look-hero-image"
                         src="${look.heroImageUrl}"
                         alt="${look.title}"
                         loading="lazy">
                    <span class="look-card-eyebrow">${look.subtitle}</span>
                    <h2>${look.title}</h2>
                    <p class="look-card-description">
                        ${look.description}
                    </p>
                    <div class="look-detail-grid">
                        <img src="${look.detailImage1Url}" alt="Détail 1" loading="lazy">
                        <img src="${look.detailImage2Url}" alt="Détail 2" loading="lazy">
                    </div>
                    <div class="look-tags">
                        ${look.tags.split(',').map(tag => `<span class="look-tag">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Réattacher les événements sur les onglets générés
        const tabs = tabsContainer.querySelectorAll('.looks-tab');
        const panels = panelsContainer.querySelectorAll('.look-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;

                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                panels.forEach(p => p.classList.remove('active'));
                const panel = document.querySelector(`.look-panel[data-panel="${targetPanel}"]`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // Call dynamic looks init
    initDynamicLooks();


    /* ─────────────────────────────────────────
       5. GLOW SLIDER (Avant/Après)
    ───────────────────────────────────────── */
    const glowSlider = document.getElementById('glow-slider');
    const glowAfter = document.getElementById('glow-slider-after');
    const glowHandle = document.getElementById('glow-slider-handle');
    const glowLabelLeft = document.getElementById('glow-label-left');
    const glowLabelRight = document.getElementById('glow-label-right');

    if (glowSlider && glowAfter && glowHandle) {
        let isDragging = false;
        let labelTimeout = null;

        function updateSlider(percentage) {
            // Clamp between 5% and 95%
            percentage = Math.max(5, Math.min(95, percentage));
            glowAfter.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            glowHandle.style.left = percentage + '%';
        }

        function getPercentage(clientX) {
            const rect = glowSlider.getBoundingClientRect();
            return ((clientX - rect.left) / rect.width) * 100;
        }

        function fadeLabels() {
            if (labelTimeout) clearTimeout(labelTimeout);
            // Show labels
            glowLabelLeft?.classList.remove('faded');
            glowLabelRight?.classList.remove('faded');
            // Fade after 2s of interaction
            labelTimeout = setTimeout(() => {
                glowLabelLeft?.classList.add('faded');
                glowLabelRight?.classList.add('faded');
            }, 2000);
        }

        // Mouse events
        glowSlider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSlider(getPercentage(e.clientX));
            fadeLabels();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(getPercentage(e.clientX));
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        glowSlider.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateSlider(getPercentage(e.touches[0].clientX));
            fadeLabels();
        }, { passive: true });

        glowSlider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(getPercentage(e.touches[0].clientX));
            e.preventDefault();
        }, { passive: false });

        glowSlider.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Initialize at 50%
        updateSlider(50);
    }


    /* ─────────────────────────────────────────
       6. (Section supprimée)
    ───────────────────────────────────────── */

    /* ─────────────────────────────────────────
       7. PARALLAX
    ───────────────────────────────────────── */
    if (!prefersReducedMotion && !isTouchDevice) {
        const parallaxElements = document.querySelectorAll('.parallax-element');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallaxSpeed) || 0.05;
                const rect = el.parentElement.getBoundingClientRect();
                const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
                // Clamp to 50px max
                const clampedOffset = Math.max(-50, Math.min(50, offset));
                el.style.transform = `translateY(${clampedOffset}px)`;
            });
        }, { passive: true });
    }


    /* ─────────────────────────────────────────
       8. DYNAMIC GALLERY (DataStore)
    ───────────────────────────────────────── */
    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        let items = [];
        if (typeof DataStore !== 'undefined' && typeof DataStore.getGallery === 'function') {
            try {
                items = await DataStore.getGallery();
            } catch (err) {
                console.error("Erreur lors de la récupération de la galerie:", err);
            }
        }

        if (items.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gris-pierre);">Le portfolio est en cours de mise à jour.</p>';
            return;
        }

        grid.innerHTML = items.map((item, i) => {
            const isVideo = item.type === 'video';
            let thumbUrl = item.url;

            if (isVideo) {
                if (item.url.includes('youtube.com/watch?v=')) {
                    const vid = item.url.split('v=')[1].split('&')[0];
                    thumbUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                } else if (item.url.includes('youtu.be/')) {
                    const vid = item.url.split('youtu.be/')[1].split('?')[0];
                    thumbUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                } else {
                    thumbUrl = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80';
                }
            }

            const videoBadge = isVideo ? `<span class="video-badge">Vidéo</span>` : '';
            const videoIcon = isVideo ? `<div class="video-icon">▶</div>` : '';

            const delay = Math.min(i * 0.08, 0.6);

            return `
            <div class="gallery-item"
                 style="opacity:0; transform:translateY(20px); transition: opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s var(--ease-smooth)"
                 onclick="openLightbox('${item.url}', '${item.type}')">
                ${videoBadge}
                <img src="${thumbUrl}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    ${videoIcon}
                    <span>${item.title}</span>
                </div>
            </div>`;
        }).join('');

        // Stagger reveal when in view
        const galleryItems = grid.querySelectorAll('.gallery-item');
        const galleryObs = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    galleryItems.forEach(item => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        galleryObs.observe(grid);

        // Apply cursor: none on new gallery items if custom cursor is active
        if (cursorDot && !isTouchDevice) {
            galleryItems.forEach(el => { el.style.cursor = 'none'; });
        }
    }

    loadGallery();


    /* ─────────────────────────────────────────
       9. LIGHTBOX (Photos & Vidéos)
    ───────────────────────────────────────── */
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');

    window.openLightbox = function (url, type) {
        if (!lightbox || !lightboxContent) return;
        lightboxContent.innerHTML = '';

        if (type === 'video') {
            let embedUrl = url;
            if (url.includes('youtube.com/watch?v=')) {
                const vid = url.split('v=')[1].split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1`;
            } else if (url.includes('youtu.be/')) {
                const vid = url.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1`;
            }
            lightboxContent.innerHTML = `<iframe src="${embedUrl}" title="Lecteur vidéo" loading="lazy" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
        } else {
            lightboxContent.innerHTML = `<img src="${url}" alt="Réalisation">`;
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        if (lightboxContent) lightboxContent.innerHTML = '';
        document.body.style.overflow = '';
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


    /* ─────────────────────────────────────────
       10. ADMIN LOGIN MODAL
    ───────────────────────────────────────── */
    const openAdminLoginBtn = document.getElementById('open-admin-login');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminModalClose = document.querySelector('.admin-modal-close');
    const clientPinBoxes = document.querySelectorAll('.client-pin-box');
    const CORRECT_PIN = '2006';

    function openAdminModal() {
        adminLoginModal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (clientPinBoxes.length > 0) setTimeout(() => clientPinBoxes[0].focus(), 120);
    }
    function closeAdminModal() {
        adminLoginModal?.classList.remove('active');
        document.body.style.overflow = '';
        clientPinBoxes.forEach(b => b.value = '');
    }

    openAdminLoginBtn?.addEventListener('click', e => {
        e.preventDefault();
        if (sessionStorage.getItem('isMakeupAdmin') === 'true') {
            window.location.href = 'admin.html';
        } else {
            openAdminModal();
        }
    });

    adminModalClose?.addEventListener('click', closeAdminModal);
    adminLoginModal?.addEventListener('click', e => { if (e.target === adminLoginModal) closeAdminModal(); });

    clientPinBoxes.forEach((box, i) => {
        box.addEventListener('input', e => {
            box.style.transform = 'scale(1.08)';
            setTimeout(() => box.style.transform = '', 150);

            if (e.target.value.length === 1) {
                if (i < clientPinBoxes.length - 1) {
                    clientPinBoxes[i + 1].focus();
                } else {
                    validateClientPin();
                }
            }
        });
        box.addEventListener('keydown', e => {
            if (e.key === 'Backspace' && e.target.value === '' && i > 0) {
                clientPinBoxes[i - 1].focus();
            }
        });
    });

    function validateClientPin() {
        const enteredPin = [...clientPinBoxes].map(b => b.value).join('');
        if (enteredPin === CORRECT_PIN) {
            sessionStorage.setItem('isMakeupAdmin', 'true');
            window.location.href = 'admin.html';
        } else {
            const pinInputs = document.querySelector('#admin-login-modal .pin-inputs');
            if (pinInputs) {
                pinInputs.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(6px)' },
                    { transform: 'translateX(-4px)' },
                    { transform: 'translateX(4px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 400, easing: 'ease-in-out' });
            }
            setTimeout(() => {
                clientPinBoxes.forEach(b => b.value = '');
                clientPinBoxes[0]?.focus();
            }, 420);
        }
    }


    /* ─────────────────────────────────────────
       11. CONTACT FORM (AJAX)
    ───────────────────────────────────────── */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = 'Envoi en cours...';
            btn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    alert('Magnifique ! Votre message a bien été envoyé. Je reviens vers vous très vite.');
                    contactForm.reset();
                } else {
                    let errorMessage = "Oops! Un problème est survenu lors de l'envoi.";
                    try {
                        const data = await response.json();
                        if (data && data.errors) {
                            errorMessage = data.errors.map(err => err.message).join(', ');
                        }
                    } catch (jsonErr) {
                        // La réponse n'est pas au format JSON
                    }
                    alert(errorMessage);
                }
            } catch (error) {
                console.error("Erreur d'envoi", error);
                alert("Oops! Impossible d'envoyer le message. Vérifiez votre connexion.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

});
