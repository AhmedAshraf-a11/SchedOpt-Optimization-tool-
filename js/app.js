/**
 * Main Application Module
 * Refactored for file:// protocol support (No ES Modules)
 */
(function (global) {
    const ROUTES = global.AppConstants.ROUTES;
    const APP_NAME = global.AppConstants.APP_NAME;
    const STORAGE_KEYS = global.AppConstants.STORAGE_KEYS;
    const THEMES = global.AppConstants.THEMES;
    const Storage = global.AppStorage;

    class App {
        constructor() {
            this.currentRoute = null;
            this.components = {};
            this.state = {
                theme: Storage.get(STORAGE_KEYS.THEME, THEMES.LIGHT)
            };
        }

        init() {
            console.log(`${APP_NAME} Initializing...`);

            // Apply saved theme
            this.applyTheme(this.state.theme);

            // Render Shell
            this.setupLayout();

            // Handle Navigation
            window.addEventListener('hashchange', () => this.handleRoute());

            // Initial Route
            this.handleRoute();

            // Reveal App
            document.body.classList.remove('loading');
        }

        setupLayout() {
            // Instantiate Sidebar
            if (global.Components && global.Components.Sidebar) {
                this.components.sidebar = new global.Components.Sidebar();
                this.components.sidebar.init();
            }

            // Instantiate Topbar
            if (global.Components && global.Components.Topbar) {
                this.components.topbar = new global.Components.Topbar();
                this.components.topbar.init();
            }
        }

        handleRoute() {
            const hash = window.location.hash.slice(1) || ROUTES.HOME;
            // console.log(`Navigating to: ${hash}`);

            const formattedHash = hash.split('/')[0];

            // Unmount current view
            const mainContainer = document.getElementById('main-content-area');
            if (!mainContainer) return;

            mainContainer.innerHTML = ''; // Fast clear

            try {
                let ViewClass;

                // Route mapping using the Global Components
                switch (formattedHash) {
                    case ROUTES.HOME:
                        ViewClass = global.Components.Home;
                        break;
                    case ROUTES.SCHEDULING:
                        ViewClass = global.Components.SchedulingInput;
                        break;
                    case ROUTES.VIEW:
                        ViewClass = global.Components.ScheduleView;
                        break;
                    case ROUTES.SETTINGS:
                        ViewClass = global.Components.Settings;
                        break;
                    default:
                        ViewClass = global.Components.Home;
                }

                if (ViewClass) {
                    const view = new ViewClass();
                    view.render(mainContainer);
                } else {
                    mainContainer.innerHTML = `<div class="error">View not found</div>`;
                }

                // Update Active Link in Sidebar
                if (this.components.sidebar) {
                    this.components.sidebar.updateActiveLink(formattedHash);
                }

                this.currentRoute = formattedHash;

            } catch (error) {
                console.error("Navigation Error:", error);
                mainContainer.innerHTML = `<div class="error">Failed to load view: ${error.message}</div>`;
            }
        }

        toggleTheme() {
            const newTheme = this.state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
            this.state.theme = newTheme;
            Storage.set(STORAGE_KEYS.THEME, newTheme);
            this.applyTheme(newTheme);
            
            // Update mobile theme toggle if sidebar exists
            if (this.components.sidebar && this.components.sidebar.updateThemeToggle) {
                this.components.sidebar.updateThemeToggle();
            }
        }

        applyTheme(theme) {
            if (theme === THEMES.DARK) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
    }

    // Expose app to global for easy access
    global.app = new App();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => global.app.init());
    } else {
        global.app.init();
    }

})(window);
