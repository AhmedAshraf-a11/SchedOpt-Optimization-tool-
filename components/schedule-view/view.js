(function (global) {
    global.Components = global.Components || {};

    global.Components.ScheduleView = class ScheduleView {
        constructor() {
            this.intervals = [];
            this.currentFilter = ''; // Store current filter state
        }

        render(parent) {
            this.parent = parent;
            this.parent.innerHTML = `
                <div class="view-container fade-in">
                    <header class="page-header">
                        <h1 class="h1">Current Schedule</h1>
                        <div class="header-actions">
                            <button class="btn btn-icon-refresh" id="refresh-btn" title="Refresh">🔄</button>
                            <button class="btn btn-secondary danger-text" id="clear-btn">Clear All</button>
                        </div>
                    </header>

                    <div class="card table-card">
                        <div class="table-controls">
                            <div class="search-box">
                                <input type="text" id="schedule-search" class="form-control" placeholder="Search by Name or Resource">
                            </div>
                            <div class="view-toggles">
                                <button class="btn btn-sm btn-primary" type="button">Table</button>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Resource</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="schedule-body">
                                    <tr><td colspan="6" style="text-align:center;">Loading...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            this.loadStyles();
            this.loadData();
            this.attachEvents();
        }

        loadStyles() {
            if (!document.getElementById('view-css')) {
                const link = document.createElement('link');
                link.id = 'view-css';
                link.rel = 'stylesheet';
                // Resolve path correctly for both root and subdirectory deployments
                const pathname = window.location.pathname;
                const basePath = pathname === '/' ? '/' : pathname.substring(0, pathname.lastIndexOf('/') + 1);
                link.href = (basePath + 'components/schedule-view/view.css').replace(/\/+/g, '/') + '?v=2.0';
                document.head.appendChild(link);
            }
        }

        loadData() {
            const STORAGE_KEYS = global.AppConstants.STORAGE_KEYS;
            const storedIntervals = global.AppStorage.get(STORAGE_KEYS.INTERVALS, []);
            this.intervals = storedIntervals;
            this.processAndRender(this.intervals);
        }

        processAndRender(intervals) {
            const tbody = this.parent.querySelector('#schedule-body');

            // Use current filter from global search
            const filter = this.currentFilter.toLowerCase();

            tbody.innerHTML = '';

            if (intervals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No intervals found.<br>Go to the <strong>Scheduling</strong> tab to add new items.</td></tr>';
                return;
            }

            // 1. Group by Resource
            const grouped = intervals.reduce((acc, curr) => {
                if (!acc[curr.resource]) acc[curr.resource] = [];
                acc[curr.resource].push(curr);
                return acc;
            }, {});

            // 2. Optimize per resource
            let renderedCount = 0;

            for (const [resource, resourceIntervals] of Object.entries(grouped)) {
                // Algorithm!
                const result = global.AppAlgorithms.maximizeNonOverlappingIntervals(resourceIntervals);

                // Combine results for rendering
                const allProcessed = [...result.selected.map(i => ({ ...i, status: 'success' })), ...result.rejected.map(i => ({ ...i, status: 'conflict' }))];

                // Sort by start time for display
                allProcessed.sort((a, b) => a.start - b.start);

                allProcessed.forEach(item => {
                    // Filter Logic: Check Name OR Resource
                    const nameMatch = item.name && item.name.toLowerCase().includes(filter);
                    const resourceMatch = item.resource && item.resource.toLowerCase().includes(filter);

                    if (!filter || nameMatch || resourceMatch) {
                        this.renderRow(tbody, item, item.status);
                        renderedCount++;
                    }
                });
            }

            if (renderedCount === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No results match your search.</td></tr>';
            }
        }

        // Helper: Convert decimal time (9.5) back to HH:MM format
        floatToTimeString(floatTime) {
            if (typeof floatTime !== 'number') return floatTime;
            const hours = Math.floor(floatTime);
            const minutes = Math.round((floatTime - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        renderRow(tbody, item, status) {
            const tr = document.createElement('tr');
            const badgeClass = status === 'success' ? 'badge-success' : 'badge-warning';
            const badgeText = status === 'success' ? 'Scheduled' : 'Conflict';

            tr.innerHTML = `
                <td><strong>${item.name || 'Untitled'}</strong></td>
                <td><span class="resource-badge">${item.resource}</span></td>
                <td>${this.floatToTimeString(item.start)}</td>
                <td>${this.floatToTimeString(item.end)}</td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td>
                    <button class="btn-icon-sm danger delete-btn" data-id="${item.id}" title="Delete">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        }

        attachEvents() {
            const STORAGE_KEYS = global.AppConstants.STORAGE_KEYS;

            this.parent.querySelector('#refresh-btn').addEventListener('click', () => this.loadData());

            this.parent.querySelector('#clear-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to clear ALL schedule data? This cannot be undone.')) {
                    global.AppStorage.remove(STORAGE_KEYS.INTERVALS);
                    this.loadData();
                }
            });

            const searchInput = this.parent.querySelector('#schedule-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.currentFilter = e.target.value;
                    this.processAndRender(this.intervals);
                });
            }

            // Delegation for Delete
            this.parent.querySelector('#schedule-body').addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const id = e.target.getAttribute('data-id');
                    this.deleteInterval(id);
                }
            });
        }

        deleteInterval(id) {
            if (!confirm('Delete this interval?')) return;
            const STORAGE_KEYS = global.AppConstants.STORAGE_KEYS;

            const updated = this.intervals.filter(i => i.id !== id);
            global.AppStorage.set(STORAGE_KEYS.INTERVALS, updated);
            this.intervals = updated; // Update local state
            this.processAndRender(this.intervals);
        }
    }
})(window);
