/* maquette-site/assets/site.js — les effets du prototype.
   Rien ici ne porte d'information : sans JavaScript, la page se lit
   entière (les .reveal sont rendus visibles ci-dessous en cas d'absence
   d'IntersectionObserver). */
(function () {
    'use strict';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var header  = document.querySelector('.site-header');
    var overHero = header && header.classList.contains('site-header--over');

    /* ── Barre : transparente sur la photo, pleine dès qu'on défile ── */
    function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        header.classList.toggle('site-header--solid', y > 40);
        if (overHero) header.classList.toggle('site-header--over', y <= 40 && !document.body.classList.contains('nav-open'));
    }
    if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

    /* ── Menu mobile ── */
    var toggle = document.querySelector('.nav-toggle');
    if (toggle) toggle.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        onScroll();
    });

    /* ── Apparition au défilement ── */
    var targets = document.querySelectorAll('.reveal, .word, .work__media');
    if (!('IntersectionObserver' in window) || reduced) {
        targets.forEach(function (el) { el.classList.add('in'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
        targets.forEach(function (el) { io.observe(el); });
    }

    /* ── Parallaxe légère : une transformation par image, dans un rAF ── */
    if (!reduced) {
        var heroBg = document.querySelector('.hero__bg');
        var storyImg = document.querySelector('.story__media img');
        var ticking = false;
        function frame() {
            ticking = false;
            var y = window.scrollY || window.pageYOffset;
            if (heroBg) heroBg.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0)';
            if (storyImg) {
                var r = storyImg.parentNode.getBoundingClientRect();
                var vh = window.innerHeight;
                if (r.bottom > 0 && r.top < vh) {
                    var p = (r.top + r.height / 2 - vh / 2) / vh;   // -0.5 … 0.5
                    storyImg.style.transform = 'scale(1.08) translate3d(0,' + (p * -24) + 'px,0)';
                }
            }
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
        }, { passive: true });
        frame();
    }

    /* ── La bande des partenaires : dupliquée une fois pour boucler ── */
    var track = document.querySelector('.marquee__track');
    if (track && !reduced) {
        var imgs = Array.prototype.slice.call(track.children);
        imgs.forEach(function (img) {
            var c = img.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('dup'); track.appendChild(c);
        });
    }
})();
