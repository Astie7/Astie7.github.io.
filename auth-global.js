window.addEventListener('DOMContentLoaded', function() {
    (function() {
        const topAuthBtn = document.getElementById('top-auth-btn');
        const topSignoutBtn = document.getElementById('top-signout-btn');
        const brandEl = document.querySelector('.topbar .brand');
        const brandNameEl = brandEl ? brandEl.querySelector('span[data-setting-key="brand_name"], span:last-child') : null;
        if (!topAuthBtn || !topSignoutBtn) return;

        const config = window.PV_SUPABASE || {};
        const hasSupabaseConfig = !!(config.url && config.anonKey && window.supabase && window.supabase.createClient);
        if (!hasSupabaseConfig) {
            topAuthBtn.style.display = 'none';
            topSignoutBtn.style.display = 'none';
            return;
        }

        const authMarkup = [
            '<div id="global-auth-modal" class="auth-modal" aria-hidden="true">',
            '  <div class="auth-card global-auth-card">',
            '    <div class="auth-head">',
            '      <h3>Pantheverse Login</h3>',
            '      <p>Sign in, or create an account with email verification.</p>',
            '    </div>',
            '    <div class="auth-body">',
            '      <div class="auth-mode-tabs">',
            '        <button id="global-auth-mode-signin" class="auth-mode-btn active" type="button">Login</button>',
            '        <button id="global-auth-mode-register" class="auth-mode-btn" type="button">Create account</button>',
            '      </div>',
            '      <div class="auth-field-group">',
            '        <label for="global-auth-email">Email address</label>',
            '        <input id="global-auth-email" class="edit-input" type="email" placeholder="you@example.com" autocomplete="email">',
            '      </div>',
            '      <div id="global-auth-password-wrap" class="auth-field-group">',
            '        <label for="global-auth-password">Password</label>',
            '        <input id="global-auth-password" class="edit-input" type="password" placeholder="Password" autocomplete="current-password">',
            '      </div>',
            '      <div id="global-auth-confirm-wrap" class="auth-field-group" style="display:none;">',
            '        <label for="global-auth-confirm-password">Confirm password</label>',
            '        <input id="global-auth-confirm-password" class="edit-input" type="password" placeholder="Confirm password" autocomplete="new-password">',
            '      </div>',
            '      <div id="global-auth-code-wrap" class="auth-field-group auth-code-group" style="display:none;">',
            '        <label for="global-auth-code">Verification code</label>',
            '        <div class="auth-code-row">',
            '          <input id="global-auth-code" class="edit-input" type="text" placeholder="Enter code from email" autocomplete="one-time-code">',
            '          <button id="global-auth-send-code-btn" class="btn btn-ghost auth-inline-btn" type="button">Send code</button>',
            '          <button id="global-auth-resend-code-btn" class="btn btn-ghost auth-inline-btn auth-inline-secondary" type="button">Resend</button>',
            '        </div>',
            '      </div>',
            '      <div class="auth-card-actions">',
            '        <button id="global-auth-login-btn" class="edit-btn" type="button">Login now</button>',
            '        <button id="global-auth-register-btn" class="edit-btn" type="button">Create account</button>',
            '        <button id="global-auth-cancel-btn" class="btn btn-ghost" type="button">Cancel</button>',
            '      </div>',
            '    </div>',
            '    <p id="global-auth-message" class="auth-message"></p>',
            '  </div>',
            '</div>'
        ].join('');
        document.body.insertAdjacentHTML('beforeend', authMarkup);

        const accountMenuMarkup = [
            '<div id="brand-account-menu" class="brand-account-menu" hidden>',
            '  <div id="brand-account-label" class="brand-account-label"></div>',
            '  <button id="brand-account-settings" class="brand-account-item" type="button">Settings</button>',
            '  <button id="brand-account-signout" class="brand-account-item danger" type="button">Sign out</button>',
            '</div>'
        ].join('');
        const accountModalMarkup = [
            '<div id="account-settings-modal" class="account-settings-modal" aria-hidden="true">',
            '  <div class="account-settings-card">',
            '    <div class="account-settings-head">',
            '      <div>',
            '        <p class="account-settings-eyebrow">Server settings</p>',
            '        <h3>Pantheverse Settings</h3>',
            '        <p>Tune appearance and performance for every page from one panel.</p>',
            '      </div>',
            '      <button id="account-settings-close-x" class="account-settings-close" type="button" aria-label="Close settings">x</button>',
            '    </div>',
            '    <div class="account-settings-layout">',
            '      <section class="account-settings-panel">',
            '        <h4>Appearance</h4>',
            '        <div class="account-setting-row">',
            '          <label for="pref-theme-mode">Theme mode</label>',
            '          <select id="pref-theme-mode" class="edit-input">',
            '            <option value="bright">Bright</option>',
            '            <option value="dark">Dark</option>',
            '            <option value="auto">Auto (system)</option>',
            '          </select>',
            '        </div>',
            '        <label class="account-toggle">',
            '          <input id="pref-compact-topbar" type="checkbox">',
            '          <span>Compact top bar layout</span>',
            '        </label>',
            '        <label class="account-toggle">',
            '          <input id="pref-open-discord" type="checkbox">',
            '          <span>Open Discord links in new tab</span>',
            '        </label>',
            '      </section>',
            '      <section class="account-settings-panel">',
            '        <h4>Performance</h4>',
            '        <label class="account-toggle">',
            '          <input id="pref-lite-mode" type="checkbox">',
            '          <span>Lite mode for low end devices</span>',
            '        </label>',
            '        <label class="account-toggle">',
            '          <input id="pref-min-effects" type="checkbox">',
            '          <span>Reduce glow and blur effects</span>',
            '        </label>',
            '        <label class="account-toggle">',
            '          <input id="pref-smooth-transitions" type="checkbox">',
            '          <span>Smooth page transitions</span>',
            '        </label>',
            '      </section>',
            '      <section class="account-settings-panel account-settings-panel-wide">',
            '        <h4>Rules controls</h4>',
            '        <label class="account-toggle">',
            '          <input id="pref-confirm-actions" type="checkbox">',
            '          <span>Confirm destructive actions in editor mode</span>',
            '        </label>',
            '        <label class="account-toggle">',
            '          <input id="pref-editor-focus" type="checkbox">',
            '          <span>Highlight editor panels on Rules page</span>',
            '        </label>',
            '      </section>',
            '      <section class="account-settings-panel account-settings-panel-wide">',
            '        <h4>Quick actions</h4>',
            '        <div class="account-settings-inline-actions">',
            '          <button id="account-settings-open-home" class="btn btn-ghost" type="button">Open Home</button>',
            '          <button id="account-settings-open-rules" class="btn btn-ghost" type="button">Open Rules</button>',
            '          <button id="account-settings-open-about" class="btn btn-ghost" type="button">Open About</button>',
            '          <button id="account-settings-toggle-lite" class="btn btn-ghost" type="button">Toggle Lite mode</button>',
            '        </div>',
            '      </section>',
            '    </div>',
            '    <p id="account-settings-msg" class="account-settings-msg"></p>',
            '    <div class="account-settings-actions">',
            '      <button id="account-settings-save" class="edit-btn" type="button">Save settings</button>',
            '      <button id="account-settings-cancel" class="btn btn-ghost" type="button">Close</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');
        if (brandEl) {
            brandEl.insertAdjacentHTML('beforeend', accountMenuMarkup);
        } else {
            document.body.insertAdjacentHTML('beforeend', accountMenuMarkup);
        }
        document.body.insertAdjacentHTML('beforeend', accountModalMarkup);

        const modal = document.getElementById('global-auth-modal');
        const modeSigninBtn = document.getElementById('global-auth-mode-signin');
        const modeRegisterBtn = document.getElementById('global-auth-mode-register');
        const emailInput = document.getElementById('global-auth-email');
        const passwordWrap = document.getElementById('global-auth-password-wrap');
        const passwordInput = document.getElementById('global-auth-password');
        const confirmWrap = document.getElementById('global-auth-confirm-wrap');
        const confirmInput = document.getElementById('global-auth-confirm-password');
        const codeWrap = document.getElementById('global-auth-code-wrap');
        const codeInput = document.getElementById('global-auth-code');
        const loginBtn = document.getElementById('global-auth-login-btn');
        const registerBtn = document.getElementById('global-auth-register-btn');
        const sendCodeBtn = document.getElementById('global-auth-send-code-btn');
        const resendCodeBtn = document.getElementById('global-auth-resend-code-btn');
        const cancelBtn = document.getElementById('global-auth-cancel-btn');
        const messageEl = document.getElementById('global-auth-message');
        const brandAccountMenu = document.getElementById('brand-account-menu');
        const brandAccountLabel = document.getElementById('brand-account-label');
        const brandAccountSettingsBtn = document.getElementById('brand-account-settings');
        const brandAccountSignoutBtn = document.getElementById('brand-account-signout');
        const accountSettingsModal = document.getElementById('account-settings-modal');
        const accountSettingsCloseXBtn = document.getElementById('account-settings-close-x');
        const prefThemeModeSelect = document.getElementById('pref-theme-mode');
        const prefOpenDiscordInput = document.getElementById('pref-open-discord');
        const prefCompactTopbarInput = document.getElementById('pref-compact-topbar');
        const prefLiteModeInput = document.getElementById('pref-lite-mode');
        const prefMinEffectsInput = document.getElementById('pref-min-effects');
        const prefSmoothTransitionsInput = document.getElementById('pref-smooth-transitions');
        const prefConfirmActionsInput = document.getElementById('pref-confirm-actions');
        const prefEditorFocusInput = document.getElementById('pref-editor-focus');
        const accountSettingsOpenHomeBtn = document.getElementById('account-settings-open-home');
        const accountSettingsOpenRulesBtn = document.getElementById('account-settings-open-rules');
        const accountSettingsOpenAboutBtn = document.getElementById('account-settings-open-about');
        const accountSettingsToggleLiteBtn = document.getElementById('account-settings-toggle-lite');
        const accountSettingsMsg = document.getElementById('account-settings-msg');
        const accountSettingsSaveBtn = document.getElementById('account-settings-save');
        const accountSettingsCancelBtn = document.getElementById('account-settings-cancel');

        const state = {
            client: window.supabase.createClient(config.url, config.anonKey),
            mode: 'signin',
            session: null,
            defaultBrandName: brandNameEl ? (brandNameEl.textContent || '').trim() : 'Pantheverse',
            userSettings: null
        };

        const AUTO_LOW_END_MODE = document.documentElement.classList.contains('low-end-mode');
        const SETTINGS_KEY = 'pv_site_settings_v3';
        const LITE_STORAGE_KEY = 'pv_lite_mode';
        const DEFAULT_SETTINGS = {
            themeMode: 'bright',
            openDiscordInNewTab: true,
            compactTopbar: false,
            liteMode: false,
            minEffects: false,
            smoothTransitions: true,
            confirmActions: true,
            emphasizeEditorTools: true
        };

        function setMessage(message, isError) {
            messageEl.textContent = message || '';
            messageEl.className = isError ? 'auth-message error' : 'auth-message';
        }

        function setAccountSettingsMessage(message, isError) {
            if (!accountSettingsMsg) return;
            accountSettingsMsg.textContent = message || '';
            accountSettingsMsg.className = isError ? 'account-settings-msg error' : 'account-settings-msg';
        }

        function normalizeSettings(raw) {
            const candidate = raw || {};
            return {
                themeMode: ['bright', 'dark', 'auto'].includes(candidate.themeMode) ? candidate.themeMode : DEFAULT_SETTINGS.themeMode,
                openDiscordInNewTab: typeof candidate.openDiscordInNewTab === 'boolean' ? candidate.openDiscordInNewTab : DEFAULT_SETTINGS.openDiscordInNewTab,
                compactTopbar: typeof candidate.compactTopbar === 'boolean' ? candidate.compactTopbar : DEFAULT_SETTINGS.compactTopbar,
                liteMode: typeof candidate.liteMode === 'boolean' ? candidate.liteMode : DEFAULT_SETTINGS.liteMode,
                minEffects: typeof candidate.minEffects === 'boolean' ? candidate.minEffects : DEFAULT_SETTINGS.minEffects,
                smoothTransitions: typeof candidate.smoothTransitions === 'boolean' ? candidate.smoothTransitions : DEFAULT_SETTINGS.smoothTransitions,
                confirmActions: typeof candidate.confirmActions === 'boolean' ? candidate.confirmActions : DEFAULT_SETTINGS.confirmActions,
                emphasizeEditorTools: typeof candidate.emphasizeEditorTools === 'boolean' ? candidate.emphasizeEditorTools : DEFAULT_SETTINGS.emphasizeEditorTools
            };
        }

        function loadSettings() {
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                if (!raw) return normalizeSettings(DEFAULT_SETTINGS);
                return normalizeSettings(JSON.parse(raw));
            } catch (_error) {
                return normalizeSettings(DEFAULT_SETTINGS);
            }
        }

        function persistSettings(settings) {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
            } catch (_error) {
                // Ignore storage errors and keep runtime state only.
            }
        }

        function detectSystemTheme() {
            try {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
            } catch (_error) {
                // Fallback to bright.
            }
            return 'bright';
        }

        function applyThemeMode(mode) {
            const resolved = mode === 'auto' ? detectSystemTheme() : mode;
            document.documentElement.setAttribute('data-theme', resolved);
        }

        function applyLiteMode(enabled) {
            const forcedLite = !!enabled;
            const effectiveLite = AUTO_LOW_END_MODE || forcedLite;

            if (forcedLite) {
                try {
                    localStorage.setItem(LITE_STORAGE_KEY, '1');
                } catch (_error) {
                    // Ignore storage failures.
                }
            } else {
                try {
                    localStorage.removeItem(LITE_STORAGE_KEY);
                } catch (_error) {
                    // Ignore storage failures.
                }
            }

            document.documentElement.classList.toggle('low-end-mode', effectiveLite);
            document.body.classList.toggle('low-end-mode', effectiveLite);
        }

        function applyUserSettings(settings) {
            state.userSettings = normalizeSettings(settings);
            applyThemeMode(state.userSettings.themeMode);
            applyLiteMode(state.userSettings.liteMode);
            document.body.classList.toggle('pref-compact-topbar', !!state.userSettings.compactTopbar);
            document.body.classList.toggle('pref-min-effects', !!state.userSettings.minEffects);
            document.body.classList.toggle('pref-no-transitions', !state.userSettings.smoothTransitions);
            document.body.classList.toggle('pref-editor-focus', !!state.userSettings.emphasizeEditorTools);

            const openInNewTab = !!state.userSettings.openDiscordInNewTab;
            document.querySelectorAll('a[data-setting-key="discord_invite_url"]').forEach(function(link) {
                link.target = openInNewTab ? '_blank' : '_self';
                if (openInNewTab) {
                    link.setAttribute('rel', 'noopener');
                } else {
                    link.removeAttribute('rel');
                }
            });
        }

        function setSettingsForm(settings) {
            const normalized = normalizeSettings(settings);
            if (prefThemeModeSelect) prefThemeModeSelect.value = normalized.themeMode;
            if (prefOpenDiscordInput) prefOpenDiscordInput.checked = normalized.openDiscordInNewTab;
            if (prefCompactTopbarInput) prefCompactTopbarInput.checked = normalized.compactTopbar;
            if (prefLiteModeInput) {
                prefLiteModeInput.checked = normalized.liteMode || AUTO_LOW_END_MODE;
                prefLiteModeInput.disabled = AUTO_LOW_END_MODE;
            }
            if (prefMinEffectsInput) prefMinEffectsInput.checked = normalized.minEffects;
            if (prefSmoothTransitionsInput) prefSmoothTransitionsInput.checked = normalized.smoothTransitions;
            if (prefConfirmActionsInput) prefConfirmActionsInput.checked = normalized.confirmActions;
            if (prefEditorFocusInput) prefEditorFocusInput.checked = normalized.emphasizeEditorTools;
        }

        function readSettingsForm() {
            return normalizeSettings({
                themeMode: prefThemeModeSelect ? prefThemeModeSelect.value : DEFAULT_SETTINGS.themeMode,
                openDiscordInNewTab: prefOpenDiscordInput ? !!prefOpenDiscordInput.checked : DEFAULT_SETTINGS.openDiscordInNewTab,
                compactTopbar: prefCompactTopbarInput ? !!prefCompactTopbarInput.checked : DEFAULT_SETTINGS.compactTopbar,
                liteMode: prefLiteModeInput ? (!AUTO_LOW_END_MODE && !!prefLiteModeInput.checked) : DEFAULT_SETTINGS.liteMode,
                minEffects: prefMinEffectsInput ? !!prefMinEffectsInput.checked : DEFAULT_SETTINGS.minEffects,
                smoothTransitions: prefSmoothTransitionsInput ? !!prefSmoothTransitionsInput.checked : DEFAULT_SETTINGS.smoothTransitions,
                confirmActions: prefConfirmActionsInput ? !!prefConfirmActionsInput.checked : DEFAULT_SETTINGS.confirmActions,
                emphasizeEditorTools: prefEditorFocusInput ? !!prefEditorFocusInput.checked : DEFAULT_SETTINGS.emphasizeEditorTools
            });
        }

        function getDisplayName(user) {
            if (!user) return state.defaultBrandName;
            const meta = user.user_metadata || {};
            const fromMeta = meta.username || meta.display_name || meta.full_name || meta.name;
            if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
            const email = user.email || '';
            if (email.includes('@')) return email.split('@')[0];
            return state.defaultBrandName;
        }

        function closeBrandMenu() {
            if (!brandAccountMenu) return;
            brandAccountMenu.hidden = true;
            brandAccountMenu.classList.remove('open');
        }

        function openBrandMenu() {
            if (!brandAccountMenu || !state.session) return;
            brandAccountMenu.hidden = false;
            brandAccountMenu.classList.add('open');
        }

        function toggleBrandMenu() {
            if (!brandAccountMenu || !state.session) return;
            if (brandAccountMenu.hidden) {
                openBrandMenu();
                return;
            }
            closeBrandMenu();
        }

        function openAccountSettingsModal() {
            if (!accountSettingsModal || !state.session) return;
            accountSettingsModal.classList.add('open');
            accountSettingsModal.setAttribute('aria-hidden', 'false');
            setSettingsForm(state.userSettings || DEFAULT_SETTINGS);
            setAccountSettingsMessage('', false);
            if (prefThemeModeSelect) prefThemeModeSelect.focus();
        }

        function closeAccountSettingsModal() {
            if (!accountSettingsModal) return;
            accountSettingsModal.classList.remove('open');
            accountSettingsModal.setAttribute('aria-hidden', 'true');
            setAccountSettingsMessage('', false);
        }

        function syncBrandAccount(session) {
            if (!brandEl || !brandNameEl) return;
            if (!session) {
                brandNameEl.textContent = state.defaultBrandName;
                brandEl.classList.add('brand-account-enabled');
                brandEl.setAttribute('role', 'button');
                brandEl.setAttribute('tabindex', '0');
                closeBrandMenu();
                closeAccountSettingsModal();
                return;
            }
            const displayName = getDisplayName(session.user);
            brandNameEl.textContent = displayName;
            brandEl.classList.add('brand-account-enabled');
            brandEl.setAttribute('role', 'button');
            brandEl.setAttribute('tabindex', '0');
            if (brandAccountLabel) brandAccountLabel.textContent = displayName;
        }

        function setMode(mode) {
            state.mode = mode;
            const isSignin = mode === 'signin';
            const isRegister = mode === 'register';

            modeSigninBtn.classList.toggle('active', isSignin);
            modeRegisterBtn.classList.toggle('active', isRegister);

            passwordWrap.style.display = 'block';
            confirmWrap.style.display = isRegister ? 'block' : 'none';
            codeWrap.style.display = isRegister ? 'block' : 'none';

            loginBtn.style.display = isSignin ? 'inline-flex' : 'none';
            sendCodeBtn.style.display = isRegister ? 'inline-flex' : 'none';
            registerBtn.style.display = isRegister ? 'inline-flex' : 'none';
            resendCodeBtn.style.display = isRegister ? 'inline-flex' : 'none';
            setMessage('', false);
        }

        function setBusy(isBusy) {
            modeSigninBtn.disabled = isBusy;
            modeRegisterBtn.disabled = isBusy;
            emailInput.disabled = isBusy;
            passwordInput.disabled = isBusy;
            confirmInput.disabled = isBusy;
            codeInput.disabled = isBusy;
            loginBtn.disabled = isBusy;
            registerBtn.disabled = isBusy;
            sendCodeBtn.disabled = isBusy;
            resendCodeBtn.disabled = isBusy;
            cancelBtn.disabled = isBusy;
        }

        function openModal() {
            closeBrandMenu();
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            setMode('signin');
            setBusy(false);
            setMessage('', false);
            emailInput.focus();
        }

        function closeModal() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            setBusy(false);
            passwordInput.value = '';
            confirmInput.value = '';
            codeInput.value = '';
            setMessage('', false);
        }

        function sessionRedirectUrl() {
            return config.authRedirectTo || window.location.href.split('#')[0].split('?')[0];
        }

        function syncTopbar(session) {
            state.session = session || null;
            syncBrandAccount(state.session);
            if (state.session) {
                topAuthBtn.style.display = 'none';
                topSignoutBtn.style.display = 'none';
                return;
            }
            topAuthBtn.style.display = 'inline-flex';
            topSignoutBtn.style.display = 'none';
        }

        function validateRegisterFields(requireCode) {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmInput.value;
            const code = codeInput.value.trim().replace(/\s+/g, '');

            if (!email || !password) {
                setMessage('Email and password are required.', true);
                return null;
            }
            if (password.length < 6) {
                setMessage('Use at least 6 characters for password.', true);
                return null;
            }
            if (password !== confirmPassword) {
                setMessage('Passwords do not match.', true);
                return null;
            }
            if (requireCode && !code) {
                setMessage('Verification code is required.', true);
                return null;
            }
            return { email: email, password: password, code: code };
        }

        async function sendCode(isResend) {
            const form = validateRegisterFields(false);
            if (!form) return;

            setBusy(true);
            const { error } = await state.client.auth.signInWithOtp({
                email: form.email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: sessionRedirectUrl()
                }
            });
            setBusy(false);
            if (error) {
                setMessage(error.message || 'Failed to send code.', true);
                return;
            }
            setMessage(isResend ? 'Code resent. Check your inbox.' : 'Code sent. Check your inbox.', false);
        }

        topAuthBtn.addEventListener('click', openModal);
        topSignoutBtn.addEventListener('click', async function() {
            await state.client.auth.signOut();
        });
        if (brandEl) {
            brandEl.addEventListener('click', function() {
                if (!state.session) {
                    openModal();
                    return;
                }
                toggleBrandMenu();
            });
            brandEl.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (!state.session) {
                        openModal();
                        return;
                    }
                    toggleBrandMenu();
                }
            });
        }
        if (brandAccountSettingsBtn) {
            brandAccountSettingsBtn.addEventListener('click', function() {
                closeBrandMenu();
                openAccountSettingsModal();
            });
        }
        if (brandAccountSignoutBtn) {
            brandAccountSignoutBtn.addEventListener('click', async function() {
                closeBrandMenu();
                await state.client.auth.signOut();
            });
        }
        if (accountSettingsOpenHomeBtn) {
            accountSettingsOpenHomeBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname.indexOf('/rules/') >= 0 || window.location.pathname.indexOf('/about/') >= 0 ? '../' : './';
            });
        }
        if (accountSettingsOpenRulesBtn) {
            accountSettingsOpenRulesBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname.indexOf('/about/') >= 0 ? '../rules/' : (window.location.pathname.indexOf('/rules/') >= 0 ? './' : 'rules/');
            });
        }
        if (accountSettingsOpenAboutBtn) {
            accountSettingsOpenAboutBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname.indexOf('/rules/') >= 0 ? '../about/' : (window.location.pathname.indexOf('/about/') >= 0 ? './' : 'about/');
            });
        }
        if (accountSettingsToggleLiteBtn) {
            accountSettingsToggleLiteBtn.addEventListener('click', function() {
                if (AUTO_LOW_END_MODE) {
                    setAccountSettingsMessage('Lite mode is auto enabled on this device.', false);
                    return;
                }
                if (prefLiteModeInput) {
                    prefLiteModeInput.checked = !prefLiteModeInput.checked;
                }
                const nextSettings = readSettingsForm();
                persistSettings(nextSettings);
                applyUserSettings(nextSettings);
                setAccountSettingsMessage(nextSettings.liteMode ? 'Lite mode enabled.' : 'Lite mode disabled.', false);
            });
        }
        if (accountSettingsSaveBtn) {
            accountSettingsSaveBtn.addEventListener('click', function() {
                if (!state.session) return;
                const nextSettings = readSettingsForm();
                persistSettings(nextSettings);
                applyUserSettings(nextSettings);
                setAccountSettingsMessage('Settings saved.', false);
            });
        }
        if (accountSettingsCancelBtn) {
            accountSettingsCancelBtn.addEventListener('click', closeAccountSettingsModal);
        }
        if (accountSettingsCloseXBtn) {
            accountSettingsCloseXBtn.addEventListener('click', closeAccountSettingsModal);
        }
        if (accountSettingsModal) {
            accountSettingsModal.addEventListener('click', function(event) {
                if (event.target === accountSettingsModal) closeAccountSettingsModal();
            });
        }

        modeSigninBtn.addEventListener('click', function() {
            setMode('signin');
            passwordInput.focus();
        });

        modeRegisterBtn.addEventListener('click', function() {
            setMode('register');
            passwordInput.focus();
        });

        loginBtn.addEventListener('click', async function() {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                setMessage('Email and password are required.', true);
                return;
            }

            setBusy(true);
            const { error } = await state.client.auth.signInWithPassword({ email: email, password: password });
            setBusy(false);
            if (error) {
                setMessage(error.message || 'Sign in failed.', true);
                return;
            }
            closeModal();
        });

        registerBtn.addEventListener('click', async function() {
            const form = validateRegisterFields(true);
            if (!form) return;

            setBusy(true);
            const verifyResult = await state.client.auth.verifyOtp({
                email: form.email,
                token: form.code,
                type: 'email'
            });
            if (verifyResult.error) {
                setMessage(verifyResult.error.message || 'Code verification failed.', true);
                setBusy(false);
                return;
            }

            const updateResult = await state.client.auth.updateUser({ password: form.password });
            if (updateResult.error) {
                setMessage(updateResult.error.message || 'Password setup failed.', true);
                setBusy(false);
                return;
            }

            setBusy(false);
            closeModal();
        });

        sendCodeBtn.addEventListener('click', function() {
            sendCode(false);
        });

        resendCodeBtn.addEventListener('click', function() {
            sendCode(true);
        });

        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(event) {
            if (event.target === modal) closeModal();
        });
        document.addEventListener('click', function(event) {
            if (!brandEl || !brandAccountMenu || brandAccountMenu.hidden) return;
            if (!brandEl.contains(event.target) && !brandAccountMenu.contains(event.target)) {
                closeBrandMenu();
            }
        });

        window.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
                closeBrandMenu();
                closeAccountSettingsModal();
            }
        });

        state.userSettings = loadSettings();
        applyUserSettings(state.userSettings);

        state.client.auth.getSession().then(function(result) {
            syncTopbar(result && result.data ? result.data.session : null);
        });

        state.client.auth.onAuthStateChange(function(_event, session) {
            syncTopbar(session);
        });
    })();
});
