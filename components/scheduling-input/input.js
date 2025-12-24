(function (global) {
    global.Components = global.Components || {};

    global.Components.SchedulingInput = class SchedulingInput {
        constructor() {
            this.state = {
                name: '',
                resource: 'Resource A',
                startTime: '',
                endTime: '',
                priority: 'normal'
            };
        }

        render(parent) {
            this.parent = parent;
            this.parent.innerHTML = `
                <div class="input-container fade-in">
                    <header class="page-header">
                        <h1 class="h1">Add Schedule Interval</h1>
                        <p class="text-muted">Define new time blocks for resources.</p>
                    </header>

                    <div class="card form-card">
                        <form id="schedule-form" class="schedule-form">
                            
                            <!-- Name Input -->
                            <div class="form-group">
                                <label for="intervalName" class="form-label">Interval Name</label>
                                <input type="text" id="intervalName" name="intervalName" class="form-control" placeholder="e.g. Team Standup" required>
                            </div>

                            <!-- Resource Selection -->
                            <div class="form-group">
                                <label for="resource" class="form-label">Resource</label>
                                <select id="resource" name="resource" class="form-control">
                                    <option value="Resource A">Resource A (Meeting Room 1)</option>
                                    <option value="Resource B">Resource B (Production Line)</option>
                                    <option value="Resource C">Resource C (Deployment Server)</option>
                                </select>
                            </div>

                            <!-- Time Inputs -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="startTime" class="form-label">Start Time</label>
                                    <input type="time" id="startTime" name="startTime" class="form-control" required>
                                    <span class="validation-msg hidden" id="startTime-error">Start time is required.</span>
                                </div>

                                <div class="form-group">
                                    <label for="endTime" class="form-label">End Time</label>
                                    <input type="time" id="endTime" name="endTime" class="form-control" required>
                                    <span class="validation-msg hidden" id="endTime-error">End time must be after start time.</span>
                                </div>
                            </div>

                            <!-- Advanced Options Collapsible -->
                            <details class="advanced-options">
                                <summary class="toggle-btn">Advanced Options</summary>
                                <div class="collapsible-content">
                                    <div class="form-group">
                                        <label class="form-label">Priority</label>
                                        <div class="radio-group">
                                            <label class="radio-label">
                                                <input type="radio" name="priority" value="high"> High
                                            </label>
                                            <label class="radio-label">
                                                <input type="radio" name="priority" value="normal" checked> Normal
                                            </label>
                                            <label class="radio-label">
                                                <input type="radio" name="priority" value="low"> Low
                                            </label>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="notes" class="form-label">Notes</label>
                                        <textarea id="notes" class="form-control" rows="2" placeholder="Optional details..."></textarea>
                                    </div>
                                </div>
                            </details>

                            <!-- Actions -->
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="reset-btn">Reset</button>
                                <button type="submit" class="btn btn-primary">Add to Schedule</button>
                            </div>
                        </form>
                        <div id="success-msg" class="success-message hidden">Interval added successfully!</div>
                    </div>
                </div>
            `;

            this.loadStyles();
            this.attachEvents();
        }

        loadStyles() {
            if (!document.getElementById('input-css')) {
                const link = document.createElement('link');
                link.id = 'input-css';
                link.rel = 'stylesheet';
                // Resolve path correctly for both root and subdirectory deployments
                const pathname = window.location.pathname;
                const basePath = pathname === '/' ? '/' : pathname.substring(0, pathname.lastIndexOf('/') + 1);
                link.href = (basePath + 'components/scheduling-input/input.css').replace(/\/+/g, '/') + '?v=2.0';
                document.head.appendChild(link);
            }
        }

        // Helper: Convert "09:30" string to 9.5 float
        timeStringToFloat(timeStr) {
            if (!timeStr) return NaN;
            const parts = timeStr.split(':');
            if (parts.length < 2) return NaN;
            return parseInt(parts[0]) + parseInt(parts[1]) / 60;
        }

        attachEvents() {
            const form = this.parent.querySelector('#schedule-form');
            const nameInput = this.parent.querySelector('#intervalName');
            const startInput = this.parent.querySelector('#startTime');
            const endInput = this.parent.querySelector('#endTime');
            const resourceInput = this.parent.querySelector('#resource');
            const successMsg = this.parent.querySelector('#success-msg');

            const validate = () => {
                const s = this.timeStringToFloat(startInput.value);
                const e = this.timeStringToFloat(endInput.value);
                const errEnd = this.parent.querySelector('#endTime-error');

                let valid = true;

                if (!isNaN(s) && !isNaN(e)) {
                    if (s >= e) {
                        errEnd.classList.remove('hidden');
                        valid = false;
                    } else {
                        errEnd.classList.add('hidden');
                    }
                }
                return valid;
            };

            form.addEventListener('change', validate);

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (validate()) {
                    const name = nameInput.value;
                    const s = this.timeStringToFloat(startInput.value);
                    const e = this.timeStringToFloat(endInput.value);
                    const r = resourceInput.value;
                    const notes = this.parent.querySelector('#notes').value;
                    const priority = this.parent.querySelector('input[name="priority"]:checked').value;

                    // Create Model
                    const interval = global.AppModels.createInterval(name, r, s, e, { priority, notes });

                    if (interval && global.AppModels.isValidInterval(interval)) {
                        // Save
                        const STORAGE_KEYS = global.AppConstants.STORAGE_KEYS;
                        const intervals = global.AppStorage.get(STORAGE_KEYS.INTERVALS, []);
                        intervals.push(interval);
                        if (global.AppStorage.set(STORAGE_KEYS.INTERVALS, intervals)) {
                            // UI Feedback
                            successMsg.classList.remove('hidden');
                            setTimeout(() => successMsg.classList.add('hidden'), 3000);
                            form.reset();
                        } else {
                            alert("Failed to save to Storage.");
                        }
                    } else {
                        alert("Invalid Interval Data");
                    }
                }
            });

            this.parent.querySelector('#reset-btn').addEventListener('click', () => {
                form.reset();
                successMsg.classList.add('hidden');
            });
        }
    }
})(window);
