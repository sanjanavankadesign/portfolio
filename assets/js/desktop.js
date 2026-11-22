// Y2K Desktop homepage interactions
(function () {
    // Clock
    const clock = document.getElementById('clock');
    const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
    tick();
    setInterval(tick, 30000);

    // Start menu
    const start = document.getElementById('start');
    const menu = document.getElementById('startmenu');
    const setMenu = (open) => {
        menu.classList.toggle('is-open', open);
        start.setAttribute('aria-expanded', String(open));
    };
    start.addEventListener('click', (e) => { e.stopPropagation(); setMenu(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    // Draggable desktop windows (wide screens only)
    let z = 10;
    const wide = window.matchMedia('(min-width: 901px)');
    document.querySelectorAll('[data-drag]').forEach((win) => {
        const bar = win.querySelector('.tb');
        win.addEventListener('pointerdown', () => { win.style.zIndex = ++z; });
        bar.addEventListener('pointerdown', (e) => {
            if (!wide.matches || e.button !== 0) return;
            const desk = win.offsetParent.getBoundingClientRect();
            const r = win.getBoundingClientRect();
            const dx = e.clientX - r.left;
            const dy = e.clientY - r.top;
            bar.setPointerCapture(e.pointerId);
            const move = (ev) => {
                const x = Math.min(Math.max(ev.clientX - dx - desk.left, -r.width + 80), desk.width - 80);
                const y = Math.min(Math.max(ev.clientY - dy - desk.top, 0), desk.height - 40);
                Object.assign(win.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
            };
            const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); };
            bar.addEventListener('pointermove', move);
            bar.addEventListener('pointerup', up);
        });
    });

    // Case study cards (article with data-href)
    document.querySelectorAll('.proj[data-href]').forEach((card) => {
        const go = (newTab) => newTab ? window.open(card.dataset.href, '_blank') : (window.location.href = card.dataset.href);
        card.addEventListener('click', (e) => {
            if (e.target.closest('a, button')) return;
            const sel = window.getSelection();
            if (sel && sel.toString().length) return;
            go(e.metaKey || e.ctrlKey);
        });
        card.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a, button')) { e.preventDefault(); go(false); }
        });
    });

    // Copy email
    document.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const label = btn.querySelector('.copy-text');
            const original = label.textContent;
            navigator.clipboard.writeText(btn.dataset.copy).then(() => {
                label.textContent = 'COPIED ✓';
                btn.classList.add('is-done');
                setTimeout(() => { label.textContent = original; btn.classList.remove('is-done'); }, 2000);
            }).catch(() => { window.location.href = 'mailto:' + btn.dataset.copy; });
        });
    });

    // Highlight the taskbar tab of the section in view
    const tabs = document.querySelectorAll('.ttab');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.sec === en.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'process', 'about', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const desk = document.getElementById('top');
    new IntersectionObserver(([en]) => { if (en.isIntersecting) tabs.forEach((t) => t.classList.remove('is-active')); }, { threshold: 0.5 }).observe(desk);
})();
