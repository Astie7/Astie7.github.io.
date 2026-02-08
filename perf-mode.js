(function() {
    var nav = window.navigator || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    var reduced = false;
    try {
        reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_err) {
        reduced = false;
    }

    var threads = nav.hardwareConcurrency || 0;
    var memory = nav.deviceMemory || 0;
    var effectiveType = conn && conn.effectiveType ? String(conn.effectiveType).toLowerCase() : '';
    var saveData = !!(conn && conn.saveData);

    var lowEnd = reduced ||
        saveData ||
        (threads && threads <= 4) ||
        (memory && memory <= 4) ||
        effectiveType === '2g' ||
        effectiveType === 'slow-2g';

    if (!lowEnd) return;

    document.documentElement.classList.add('low-end-mode');
    if (document.body) {
        document.body.classList.add('low-end-mode');
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (document.body) document.body.classList.add('low-end-mode');
        }, { once: true });
    }
})();
