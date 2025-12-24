/**
 * Application Constants
 * Refactored to global scope for file:// support
 */
(function (global) {
  global.AppConstants = {
    APP_NAME: "SchedOpt",
    VERSION: "1.0.0",
    ROUTES: {
      HOME: "home",
      SCHEDULING: "scheduling-input",
      VIEW: "schedule-view",
      RESOURCES: "resources",
      REPORTS: "reports",
      SETTINGS: "settings"
    },
    STORAGE_KEYS: {
      THEME: "schedopt_theme",
      INTERVALS: "schedopt_intervals",
      RESOURCES: "schedopt_resources"
    },
    THEMES: {
      LIGHT: "light",
      DARK: "dark"
    }
  };
})(window);
