/* maquette-site/assets/site.js — les effets du prototype.
   Rien ici ne porte d'information : sans JavaScript, la page se lit
   entière (les .reveal sont rendus visibles ci-dessous en cas d'absence
   d'IntersectionObserver). */
/* La langue de la page décide des quelques mots que ce script écrit. */
var FUSE_FR = document.documentElement.lang === 'fr';
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

/* ── Our team et Connect with us — 24 septembre 2026 ────────────────
   Même règle qu'au-dessus : sans ce script, les deux pages se lisent
   entières (les biographies se déplient sous chaque carte, l'adresse
   de courriel est écrite en clair, le formulaire est un formulaire). */
(function () {
    'use strict';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var members = Array.prototype.slice.call(document.querySelectorAll('.member'));

    /* ── La mosaïque de l'ouverture : les portraits de la grille, trois rangées ── */
    var mosaic = document.querySelector('.mosaic');
    if (mosaic && members.length) {
        var srcs = members.map(function (m) { return m.querySelector('.member__media img').getAttribute('src'); });
        for (var r = 0; r < 3; r++) {
            var row = document.createElement('div');
            row.className = 'mosaic__row';
            var cut = (r * 5) % srcs.length;
            var order = srcs.slice(cut).concat(srcs.slice(0, cut));
            order.concat(order).forEach(function (src, k) {
                var im = document.createElement('img');
                im.src = src; im.alt = ''; im.decoding = 'async';
                im.style.setProperty('--i', k % srcs.length);
                row.appendChild(im);
            });
            mosaic.appendChild(row);
        }
    }

    /* ── Les chiffres qui montent — la valeur finale est écrite dans le HTML ── */
    var counters = document.querySelectorAll('[data-count]');
    function count(el) {
        var end = +el.getAttribute('data-count'), t0 = null;
        function step(t) {
            if (!t0) t0 = t;
            var p = Math.min((t - t0) / 1400, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
            if (p < 1) window.requestAnimationFrame(step);
        }
        el.textContent = '0';
        window.requestAnimationFrame(step);
    }
    if (counters.length && !reduced && 'IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { cio.observe(el); });
    }

    /* ── Les filtres ── */
    var chips = document.querySelectorAll('.chip');
    var status = document.querySelector('.filters-status');
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var f = chip.getAttribute('data-filter'), shown = 0;
            chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
            members.forEach(function (m) {
                var ok = f === 'all' || (' ' + m.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1;
                var was = m.hidden;
                m.hidden = !ok;
                if (ok) {
                    m.classList.add('in');
                    if (was && !reduced && m.animate) m.animate(
                        [{ opacity: 0, transform: 'translateY(18px) scale(.97)' }, { opacity: 1, transform: 'none' }],
                        { duration: 500, delay: shown * 45, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
                    shown++;
                }
            });
            document.querySelectorAll('.crew-group').forEach(function (g) {
                var any = members.some(function (m) { return !m.hidden && m.getAttribute('data-group') === g.getAttribute('data-group'); });
                g.hidden = !any;
            });
            if (status) status.textContent = f === 'all' ? '' : (FUSE_FR ? shown + ' personnes sur ' + members.length + '.' : 'Showing ' + shown + ' of ' + members.length + ' people.');
        });
    });

    /* ── La carte suit la souris, légèrement ── */
    if (finePointer && !reduced) members.forEach(function (m) {
        var glare = document.createElement('span');
        glare.className = 'member__glare'; glare.setAttribute('aria-hidden', 'true');
        m.querySelector('.member__media').appendChild(glare);
        m.addEventListener('mousemove', function (e) {
            var r = m.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            m.style.transition = 'transform .12s linear, box-shadow .45s';
            m.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 6).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 7).toFixed(2) + 'deg) translateY(-6px)';
            m.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
            m.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
        m.addEventListener('mouseleave', function () { m.style.transition = ''; m.style.transform = ''; });
    });

    /* ── La biographie en grand — sans <dialog>, le <details> de la carte suffit ── */
    var dlg = document.querySelector('.bio-dialog');
    if (dlg && typeof dlg.showModal === 'function') {
        var current = null;
        var visible = function () { return members.filter(function (m) { return !m.hidden; }); };
        var show = function (m) {
            current = m;
            var img = m.querySelector('.member__media img'), name = m.querySelector('h3').textContent;
            var dimg = dlg.querySelector('.bio-dialog__media img');
            dimg.src = img.getAttribute('src'); dimg.alt = (FUSE_FR ? 'Portrait de ' : 'Portrait of ') + name;
            dlg.querySelector('h2').textContent = name;
            dlg.querySelector('.member__cred').textContent = m.querySelector('.member__cred').textContent;
            dlg.querySelector('.bio-dialog__role').textContent = m.querySelector('.member__role').textContent;
            dlg.querySelector('.bio-dialog__text').innerHTML = m.querySelector('.member__bio').innerHTML;
            var list = visible();
            dlg.querySelector('.bio-dialog__count').textContent = (list.indexOf(m) + 1) + ' / ' + list.length;
            dlg.querySelector('.bio-dialog__body').scrollTop = 0;
            if (!dlg.open) dlg.showModal();
        };
        var step = function (d) {
            var list = visible(), i = list.indexOf(current);
            show(list[(i + d + list.length) % list.length]);
        };
        members.forEach(function (m) {
            m.addEventListener('click', function (e) { e.preventDefault(); show(m); });
        });
        dlg.querySelector('[data-bio="prev"]').addEventListener('click', function () { step(-1); });
        dlg.querySelector('[data-bio="next"]').addEventListener('click', function () { step(1); });
        dlg.querySelector('.bio-dialog__close').addEventListener('click', function () { dlg.close(); });
        dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
        dlg.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
        });
        dlg.addEventListener('close', function () { if (current) current.querySelector('summary').focus(); });
    }

    /* ── Copier l'adresse de courriel ── */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        var label = btn.textContent;
        btn.addEventListener('click', function () {
            var done = function () {
                btn.textContent = FUSE_FR ? 'Copié ✓' : 'Copied ✓'; btn.classList.add('is-done');
                setTimeout(function () { btn.textContent = label; btn.classList.remove('is-done'); }, 2200);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(done, function () {});
        });
    });

    /* ── Le compteur de caractères du message ── */
    document.querySelectorAll('textarea[maxlength]').forEach(function (ta) {
        var out = document.getElementById(ta.getAttribute('aria-describedby'));
        if (!out) return;
        var max = +ta.getAttribute('maxlength');
        var upd = function () { out.textContent = ta.value.length + ' / ' + max; };
        ta.addEventListener('input', upd); upd();
    });

    /* ── Le formulaire du prototype : il ne part nulle part, et il le dit ── */
    var form = document.querySelector('.contact-form');
    var doneBox = document.querySelector('.form-done');
    if (form && doneBox) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (form.querySelector('.hp input').value) return;   // un robot a rempli le piège
            form.hidden = true;
            doneBox.classList.add('is-shown');
            doneBox.querySelector('h3').focus();
        });
        doneBox.querySelector('[data-again]').addEventListener('click', function () {
            form.reset(); form.hidden = false; doneBox.classList.remove('is-shown');
            form.querySelector('input:not([type=radio])').focus();
            form.querySelectorAll('textarea').forEach(function (t) { t.dispatchEvent(new Event('input')); });
        });
    }

    /* ── L'heure de chaque bureau ── */
    var clocks = document.querySelectorAll('[data-tz]');
    function tick() {
        var now = new Date();
        clocks.forEach(function (c) {
            var tz = c.getAttribute('data-tz');
            try {
                var parts = new Intl.DateTimeFormat(FUSE_FR ? 'fr-CA' : 'en-CA', { hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short' }).formatToParts(now);
                var t = '', z = '';
                parts.forEach(function (p) { if (p.type === 'timeZoneName') z = p.value; else if (p.type !== 'literal' || t) t += p.value; });
                c.querySelector('b').textContent = t.trim().replace(/\s+$/, '');
                c.querySelector('span').textContent = (FUSE_FR ? 'heure locale · ' : 'local time · ') + z;
            } catch (err) {}
        });
    }
    if (clocks.length) { tick(); setInterval(tick, 15000); }
})();

/* ── Le blog, les articles, la carte du Canada — 24 septembre 2026 ── */
(function () {
    'use strict';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Le mur de couvertures derrière le titre du blog */
    var wall = document.querySelector('.cover-wall');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.pcard'));
    if (wall && cards.length) {
        var srcs = cards.map(function (c) { return c.querySelector('img').getAttribute('src'); });
        srcs.concat(srcs).slice(0, 18).forEach(function (src, k) {
            var im = document.createElement('img');
            im.src = src; im.alt = ''; im.decoding = 'async'; im.style.setProperty('--i', k);
            wall.appendChild(im);
        });
    }

    /* Les cartes d'article s'inclinent sous la souris, comme celles de l'équipe */
    if (finePointer && !reduced) document.querySelectorAll('.pcard').forEach(function (m) {
        m.addEventListener('mousemove', function (e) {
            var r = m.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            m.style.transition = 'transform .12s linear, box-shadow .45s';
            m.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 5).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 6).toFixed(2) + 'deg) translateY(-6px)';
        });
        m.addEventListener('mouseleave', function () { m.style.transition = ''; m.style.transform = ''; });
    });

    /* Sujet + recherche : les deux filtres se cumulent */
    var bchips = document.querySelectorAll('.blog-tools .chip');
    var search = document.querySelector('.search input');
    var empty = document.querySelector('.blog-empty');
    var bstatus = document.querySelector('.blog-tools + .filters-status');
    var topic = 'all';
    function applyBlog() {
        var q = search ? search.value.trim().toLowerCase() : '', shown = 0;
        cards.forEach(function (c) {
            var okT = topic === 'all' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + topic + ' ') > -1;
            var okQ = !q || c.textContent.toLowerCase().indexOf(q) > -1;
            var was = c.hidden;
            c.hidden = !(okT && okQ);
            if (!c.hidden) {
                c.classList.add('in');
                if (was && !reduced && c.animate) c.animate(
                    [{ opacity: 0, transform: 'translateY(18px) scale(.97)' }, { opacity: 1, transform: 'none' }],
                    { duration: 500, delay: shown * 45, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
                shown++;
            }
        });
        if (empty) empty.classList.toggle('is-shown', shown === 0);
        if (bstatus) bstatus.textContent = (topic === 'all' && !q) ? '' : shown + (FUSE_FR ? ' articles sur ' : ' of ') + cards.length + (FUSE_FR ? '.' : ' articles.');
    }
    bchips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            topic = chip.getAttribute('data-filter');
            bchips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
            applyBlog();
        });
    });
    if (search) search.addEventListener('input', applyBlog);

    /* La barre de lecture de l'article */
    var bar = document.querySelector('.progress'), art = document.querySelector('.art');
    if (bar && art && !reduced) {
        var ticking = false;
        var upd = function () {
            ticking = false;
            var r = art.getBoundingClientRect(), vh = window.innerHeight;
            var p = Math.min(Math.max((vh - r.top) / (r.height + vh * .2), 0), 1);
            bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        };
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(upd); } }, { passive: true });
        upd();
    }

    /* L'image en grand */
    var zoom = document.querySelector('.zoom-dialog');
    if (zoom && typeof zoom.showModal === 'function') {
        document.querySelectorAll('.art figure img').forEach(function (img) {
            img.addEventListener('click', function () {
                var z = zoom.querySelector('img');
                z.src = img.getAttribute('src'); z.alt = img.alt;
                var cap = img.closest('figure').querySelector('figcaption');
                zoom.querySelector('p').textContent = cap ? cap.textContent.trim() : '';
                zoom.showModal();
            });
        });
        zoom.addEventListener('click', function () { zoom.close(); });
    }

    /* Copier l'adresse de l'article */
    document.querySelectorAll('[data-copy-url]').forEach(function (btn) {
        var label = btn.innerHTML;
        btn.addEventListener('click', function () {
            if (!navigator.clipboard) return;
            navigator.clipboard.writeText(window.location.href).then(function () {
                btn.textContent = FUSE_FR ? 'Lien copié ✓' : 'Link copied ✓'; btn.classList.add('is-done');
                setTimeout(function () { btn.innerHTML = label; btn.classList.remove('is-done'); }, 2200);
            }, function () {});
        });
    });

    /* La carte du Canada : une province et son groupe de visages s'allument ensemble */
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile--team'));
    var provs = Array.prototype.slice.call(document.querySelectorAll('.prov'));
    function light(prov) {
        tiles.forEach(function (t) { t.classList.toggle('is-lit', !!prov && t.getAttribute('data-prov') === prov); });
        provs.forEach(function (x) { x.classList.toggle('is-lit', !!prov && x.getAttribute('data-prov') === prov); });
    }
    tiles.forEach(function (t) {
        var on = function () { light(t.getAttribute('data-prov')); };
        t.addEventListener('mouseenter', on); t.addEventListener('focus', on);
        t.addEventListener('mouseleave', function () { light(null); }); t.addEventListener('blur', function () { light(null); });
        t.addEventListener('click', function () {
            var c = provs.filter(function (x) { return x.getAttribute('data-prov') === t.getAttribute('data-prov'); })[0];
            if (c && window.matchMedia('(max-width: 960px)').matches) c.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        });
    });
    provs.forEach(function (x) {
        x.addEventListener('mouseenter', function () { light(x.getAttribute('data-prov')); });
        x.addEventListener('mouseleave', function () { light(null); });
    });
})();

/* ── What we do et ses cinq pages — 25 septembre 2026 ────────────────
   Sans ce script, tout se lit : les cinq formats d'Infographics sont
   empilés, les sept formats d'atelier sont tous visibles, une vignette
   ouvre l'image dans l'onglet. */
(function () {
    'use strict';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* La mosaïque des livrables derrière le titre : la liste est dans data-srcs */
    document.querySelectorAll('.mosaic[data-srcs]').forEach(function (mosaic) {
        var srcs = mosaic.getAttribute('data-srcs').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        if (!srcs.length) return;
        for (var r = 0; r < 3; r++) {
            var row = document.createElement('div');
            row.className = 'mosaic__row';
            var cut = (r * 3) % srcs.length;
            var order = srcs.slice(cut).concat(srcs.slice(0, cut));
            while (order.length < 8) order = order.concat(order);
            order.concat(order).forEach(function (src, k) {
                var im = document.createElement('img');
                im.src = src; im.alt = ''; im.decoding = 'async';
                im.style.setProperty('--i', k % 10);
                row.appendChild(im);
            });
            mosaic.appendChild(row);
        }
    });

    /* L'icône du domaine suit la souris, de loin */
    var hero = document.querySelector('.hero--domain');
    var art = hero && hero.querySelector('.dom-hero__art');
    if (hero && art && finePointer && !reduced) {
        hero.addEventListener('mousemove', function (e) {
            var r = hero.getBoundingClientRect();
            art.style.setProperty('--mx', (((e.clientX - r.left) / r.width) - .5).toFixed(3));
            art.style.setProperty('--my', (((e.clientY - r.top) / r.height) - .5).toFixed(3));
        });
        hero.addEventListener('mouseleave', function () { art.style.setProperty('--mx', 0); art.style.setProperty('--my', 0); });
    }

    /* L'échelle des formats : des onglets, flèches du clavier comprises */
    document.querySelectorAll('.ladder').forEach(function (ladder) {
        var scale = ladder.querySelector('.ladder__scale');
        var tabs = Array.prototype.slice.call(ladder.querySelectorAll('[role="tab"]'));
        var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
        var fill = ladder.querySelector('.ladder__fill');
        function select(i, focus) {
            tabs.forEach(function (t, k) {
                var on = k === i;
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.tabIndex = on ? 0 : -1;
                panels[k].hidden = !on;
            });
            if (fill) fill.style.setProperty('--p', tabs.length > 1 ? i / (tabs.length - 1) : 0);
            if (focus) tabs[i].focus();
        }
        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { select(i); });
            t.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
                if (e.key === 'ArrowLeft')  { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
            });
        });
        scale.hidden = false;
        ladder.classList.add('is-ready');
        var fromHash = function () { var k = panels.map(function (p) { return '#' + p.id; }).indexOf(window.location.hash); return k; };
        select(Math.max(fromHash(), 0));
        window.addEventListener('hashchange', function () { var k = fromHash(); if (k > -1) select(k); });
    });

    /* Les sept étapes d'une synthèse : un chiffre ouvre sa fenêtre, une seule à la fois */
    var procBtns = Array.prototype.slice.call(document.querySelectorAll('.proc__num'));
    function procClose(except) {
        procBtns.forEach(function (b) {
            if (b === except) return;
            b.setAttribute('aria-expanded', 'false');
            var p = document.getElementById(b.getAttribute('aria-controls')); if (p) p.hidden = true;
        });
    }
    procBtns.forEach(function (b) {
        b.addEventListener('click', function (e) {
            e.stopPropagation();
            var p = document.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') !== 'true';
            procClose(b);
            b.setAttribute('aria-expanded', open ? 'true' : 'false'); p.hidden = !open;
        });
    });
    if (procBtns.length) {
        document.addEventListener('click', function (e) { if (!e.target.closest('.proc__pop')) procClose(null); });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var b = procBtns.filter(function (x) { return x.getAttribute('aria-expanded') === 'true'; })[0];
            procClose(null); if (b) b.focus();
        });
    }

    /* Les études de cas : un filtre par domaine, ?area= le choisit en arrivant */
    var caseChips = Array.prototype.slice.call(document.querySelectorAll('.case-filter .chip'));
    if (caseChips.length) {
        var cases = Array.prototype.slice.call(document.querySelectorAll('.case'));
        var caseStatus = document.querySelector('.case-status');
        var pickArea = function (area, quiet) {
            var shown = 0;
            caseChips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-area') === area ? 'true' : 'false'); });
            cases.forEach(function (c) {
                var ok = area === 'all' || (' ' + c.getAttribute('data-area') + ' ').indexOf(' ' + area + ' ') > -1;
                c.hidden = !ok; if (ok) { shown++; c.classList.add('in'); }
            });
            if (caseStatus && !quiet) caseStatus.textContent = FUSE_FR ? shown + (shown > 1 ? ' études de cas' : ' étude de cas') : shown + (shown > 1 ? ' case studies' : ' case study');
        };
        caseChips.forEach(function (c) { c.addEventListener('click', function () { pickArea(c.getAttribute('data-area')); }); });
        var wanted = (window.location.search.match(/[?&]area=([a-z]+)/) || [])[1];
        if (wanted && !window.location.hash && caseChips.some(function (c) { return c.getAttribute('data-area') === wanted; })) pickArea(wanted);
        window.addEventListener('hashchange', function () { pickArea('all', true); });
    }

    /* Les formats d'atelier : filtrés par lieu et par taille */
    document.querySelectorAll('.fmt-tools').forEach(function (tools) {
        var chips = tools.querySelectorAll('.chip');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.fmt'));
        var status = tools.parentNode.querySelector('.fmt-status');
        var noun = tools.getAttribute('data-noun') || (FUSE_FR ? 'formats' : 'formats');
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var f = chip.getAttribute('data-filter'), shown = 0;
                chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
                cards.forEach(function (c) {
                    var ok = f === 'all' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1;
                    var was = c.hidden;
                    c.hidden = !ok;
                    if (ok) {
                        c.classList.add('in');
                        if (was && !reduced && c.animate) c.animate(
                            [{ opacity: 0, transform: 'translateY(18px) scale(.97)' }, { opacity: 1, transform: 'none' }],
                            { duration: 500, delay: shown * 50, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
                        shown++;
                    }
                });
                if (status) status.textContent = f === 'all' ? '' : shown + (FUSE_FR ? ' sur ' : ' of ') + cards.length + ' ' + noun + '.';
            });
        });
    });

    /* Les vignettes et les fiches s'inclinent sous la souris */
    if (finePointer && !reduced) document.querySelectorAll('.work-tile:not(.work-tile--ph), .scard').forEach(function (m) {
        if (m.classList.contains('scard')) {
            var gl = document.createElement('span'); gl.className = 'scard__glare'; gl.setAttribute('aria-hidden', 'true'); m.appendChild(gl);
            m.addEventListener('mousemove', function (e) {
                var r = m.getBoundingClientRect();
                m.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
                m.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
            });
        }
        m.addEventListener('mousemove', function (e) {
            var r = m.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            m.style.transition = 'transform .12s linear, box-shadow .45s';
            m.style.transform = 'perspective(700px) rotateX(' + ((.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 8).toFixed(2) + 'deg) translateY(-4px)';
        });
        m.addEventListener('mouseleave', function () { m.style.transition = ''; m.style.transform = ''; });
    });

    /* Une vignette s'ouvre en grand ; les flèches passent à la voisine du même groupe */
    var zoom = document.querySelector('.zoom-dialog');
    var tiles = Array.prototype.slice.call(document.querySelectorAll('a[data-zoom]'));
    if (zoom && tiles.length && typeof zoom.showModal === 'function') {
        var cur = null;
        var group = function (t) { var g = t.closest('[data-gallery]'); return g ? Array.prototype.slice.call(g.querySelectorAll('a[data-zoom]')) : [t]; };
        var show = function (t) {
            cur = t;
            var z = zoom.querySelector('img');
            z.src = t.getAttribute('href'); z.alt = t.querySelector('img').alt;
            zoom.querySelector('p').textContent = t.getAttribute('data-caption') || '';
            if (!zoom.open) zoom.showModal();
        };
        tiles.forEach(function (t) { t.addEventListener('click', function (e) { e.preventDefault(); show(t); }); });
        zoom.addEventListener('click', function (e) { if (e.target === zoom || e.target.tagName === 'BUTTON') zoom.close(); });
        zoom.addEventListener('keydown', function (e) {
            if (!cur || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
            var g = group(cur), i = g.indexOf(cur);
            show(g[(i + (e.key === 'ArrowRight' ? 1 : -1) + g.length) % g.length]);
        });
        zoom.addEventListener('close', function () { if (cur) cur.focus(); });
    }

    /* Connect : le domaine d'où l'on vient est déjà coché */
    var about = (window.location.search.match(/[?&]about=([^&]+)/) || [])[1];
    if (about) {
        var val = decodeURIComponent(about.replace(/\+/g, ' '));
        document.querySelectorAll('input[name="service"]').forEach(function (i) { if (i.value === val) i.checked = true; });
    }
})();
