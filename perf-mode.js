(function() {
    var storageKey = 'pv_lite_mode';
    var forcedLite = false;
    try {
        var params = new URLSearchParams(window.location.search || '');
        var liteParam = params.get('lite');
        if (liteParam === '1') {
            window.localStorage.setItem(storageKey, '1');
        } else if (liteParam === '0') {
            window.localStorage.removeItem(storageKey);
        }
        forcedLite = window.localStorage.getItem(storageKey) === '1';
    } catch (_storageErr) {
        forcedLite = false;
    }

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

    var lowEnd = forcedLite ||
        reduced ||
        saveData ||
        (threads && threads <= 6) ||
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
