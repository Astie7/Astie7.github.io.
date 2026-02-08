(function() {
    var root = document.documentElement;
    if (root && root.classList.contains('low-end-mode')) return;

    var body = document.body;
    if (!body) return;
    if (body.classList.contains('pref-no-transitions')) return;
    if (body.classList.contains('pref-min-effects')) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var transitionMs = 180;
    body.classList.add('page-anim-ready', 'page-enter');
    requestAnimationFrame(function() {
        body.classList.remove('page-enter');
    });

    document.addEventListener('click', function(event) {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        var link = event.target.closest('a[href]');
        if (!link) return;
        if (link.target && link.target.toLowerCase() !== '_self') return;
        if (link.hasAttribute('download')) return;

        var href = link.getAttribute('href');
        if (!href || href[0] === '#') return;

        var nextUrl;
        try {
            nextUrl = new URL(link.href, window.location.href);
        } catch (_err) {
            return;
        }

        if (nextUrl.origin !== window.location.origin) return;
        if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) return;

        event.preventDefault();
        body.classList.add('page-leave');
        setTimeout(function() {
            window.location.href = nextUrl.href;
        }, transitionMs);
    });
})();
