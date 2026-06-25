const { TENANT_URL, MAIN_BO_URL, TENANT_BO_URL } = require("./cypress.env.json");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  chromeWebSecurity: false,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'SIBS 10 User Load Simulation Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: TENANT_URL,
    boUrl: MAIN_BO_URL,
    pageLoadTimeout: 100000,
    defaultCommandTimeout: 40000,
    viewportWidth: 1920,
    viewportHeight: 1080,
  },
});
