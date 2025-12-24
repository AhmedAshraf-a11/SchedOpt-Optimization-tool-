/**
 * Storage Utility
 * Wrapper around LocalStorage
 * Refactored for file:// support
 */
(function (global) {
    global.AppStorage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error("Storage Read Error:", e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error("Storage Write Error:", e);
                return false;
            }
        },

        remove(key) {
            localStorage.removeItem(key);
        },

        clear() {
            localStorage.clear();
        }
    };
})(window);
