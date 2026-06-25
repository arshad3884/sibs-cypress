/// <reference types="cypress" />

import { LoginPage } from "../PageObject/LoginPage";
import { HomePage } from "../PageObject/HomePage";
import { CompanyPage } from "../PageObject/CompanyPage";
import { QuestionPage } from "../PageObject/QuestionPage";

const loginPage = new LoginPage()
const homePage = new HomePage()
const companyPage = new CompanyPage()
const questionPage = new QuestionPage()

describe("SIBS Company Creation", () => {
  let companyName

  beforeEach(() => {
    cy.env(["TENANT_URL", "USERS"]).then(({ TENANT_URL, USERS }) => {
      cy.visit('/login')
      loginPage.loginOnTenant(USERS.TENANT_USERNAME, USERS.TENANT_PASSWORD)
    })
  })

  it("Create a New company and complete Company Registration Questionnaire", () => {
    let tinNumber
    companyName = faker.company.name()

    companyPage.getTINnumber().then(number => {
      tinNumber = number
      cy.go('back');

      homePage.gotoCompanies()
      companyPage.clickOnAddCompany()
      companyPage.fillCompanyForm({
        enabledStatus: 'Active',
        companyName: companyName,
        companyCommercialName: companyName + ' TC Ltd',
        type: 'External',
        parentCompany: null,
        mainNace: 'A01.12 - Growing of rice (CAE 01120)',
        secondaryNaces: ['A01.12 - Growing of rice (CAE 01120)', 'A01.14 - Growing of sugar cane (CAE 01140)'],
        tinCountry: 'Portugal',
        tinNumber: tinNumber,
        headquartersCountry: 'Portugal',
        foundedAt: '2020-12-24',
        sharingConsent: ['Nome banco 0001', 'QA Bancos'],
        entityType: 'Non-financial undertakings',
        referredBy: 'RAIZE',
        owner: null,
        users: null,
        mainCompanyColor: null,
        logoPath: 'cypress/fixtures/imageLogo.jpg'
      })

      companyPage.clickNext()
      companyPage.fillCompanyRegistrationQuestionnaire()
      companyPage.clickFinish()
    })
  })

  it('Submit ESG - SIBS v2025 Questionnaire', () => {
    homePage.gotoCompanies()
    companyPage.gotoCompanyList()
    companyPage.gotoCompanyDetail(companyName)
    //companyPage.gotoCompanyDetail('Zboncak - Herman')
    companyPage.gotoAdditionalInfo()
    companyPage.openQuestionnaire('Questionnaire ESG - SIBS v2025')
    questionPage.validateActiveSection('General Info')
    //1
    questionPage.answerQuestion(
      `State the most relevant countries where the organisation's products and/or services are offered`,
      'countries',
      ['Portugal']
    )
    //2
    questionPage.answerQuestion(
      `State the countries of the most relevant suppliers`,
      'countries',
      ['Portugal']
    )
    //3
    questionPage.answerQuestion(
      `State the transition risks to which the organisation is subject`,
      'checkbox',
      ['Political and Legal Domain', 'Technology', 'Market', 'Reputation']
    )
    //4
    questionPage.answerQuestion(
      'Are there any physical risks to which the organisation is subject in any of the geographical areas in which it operates?',
      'radio',
      'Yes'
    )
    //5
    questionPage.markCompanyDoesNotReportByQuestionId(41167)
    //6
    questionPage.answerQuestion(
      'Provide a brief description of the investments planned to respond to the impacts and risks, as well as the value of the expected impacts.',
      'text',
      'The company plans to invest €2M in energy efficiency initiatives and renewable energy projects.'
    )
    //7
    questionPage.answerQuestion(
      'Does the company have any certifications relevant to ESG?',
      'radio',
      'No'
    )
    //8
    questionPage.answerQuestion(
      `Do the organisation's financial statements include disclosure of non-financial information?`,
      'radio',
      'No'
    )
    //9
    questionPage.answerQuestion(
      'Please supplement the information provided with additional information that is relevant to the ESG scope and that has not been previously stated.',
      'text',
      'Additional ESG information has been disclosed in the sustainability report and annual management report.'
    )
    questionPage.clickNext()

    questionPage.validateActiveSection('E1 - Climate Change')
    //1
    questionPage.markCompanyDoesNotReportByQuestionId(41170)
    //2
    questionPage.answerQuestion(
      'Does the organisation have a transition plan for climate change mitigation?',
      'yes/no',
      'No'
    );
    //3
    questionPage.markCompanyDoesNotReportByQuestionId(41240)
    questionPage.clickNext()

    questionPage.validateActiveSection('E2 - Pollution')
    //1
    questionPage.answerQuestion(
      'Indicate the issues on which the company believes there to be actual or potential negative pollution-related impacts.',
      'checkbox',
      [
        'Air pollution',
        'Pollution of water',
        'Pollution of soil',
        'Microplastics'
      ]
    );
    //2
    questionPage.answerQuestion(
      'Does the organisation have any policies or practices in place to respond to the potential impacts or risks associated with the company?',
      'yes/no',
      'No'
    );
    //3
    questionPage.markCompanyDoesNotReportByQuestionId(41176);
    //4
    questionPage.markCompanyDoesNotReportByQuestionId(41177);
    //5
    questionPage.markCompanyDoesNotReportByQuestionId(41178);
    questionPage.clickNext()

    questionPage.validateActiveSection('E3 - Water and Marine Resources')
    //1
    questionPage.answerQuestion(
      'List the issues relating to water and marine resources on which the company considers there to be actual or potential negative impacts.',
      'checkbox',
      [
        'Water consumption',
        'Water harvesting'
      ]
    );
    //2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'radio',
      'No'
    );
    //3
    questionPage.markCompanyDoesNotReportByQuestionId(41182);
    questionPage.clickNext()
    questionPage.validateActiveSection('E4 - Biodiversity and Ecosystems')
    //1
    questionPage.answerQuestion(
      'State the issues on which the company believes there to be negative impacts, whether actual or potential, related to biodiversity and ecosystems.',
      'checkbox',
      [
        'Loss of biodiversity due to climate change',
        'Biodiversity loss due to direct exploitation'
      ]
    );
    //2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'radio',
      'No'
    );
    //3
    questionPage.answerQuestion(
      'Does the company own, lease or manage any sites in areas that are sensitive from a biodiversity perspective?',
      'radio',
      'No'
    );
    questionPage.clickNext()

    questionPage.validateActiveSection('E5 - Circular Economy')
    //1
    questionPage.answerQuestion(
      'List any issues that the company considers to have an actual or potential negative impact on the circular economy',
      'checkbox',
      [
        `Resource inputs in the company's facilities, including resource usage`,
        `Resource outputs from the company's facilities related to products and services`
      ]
    );
    //2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'radio',
      'No'
    );
    //3
    questionPage.markCompanyDoesNotReportByQuestionId(41191);
    questionPage.clickNext()

    questionPage.validateActiveSection('S1 - Own Workforce')
    // Question 1
    questionPage.answerQuestion(
      'State the issues on which the company believes there to be negative impacts, whether actual or potential, relating to its own workforce.',
      'checkbox',
      [
        'Job security',
        'Working hours',
        'Health and Safety'
      ]
    );

    // Question 2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'radio',
      'No'
    );

    // Question 3
    questionPage.answerQuestion(
      'State the breakdown of workers by gender.',
      'integer',
      { companyDoesNotReport: true }
    );

    // Question 4
    questionPage.answerQuestion(
      'State the breakdown of workers by type of contract.',
      'integer',
      { companyDoesNotReport: true }
    );

    // Question 5
    questionPage.answerQuestion(
      'State the breakdown of workers by country.',
      'checkbox',
      ['Portugal']
    );

    // Question 6
    questionPage.answerQuestion(
      'State the number of recordable work-related accidents and the number of deaths due to work-related injuries and work-related health problems.',
      'integer',
      { companyDoesNotReport: true }
    );

    // Question 7
    questionPage.answerQuestion(
      'State the following figures relating to the organisation\'s own workforce:',
      'decimal',
      { companyDoesNotReport: true }
    );

    // Question 8
    questionPage.answerQuestion(
      'State the gender distribution of the number of members of the organisation\'s management body.',
      'integer',
      { companyDoesNotReport: true }
    );

    // Question 9
    questionPage.answerQuestion(
      'State the employee turnover rate for the reporting period.',
      'decimal',
      {
        value: 10,
        unit: '%'
      }
    );

    // Question 10
    questionPage.answerQuestion(
      'Indicate the percentage of employees who earn the applicable minimum wage or less as determined by national legislation or collective bargaining agreements.',
      'decimal',
      {
        value: 5,
        unit: '%'
      }
    );

    // Question 11
    questionPage.answerQuestion(
      'Indicate the percentage of employees covered by collective bargaining agreements.',
      'decimal',
      {
        value: 60,
        unit: '%'
      }
    );

    // Question 12
    questionPage.answerQuestion(
      'Indicate the average number of training hours per employee per year, broken down by gender.',
      'decimal',
      { companyDoesNotReport: true }
    );
    questionPage.clickNext()

    questionPage.validateActiveSection('S2 - Value Chain Workers')
    // Question 1
    questionPage.answerQuestion(
      'State the issues relating to workers in the value chain that the company considers to have an actual or potential negative impact.',
      'checkbox',
      [
        'Job security',
        'Working hours',
        'Health and Safety'
      ]
    );

    // Question 2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'yes/no',
      'No'
    );
    questionPage.clickNext()

    questionPage.validateActiveSection('S3 - Affected Communities')
    // Question 1
    questionPage.answerQuestion(
      'State the issues on which the company believes there to be negative impacts, whether actual or potential, on the affected communities',
      'checkbox',
      [
        'Adequate housing',
        'Adequate Nutrition',
        'Water and sanitation'
      ]
    );

    // Question 2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'yes/no',
      'No'
    );
    questionPage.clickNext()

    questionPage.validateActiveSection('S4 - Consumers and Final Users')
    // Question 1
    questionPage.answerQuestion(
      'Specify the issues that the company considers to have an actual or potential negative impact on consumers and end users.',
      'checkbox',
      [
        'Privacy',
        'Freedom of expression',
        'Health and Safety'
      ]
    );

    // Question 2
    questionPage.answerQuestion(
      'Does the organisation have any policies, practices or future initiatives in place to address the potential impacts and/or risks associated with the company?',
      'yes/no',
      'No'
    );
    questionPage.clickNext()

    questionPage.validateActiveSection('Governance')
    // Question 1
    questionPage.answerQuestion(
      'Indicate the number of confirmed cases of corruption or bribery.',
      'integer',
      2
    );

    // Question 2
    questionPage.answerQuestion(
      'Provide the total amount of fines related to corruption and bribery.',
      'decimal',
      {
        value: 1000,
        unit: 'unit'
      }
    );

    // Question 3
    questionPage.answerQuestion(
      'Does the company have a Code of Conduct for suppliers, or any other document establishing general rules for protecting people and the environment?',
      'radio',
      'Yes'
    );

    // Question 4
    questionPage.answerQuestion(
      'What is the company\'s exposure to reputational and litigation risks relating to the environment?',
      'checkbox',
      [
        'There are pending environmental litigation cases',
        'There are imminent cases of environmental litigation'
      ]
    );
    questionPage.clickSubmit()
    cy.wait(10000)
    questionPage.clickViewReport()
  })
})