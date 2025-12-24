(function (global) {
    global.Components = global.Components || {};

    global.Components.Home = class Home {
        constructor() {
        }

        render(parent) {
            this.parent = parent;
            this.parent.innerHTML = `
                <div class="home-container fade-in">
                    <header class="page-header">
                        <h1 class="h1">Dashboard</h1>
                        <p class="text-muted">Welcome back! Here is your scheduling overview.</p>
                    </header>

                    <div class="stats-grid">
                        <div class="card stat-card">
                            <div class="stat-icon info">📅</div>
                            <div class="stat-content">
                                <span class="stat-value" id="stats-total">-</span>
                                <span class="stat-label">Total Intervals</span>
                            </div>
                        </div>
                        <div class="card stat-card">
                            <div class="stat-icon success">✅</div>
                            <div class="stat-content">
                                <span class="stat-value" id="stats-optimized">-</span>
                                <span class="stat-label">Scheduled</span>
                            </div>
                        </div>
                        <div class="card stat-card">
                            <div class="stat-icon warning">⚠️</div>
                            <div class="stat-content">
                                <span class="stat-value" id="stats-conflicts">-</span>
                                <span class="stat-label">Conflicts</span>
                            </div>
                        </div>
                        <div class="card stat-card">
                            <div class="stat-icon primary">📦</div>
                            <div class="stat-content">
                                <span class="stat-value" id="stats-resources">-</span>
                                <span class="stat-label">Active Resources</span>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-content">
                        <div class="card recent-activity">
                            <h2 class="h3">System Status</h2>
                             <ul class="activity-list" id="activity-list">
                                <!-- Populated by JS -->
                            </ul>
                        </div>
                        
                        <div class="card quick-actions">
                            <h2 class="h3">Quick Actions</h2>
                            <div class="action-buttons">
                                <a href="#scheduling-input" class="btn btn-primary">New Schedule</a>
                                <a href="#schedule-view" class="btn btn-secondary">View Calendar</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.loadStyles();
            this.calculateStats();
        }

        loadStyles() {
            if (!document.getElementById('home-css')) {
                const link = document.createElement('link');
                link.id = 'home-css';
                link.rel = 'stylesheet';
                // Resolve path correctly for both root and subdirectory deployments
                const pathname = window.location.pathname;
                const basePath = pathname === '/' ? '/' : pathname.substring(0, pathname.lastIndexOf('/') + 1);
                link.href = (basePath + 'components/home/home.css').replace(/\/+/g, '/') + '?v=2.0';
                document.head.appendChild(link);
            }
        }

        calculateStats() {
            const STORAGE_KEYS = global.AppConstants.STORAGE_KEYS;
            const intervals = global.AppStorage.get(STORAGE_KEYS.INTERVALS, []);

            const total = intervals.length;
            let scheduled = 0;
            let conflicts = 0;
            const resources = new Set();

            const grouped = intervals.reduce((acc, curr) => {
                acc[curr.resource] = acc[curr.resource] || [];
                acc[curr.resource].push(curr);
                resources.add(curr.resource);
                return acc;
            }, {});

            // Clear generic resource set, we will count active ones in the loop
            resources.clear();

            for (const r in grouped) {
                const result = global.AppAlgorithms.maximizeNonOverlappingIntervals(grouped[r]);
                scheduled += result.selected.length;
                conflicts += result.rejected.length;
                // Active Resource: A resource is active if it has at least one scheduled item
                if (result.selected.length > 0) {
                    resources.add(r);
                }
            }

            // Update DOM
            this.updateValue('stats-total', total);
            this.updateValue('stats-optimized', scheduled); // "Scheduled" means selected
            this.updateValue('stats-conflicts', conflicts);
            this.updateValue('stats-resources', resources.size);

            // Update Activity List
            const list = this.parent.querySelector('#activity-list');
            list.innerHTML = `
                <li class="activity-item">
                    <span class="activity-icon">ℹ️</span>
                    <div class="activity-info">
                        <span class="activity-msg">Algorithm Engine Ready (Greedy)</span>
                        <span class="activity-time">Phase 2 Active</span>
                    </div>
                </li>
                <li class="activity-item">
                    <span class="activity-icon">📊</span>
                    <div class="activity-info">
                        <span class="activity-msg">Optimization Rate</span>
                        <span class="activity-time">${total > 0 ? Math.round((scheduled / total) * 100) : 0}% Efficiency</span>
                    </div>
                </li>
            `;
        }

        updateValue(id, val) {
            const el = this.parent.querySelector('#' + id);
            if (el) el.textContent = val;
        }
    }
})(window);
