export class HomePage {

    gotoCompanies() {
        cy.get('[data-test="manage-menu"]').eq(0).should('be.visible').click();
        cy.get('[data-test="companies-menu"]').eq(0).should('be.visible').click();
        cy.url().should('include','/companies')
        cy.get(':nth-child(1) > .w-full > .cursor-pointer').should('be.visible').click() //Close guide modal
        cy.get('h2').contains('General information').should('be.visible')
    }

    gotoUsers() {
        cy.get('[data-test="manage-menu"]').click();
        cy.get('[data-test="users-menu"]').contains('Users').click();
    }

    gotoRoles() {
        cy.get('[data-test="manage-menu"]').click();
        cy.contains('[data-test="users-menu"]', 'Roles').click();
    }

    gotoApiTokens() {
        cy.get('[data-test="manage-menu"]').click();
        cy.get('[data-test="api-tokens-menu"]').click();
    }

    gotoReportingPeriods() {
        cy.get('[data-test="manage-menu"]').click();
        cy.get('[data-test="reporting-periods-menu"]').click();
    }

    gotoQuestionnaires() {
        cy.get('[data-test="report-menu"]').click();
        cy.get('[data-test="questionnaires-menu"]').click();
    }

    gotoLibrary() {
        cy.get('[data-test="learn-menu"]').click();
        cy.get('[data-test="library-menu"]').click();
    }

    gotoMyAccount() {
        cy.get('button img[alt]').click();
        cy.get('[data-test="my-acc-menu"]').click();
    }

    gotoApplicationSettings() {
        cy.get('button img[alt]').click();
        cy.get('[data-test="application-settings-menu"]').click();
    }

    logout() {
        cy.get('button img[alt]').click();
        cy.contains('button', 'Log out').click();
    }
}