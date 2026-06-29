// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
Cypress.Commands.add('verifyToast', (message, type = 'success') => {
    cy.get('#toast-top-right', { timeout: 10000 })
        .should('exist')
        .and('be.visible')
        .and('have.class', '!block')
        .and('have.class', `bg-${type}`)
        .and('have.class', `border-${type}`)
        .and('have.class', `text-${type}-text`)
        .and('contain.text', message);

    cy.get('#toast-top-right', { timeout: 15000 })
        .should('exist')
        .and('not.be.visible')
        .and('have.class', '!hidden');
})
Cypress.Commands.add('waitForLoader', () => {
    cy.get('.loader-v2').should('not.be.visible') //loader should be disappear
})