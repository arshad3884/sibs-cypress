import { QuestionPage } from "../PageObject/QuestionPage";

const questionPage = new QuestionPage()

export class CompanyPage {
    gotoCompanyList() {
        cy.get('.company-list-button').should('be.visible').and('contain.text', 'List').click()
        cy.url().should('include', '/companies/list')
    }
    gotoCompanyDetail(companyName) {
        cy.get('[id*="_tooltip_company"] a[href*="/companies/"]').contains(companyName).parents('.company-list-card').find('a[title="View"]')
            .scrollIntoView().should('be.visible').click()
        cy.get('[aria-current="page"]').should('be.visible').and('contain.text', companyName)
    }
    gotoAdditionalInfo() {
        cy.get('button[id="indicatorPanelTabButton__additional-info"]').should('be.visible').and('contain.text', 'Additional Info').click()
        cy.get('.company-show-extra-info.bg-white').should('be.visible')
    }
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
            this.pickTomSelectOption(() => cy.get('input[placeholder="Select the parent company"]'), company.mainNace) //select first option
        }
        if (company.mainNace) {
            cy.get('label[for="business_sector"]').should('be.visible').and('contain.text', 'Main nace').wait(500)
            this.pickTomSelectOption(() => cy.get('input[placeholder="Select the main business sector"]'), company.mainNace)
        }

        if (company.secondaryNaces?.length) {
            cy.get('label[for="businessSectorSecondary"]').should('be.visible').and('contain.text', 'Secondary naces').wait(500)
            company.secondaryNaces.forEach(option => {
                this.pickTomSelectOption(() => cy.get('input[placeholder="Select the secondary business sectors."]'), option)
            })
            cy.get('input[placeholder="Select the secondary business sectors."]').scrollIntoView().type('{esc}', { force: true }) //to close the dropdown
        }

        if (company.tinCountry) {
            cy.get('label[for="vat_country"]').should('be.visible').and('contain.text', 'TIN Country').wait(500)
            this.pickTomSelectOption(() => cy.get('input[placeholder="TIN/VAT/CNPJ country"]'), company.tinCountry)
        }

        if (company.tinNumber) {
            cy.get('label[for="vat_number"]').should('be.visible').and('contain.text', 'TIN Number').wait(500)
            cy.get('input[id="vat_number"]').should('be.visible').type(company.tinNumber).wait(500)
            cy.get('input[id="vat_number"]').should('be.visible').should('contain.value', company.tinNumber).wait(500)
        }

        if (company.headquartersCountry) {
            cy.get('label[for="country"]').should('be.visible').and('contain.text', 'Headquarters country').wait(500)
            this.pickTomSelectOption(() => cy.get('input[placeholder="Select the headquarters country"]'), company.headquartersCountry)
        }

        if (company.foundedAt) {
            cy.get('label[for="founded_at"]').should('be.visible').and('contain.text', 'Founded at')
            cy.get('input[id="founded_at"]').type(company.foundedAt)
        }

        if (company.sharingConsent?.length) {
            cy.get('label[for="sharingConsent"]').should('be.visible').and('contain.text', 'Sharing consent')
            company.sharingConsent.forEach(consent => {
                this.pickTomSelectOption(
                    () => cy.get('label[for="sharingConsent"]').parents('.relative').find('input[id*="-ts-control"]'),
                    consent
                )
            })
        }

        if (company.entityType) {
            cy.get('label[for="customColumnsData.cus_categories"]').should('be.visible').and('contain.text', 'Entity type')
            this.pickTomSelectOption(
                () => cy.get('label[for="customColumnsData.cus_categories"]').parents('.relative').find('input[id*="-ts-control"]'),
                company.entityType
            )
        }

        if (company.referredBy) {
            cy.get('label.text-esg8').contains('Referred by').should('be.visible')
            this.pickTomSelectOption(() => cy.get('input[placeholder="Select the referred by"]'), company.referredBy)
        }

        if (company.owner?.length) {
            cy.get('label[for="createdByUserId"]').should('be.visible').and('contain.text', 'Owner')
            company.owner.forEach(option => {
                this.pickTomSelectOption(
                    () => cy.get('label[for="createdByUserId"]').parents('.relative').find('input[id*="-ts-control"]'),
                    option
                )
            })
        }

        if (company.users?.length) {
            cy.get('label[for="userablesId"]').should('be.visible').and('contain.text', 'Users')
            company.users.forEach(user => {
                this.pickTomSelectOption(
                    () => cy.get('label[for="userablesId"]').parents('.relative').find('input[id*="-ts-control"]'),
                    user
                )
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
    pickTomSelectOption(getInput, option) {
        const normalize = (text) =>
            (text || '')
                .replace(/\u00a0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

        const matchesOption = (el) =>
            normalize(el.innerText || el.textContent).includes(normalize(option));

        const optionSelector =
            '.dropdown-active [id*="-ts-dropdown"] [role="option"], .ts-dropdown:visible [role="option"], .ts-dropdown:visible .option';

        const openAndSelect = (attemptsLeft) => {
            // Re-query each command so Livewire re-renders never act on a detached control.
            getInput()
                .scrollIntoView()
                .should('be.visible')
                .click({ force: true });

            getInput()
                .clear({ force: true })
                .type(option, { force: true });

            cy.wait(1500);

            cy.get('body').then(($body) => {
                const optionReady = [...$body.find(optionSelector)].some(matchesOption);

                if (optionReady) {
                    cy.get(optionSelector)
                        .filter((_, el) => matchesOption(el))
                        .first()
                        .scrollIntoView()
                        .click({ force: true });
                    return;
                }

                if (attemptsLeft <= 1) {
                    cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"], .ts-dropdown:visible [role="option"]')
                        .contains(option)
                        .click({ force: true });
                    return;
                }

                cy.log(`TomSelect option "${option}" not ready - retrying`);
                cy.wait(1500);
                openAndSelect(attemptsLeft - 1);
            });
        };

        openAndSelect(5);
    }
    clickNext() {
        cy.get('button[type="button"]').contains('Next').should('be.visible').click()
    }
    clickFinish() {
        cy.get('button.bg-esg5.text-white').contains('Finish').should('be.visible').click()
    }
    fillCompanyRegistrationQuestionnaire() {
        cy.get('a[href*="/questionnaires"]').contains('Questionnaire: Company Registration Questionnaire -v2025').should('be.visible')
        // cy.get('[id*="question-"] .question-description').contains(question1).should('be.visible').parents('.question_div').find('.answer_type')
        questionPage.answerQuestion('Is the company an issuer of securities?', 'radio', 'No');
        questionPage.answerQuestion(
            'State the number of employees in the company´s own workforce.',
            'number',
            250
        );
        questionPage.answerQuestion(
            "State the company's Balance Sheet.",
            'currency/unit',
            { value: 25000000, unit: 'unit' }
        );
        questionPage.answerQuestion(
            "State the Company's Overall Turnover.",
            'currency/unit',
            { value: 5000000, unit: 'unit' }
        );
        questionPage.answerQuestion(
            'State the Tax Identification Numbers (NIPC) of the subsidiaries included in the ESG consolidation scope for this reporting period',
            'text',
            { notApplicable: true }
        );
        questionPage.answerQuestion("Has the company conducted a materiality analysis?", 'radio', 'No');

        questionPage.answerQuestion(
            'List the issues on which the company considers its activities to have an actual or potential negative impact on people and the environment.',
            'checkboxes',
            ['E1 - Climate Change', 'E2 - Pollution', 'E3 - Water and Marine Resources', 'E4 - Biodiversity and Ecosystems', 'E5 - Circular Economy', 'S1 - Own Labour', 'S2 - Workers in the Value Chain', 'S3 - Affected Communities', 'S4 - Consumers and End Users', 'G1 - Governance']
        );
        questionPage.answerQuestion("Does the company monitor its Scope 1, 2 and 3 greenhouse gas emissions?", 'radio', 'No'); // if we set No, GHG calculator will be be enabled 
        cy.get('[id="company-btn-move"]').should('be.visible').and('contain.text', 'Next').click()
    }
    openQuestionnaire(questionName) {
        cy.contains('tr', questionName)
            .should('be.visible')
            .within(() => {
                cy.get('a[href*="/questionnaires/"]')
                    .filter(':visible')
                    .first()
                    .click({ force: true });
            })

        cy.url().should('include', '/questionnaires/')
        cy.contains('.grid.content-start .text-esg5', questionName).should('be.visible')
        //If modal appears
        cy.wait(3000)
        cy.get('.p-6').if().then(() => {
            cy.get('.p-6').should('be.visible').and('contain.text', 'Welcome! You’re at the start of our questionnaire and we’re glad to have you here!')
            cy.get('a[text="Start Now!"]').should('be.visible').click()
        })

    }
}