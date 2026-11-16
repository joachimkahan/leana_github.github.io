/**
 * Léana Beauté — Expérience Éditoriale Haut de Gamme
 * Direction Artistique : Vogue / Harper's Bazaar
 *
 * Features:
 * - Curseur personnalisé (souris fine, visible au 1er mouvement)
 * - Page transition voile
 * - Apparition au défilement (IntersectionObserver)
 * - Navbar + menu mobile plein écran
 * - Looks Signature (masqués s'il n'y en a aucun)
 * - Avant/Après (pointer events, clavier, amorce unique)
 * - Parallax léger (transform)
 * - Galerie dynamique (DataStore) + visionneuse
 * - Prestations en carte de tarifs
 * - Modale d'accès Pro
 */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Échappe le texte venant de la base avant de l'insérer dans le HTML */
    const esc = (v) => String(v == null ? '' : v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

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
       1. CURSEUR PERSONNALISÉ
       Caché tant que la souris n'a pas bougé ; la boucle
       d'animation s'arrête dès que le curseur est immobile.
    ───────────────────────────────────────── */
    const cursorDot = document.getElementById('cursor-dot');

    if (cursorDot && canHover) {
        let targetX = 0, targetY = 0, dotX = 0, dotY = 0;
        let started = false, running = false;

        const loop = () => {
            dotX += (targetX - dotX) * 0.2;
            dotY += (targetY - dotY) * 0.2;
            cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
            if (Math.abs(targetX - dotX) > 0.1 || Math.abs(targetY - dotY) > 0.1) {
                requestAnimationFrame(loop);
            } else {
                running = false;
            }
        };

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!started) {
                started = true;
                dotX = targetX;
                dotY = targetY;
                document.documentElement.classList.add('has-cursor');
            }
            cursorDot.classList.add('ready');
            if (!running) {
                running = true;
                requestAnimationFrame(loop);
            }
        }, { passive: true });

        document.documentElement.addEventListener('mouseleave', () => cursorDot.classList.remove('ready'));

        const hoverTargets = 'a, button, .gallery-item, .looks-tab, .glow-slider-wrapper, [role="button"], [role="tab"]';
        const textTargets = 'input, textarea, select';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(textTargets)) cursorDot.classList.add('away');
            else if (e.target.closest(hoverTargets)) cursorDot.classList.add('hover');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(textTargets)) cursorDot.classList.remove('away');
            if (e.target.closest(hoverTargets)) cursorDot.classList.remove('hover');
        });
        document.addEventListener('mousedown', () => cursorDot.classList.add('click'));
        document.addEventListener('mouseup', () => cursorDot.classList.remove('click'));
    } else if (cursorDot) {
        cursorDot.remove();
    }


    /* ─────────────────────────────────────────
       2. APPARITION AU DÉFILEMENT
       watchReveal() est rappelée après chaque rendu dynamique.
    ───────────────────────────────────────── */
    let revealObserver = null;
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    }

    function watchReveal(root) {
        (root || document).querySelectorAll('.reveal:not(.visible)').forEach(el => {
            if (revealObserver) revealObserver.observe(el);
            else el.classList.add('visible');
        });
    }
    watchReveal(document);


    /* ─────────────────────────────────────────
       3. NAVBAR + MENU MOBILE
    ───────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    function setMenu(open) {
        navLinks?.classList.toggle('active', open);
        hamburger?.classList.toggle('open', open);
        hamburger?.setAttribute('aria-expanded', open ? 'true' : 'false');
        hamburger?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        document.body.classList.toggle('menu-open', open);
    }

    hamburger?.addEventListener('click', () => {
        setMenu(!navLinks.classList.contains('active'));
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navLinks?.classList.contains('active')) {
            setMenu(false);
            hamburger?.focus();
        }
    });

    window.matchMedia('(min-width: 769px)').addEventListener?.('change', e => {
        if (e.matches) setMenu(false);
    });


    /* ─────────────────────────────────────────
       4. SCROLL : navbar + parallax (un seul écouteur, throttlé par rAF)
    ───────────────────────────────────────── */
    const parallaxEls = (!prefersReducedMotion && canHover)
        ? [...document.querySelectorAll('.parallax-element')]
        : [];
    let scrollTicking = false;

    function onScrollFrame() {
        scrollTicking = false;
        navbar?.classList.toggle('scrolled', window.scrollY > 60);

        const vh = window.innerHeight;
        parallaxEls.forEach(el => {
            const frame = el.parentElement;
            const rect = frame.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;
            const speed = parseFloat(el.dataset.parallaxSpeed) || 0.05;
            const maxShift = rect.height * 0.06;
            const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
            const shift = Math.max(-maxShift, Math.min(maxShift, offset));
            el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
        });
    }
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });
    onScrollFrame();


    /* ─────────────────────────────────────────
       5. LOOKS SIGNATURE (masqués s'il n'y en a aucun)
    ───────────────────────────────────────── */
    async function initDynamicLooks() {
        const block = document.getElementById('looks-block');
        const tabsContainer = document.getElementById('looks-tabs');
        const panelsContainer = document.getElementById('looks-panels');
        if (!tabsContainer || !panelsContainer) return;

        let looks = [];
        if (typeof DataStore !== 'undefined' && typeof DataStore.getLooks === 'function') {
            try {
                looks = await DataStore.getLooks();
            } catch (err) {
                console.error("Erreur lors de la récupération des looks:", err);
            }
        }

        // Aucun look : le bloc reste masqué, la section devient la galerie
        if (!looks || looks.length === 0) return;

        // Des looks existent : on les montre et la galerie prend son propre surtitre
        if (block) block.hidden = false;
        const galleryEyebrow = document.getElementById('gallery-eyebrow');
        if (galleryEyebrow) galleryEyebrow.textContent = 'Toutes mes réalisations';

        const tabLabel = (look) => {
            const sub = String(look.subtitle || look.title || '');
            return sub.split('—')[1]?.trim() || sub;
        };

        // Onglets (inutiles s'il n'y a qu'un seul look)
        tabsContainer.innerHTML = looks.length > 1 ? looks.map((look, i) => `
            <button class="looks-tab ${i === 0 ? 'active' : ''}" data-tab="${esc(look.id)}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}">${esc(tabLabel(look))}</button>
        `).join('') : '';

        panelsContainer.innerHTML = looks.map((look, i) => `
            <div class="look-panel ${i === 0 ? 'active' : ''}" data-panel="${esc(look.id)}" role="tabpanel">
                <div class="look-card">
                    <img class="look-hero-image"
                         src="${esc(look.heroImageUrl)}"
                         alt="${esc(look.title)}"
                         width="1200" height="1500"
                         loading="lazy">
                    <div class="look-copy">
                        <span class="look-card-eyebrow">${esc(look.subtitle)}</span>
                        <h3>${esc(look.title)}</h3>
                        <p class="look-card-description">${esc(look.description)}</p>
                        <div class="look-tags">
                            ${String(look.tags || '').split(',').filter(t => t.trim()).map(tag => `<span class="look-tag">${esc(tag.trim())}</span>`).join('')}
                        </div>
                    </div>
                    <div class="look-detail-grid">
                        <img src="${esc(look.detailImage1Url)}" alt="${esc(look.title)} — détail 1" width="600" height="750" loading="lazy">
                        <img src="${esc(look.detailImage2Url)}" alt="${esc(look.title)} — détail 2" width="600" height="750" loading="lazy">
                    </div>
                </div>
            </div>
        `).join('');

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
                const panel = panelsContainer.querySelector(`.look-panel[data-panel="${CSS.escape(targetPanel)}"]`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    initDynamicLooks();


    /* ─────────────────────────────────────────
       6. AVANT / APRÈS — dynamique
       Avant à gauche, Après à droite. Pointer events (souris, doigt,
       stylet), clavier (flèches), amorce unique à l'entrée dans l'écran.
    ───────────────────────────────────────── */
    async function initDynamicBeforeAfter() {
        const container = document.getElementById('ba-sliders-container');
        const nav = document.getElementById('ba-nav');
        if (!container) return;

        let items = [];
        if (typeof DataStore !== 'undefined' && typeof DataStore.getBeforeAfter === 'function') {
            try {
                items = await DataStore.getBeforeAfter();
            } catch (err) {
                console.error("Erreur lors de la récupération des avant/après:", err);
            }
        }

        if (!items || items.length === 0) {
            container.innerHTML = '<p class="empty-note">Aucune transformation disponible.</p>';
            return;
        }

        container.innerHTML = items.map((item, i) => `
            <div class="ba-slide ${i === 0 ? 'active' : ''}" data-ba-index="${i}">
                <div class="glow-slider-wrapper" data-slider-id="${i}" tabindex="0" role="slider"
                     aria-label="Comparer avant et après — ${esc(item.title)}"
                     aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
                    <div class="glow-slider-after">
                        <img src="${esc(item.afterUrl)}" alt="Après — ${esc(item.title)}" width="800" height="1000" loading="lazy" draggable="false">
                    </div>
                    <div class="glow-slider-before" data-before-id="${i}">
                        <img src="${esc(item.beforeUrl)}" alt="Avant — ${esc(item.title)}" width="800" height="1000" loading="lazy" draggable="false">
                    </div>
                    <div class="glow-slider-handle" data-handle-id="${i}">
                        <div class="glow-slider-handle-knob"></div>
                    </div>
                    <span class="glow-slider-label left">Avant</span>
                    <span class="glow-slider-label right">Après</span>
                </div>
                <div class="ba-slide-title">${esc(item.title)}</div>
            </div>
        `).join('');

        const slides = container.querySelectorAll('.ba-slide');

        // Navigation (seulement s'il y a plusieurs transformations)
        if (items.length > 1 && nav) {
            nav.style.display = 'flex';
            nav.innerHTML = items.map((item, i) => `
                <button class="ba-dot ${i === 0 ? 'active' : ''}" data-ba-dot="${i}" aria-label="Transformation ${i + 1}">${esc(item.title)}</button>
            `).join('');

            const dots = nav.querySelectorAll('.ba-dot');
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const idx = parseInt(dot.dataset.baDot, 10);
                    slides.forEach(s => s.classList.remove('active'));
                    dots.forEach(d => d.classList.remove('active'));
                    slides[idx].classList.add('active');
                    dots[idx].classList.add('active');
                    const sl = slides[idx].querySelector('.glow-slider-wrapper');
                    if (sl && sl._set) sl._set(50);
                });
            });
        }

        const allSliders = container.querySelectorAll('.glow-slider-wrapper');
        allSliders.forEach(slider => {
            const handleEl = slider.querySelector('.glow-slider-handle');
            if (!handleEl) return;

            let pos = 50;
            let dragging = false;
            let introFrame = 0;

            function set(p) {
                pos = Math.max(4, Math.min(96, p));
                slider.style.setProperty('--pos', pos);
                handleEl.style.transform = `translate3d(${(slider.clientWidth * pos / 100).toFixed(1)}px, 0, 0)`;
                slider.setAttribute('aria-valuenow', String(Math.round(pos)));
            }
            slider._set = set;

            function pct(clientX) {
                const rect = slider.getBoundingClientRect();
                return ((clientX - rect.left) / rect.width) * 100;
            }
            function stopIntro() {
                if (introFrame) { cancelAnimationFrame(introFrame); introFrame = 0; }
            }

            slider.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                stopIntro();
                dragging = true;
                slider.classList.add('dragging');
                try { slider.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
                set(pct(e.clientX));
            });
            slider.addEventListener('pointermove', (e) => {
                if (dragging) set(pct(e.clientX));
            });
            const endDrag = () => { dragging = false; slider.classList.remove('dragging'); };
            slider.addEventListener('pointerup', endDrag);
            slider.addEventListener('pointercancel', endDrag);
            slider.addEventListener('lostpointercapture', endDrag);

            slider.addEventListener('keydown', (e) => {
                const step = e.shiftKey ? 15 : 5;
                if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { stopIntro(); set(pos - step); e.preventDefault(); }
                else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { stopIntro(); set(pos + step); e.preventDefault(); }
                else if (e.key === 'Home') { stopIntro(); set(4); e.preventDefault(); }
                else if (e.key === 'End') { stopIntro(); set(96); e.preventDefault(); }
            });

            if (typeof ResizeObserver !== 'undefined') {
                new ResizeObserver(() => set(pos)).observe(slider);
            } else {
                window.addEventListener('resize', () => set(pos));
            }
            set(50);

            // Amorce unique : un va-et-vient lent à l'entrée dans l'écran (jamais en mouvement réduit)
            const isFirst = slider.closest('.ba-slide')?.classList.contains('active');
            if (isFirst && !prefersReducedMotion && 'IntersectionObserver' in window) {
                const introObs = new IntersectionObserver((entries, obs) => {
                    if (!entries.some(en => en.isIntersecting)) return;
                    obs.disconnect();
                    const duration = 2200;
                    const start = performance.now();
                    const tick = (now) => {
                        const t = Math.min(1, (now - start) / duration);
                        const wave = Math.sin(t * Math.PI * 2) * (1 - t);
                        set(50 + wave * 22);
                        introFrame = t < 1 ? requestAnimationFrame(tick) : 0;
                    };
                    introFrame = requestAnimationFrame(tick);
                }, { threshold: 0.6 });
                introObs.observe(slider);
            }
        });
    }

    initDynamicBeforeAfter();


    /* ─────────────────────────────────────────
       7. GALERIE DYNAMIQUE (DataStore)
    ───────────────────────────────────────── */
    let galleryData = [];   // [{ url, type, title }] — sert à la navigation de la visionneuse

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

        if (!items || items.length === 0) {
            grid.innerHTML = '<p class="empty-note">Le portfolio est en cours de mise à jour.</p>';
            return;
        }

        galleryData = items.map(item => ({ url: item.url, type: item.type, title: item.title || '' }));

        const countEl = document.getElementById('gallery-count');
        if (countEl) {
            countEl.textContent = items.length > 1 ? `${items.length} réalisations` : '1 réalisation';
            countEl.hidden = false;
        }

        grid.innerHTML = items.map((item, i) => {
            const isVideo = item.type === 'video';
            let thumbUrl = item.url;

            if (isVideo) {
                if (String(item.url).includes('youtube.com/watch?v=')) {
                    const vid = item.url.split('v=')[1].split('&')[0];
                    thumbUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                } else if (String(item.url).includes('youtu.be/')) {
                    const vid = item.url.split('youtu.be/')[1].split('?')[0];
                    thumbUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                } else {
                    thumbUrl = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80';
                }
            }

            const videoBadge = isVideo ? `<span class="video-badge">Vidéo</span>` : '';
            const videoIcon = isVideo ? `<div class="video-icon" aria-hidden="true"></div>` : '';
            const delay = ((i % 4) * 0.07).toFixed(2);

            return `
            <div class="gallery-item reveal" style="--d:${delay}s" data-index="${i}"
                 role="button" tabindex="0" aria-label="Ouvrir : ${esc(item.title)}">
                ${videoBadge}
                <img src="${esc(thumbUrl)}" alt="${esc(item.title)}" width="800" height="1000" loading="lazy">
                <div class="gallery-overlay">
                    ${videoIcon}
                    <span>${esc(item.title)}</span>
                </div>
            </div>`;
        }).join('');

        grid.querySelectorAll('.gallery-item').forEach(el => {
            const open = () => window.openLightbox(galleryData[+el.dataset.index].url, galleryData[+el.dataset.index].type, +el.dataset.index);
            el.addEventListener('click', open);
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
            });
        });

        watchReveal(grid);
    }

    loadGallery();


    /* ─────────────────────────────────────────
       8. PRESTATIONS — carte de tarifs
       Les titres « Supplément : … » et « Cours … : … » sont regroupés
       sous un intertitre ; sans correspondance, liste simple.
    ───────────────────────────────────────── */
    function formatPrice(price) {
        const text = String(price == null ? '' : price).trim();
        if (!text) return '';
        const m = text.match(/^(à partir de|dès)\s*(.+)$/i);
        if (m) {
            return `<span class="price-pre">${esc(m[1])}</span><span class="price-val">${esc(m[2])}</span>`;
        }
        return `<span class="price-val">${esc(text)}</span>`;
    }

    async function loadPrestations() {
        const list = document.getElementById('services-grid');
        if (!list) return;

        let items = [];
        if (typeof DataStore !== 'undefined' && typeof DataStore.getPrestations === 'function') {
            try {
                items = await DataStore.getPrestations();
            } catch (err) {
                console.error("Erreur lors de la récupération des prestations:", err);
            }
        }

        if (!items || items.length === 0) {
            list.innerHTML = '<p class="empty-note">Les prestations sont en cours de mise à jour.</p>';
            return;
        }

        // Séparation prestations principales / groupes (Supplément, Cours)
        const main = [];
        const groups = [];
        items.forEach(item => {
            const title = String(item.title || '').trim();
            const m = title.match(/^((?:Suppl[ée]ments?|Cours)[^:]*?)\s*:\s*(.+)$/i);
            if (m) {
                const prefix = m[1].trim();
                const key = prefix.toLowerCase();
                const label = /^suppl/i.test(prefix) ? 'Suppléments' : prefix.charAt(0).toUpperCase() + prefix.slice(1);
                let group = groups.find(g => g.key === key || (/^suppl/.test(key) && /^suppl/.test(g.key)));
                if (!group) { group = { key, label, items: [] }; groups.push(group); }
                group.items.push({ ...item, _title: m[2].trim() });
            } else {
                main.push({ ...item, _title: title });
            }
        });

        let n = 0;
        const row = (item) => {
            n += 1;
            const delay = Math.min(((n - 1) % 6) * 0.05, 0.3).toFixed(2);
            const desc = item.description ? `<p>${esc(item.description)}</p>` : '';
            return `
            <div class="price-row reveal" style="--d:${delay}s">
                <span class="price-num">${String(n).padStart(2, '0')}</span>
                <div class="price-body">
                    <h3>${esc(item._title)}</h3>
                    ${desc}
                </div>
                <div class="price-amount">${formatPrice(item.price)}</div>
            </div>`;
        };

        let html = '';
        if (main.length) {
            html += `<div class="price-list">${main.map(row).join('')}</div>`;
        }
        groups.forEach(g => {
            html += `
            <div class="price-group">
                <h3 class="price-group-title reveal">${esc(g.label)}</h3>
                <div class="price-list">${g.items.map(row).join('')}</div>
            </div>`;
        });
        html += `<div class="price-cta reveal"><a href="#contact" class="btn-primary">Réserver</a></div>`;

        list.innerHTML = html;
        watchReveal(list);
    }

    loadPrestations();


    /* ─────────────────────────────────────────
       9. VISIONNEUSE (Photos & Vidéos)
       openLightbox(url, type[, index]) reste l'entrée publique.
    ───────────────────────────────────────── */
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    let currentIndex = -1;
    let lastFocused = null;

    function renderLightbox(url, type, title) {
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
            lightboxContent.innerHTML = `<iframe src="${esc(embedUrl)}" title="Lecteur vidéo" loading="lazy" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
        } else {
            lightboxContent.innerHTML = `<img src="${esc(url)}" alt="${esc(title || 'Réalisation')}">`;
        }
    }

    function showGalleryItem(index) {
        const n = galleryData.length;
        if (!n) return;
        currentIndex = ((index % n) + n) % n;
        const item = galleryData[currentIndex];
        renderLightbox(item.url, item.type, item.title);
        if (lightboxTitle) lightboxTitle.textContent = item.title;
        if (lightboxCounter) lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    }

    window.openLightbox = function (url, type, index) {
        if (!lightbox || !lightboxContent) return;
        lastFocused = document.activeElement;

        let idx = typeof index === 'number' ? index : galleryData.findIndex(g => g.url === url);
        if (idx >= 0 && galleryData[idx]) {
            lightbox.classList.toggle('has-nav', galleryData.length > 1);
            showGalleryItem(idx);
        } else {
            currentIndex = -1;
            lightbox.classList.remove('has-nav');
            if (lightboxTitle) lightboxTitle.textContent = '';
            if (lightboxCounter) lightboxCounter.textContent = '';
            renderLightbox(url, type, '');
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lightboxClose?.focus({ preventScroll: true });
    };

    function closeLightbox() {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        lightbox.classList.remove('active');
        if (lightboxContent) lightboxContent.innerHTML = '';
        document.body.style.overflow = '';
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', e => { if (e.target === lightbox || e.target === lightboxContent) closeLightbox(); });
    lightboxPrev?.addEventListener('click', () => showGalleryItem(currentIndex - 1));
    lightboxNext?.addEventListener('click', () => showGalleryItem(currentIndex + 1));

    document.addEventListener('keydown', e => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft' && currentIndex >= 0) showGalleryItem(currentIndex - 1);
        else if (e.key === 'ArrowRight' && currentIndex >= 0) showGalleryItem(currentIndex + 1);
    });

    // Balayage horizontal au doigt
    let touchStartX = null;
    lightbox?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox?.addEventListener('touchend', e => {
        if (touchStartX === null || currentIndex < 0) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) > 50) showGalleryItem(currentIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });


    /* ─────────────────────────────────────────
       10. ADMIN LOGIN MODAL
    ───────────────────────────────────────── */
    const openAdminLoginBtn = document.getElementById('open-admin-login');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminModalClose = document.querySelector('.admin-modal-close');
    const clientPinBoxes = document.querySelectorAll('.client-pin-box');
    const CORRECT_PIN = '14032005';

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
       11. CONTACT FORM
    ───────────────────────────────────────── */
    // Le formulaire est géré nativement via formsubmit.co
    // (pas d'interception AJAX : la page d'activation du premier envoi doit rester accessible).

});
