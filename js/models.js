/**
 * Domain Models & Factories
 * Refactored for file:// support
 */
(function (global) {
    global.AppModels = {
        /**
         * Creates a standard Interval object.
         */
        createInterval(name, resource, start, end, meta = {}) {
            // Basic validation
            if (!name || name.trim() === "") {
                name = "Untitled Interval";
            }
            if (typeof start !== 'number' || typeof end !== 'number') {
                console.error("Invalid time format: must be numbers");
                return null;
            }

            if (start >= end) {
                console.error("Invalid interval: start must be less than end");
                return null; // Enforce s_i < e_i
            }

            return {
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
                name,
                resource,
                start,
                end,
                meta,
                createdAt: new Date().toISOString()
            };
        },

        /**
         * Validates an interval object structure.
         */
        isValidInterval(interval) {
            return interval
                && interval.resource
                && typeof interval.start === 'number'
                && typeof interval.end === 'number'
                && interval.start < interval.end;
        }
    };
})(window);
