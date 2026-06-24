export class LoginPage {
    loginOnTenant(email, password) {
        cy.get('#username')
            .should('be.visible')
            .clear()
            .type(email);

        cy.get('#password')
            .should('be.visible')
            .clear()
            .type(password, { log: false });

        cy.get('[data-test="login-btn"]')
            .should('be.visible')
            .click();
        cy.url().should('include', '/home')
    }
}