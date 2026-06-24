// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-if'
import { faker } from '@faker-js/faker';
globalThis.faker = faker;

Cypress.on('uncaught:exception', (err, runnable) => {
    // Handle specific errors
    if (
        err.message?.includes('google is not defined')
    ) {
        // Returning false here prevents Cypress from failing the test
        return false;
    }
    // Let other errors fail the test if true
    return true;
})