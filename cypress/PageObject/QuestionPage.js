export class QuestionPage {
    clickNext() {
        cy.get('.pt-7 a[href*="/questionnaires/"]').contains('Next').should('be.visible').wait(1000).click()
        cy.wait(1000)
    }
    submitQuestion() {
        cy.wait(2000)
        cy.get('[type="button"]')
            .contains('Submit')
            .should('be.visible')
            .and('be.enabled')
            .click({ force: true }) //Submit
        //modal
        cy.get('[x-show="show && showActiveComponent"] h3[id="modal-headline"]').should('be.visible').and('contain.text', 'Finish your questionnaire')
        cy.get('[x-show="show && showActiveComponent"] .pt-6').should('be.visible').and('contain.text', 'Are you sure you want to finish your questionnaire?')
        cy.get('[x-show="show && showActiveComponent"] .btn-secondary').should('be.visible').and('contain.text', 'Submit').click()
        cy.wait(5000)
    }
    reOpenQuestionnaire() {
        cy.contains('button[modal="questionnaires.stages.navigation.reopen"]', 'Re open').should('be.visible').click()
        cy.wait(1000)
        // Wait for modal to appear, then operate within it
        cy.get('#modal-container').should('be.visible').within(() => {
            // Title h3 also contains the close-button node, so use contain.text (not have.text)
            cy.get('#modal-headline').should('be.visible').and('contain.text', 'Re open your questionnaire')
            cy.contains('span', 'Do you want to re open your questionnaire?').should('be.visible')
            // Confirm button carries wire:click="reopen"
            cy.get('button[wire\\:click="reopen"]').should('be.visible').and('contain.text', 'Confirm').click()
        })
        cy.wait(2000)
    }
    refreshAndConfirmSubmission(questionName) {
        cy.get('.w-full > .text-esg5').should('be.visible').and('contain.text', questionName)
        cy.get('.w-full.text-center').should('be.visible').and('contain.text', 'We are processing the questionnaire, please wait a few seconds and refresh the page')

        // Processing can take several minutes (esp. GHG), needing many refresh cycles. Each
        // Refresh click is a full page load; keep refreshing until the "Refresh" link is gone
        // (i.e. processing finished). Re-query fresh each time to avoid detached-element errors.
        const refreshUntilDone = (attemptsLeft) => {
            cy.get('body').then(($body) => {
                if (!$body.find('a:contains("Refresh")').length) {
                    return // processing finished, link gone
                }
                cy.wait(15000)
                cy.get('a:contains("Refresh")').if('visible').click()
                cy.wait(3000)
                if (attemptsLeft > 0) {
                    refreshUntilDone(attemptsLeft - 1)
                }
            })
        }
        refreshUntilDone(15)
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

        cy.get('[id*="question-"] .question-description p .question_title')
            .filter((_, el) => {
                return el.innerText
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toLowerCase()
                    .includes(description.toLowerCase());
            })
            .eq(questionIndex)
            .should('be.visible')
            .parents('.question_div')
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
                            .click({ force: true }).wait(500)

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
    addValue(description, value, unit) {
        cy.contains('[data-is-checkbox-dropdown-row="1"] .border-0.text-esg39', description, { matchCase: false })
            .should('be.visible')
            .parents('[data-is-checkbox-dropdown-row="1"]')
            .first()
            .as('selectedValueRow')
            .find('input[placeholder="Value"]')
            .first()
            .clear({ force: true })
            .type(value.toString(), { force: true })
            .wait(500);

        cy.get('@selectedValueRow')
            .find(`.item[data-value*="${unit}"]`)
            .if()
            .then(() => {
                cy.log(`${unit} already selected`);
            })
            .else()
            .then(() => {
                cy.get('@selectedValueRow')
                    .find('.ts-control')
                    .first()
                    .click({ force: true });

                cy.get('.ts-dropdown:visible .dropdown-input')
                    .clear({ force: true })
                    .type(unit, { force: true });

                cy.get('.ts-dropdown:visible [role="option"] .item-description, .ts-dropdown:visible .option')
                    .contains(unit, { matchCase: false })
                    .click({ force: true });

                cy.get('@selectedValueRow')
                    .find(`.item[data-value*="${unit}"]`)
                    .should('exist');
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
    validateCurrentGHGSection(sectionNo) {
        cy.get('a .drop-shadow').eq(sectionNo - 1).should('have.class', 'border-esg5') //should be selected
    }

    //Taxonomy
    expandSection(sectionName) {
        cy.get('.accordion-header .text-base').contains(sectionName).parents('.accordion-item').find('.accordion-button').click()
    }
    gotoVerifyLink(sectionName) {
        cy.get('.accordion-header .text-base').contains(sectionName).parents('.accordion-item').find('button[type="button"]').contains('Verify').click()
    }
    answerTaxonomyQuestion(description, type, answer, questionIndex = 0) {
        const normalizeType = type.toLowerCase().trim();

        cy.contains('.max-h-auto p.text-normal, .max-h-auto p.text-base', description)
            .eq(questionIndex)
            .should('be.visible')
            .parents('.max-h-auto')
            .first()
            .then(($question) => {
                const questionSelector = $question;

                cy.wrap(questionSelector)
                    .scrollIntoView()
                    .should('be.visible');

                switch (normalizeType) {
                    case 'radio':
                    case 'yes/no':
                    case 'binary':
                        cy.wrap(questionSelector)
                            .find('input[type="radio"]')
                            .filter((_, input) => {
                                const actual = input.value.replace(/\.$/, '').trim().toLowerCase();
                                const expected = answer.replace(/\.$/, '').trim().toLowerCase();

                                return actual === expected;
                            })
                            .first()
                            .should('exist')
                            .check({ force: true })
                            .wait(2000)
                            .should('be.checked');
                        break;

                    default:
                        throw new Error(`Unsupported taxonomy question type: ${type}`);
                }
            });
    }
    clickComplete() {
        cy.get('button[text="Complete"]').should('be.visible').click()
    }
    verifyCompletedSection(sectionName) {
        cy.contains('.accordion-header .text-base', sectionName)
            .should('be.visible')
            .parents('.accordion-item')
            .first()
            .find('.accordion-header svg')
            .first()
            .should('be.visible');
    }
    addKPIValues(capex, opex) {
        cy.contains('label', 'CAPEX')
            .parent()
            .find('input[id="value"]')
            .clear()
            .type(capex.toString(), { force: true })
            .blur();

        cy.contains('label', 'OPEX')
            .parent()
            .find('input[id="value"]')
            .clear()
            .type(opex.toString(), { force: true })
            .blur();
    }
    declareMininumSafguardOption(sectionName, option) {
        cy.get('.accordion-header .text-base').contains(sectionName).parents('.accordion-item').find('button[type="button"]').contains('Declare').click()
        cy.get('[id="modal-container"]').contains(option).parents('li').find('[name="safeguardAligned"]').check({ force: true }).should('be.checked').wait(1000)
        cy.get('[id="modal-container"] [savemethod="save"]').should('be.visible').click() //Save
    }
    addActivityInTaxonomy(activityName, taxonomySector, taxonomyActivity, activityKPI) {
        cy.contains('button', 'Add activity').should('be.visible').click()
        cy.get('#name').should('be.visible').clear().type(activityName)

        // Relevant taxonomy sector — scope to the visible "Add activity" form's wrapper, since the
        // page can hold multiple `.ts-wrapper` siblings (already-added activities / re-render).
        cy.get('select[data-property-id="sector"]')
            .siblings('.ts-wrapper')
            .filter(':visible')
            .first()
            .find('.ts-control')
            .click({ force: true })
        cy.get('.ts-dropdown:visible .option')
            .contains(taxonomySector, { matchCase: false })
            .click({ force: true })
        cy.wait(2000)

        // Relevant taxonomy activity — the dropdown doesn't reliably open via a forced click after
        // the Livewire re-render. Instead set the value directly through the TomSelect instance
        // (stored on the native <select> as `.tomselect`): look up the option by its label and call
        // setValue(id), which fires TomSelect's onChange -> wire:model.live. No dropdown needed.
        //
        // IMPORTANT: choosing the sector triggers a Livewire `/livewire/update` that re-renders the
        // activity control and re-initialises TomSelect with the new sector's options. That morph is
        // async and its timing varies, so we must NOT read the options in a single-shot `.then()`
        // (which is what made this break: it read `ts.options` before the new options were loaded and
        // failed with "expected undefined to exist"). We retry with `.should()` until the *visible*
        // activity control's TomSelect actually contains the wanted option, then set it.
        const wantedActivity = taxonomyActivity.replace(/\s+/g, ' ').trim().toLowerCase();

        // Pick the activity <select> whose adjacent `.ts-wrapper` is currently visible (the open
        // "Add activity" form), is wired to a live TomSelect instance, and whose options are loaded.
        const findActivityMatch = ($selects) => {
            for (const select of [...$selects]) {
                const wrapper = select.nextElementSibling;
                const isVisibleWrapper =
                    wrapper &&
                    wrapper.classList.contains('ts-wrapper') &&
                    wrapper.offsetParent !== null;
                const ts = select.tomselect;
                if (!isVisibleWrapper || !ts) continue;

                const match = Object.values(ts.options).find(
                    (o) => (o.title || '').replace(/\s+/g, ' ').trim().toLowerCase().includes(wantedActivity)
                );
                if (match) return { ts, match };
            }
            return null;
        };

        cy.get('select[data-property-id="activity"]')
            .should(($selects) => {
                // Retries (re-querying fresh DOM each attempt) until the morph settles and the
                // option exists on the visible control's TomSelect instance.
                expect(
                    findActivityMatch($selects),
                    `taxonomy activity option "${taxonomyActivity}" loaded on visible control`
                ).to.not.be.null;
            })
            .then(($selects) => {
                const { ts, match } = findActivityMatch($selects);
                ts.setValue(String(match[ts.settings.valueField] ?? match.id));
            });

        cy.wait(2000)

        cy.get('select[data-property-id="activity"]')
            .siblings('.ts-wrapper')
            .filter(':visible')
            .first()
            .find('.ts-control')
            .should('contain.text', taxonomyActivity)

        // No special case
        cy.get('#specialCaseActivity-no').check({ force: true })

        // 1. Check eligibility
        cy.contains('The chosen activity may be eligible').should('be.visible')
        cy.contains('button', 'Read description').should('be.visible').click()
        cy.contains('.modal-header', 'Description').should('be.visible')
        cy.contains('button', 'Close').click()
        cy.contains('label', 'Confirm description and eligibility').click()
        // Select the first eligible objective
        cy.get('input[id="eligibility"]').should('be.enabled').check({ force: true }).wait(500)

        // KPI values. These inputs use Livewire `wire:model.blur`: each blur commits the value and
        // triggers a `/livewire/update` morph that re-renders ALL three inputs. Do NOT wrap this in
        // `within()` - its container detaches on the first morph, so later queries hit stale/empty
        // re-rendered inputs (the values appear to "clear"). Query by id each time and wait for each
        // commit's round-trip to settle so the values accumulate instead of resetting each other.
        cy.get('#specialCaseActivity-no').check({ force: true })

        cy.get('#activityVolume\\.volume\\.value:visible')
            .clear({ force: true })
            .type(activityKPI.businessVolume.toString(), { force: true })
            .blur()
        cy.wait(2000)

        cy.get('#activityVolume\\.capex\\.value:visible')
            .clear({ force: true })
            .type(activityKPI.capex.toString(), { force: true })
            .blur()
        cy.wait(2000)

        cy.get('#activityVolume\\.opex\\.value:visible')
            .clear({ force: true })
            .type(activityKPI.opex.toString(), { force: true })
            .blur()
        cy.wait(2000)
        // "Add" commits via wire:click="createAndClose"; target by wire:click to avoid the
        // "Add Another" button and the whitespace around the button's "Add" label.
        cy.get('button[wire\\:click="createAndClose"]')
            .filter(':visible')
            .should('be.enabled')
            .click({ force: true })
    }
    goToSubstantialContribute() {
        cy.contains('.flex.items-center.gap-3', '2. Substantial contribute')
            .should('be.visible').within(() => {
                cy.contains('span', '2. Substantial contribute').should('be.visible')
                cy.get('a').should('have.attr', 'href').and('include', '/taxonomy/substantial/')
                cy.get('a').click()
            })
        cy.url().should('include', '/taxonomy/substantial/')
    }
    goToTaxonomyQuestionnaire(objective, section = 'substantial') {
        cy.contains('.grid.grid-cols-6', objective)
            .should('be.visible')
            .within(() => {
                cy.contains('a', 'Verify')
                    .should('have.attr', 'href')
                    .and('include', `/taxonomy/${section}/`)
                    .then((href) => {
                        cy.visit(href);
                    });
            });

        cy.url().should('include', `/taxonomy/${section}/`);
    }
    selectMostRelevantObjective(objective) {
        cy.get('select[data-property-id="mostRelevant"]')
            .siblings('.ts-wrapper')
            .find('.ts-control')
            .should('be.visible')
            .click();

        cy.get('.ts-dropdown:visible .option')
            .contains(objective)
            .should('be.visible')
            .click();

        cy.get('select[data-property-id="mostRelevant"]')
            .siblings('.ts-wrapper')
            .find('.item')
            .should('contain.text', objective)
        cy.wait(1000)
    }
    goToDNSH() { //Does Not Significantly Harm
        cy.contains('.flex.items-center.gap-3', '3. Does Not Significantly Harm')
            .should('be.visible').within(() => {
                cy.contains('span', '3. Does Not Significantly Harm').should('be.visible')
                cy.get('a').should('have.attr', 'href').and('include', '/taxonomy/dnsh/').then((href) => {
                    cy.visit(href)
                })
            })
        cy.url().should('include', '/taxonomy/dnsh/')
    }
    clickSubmit() {
        cy.wait(1000)
        cy.get('[type="button"]').contains('Submit').should('be.visible').click({ force: true })
    }
    downloadTaxonomyFullReport() {
        cy.get('#dropdownDefault').should('contain.text', 'Download').and('be.visible').click()
        cy.get('#dropdown > .text-sm > :nth-child(2)').should('contain.text', 'Full report').and('be.visible').click()
        cy.url().should('include', '/taxonomy/report/export/')
    }

    //Physical Risk
    addAsset(assetName, assetType, primaryNACE, assetLocation, assetRelevance) {
        cy.get('.grid a[href*="/questionnaires"]').contains('Questionnaire: Physical Risks').should('be.visible')
        cy.contains('button#addForm', 'Add Asset and its Location', { matchCase: false })
            .scrollIntoView()
            .should('be.visible')
        cy.wait(1500)
        cy.contains('button#addForm', 'Add Asset and its Location', { matchCase: false })
            .click({ force: true })
        cy.get('input[id="name"]', { timeout: 10000 }).should('be.visible')
        //Asset Name
        cy.get('input[id="name"]').should('be.visible').clear().type(assetName)
        cy.get('input[id="name"]').should('have.value', assetName)
        //Asset type 
        cy.get('select[data-property-id="assetType"]')
            .siblings('.ts-wrapper')
            .find('.ts-control')
            .click({ force: true })
        cy.contains('.ts-dropdown:visible .option', assetType, { matchCase: false }).click({ force: true })
        cy.get('select[data-property-id="assetType"]')
            .siblings('.ts-wrapper')
            .find('.ts-control .item')
            .should('contain.text', assetType)
        // Select the primary NACE for the selected asset in this location 
        cy.get('#activity option')
            .then(($options) => {
                const expected = primaryNACE.replace(/\s+/g, ' ').trim().toLowerCase();
                const option = [...$options].find((opt) => {
                    const text = opt.innerText.replace(/\s+/g, ' ').trim().toLowerCase();
                    const value = opt.value.replace(/\s+/g, ' ').trim().toLowerCase();

                    return text.includes(expected) || value === expected;
                });

                expect(option, `primary NACE option "${primaryNACE}"`).to.exist;
                // force: true — the sticky page header (.flex.items-center.justify-between.h-16)
                // can overlap the select and trip Cypress's "covered by another element" check
                cy.get('#activity').select(option.value, { force: true }).should('have.value', option.value);
            })
        cy.wait(1000)

        this.addAssetLocation(assetLocation)

        // Relevance (asset value)
        cy.get('select[data-property-id="relevanceAssetValue"]')
            .siblings('.ts-wrapper')
            .find('.ts-control')
            .click({ force: true })
        cy.contains('.ts-dropdown:visible .option', assetRelevance.relevanceAssetValue, { matchCase: false }).click({ force: true })
        cy.get('#relevanceJustificationAssetValue').type(assetRelevance.relevanceJustificationAssetValue).blur()
        cy.get('#relevanceJustificationAssetValue').should('have.value', assetRelevance.relevanceJustificationAssetValue)

        // Relevance (business volume)
        cy.get('select[data-property-id="relevanceBusinessVolume"]')
            .siblings('.ts-wrapper')
            .find('.ts-control')
            .click({ force: true })
        cy.contains('.ts-dropdown:visible .option', assetRelevance.relevanceBusinessVolume, { matchCase: false }).click({ force: true })
        cy.get('#relevanceJustificationBusinessVolume').type(assetRelevance.relevanceJustificationBusinessVolume).blur()
        cy.get('#relevanceJustificationBusinessVolume').should('have.value', assetRelevance.relevanceJustificationBusinessVolume)

        // Insurance coverage
        cy.get('select[data-property-id="insuranceCoverage"]')
            .siblings('.ts-wrapper')
            .find('.ts-control')
            .click({ force: true })
        cy.contains('.ts-dropdown:visible .option', assetRelevance.insuranceCoverage, { matchCase: false }).click({ force: true })

        if (assetRelevance.insuranceCoverage?.toLowerCase() === 'yes') {
            cy.get('select[data-property-id="insuranceCoverageOptions"]').scrollIntoView().should('be.visible')
            cy.wait(1000)

            assetRelevance.insuranceCoverageOptions.forEach((coverage) => {
                cy.get('select[data-property-id="insuranceCoverageOptions"]')
                    .siblings('.ts-wrapper')
                    .find('.ts-control')
                    .click({ force: true })
                cy.contains('.ts-dropdown:visible .option', coverage, { matchCase: false })
                    .click({ force: true })
            })
            cy.get('body').click(0, 0, { force: true })

            cy.get('#insuranceCoverageFile').selectFile('cypress/fixtures/Ficheiro_9MB.pdf', { force: true })
            cy.wait(2000)
        }

        // Re-verify address fields still hold values after later Livewire morphs
        cy.get('[data-test="add-name-btn"]').should('have.value', assetLocation.name)
        cy.get('[data-test="add-latitude-btn"]').should('have.value', String(assetLocation.latitude))
        cy.get('[data-test="add-longitude-btn"]').should('have.value', String(assetLocation.longitude))
        cy.get('[data-test="add-postal-code-btn"]').should('have.value', String(assetLocation.postalCode))

        // Add button stays disabled (wire:loading) while the file uploads/saves; wait until it
        // turns enabled (yellow) then click. Upload can take ~30s.
        cy.get('button[data-test="save-btn"][text="Add"]', { timeout: 80000 })
            .scrollIntoView()
            .should('be.visible')
            .and('be.enabled')
            .click({ force: true })
    }
    addAssetLocation(assetLocation) {
        cy.contains('button', 'Add a new asset location', { matchCase: false }).click({ force: true })
        cy.wait(1000)

        // Text inputs - type, blur, then let the Livewire morph settle before the next field.
        // The first field (name) can be wiped by a late morph triggered by adding the location,
        // so re-type it until the value sticks.
        const fillNameField = (attemptsLeft) => {
            cy.get('[data-test="add-name-btn"]').clear().type(assetLocation.name).blur()
            cy.wait(1500)
            cy.get('[data-test="add-name-btn"]').then(($el) => {
                if ($el.val() !== assetLocation.name && attemptsLeft > 0) {
                    fillNameField(attemptsLeft - 1)
                }
            })
        }
        fillNameField(3)
        cy.get('[data-test="add-name-btn"]').should('have.value', assetLocation.name)
        cy.get('[data-test="add-latitude-btn"]').clear().type(String(assetLocation.latitude)).blur()
        cy.wait(1500)
        cy.get('[data-test="add-latitude-btn"]').should('have.value', String(assetLocation.latitude))
        cy.get('[data-test="add-longitude-btn"]').clear().type(String(assetLocation.longitude)).blur()
        cy.wait(1500)
        cy.get('[data-test="add-longitude-btn"]').should('have.value', String(assetLocation.longitude))

        // Country 
        cy.get('input[placeholder="Select the country"]').parent('.ts-control').click().wait(1000)
        cy.get('input[placeholder="Select the country"]').parent('.ts-control').click()
        cy.get('select[data-property-id$="country_code"]').parent('div')
            .find('[role="option"]').contains(assetLocation.country).should('exist').click({ force: true })
        cy.wait(2000)
        cy.get('select[data-property-id$="country_code"]').siblings('.ts-wrapper').find('.ts-control .item').should('contain.text', assetLocation.country)

        cy.get('input[placeholder="Select the region"]').parent('.ts-control').click().wait(1000)
        cy.get('input[placeholder="Select the region"]').parent('.ts-control').click()
        cy.get('select[data-property-id$="region_code"]').parent('div')
            .find('[role="option"]').contains(assetLocation.region).should('exist').click({ force: true })
        cy.wait(2000)
        cy.get('select[data-property-id$="region_code"]').siblings('.ts-wrapper').find('.ts-control .item').should('contain.text', assetLocation.region)

        cy.get('input[placeholder="Select the city"]').parent('.ts-control').click().wait(1000)
        cy.get('input[placeholder="Select the city"]').parent('.ts-control').click().click()
        cy.get('select[data-property-id$="city_code"]').parent('div')
            .find('[role="option"]').contains(assetLocation.city).should('exist').click({ force: true })
        cy.wait(2000)
        cy.get('select[data-property-id$="city_code"]').siblings('.ts-wrapper').find('.ts-control .item').should('contain.text', assetLocation.city)

        cy.get('[data-test="add-postal-code-btn"]').clear().type(String(assetLocation.postalCode)).blur()
        cy.get('[data-test="add-postal-code-btn"]').should('have.value', String(assetLocation.postalCode))
    }

    // Opens the Contingency/Continuity plan modal for a given hazard (e.g. 'Earthquake')
    // and answers both questions. contingencyPlan/continuityPlan are 'Yes' or 'No'.
    selectRiskPlan(potentialRisk, contingencyPlan, continuityPlan) {
        cy.contains('div.left-block', potentialRisk, { matchCase: false })
            .find('button[modal="questionnaires.physicalrisks.modals.plan"]')
            .should('be.visible')
            .click({ force: true })
        cy.wait(1000)

        const contingencyValue = contingencyPlan.toLowerCase() === 'yes' ? '1' : '0'
        const continuityValue = continuityPlan.toLowerCase() === 'yes' ? '1' : '0'

        // Wait for the modal's inner heading rather than #modal-container itself: the container
        // animates open (x-transition) and is momentarily 672x0, which fails be.visible.
        cy.contains('h3', 'Contingency Plan', { timeout: 20000 }).should('be.visible')

        cy.get('#modal-container').within(() => {
            cy.get(`input[name="risk.has_contingency_plan"][value="${contingencyValue}"]`)
                .check({ force: true })
            cy.wait(1000)

            cy.get(`input[name="risk.has_continuity_plan"][value="${continuityValue}"]`)
                .check({ force: true })
            cy.wait(1000)

            cy.get('button[text="Confirm"]').should('be.visible').and('be.enabled').click({ force: true })
        })
        cy.wait(1500)
    }

}