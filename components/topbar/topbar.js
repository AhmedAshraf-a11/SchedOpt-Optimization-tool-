(function (global) {
    global.Components = global.Components || {};

    global.Components.Topbar = class Topbar {
        constructor() {
            this.container = document.getElementById('topbar-container');
        }

        init() {
            this.render();
        }

        render() {
            this.container.innerHTML = `
                <div class="topbar-actions">
                    <div class="user-profile">
                        <span class="user-avatar">AD</span>
                        <span class="user-name">Admin</span>
                    </div>
                </div>
            `;

            this.loadStyles();
        }

        loadStyles() {
            if (!document.getElementById('topbar-css')) {
                const link = document.createElement('link');
                link.id = 'topbar-css';
                link.rel = 'stylesheet';
                // Resolve path correctly for both root and subdirectory deployments
                const pathname = window.location.pathname;
                const basePath = pathname === '/' ? '/' : pathname.substring(0, pathname.lastIndexOf('/') + 1);
                link.href = (basePath + 'components/topbar/topbar.css').replace(/\/+/g, '/') + '?v=2.0';
                document.head.appendChild(link);
            }
        }
    }
})(window);
