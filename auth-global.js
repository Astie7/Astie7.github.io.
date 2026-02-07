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

        const accountMarkup = [
            '<div id="brand-account-menu" class="brand-account-menu" hidden>',
            '  <div id="brand-account-label" class="brand-account-label"></div>',
            '  <button id="brand-account-settings" class="brand-account-item" type="button">Settings</button>',
            '  <button id="brand-account-signout" class="brand-account-item danger" type="button">Sign out</button>',
            '</div>',
            '<div id="account-settings-modal" class="account-settings-modal" aria-hidden="true">',
            '  <div class="account-settings-card">',
            '    <h3>Account settings</h3>',
            '    <label for="account-display-name">Username</label>',
            '    <input id="account-display-name" class="edit-input" type="text" placeholder="Choose a username" autocomplete="nickname">',
            '    <p id="account-settings-msg" class="account-settings-msg"></p>',
            '    <div class="account-settings-actions">',
            '      <button id="account-settings-save" class="edit-btn" type="button">Save</button>',
            '      <button id="account-settings-cancel" class="btn btn-ghost" type="button">Close</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');
        document.body.insertAdjacentHTML('beforeend', accountMarkup);

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
        const accountDisplayNameInput = document.getElementById('account-display-name');
        const accountSettingsMsg = document.getElementById('account-settings-msg');
        const accountSettingsSaveBtn = document.getElementById('account-settings-save');
        const accountSettingsCancelBtn = document.getElementById('account-settings-cancel');

        const state = {
            client: window.supabase.createClient(config.url, config.anonKey),
            mode: 'signin',
            session: null,
            defaultBrandName: brandNameEl ? (brandNameEl.textContent || '').trim() : 'Pantheverse'
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
            accountDisplayNameInput.value = getDisplayName(state.session.user);
            setAccountSettingsMessage('', false);
            accountDisplayNameInput.focus();
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
                brandEl.classList.remove('brand-account-enabled');
                brandEl.removeAttribute('role');
                brandEl.removeAttribute('tabindex');
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
                if (!state.session) return;
                toggleBrandMenu();
            });
            brandEl.addEventListener('keydown', function(event) {
                if (!state.session) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
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
        if (accountSettingsSaveBtn) {
            accountSettingsSaveBtn.addEventListener('click', async function() {
                const username = (accountDisplayNameInput.value || '').trim();
                if (!username) {
                    setAccountSettingsMessage('Username is required.', true);
                    return;
                }
                accountSettingsSaveBtn.disabled = true;
                const { error } = await state.client.auth.updateUser({
                    data: { username: username }
                });
                accountSettingsSaveBtn.disabled = false;
                if (error) {
                    setAccountSettingsMessage(error.message || 'Failed to save username.', true);
                    return;
                }
                setAccountSettingsMessage('Saved.', false);
                const sessionResult = await state.client.auth.getSession();
                syncTopbar(sessionResult && sessionResult.data ? sessionResult.data.session : null);
            });
        }
        if (accountSettingsCancelBtn) {
            accountSettingsCancelBtn.addEventListener('click', closeAccountSettingsModal);
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

        state.client.auth.getSession().then(function(result) {
            syncTopbar(result && result.data ? result.data.session : null);
        });

        state.client.auth.onAuthStateChange(function(_event, session) {
            syncTopbar(session);
        });
    })();
});
