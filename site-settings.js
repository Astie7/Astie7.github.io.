(function() {
    var config = window.PV_SUPABASE || {};
    if (!config.url || !config.anonKey) return;

    function applySetting(node, value) {
        var attr = node.getAttribute('data-setting-attr') || 'text';
        if (attr === 'text') {
            node.textContent = value;
            return;
        }
        if (attr === 'html') {
            node.innerHTML = value;
            return;
        }
        node.setAttribute(attr, value);
    }

    function fetchSettings(keys) {
        var endpointBase = config.url.replace(/\/$/, '') + '/rest/v1/site_settings';
        var encoded = keys.map(function(key) {
            return '"' + key.replace(/"/g, '\\"') + '"';
        }).join(',');
        var endpoint = endpointBase + '?select=setting_key,setting_value&setting_key=in.(' + encodeURIComponent(encoded) + ')';
        return fetch(endpoint, {
            headers: {
                'apikey': config.anonKey,
                'Authorization': 'Bearer ' + config.anonKey
            }
        }).then(function(response) {
            if (!response.ok) throw new Error('site settings fetch failed');
            return response.json();
        });
    }

    window.addEventListener('DOMContentLoaded', function() {
        var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-setting-key]'));
        if (!nodes.length) return;

        var uniq = {};
        for (var i = 0; i < nodes.length; i++) {
            uniq[nodes[i].getAttribute('data-setting-key')] = true;
        }
        var keys = Object.keys(uniq);
        if (!keys.length) return;

        fetchSettings(keys).then(function(rows) {
            var map = {};
            for (var j = 0; j < rows.length; j++) {
                map[rows[j].setting_key] = rows[j].setting_value;
            }

            for (var k = 0; k < nodes.length; k++) {
                var key = nodes[k].getAttribute('data-setting-key');
                if (typeof map[key] === 'string' && map[key].length) {
                    applySetting(nodes[k], map[key]);
                }
            }
        }).catch(function() {
            // Intentionally no UI noise; site falls back to static defaults.
        });
    });
})();
