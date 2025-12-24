(function (global) {
    global.Components = global.Components || {};

    global.Components.Sidebar = class Sidebar {
        constructor() {
            this.container = document.getElementById('sidebar-container');
            this.constants = global.AppConstants;
        }

        init() {
            this.render();
            this.attachEvents();
        }

        render() {
            const ROUTES = this.constants.ROUTES;
            const linkClass = "nav-link";

            this.container.innerHTML = `
                <div class="sidebar-header">
                    <div class="header-left">
                        <span class="logo-icon">⚡</span>
                        <span class="logo-text">SchedOpt</span>
                    </div>
                    <div class="header-right mobile-only">
                        <label class="dark-mode-toggle-mobile switch">
                            <input type="checkbox" id="theme-toggle-mobile">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    <a href="#${ROUTES.HOME}" class="${linkClass}" data-route="${ROUTES.HOME}">
                        <span class="icon">🏠</span> 
                        <span class="label">Home</span>
                    </a>
                    
                    <a href="#${ROUTES.SCHEDULING}" class="${linkClass}" data-route="${ROUTES.SCHEDULING}">
                        <span class="icon">📅</span> 
                        <span class="label">Scheduling</span>
                    </a>

                    <a href="#${ROUTES.VIEW}" class="${linkClass}" data-route="${ROUTES.VIEW}">
                        <span class="icon">👁️</span> 
                        <span class="label">View Schedule</span>
                    </a>
                    
                </nav>

                <div class="sidebar-footer desktop-only">
                    <a href="#${ROUTES.SETTINGS}" class="${linkClass}" data-route="${ROUTES.SETTINGS}">
                        <span class="icon">⚙️</span> 
                        <span class="label">Settings</span>
                    </a>
                </div>
            `;

            // Dynamically load CSS
            this.loadStyles();
        }

        loadStyles() {
            if (!document.getElementById('sidebar-css')) {
                const link = document.createElement('link');
                link.id = 'sidebar-css';
                link.rel = 'stylesheet';
                // Resolve path correctly for both root and subdirectory deployments
                const pathname = window.location.pathname;
                const basePath = pathname === '/' ? '/' : pathname.substring(0, pathname.lastIndexOf('/') + 1);
                link.href = (basePath + 'components/sidebar/sidebar.css').replace(/\/+/g, '/') + '?v=2.0';
                document.head.appendChild(link);
            }
        }

        attachEvents() {
            // Events usually handled by anchor tags + hashchange in app.js
            
            // Dark mode toggle for mobile
            const themeToggleMobile = this.container.querySelector('#theme-toggle-mobile');
            if (themeToggleMobile) {
                // Sync initial state
                this.syncThemeToggle();
                
                // Add event listener
                themeToggleMobile.addEventListener('change', () => {
                    if (window.app) {
                        window.app.toggleTheme();
                        this.syncThemeToggle();
                    }
                });
            }
        }

        syncThemeToggle() {
            const themeToggleMobile = this.container.querySelector('#theme-toggle-mobile');
            if (themeToggleMobile && window.app) {
                const THEMES = global.AppConstants.THEMES;
                themeToggleMobile.checked = window.app.state.theme === THEMES.DARK;
            }
        }

        updateActiveLink(route) {
            const links = this.container.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-route') === route) {
                    link.classList.add('active');
                }
            });
        }

        // Public method to sync theme toggle (called from app when theme changes)
        updateThemeToggle() {
            this.syncThemeToggle();
        }
    }
})(window);
