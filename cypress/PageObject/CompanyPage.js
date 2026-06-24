export class CompanyPage {
    clickOnAddCompany() {
        cy.get('[data-test="add-data-btn"]').contains('Add').should('be.visible').click()
        cy.url().should('include', '/companies/form')
        cy.contains('Identify the company').scrollIntoView().should('be.visible')
        cy.contains('The first step is to fill in simple information about your company that will allow us to identify the next steps of your journey').scrollIntoView().should('be.visible')
        cy.get('p.text-red-500').should('contain.text', 'By submitting this form you agree and accept the terms and conditions of use of the SIBS ESG Portal, which means that the information provided by user companies can be shared with Participating Banks')
            .and('contain.text', 'See the full text of the terms and conditions here.')
    }
    getTINnumber() {
        cy.visit('https://nif.marcosantos.me/?i=1')
        cy.get('h1[class="center"]').should('be.visible').and('contain.text', 'NIF fresquinho')
        cy.wait(3000)
        return cy.get('h2[id="nif"]').should('be.visible').invoke('text').as('tinNumber')
    }
    fillCompanyForm(company) {

        if (company.enabledStatus) {
            cy.get('[for="enabled_status"]').should('be.visible').and('contain.text', 'Enabled status')
            cy.get('[id="enabled_status"]').select(company.enabledStatus)
        }

        if (company.companyName) {
            cy.get('label[for="name"]').should('be.visible').and('contain.text', 'Company name')
            cy.get('input[data-test="company-name"]').should('exist').type(company.companyName);
        }

        if (company.companyCommercialName) {
            cy.get('label[for="commercial_name"]').should('be.visible').and('contain.text', 'Company commercial name')
            cy.get('input[id="commercial_name"]').type(company.companyCommercialName);
        }

        if (company.type) {
            cy.get('label[for="type"]').should('be.visible').and('contain.text', 'Type')
            cy.get('select[id="type"]').select(company.type)
        }

        if (company.parentCompany) {
            cy.get('label[for="parent"]').should('be.visible').and('contain.text', 'Parent company')
            cy.get('input[placeholder="Select the parent company"]').scrollIntoView().should('be.visible').click()
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.mainNace).click({ force: true }) //select first option
        }
        if (company.mainNace) {
            cy.get('label[for="business_sector"]').should('be.visible').and('contain.text', 'Main nace')
            cy.get('input[placeholder="Select the main business sector"]').scrollIntoView().should('be.visible').click()
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.mainNace).click({ force: true })
        }

        if (company.secondaryNaces?.length) {
            cy.get('label[for="businessSectorSecondary"]').should('be.visible').and('contain.text', 'Secondary naces')
            cy.get('input[placeholder="Select the secondary business sectors."]').scrollIntoView().should('be.visible').click()
            company.secondaryNaces.forEach(option => {
                cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(option).click({ force: true })
            })
        }

        if (company.tinCountry) {
            cy.get('label[for="vat_country"]').should('be.visible').and('contain.text', 'TIN Country').wait(500)
            cy.get('input[placeholder="TIN/VAT/CNPJ country"]').scrollIntoView().should('be.visible').click().wait(500)
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.tinCountry).click({ force: true })
        }

        if (company.tinNumber) {
            cy.get('label[for="vat_number"]').should('be.visible').and('contain.text', 'TIN Number').wait(500)
            cy.get('input[id="vat_number"]').should('be.visible').type(company.tinNumber).wait(500)
            cy.get('input[id="vat_number"]').should('be.visible').should('contain.value', company.tinNumber).wait(500)
        }

        if (company.headquartersCountry) {
            cy.get('label[for="country"]').should('be.visible').and('contain.text', 'Headquarters country').wait(500)
            cy.get('input[placeholder="Select the headquarters country"]').scrollIntoView().should('be.visible').click().wait(500)
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.headquartersCountry).click({ force: true })
        }

        if (company.foundedAt) {
            cy.get('label[for="founded_at"]').should('be.visible').and('contain.text', 'Founded at')
            cy.get('input[id="founded_at"]').type(company.foundedAt)
        }

        if (company.sharingConsent?.length) {
            cy.get('label[for="sharingConsent"]').should('be.visible').and('contain.text', 'Sharing consent')
                .parents('.relative').find('input[id*="-ts-control"]').scrollIntoView().should('be.visible').click()
            company.sharingConsent.forEach(consent => {
                cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(consent).click({ force: true })
            })
        }

        if (company.entityType) {
            cy.get('label[for="customColumnsData.cus_categories"]').should('be.visible').and('contain.text', 'Entity type')
                .parents('.relative').find('input[id*="-ts-control"]').scrollIntoView().should('be.visible').click()
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.entityType).click({ force: true })
        }

        if (company.referredBy) {
            cy.get('label.text-esg8').contains('Referred by').should('be.visible')
            cy.get('input[placeholder="Select the referred by"]').scrollIntoView().should('be.visible').click()
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.referredBy).click({ force: true })
        }

        if (company.owner?.length) {
            cy.get('label[for="createdByUserId"]').should('be.visible').and('contain.text', 'Owner')
                .parents('.relative').find('input[id*="-ts-control"]').scrollIntoView().should('be.visible').click()
            company.owner.forEach(option => {
                cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(option).click({ force: true })
            })
        }

        if (company.users?.length) {
            cy.get('label[for="userablesId"]').should('be.visible').and('contain.text', 'Users')
                .parents('.relative').find('input[id*="-ts-control"]').scrollIntoView().should('be.visible').click()
            company.users.forEach(user => {
                cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(user).click({ force: true })
            })
        }

        if (company.mainCompanyColor) {
            cy.get('label[for="color"]').should('be.visible').and('contain.text', 'Main company color')
            cy.get('input[data-test="company-color"]').type(company.mainCompanyColor)
        }

        if (company.logoPath) {
            cy.get('label.text-esg8').contains('Company logo').scrollIntoView().should('be.visible')
            cy.get('input[type="file"]').selectFile(company.logoPath, { force: true });
        }
    }
    clickNext(){
        cy.get('button[type="button"]').contains('Next').should('be.visible').click()
    }
    fillCompanyRegistrationQuestionnaire(){
        cy.get('a[href*="/questionnaires"]').contains('Questionnaire: Company Registration Questionnaire -v2025').should('be.visible')
        cy.get('[id*="question-"] .question-description').contains(question1).should('be.visible')
            .parents('.question_div').find('.answer_type').then()
    }
}