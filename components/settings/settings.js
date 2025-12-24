(function (global) {
    global.Components = global.Components || {};

    global.Components.Settings = class Settings {
        constructor() {
        }

        render(parent) {
            this.parent = parent;
            this.parent.innerHTML = `
                <div class="settings-container fade-in">
                    <header class="page-header">
                        <h1 class="h1">Settings</h1>
                    </header>

                    <div class="card settings-card">
                        <h2 class="h3">Appearance</h2>
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">Dark Mode</span>
                                <span class="text-muted">Switch between light and dark themes.</span>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" id="theme-toggle">
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.loadStyles();
            this.attachEvents();
            this.syncState();
        }

        loadStyles() {
            if (!document.getElementById('settings-css')) {
                const link = document.createElement('link');
                link.id = 'settings-css';
                link.rel = 'stylesheet';
                // Resolve path correctly for both root and subdirectory deployments
                const pathname = window.location.pathname;
                const basePath = pathname === '/' ? '/' : pathname.substring(0, pathname.lastIndexOf('/') + 1);
                link.href = (basePath + 'components/settings/settings.css').replace(/\/+/g, '/') + '?v=2.0';
                document.head.appendChild(link);
            }
        }

        attachEvents() {
            // Theme Toggle
            const themeToggle = this.parent.querySelector('#theme-toggle');
            themeToggle.addEventListener('change', () => {
                if (window.app) {
                    window.app.toggleTheme();
                }
            });
        }

        syncState() {
            const THEMES = global.AppConstants.THEMES;
            const themeToggle = this.parent.querySelector('#theme-toggle');
            if (window.app && window.app.state.theme === THEMES.DARK) {
                themeToggle.checked = true;
            }
        }
    }
})(window);
