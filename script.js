// --- Fonction Utilitaire: Debounce pour améliorer les performances ---
function debounce(func, wait = 15) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Loader overlay helpers (utilisé lors de la navigation Actualités) ---
    const loaderOverlay = document.getElementById('loader-overlay');
    function showLoader() {
        if (loaderOverlay) loaderOverlay.style.display = 'flex';
    }
    function hideLoader() {
        if (loaderOverlay) loaderOverlay.style.display = 'none';
    }
    // si l'overlay est présent au chargement de la page, on le cache après 1,5s
    if (loaderOverlay) {
        setTimeout(hideLoader, 1500);
    }
    // intercepter les clics sur le(s) lien(s) Actualités pour montrer l'overlay
    document.querySelectorAll('a[href="actualites.html"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const href = link.getAttribute('href');
            showLoader();
            setTimeout(() => { window.location.href = href; }, 1500);
        });
    });

    // NOTE: les cartes d'actualité ne sont plus cliquables (images supprimées de balises <a>)

    // --- 1. Gestion Professionnelle du Menu Mobile ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Fonction centralisée pour fermer le menu
    const closeMenu = () => {
        if (navLinks) {
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
        }
        if (hamburger) {
            hamburger.classList.remove('toggle');
        }
    };

    // Ouverture/fermeture du menu au clic sur le hamburger -> utilise le Side Drawer
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerClose');

    function openDrawer() {
        if (sideDrawer) sideDrawer.classList.add('open');
        if (drawerBackdrop) drawerBackdrop.classList.add('visible');
        if (hamburger) hamburger.classList.add('toggle');
        body.classList.add('menu-open');
    }

    function closeDrawer() {
        if (sideDrawer) sideDrawer.classList.remove('open');
        if (drawerBackdrop) drawerBackdrop.classList.remove('visible');
        if (hamburger) hamburger.classList.remove('toggle');
        body.classList.remove('menu-open');
    }

    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            openDrawer();
        });
    }
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

    // ensure staggered animation restarts when opening
    const drawerListItems = document.querySelectorAll('.drawer-nav ul li');
    function resetStagger() {
        drawerListItems.forEach(li => {
            li.style.transitionDelay = '';
        });
    }
    function applyStagger() {
        drawerListItems.forEach((li, i) => {
            li.style.transitionDelay = `${0.04 + i * 0.08}s`;
        });
    }
    // apply stagger when drawer opens
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.attributeName === 'class') {
                if (sideDrawer.classList.contains('open')) {
                    resetStagger();
                    // small timeout to allow class to settle
                    setTimeout(applyStagger, 25);
                } else {
                    resetStagger();
                }
            }
        });
    });
    if (sideDrawer) observer.observe(sideDrawer, { attributes: true });

    // Fermer le menu quand on clique sur un lien de navigation (desktop)
    const navAnchors = document.querySelectorAll('.nav-links a');
    navAnchors.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Fermer le drawer/overlay mobile dès qu'un lien est activé
    const drawerAnchors = document.querySelectorAll('.drawer-nav a');
    drawerAnchors.forEach(link => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active')) {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // --- Animation dynamique sur les contours des cartes organigramme ---
    const orgCards = document.querySelectorAll('.org-card');
    let borderAngle = 0;
    function animateOrgBorders() {
        borderAngle += 2;
        orgCards.forEach(card => {
            // Animation dynamique du contour orange et lueur
            const angle = borderAngle % 360;
            const color = `hsl(${30 + Math.sin(angle * Math.PI / 180) * 10}, 100%, 50%)`;
            card.style.borderColor = color;
            card.style.boxShadow = `0 0 ${32 + 16 * Math.abs(Math.sin(angle * Math.PI / 180))}px 0 rgba(255,136,0,${0.18 + 0.14 * Math.abs(Math.sin(angle * Math.PI / 180))}), 0 0 48px 0 rgba(0,136,85,0.10)`;
        });
        requestAnimationFrame(animateOrgBorders);
    }
    if (orgCards.length > 0) animateOrgBorders();
    // --- 2. Effet Sticky Header & Scroll Top Button ---
    const header = document.querySelector('.header');
    const scrollTopBtn = document.querySelector('.scroll-top');

    window.addEventListener('scroll', () => {
        // Ajoute une ombre au header quand on descend
        if (window.scrollY > 100) {
            if (header) header.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
            if (scrollTopBtn) scrollTopBtn.classList.add('active');
        } else {
            if (header) header.style.boxShadow = "none";
            if (scrollTopBtn) scrollTopBtn.classList.remove('active');
        }
    });

    // --- Back to Top (accessibilité + smooth) ---
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 3. Détection du lien actif basée sur la section visible (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-80px 0px -80px 0px'
    };

    const updateActiveLink = () => {
        const sections = document.querySelectorAll('section[id], div[id^="accueil"], div[id^="president"], div[id^="direction"], div[id^="vision"], div[id^="oeuvres"], div[id^="contact"]');
        const navLinksList = document.querySelectorAll('.nav-links a[href^="#"]');
        
        sections.forEach(section => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinksList.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, observerOptions);
            
            observer.observe(section);
        });
    };
    
    updateActiveLink();

    // --- Typewriter effect for hero heading (machine) ---
    (function() {
        const heroTypeEl = document.getElementById('heroType');
        if (!heroTypeEl) return;
        const heroHTML = "L'Espoir de la Côte d'Ivoire<br>avec <span class='text-orange'>Diomandé ZOUMANA</span>";
        heroTypeEl.innerHTML = '';
        const TYPE_SPEED = 40; // ms per character
        let i = 0;
        function typeStep() {
            if (i < heroHTML.length) {
                if (heroHTML[i] === '<') {
                    const close = heroHTML.indexOf('>', i);
                    heroTypeEl.innerHTML += heroHTML.slice(i, close + 1);
                    i = close + 1;
                } else {
                    heroTypeEl.innerHTML += heroHTML[i];
                    i++;
                }
                setTimeout(typeStep, TYPE_SPEED);
            }
        }
        // démarre dès l'arrivée sur la page (petit délai pour l'animation reveal)
        setTimeout(typeStep, 250);
    })();

    // --- 4. Smooth Scroll Amélioré pour les ancres ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Fermeture du drawer au cas où il serait ouvert (prioritaire)
            closeDrawer();

            // Ignorer les liens vides ou invalides
            if (!href || href === '#') {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                console.warn(`La cible "${href}" n'a pas été trouvée`);
                return;
            }

            e.preventDefault();
            
            // Animate scroll avec gestion du scroll-margin-top
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });

            // Mettre à jour l'historique du navigateur
            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, href);
            }
        });
    });

    // --- 5. Envoi automatique du formulaire (EmailJS) + fallback mailto ---
    // Remplacez les valeurs ci‑dessous par vos identifiants EmailJS (https://www.emailjs.com)
    const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID';     // ex: user_XXXXXXXXXX
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';      // ex: service_xxx
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';    // ex: template_xxx

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = document.getElementById('contactSubmit');
        const feedbackEl = contactForm.querySelector('.form-feedback');

        function showFeedback(message, type = 'success') {
            feedbackEl.textContent = message;
            feedbackEl.className = 'form-feedback ' + (type === 'success' ? 'success' : 'error');
            feedbackEl.style.display = 'block';
            
            // Animation moderne pour le message de succès
            if (type === 'success') {
                feedbackEl.style.animation = 'slideInDown 0.5s ease-out';
            }
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            showFeedback('Envoi en cours…', '');

            const placeholdersNotReplaced = EMAILJS_USER_ID.includes('YOUR_') || EMAILJS_SERVICE_ID.includes('YOUR_') || EMAILJS_TEMPLATE_ID.includes('YOUR_');

            // fallback : ouvre le client mail si les identifiants EmailJS ne sont pas configurés
            if (placeholdersNotReplaced) {
                const formData = new FormData(contactForm);
                const body = Array.from(formData.entries()).map(([k, v]) => `${k}: ${v}`).join('\n');
                window.location.href = `mailto:lepri.vision2030@gmail.com?subject=${encodeURIComponent('Nouvelle demande depuis le site PRI')}&body=${encodeURIComponent(body)}`;
                submitBtn.disabled = false;
                showFeedback('Ouverture du client mail (fallback). Pour envoi automatique, collez vos identifiants EmailJS dans script.js.', 'error');
                return;
            }

            // initialiser EmailJS et envoyer
            try {
                emailjs.init(EMAILJS_USER_ID);
                emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, '#contactForm')
                    .then(() => {
                        showFeedback('✓ Message envoyé avec succès — merci pour votre contact !', 'success');
                        contactForm.reset();
                        submitBtn.disabled = false;
                        // Masquer le message après 5 secondes
                        setTimeout(() => {
                            feedbackEl.style.display = 'none';
                        }, 5000);
                    }, (err) => {
                        console.error('EmailJS error:', err);
                        showFeedback('Échec de l\'envoi automatique. Un fallback mail a été lancé.', 'error');
                        const formData = new FormData(contactForm);
                        const body = Array.from(formData.entries()).map(([k, v]) => `${k}: ${v}`).join('\n');
                        window.location.href = `mailto:lepri.vision2030@gmail.com?subject=${encodeURIComponent('Nouvelle demande depuis le site PRI')}&body=${encodeURIComponent(body)}`;
                        submitBtn.disabled = false;
                    });
            } catch (e) {
                console.error(e);
                showFeedback('Erreur interne. Utilisation du client mail en fallback.', 'error');
                const formData = new FormData(contactForm);
                const body = Array.from(formData.entries()).map(([k, v]) => `${k}: ${v}`).join('\n');
                window.location.href = `mailto:lepri.vision2030@gmail.com?subject=${encodeURIComponent('Nouvelle demande depuis le site PRI')}&body=${encodeURIComponent(body)}`;
                submitBtn.disabled = false;
            }
        });
    }

    // --- Section Direction du Parti : clic carte → modale profil + effet pulse ---
    (function directionPartiInteraction() {
        let overlay = document.getElementById('direction-modal-overlay');
        let modalTitle = document.getElementById('direction-modal-title');
        let closeBtn = document.getElementById('direction-modal-close');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'direction-modal-overlay';
            overlay.className = 'direction-modal-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            const modal = document.createElement('div');
            modal.className = 'direction-modal';
            modal.setAttribute('role', 'dialog');
            modalTitle = document.createElement('p');
            modalTitle.id = 'direction-modal-title';
            modal.appendChild(modalTitle);
            closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'direction-modal-close';
            closeBtn.id = 'direction-modal-close';
            closeBtn.textContent = 'Fermer';
            modal.appendChild(closeBtn);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        } else {
            modalTitle = document.getElementById('direction-modal-title');
            closeBtn = document.getElementById('direction-modal-close');
        }

        function showProfileModal(name, role, region) {
            if (!modalTitle) return;
            modalTitle.textContent = 'Vous consultez le profil de ' + name + ', ' + role + ' originaire de ' + region + '.';
            if (overlay) {
                overlay.classList.add('is-visible');
                overlay.setAttribute('aria-hidden', 'false');
            }
        }

        function closeModal() {
            if (overlay) {
                overlay.classList.remove('is-visible');
                overlay.setAttribute('aria-hidden', 'true');
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });

        function getRegionFromDesc(desc) {
            if (!desc) return '—';
            const match = desc.trim().match(/originaire de (.+)/i);
            return match ? match[1].trim() : desc;
        }

        function handleCardClick(card) {
            const nameEl = card.querySelector('.direction-parti-name');
            const roleEl = card.querySelector('.direction-parti-role');
            const descEl = card.querySelector('.direction-parti-desc');
            const name = nameEl ? nameEl.textContent.trim() : '—';
            const role = roleEl ? roleEl.textContent.trim() : '—';
            const region = getRegionFromDesc(descEl ? descEl.textContent : '');
            showProfileModal(name, role, region);
            card.classList.add('click-flash');
            setTimeout(function () { card.classList.remove('click-flash'); }, 500);
        }

        const presidentCard = document.querySelector('#direction-parti .direction-parti-president-card');
        if (presidentCard) presidentCard.addEventListener('click', function () { handleCardClick(presidentCard); });

        const memberCards = document.querySelectorAll('#direction-parti .direction-parti-card');
        memberCards.forEach(function (card) {
            card.addEventListener('click', function () { handleCardClick(card); });
        });
    })();

});