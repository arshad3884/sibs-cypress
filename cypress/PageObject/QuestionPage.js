export class QuestionPage {
    clickNext() {
        cy.get('.pt-7 a[href*="/questionnaires/"]').contains('Next').should('be.visible').click()
    }
    clickSubmit() {
        cy.get('button[modal="questionnaires.stages.navigation.finish"]').eq(0).should('contain.text', 'Submit').scrollIntoView().should('be.visible').click() //Submit
        //modal
        cy.get('[x-show="show && showActiveComponent"] h3[id="modal-headline"]').should('be.visible').and('contain.text', 'Finish your questionnaire')
        cy.get('[x-show="show && showActiveComponent"] .pt-6').should('be.visible').and('contain.text', 'Are you sure you want to finish your questionnaire?')
        cy.get('[x-show="show && showActiveComponent"] .btn-secondary').should('be.visible').and('contain.text', 'Submit').click()
        cy.url().should('include', '/dashboards/')
        cy.wait(5000)
    }
    validateActiveSection(sectionName) {
        cy.get('h2 .text-esg5').contains(sectionName).scrollIntoView().should('be.visible')
    }
    clickViewReport() {
        cy.get('.w-full > div.flex > div > .cursor-pointer').contains('View Report').should('be.visible').click()
        cy.url().should('include', '?report=true')
    }
    answerQuestion(description, type, answer, questionIndex = 0) {
        const normalizeType = type.toLowerCase().trim();

        cy.contains('[id*="question-"] .question-description p .question_title', description)
            .should('be.visible')
            .parents('.question_div')
            .eq(questionIndex)
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
                        if (Array.isArray(answer)) {
                            this.answerMultipleValueUnitRows(questionSelector, answer);
                        } else {
                            cy.get(questionSelector)
                                .find('.answer_type input[type="text"]:visible')
                                .first()
                                .clear({ force: true })
                                .type(answer.value.toString(), { force: true })
                                .should(($input) => {
                                    const actual = $input.val().replace(/\s/g, '');
                                    expect(actual).to.eq(answer.value.toString());
                                }).wait(1000)

                            if (
                                answer.unit &&
                                answer.unit.toLowerCase() !== 'unit' &&
                                answer.unit !== '%'
                            ) {
                                this.selectTomSelectOption(questionSelector, answer.unit);
                            }
                        }
                        break;

                    case 'checkbox':
                    case 'checkboxes':
                    case 'multiselect checkboxes':
                        cy.get(questionSelector).then(($q) => {
                            const hasRealDropdown = $q.find('[data-dropdown-selected-text]').length > 0;

                            if (hasRealDropdown) {
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
                .find('.answer_type label')
                .filter((_, label) => {
                    const actual = label.innerText
                        .replace(/\u00a0/g, ' ')
                        .replace(/\s+/g, ' ')
                        .replace(/\.$/, '')
                        .trim()
                        .toLowerCase();

                    const expected = option
                        .replace(/\u00a0/g, ' ')
                        .replace(/\s+/g, ' ')
                        .replace(/\.$/, '')
                        .trim()
                        .toLowerCase();

                    return actual.includes(expected);
                })
                .first()
                .should('be.visible')
                .find('input[type="checkbox"]')
                .check({ force: true }).wait(1000)
        });
    }
    selectCheckboxDropdownOptions(questionSelector, options) {
        options.forEach((option) => {
            cy.get(questionSelector).then(($q) => {
                const dropdownIsOpen = $q.find('[x-show="showDropdown"]:visible').length > 0;

                if (!dropdownIsOpen) {
                    cy.get(questionSelector)
                        .find('[data-dropdown-selected-text]')
                        .first()
                        .scrollIntoView()
                        .click({ force: true });
                }
            });

            cy.get(questionSelector)
                .find('[x-show="showDropdown"]:visible, .checkboxDropDownContainer:visible')
                .should('be.visible');

            cy.get(questionSelector)
                .find('[x-show="showDropdown"]:visible label, .checkboxDropDownContainer:visible label')
                .filter((_, label) => {
                    const actual = label.innerText
                        .replace(/\u00a0/g, ' ')
                        .replace(/\s+/g, ' ')
                        .replace(/\.$/, '')
                        .trim()
                        .toLowerCase();

                    const expected = option
                        .replace(/\u00a0/g, ' ')
                        .replace(/\s+/g, ' ')
                        .replace(/\.$/, '')
                        .trim()
                        .toLowerCase();

                    return actual.includes(expected);
                })
                .first()
                .scrollIntoView()
                .find('input[type="checkbox"]')
                .check({ force: true })
            cy.wait(2000);
        });

        cy.get('body').click(0, 0, { force: true });
    }
    selectTomSelectOption(questionSelector, option) {
        const matchesOption = (el) =>
            el.innerText
                .replace('×', '')
                .replace(/\u00a0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase()
                .includes(option.toLowerCase());

        cy.get(questionSelector).then(($question) => {
            const alreadySelected = [...$question.find('.ts-control .item')].some(matchesOption);

            if (alreadySelected) {
                cy.log(`${option} already selected - skipping`);
                return;
            }

            // The country TomSelect is rendered/refreshed by Livewire while typing. The remote
            // search re-morphs the DOM, which (a) can detach the input mid-type if we type with a
            // per-char delay and (b) can close the dropdown before the option is clicked, leaving
            // Cypress retrying against a dropdown that never re-opens on slower (CI) runs.
            // Strategy: focus + type fast (re-querying each command so we never act on a detached
            // element), let Livewire settle, then ensure the dropdown is open before selecting.

            // focus / open the control
            cy.get(questionSelector)
                .find('.answer_type .ts-control input:visible')
                .first()
                .scrollIntoView()
                .click({ force: true });

            // type the search term fast (no per-char delay) so every char lands before Livewire
            // morphs the input out from under us
            cy.get(questionSelector)
                .find('.answer_type .ts-control input:visible')
                .first()
                .type(option, { force: true });

            // allow Livewire to fetch + re-render the matching remote options
            cy.wait(2500);

            // The morph may have closed the dropdown; re-open it (search term is retained) until the
            // option is actually rendered, then click it.
            const ensureDropdownAndSelect = (attemptsLeft) => {
                cy.get('body').then(($body) => {
                    const optionReady = [...$body.find('.ts-dropdown:visible .option')].some(matchesOption);

                    if (optionReady) {
                        cy.contains('.ts-dropdown:visible .option', option, { matchCase: false })
                            .first()
                            .scrollIntoView()
                            .click({ force: true });
                        return;
                    }

                    if (attemptsLeft <= 1) {
                        // last attempt: surface the original, meaningful assertion error
                        cy.contains('.ts-dropdown:visible .option', option, { matchCase: false })
                            .click({ force: true });
                        return;
                    }

                    cy.log(`Dropdown option "${option}" not ready - re-opening`);
                    cy.get(questionSelector)
                        .find('.answer_type .ts-control')
                        .first()
                        .click({ force: true });
                    cy.wait(1500);
                    ensureDropdownAndSelect(attemptsLeft - 1);
                });
            };

            ensureDropdownAndSelect(5);

            cy.get(questionSelector)
                .find('.ts-control .item')
                .should('contain.text', option);

            cy.get('body').click(0, 0, { force: true });
        });
    }
    answerMultipleValueUnitRows(questionSelector, rows) {
        rows.forEach((row) => {
            cy.get(questionSelector)
                .contains('.answer_type .font-bold', row.label, { matchCase: false })
                .parents('.w-full.py-4')
                .first()
                .within(() => {
                    cy.get('input[type="text"]:visible')
                        .clear({ force: true })
                        .type(row.value.toString(), { force: true }).wait(1000)
                        .should(($input) => {
                            const actual = $input.val().replace(/\s/g, '');
                            expect(actual).to.eq(row.value.toString());
                        });
                });

            if (row.unit && row.unit.toLowerCase() !== 'unit') {
                this.selectTomSelectOptionByRowLabel(questionSelector, row.label, row.unit);
            }
        });
    }
    selectTomSelectOptionByRowLabel(questionSelector, label, option) {
        cy.get(questionSelector)
            .contains('.answer_type .font-bold', label, { matchCase: false })
            .parents('.w-full.py-4')
            .first()
            .then(($row) => {
                const alreadySelected = [...$row.find('.ts-control .item')]
                    .some((el) => el.innerText.replace('×', '').trim().toLowerCase().includes(option.toLowerCase()));

                if (alreadySelected) {
                    cy.log(`${option} already selected - skipping`);
                    return;
                }

                cy.wrap($row)
                    .find('.ts-control')
                    .click({ force: true });

                cy.get('.ts-dropdown:visible .dropdown-input')
                    .clear({ force: true })
                    .type(option, { force: true });

                cy.get('.ts-dropdown:visible .option').contains(option, { matchCase: false })
                    .click({ force: true });

                cy.wrap($row)
                    .find('.ts-control .item')
                    .should('contain.text', option);

                cy.get('body').click(0, 0, { force: true });
            });
    }
    markCompanyDoesNotReportByQuestionId(questionId) {
        const questionSelector = `.question_div[data-question-id="${questionId}"]`;

        cy.get(questionSelector)
            .scrollIntoView()
            .should('be.visible')
            .contains('label', 'Company does not report')
            .invoke('attr', 'for')
            .then((forId) => {
                cy.get(`#${forId}`)
                    .check({ force: true })
                    .should('be.checked');
            });
    }
}