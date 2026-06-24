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
            cy.get('input[placeholder="Select the parent company"]').scrollIntoView().should('be.visible').click()
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.mainNace).click({ force: true }) //select first option
        }
        if (company.mainNace) {
            cy.get('label[for="business_sector"]').should('be.visible').and('contain.text', 'Main nace').wait(500)
            cy.get('input[placeholder="Select the main business sector"]').scrollIntoView().should('be.visible').click().wait(500)
            cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(company.mainNace).click({ force: true })
        }

        if (company.secondaryNaces?.length) {
            cy.get('label[for="businessSectorSecondary"]').should('be.visible').and('contain.text', 'Secondary naces').wait(500)
            cy.get('input[placeholder="Select the secondary business sectors."]').scrollIntoView().should('be.visible').click().wait(500)
            company.secondaryNaces.forEach(option => {
                cy.get('.dropdown-active [id*="-ts-dropdown"] [role="option"]').contains(option).click({ force: true })
            })
            cy.get('input[placeholder="Select the secondary business sectors."]').scrollIntoView().type('{esc}', { force: true }) //to close the dropdown
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
    clickNext() {
        cy.get('button[type="button"]').contains('Next').should('be.visible').click()
    }
    clickFinish() {
        cy.get('button.bg-esg5.text-white').contains('Finish').should('be.visible').click()
    }
    fillCompanyRegistrationQuestionnaire() {
        cy.get('a[href*="/questionnaires"]').contains('Questionnaire: Company Registration Questionnaire -v2025').should('be.visible')
        // cy.get('[id*="question-"] .question-description').contains(question1).should('be.visible').parents('.question_div').find('.answer_type')
        this.answerQuestion('Is the company an issuer of securities?', 'radio', 'No');
        this.answerQuestion(
            'State the number of employees in the company´s own workforce.',
            'number',
            250
        );
        this.answerQuestion(
            "State the company's Balance Sheet.",
            'currency/unit',
            { value: 25000000, unit: 'unit' }
        );
        this.answerQuestion(
            "State the Company's Overall Turnover.",
            'currency/unit',
            { value: 5000000, unit: 'unit' }
        );
        this.answerQuestion(
            'State the Tax Identification Numbers (NIPC) of the subsidiaries included in the ESG consolidation scope for this reporting period',
            'text',
            { notApplicable: true }
        );
        this.answerQuestion("Has the company conducted a materiality analysis?", 'radio', 'No');

        this.answerQuestion(
            'List the issues on which the company considers its activities to have an actual or potential negative impact on people and the environment.',
            'checkboxes',
            ['E1 - Climate Change', 'E2 - Pollution', 'E3 - Water and Marine Resources', 'E4 - Biodiversity and Ecosystems', 'E5 - Circular Economy', 'S1 - Own Labour', 'S2 - Workers in the Value Chain', 'S3 - Affected Communities', 'S4 - Consumers and End Users', 'G1 - Governance']
        );
        this.answerQuestion("Does the company monitor its Scope 1, 2 and 3 greenhouse gas emissions?", 'radio', 'No'); // if we set No, GHG calculator will be be enabled 
        cy.get('[id="company-btn-move"]').should('be.visible').and('contain.text', 'Next').click()
    }
    answerQuestion(description, type, answer) {
        const normalizeType = type.toLowerCase().trim();

        cy.contains('[id*="question-"] .question-description p .question_title', description)
            .should('be.visible')
            .parents('.question_div')
            .first()
            .then(($question) => {
                const questionId = $question.attr('data-question-id');
                const questionSelector = `.question_div[data-question-id="${questionId}"]`;

                cy.get(questionSelector)
                    .scrollIntoView()
                    .should('be.visible');

                if (typeof answer === 'object' && !Array.isArray(answer)) {
                    if (answer.notApplicable === true) {
                        cy.get(questionSelector)
                            .contains('label', 'Question not applicable')
                            .invoke('attr', 'for')
                            .then((forId) => {
                                cy.get(`#${forId}`)
                                    .check({ force: true })
                                    .should('be.checked');
                            });
                        return;
                    }

                    if (answer.companyDoesNotReport === true) {
                        cy.get(questionSelector)
                            .contains('label', 'Company does not report')
                            .invoke('attr', 'for')
                            .then((forId) => {
                                cy.get(`#${forId}`)
                                    .check({ force: true })
                                    .should('be.checked');
                            });
                        return;
                    }
                }

                switch (normalizeType) {
                    case 'radio':
                    case 'yes/no':
                    case 'binary':
                        cy.get(questionSelector)
                            .contains('label, span', new RegExp(`^\\s*${answer}\\s*$`, 'i'))
                            .click({ force: true });
                        break;

                    case 'number':
                    case 'integer':
                        cy.get(questionSelector)
                            .find('.answer_type input:visible')
                            .first()
                            .clear({ force: true })
                            .type(answer.toString(), { force: true })
                            .should('have.value', answer.toString());
                        break;

                    case 'text':
                    case 'text input':
                    case 'text-long':
                    case 'textarea': {
                        const textValue = typeof answer === 'object' ? answer.value : answer;

                        cy.get(questionSelector)
                            .find('.answer_type textarea:visible, .answer_type input[type="text"]:visible')
                            .first()
                            .clear({ force: true })
                            .type(textValue, { force: true })
                            .should('have.value', textValue);
                        break;
                    }

                    case 'currency':
                    case 'unit':
                    case 'currency/unit':
                    case 'decimal':
                        cy.get(questionSelector)
                            .find('.answer_type input:visible')
                            .first()
                            .clear({ force: true })
                            .type(answer.value.toString(), { force: true });

                        if (answer.unit && answer.unit.toLowerCase() !== 'unit') {
                            this.selectTomSelectOption(questionSelector, answer.unit);
                        }
                        break;

                    case 'checkbox':
                    case 'checkboxes':
                    case 'multiselect checkboxes':
                        cy.get(questionSelector).then(($q) => {
                            const hasHiddenDropdown = $q.find('.checkboxDropDownContainer').length > 0;
                            const hasDropdownTrigger = $q.find('.checkboxDropDown').length > 0;
                            const isDropdownClosed =
                                hasHiddenDropdown ||
                                $q.find('.checkboxDropDown').text().toLowerCase().includes('click to select') ||
                                $q.find('.checkboxDropDown').text().toLowerCase().includes('option selected');

                            if (hasDropdownTrigger && isDropdownClosed) {
                                this.selectCheckboxDropdownOptions(questionSelector, answer);
                            } else {
                                this.selectCheckboxOptions(questionSelector, answer);
                            }
                        });
                        break;

                    case 'countries':
                    case 'country':
                    case 'tomselect':
                    case 'tom select':
                        answer.forEach((option) => {
                            this.selectTomSelectOption(questionSelector, option);
                        });
                        break;

                    default:
                        throw new Error(`Unsupported question type: ${type}`);
                }
            });
    }

    selectCheckboxOptions(questionSelector, options) {
        options.forEach((option) => {
            cy.get(questionSelector)
                .contains('.answer_type label', option, { matchCase: false })
                .should('be.visible')
                .find('input[type="checkbox"]')
                .check({ force: true })
                .should('be.checked').wait(1000)
        });
    }

    selectCheckboxDropdownOptions(questionSelector, options) {
        cy.get(questionSelector)
            .find('.checkboxDropDown')
            .scrollIntoView()
            .click({ force: true });

        options.forEach((option) => {
            cy.get(questionSelector)
                .contains(
                    '.checkboxDropDownContainer label, .checkboxDropDown label, .answer_type label',
                    option,
                    { matchCase: false }
                )
                .find('input[type="checkbox"]')
                .check({ force: true })
                .should('be.checked');
        });
    }

    selectTomSelectOption(questionSelector, option) {
        cy.get(questionSelector).then(($question) => {
            const alreadySelected = [...$question.find('.ts-control .item')]
                .some((el) => el.innerText.replace('×', '').trim().toLowerCase() === option.toLowerCase());

            if (alreadySelected) {
                cy.log(`${option} already selected - skipping`);
                return;
            }

            cy.get(questionSelector)
                .find('.answer_type .ts-control input:visible')
                .first()
                .click({ force: true })
                .clear({ force: true })
                .type(option, { force: true });

            cy.contains('.ts-dropdown:visible .option', option, { matchCase: false })
                .click({ force: true });

            cy.get(questionSelector)
                .find('.ts-control .item')
                .should('contain.text', option);

            cy.get('body').click(0, 0, { force: true });
        });
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