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
    companyName = 'Load Test ' + faker.company.name()

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
    let questioName = 'Questionnaire ESG - SIBS v2025'
    homePage.gotoCompanies()
    companyPage.gotoCompanyList()
    companyPage.gotoCompanyDetail(companyName)
    companyPage.gotoAdditionalInfo()
    companyPage.openQuestionnaire(questioName)
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
  it('Submit GHG Calculator V1 Questionnaire', () => {
    let questionName = 'GHG Calculator V1'
    homePage.gotoCompanies()
    companyPage.gotoCompanyList()
    companyPage.gotoCompanyDetail(companyName)
    companyPage.gotoAdditionalInfo()
    companyPage.openQuestionnaire(questionName)
    //****************/
    //1st segment
    //****************/
    questionPage.validateCurrentGHGSection(1) //1st Section
    questionPage.answerQuestion(
      'During the reporting period, did the undertaking consume fuel in its own operations within its infrastructure or stationary equipment?',
      'radio',
      'No'
    )
    //1
    questionPage.clickNext()

    questionPage.validateCurrentGHGSection(2) //2nd Section
    //1
    questionPage.answerQuestion(
      'Are the undertaking’s premises located in areas where energy customers have access to product- or supplier-specific data?',
      'radio',
      'No'
    )
    //2
    questionPage.answerQuestion(
      'During the reporting period, did the undertaking produce renewable energy?',
      'radio',
      'No'
    )
    //3
    questionPage.answerQuestion(
      'During the reporting period, did the undertaking acquire energy externally?',
      'radio',
      'No'
    )
    questionPage.clickNext()

    questionPage.validateCurrentGHGSection(3) //3rd Section
    //1
    questionPage.answerQuestion(
      `Are refrigerant gases (commonly fluorinated greenhouse gases) used in equipment within the undertaking's operations?`,
      'radio',
      'No'
    )
    //2
    questionPage.answerQuestion(
      `During the reporting period, did any industrial processes occur on the undertaking's own operations that involve the release of gases such as Carbon Dioxide (CO₂), Methane (CH4), Nitrous Oxide (N₂O), Sulphur Hexafluoride (SF6), Nitrogen Trifluoride (NF3), Hydrofluorocarbons (HFCs) or Perfluorocarbons (PFCs)?`,
      'radio',
      'No'
    )
    questionPage.clickNext()

    questionPage.validateCurrentGHGSection(4) //4th Section
    // 1
    questionPage.answerQuestion(
      `During the reporting period, were journeys undertaken in combustion vehicles owned, controlled, or operated (including leasing) by the undertaking?`,
      'radio',
      'No'
    )
    //2
    questionPage.answerQuestion(
      `During the reporting, did the undertaking operate any other combustion mobile sources, such as heavy machinery (e.g., construction or agricultural equipment)?`,
      'radio',
      'No'
    )
    //3
    questionPage.answerQuestion(
      `During the reporting period, were journeys undertaken in electric vehicles owned, controlled, or operated (including leased) by the undertaking?`,
      'radio',
      'Yes'
    )
    //3.1
    questionPage.answerQuestion(
      `Are these electric vehicles primarily charged outside the undertaking's premises, and can you confirm that their electricity consumption has not been reported in previous questions?`,
      'radio',
      'No'
    )
    //4
    questionPage.answerQuestion(
      `During the reporting period, did workers work remotely or commute using vehicles not owned by the undertaking?`,
      'radio',
      'No'
    )
    //5
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking's employees undertake business trips using vehicles not owned by the undertaking?`,
      'radio',
      'No'
    )
    questionPage.clickNext()

    questionPage.validateCurrentGHGSection(5) //5th Section
    questionPage.answerQuestion(
      `During the reporting period, was any waste produced in the undertaking's own operations and sent for third-party treatment?`,
      'radio',
      'No'
    )
    questionPage.clickNext()

    questionPage.validateCurrentGHGSection(6) //6th Section
    questionPage.answerQuestion(
      `During the reporting period, was water used on the undertaking's own operations?`,
      'radio',
      'No'
    )
    questionPage.clickNext()
    //****************/
    //2nd segment
    //****************/
    //1
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking purchase or subcontract any transport and distribution services? (This includes inbound and outbound logistics and/or logistics within the undertaking's premises, using vehicles not owned by the it)`,
      'radio',
      'No'
    )
    //2
    questionPage.answerQuestion(
      `Does the undertaking have direct suppliers (Tier 1) whose transport and distribution costs for purchased goods were not covered in the previous question?`,
      'radio',
      'Yes'
    )
    //2.1
    questionPage.answerQuestion(
      `Can the undertaking provide an estimate of the distance or cost involved in transporting these products from the supplier to the undertaking's premises?`,
      'radio',
      'No'
    )
    //3
    questionPage.answerQuestion(
      `Is there a third-party storage facility involved in the transport and distribution processes for either the undertaking's upstream or downstream products?`,
      'radio',
      'Yes'
    )
    //3.1
    questionPage.answerQuestion(
      `Is the storage facility located off-site from the undertaking’s premises?`,
      'radio',
      'No'
    )
    questionPage.clickNext()
    //****************/
    //3rd Segment
    //****************/
    //1
    questionPage.answerQuestion(
      `During the reporting period, the undertaking purchase capital goods?`,
      'radio',
      'No'
    )
    //2
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking purchase services?`,
      'radio',
      'No'
    )
    //3
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking purchase goods?`,
      'radio',
      'No'
    )
    questionPage.clickNext()
    //****************/
    //4th Segment
    //****************/
    //1
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking sell goods?`,
      'radio',
      'Yes'
    )
    //1.1
    questionPage.answerQuestion(
      `Considering the materials used to produce or package the goods sold by the undertaking, select the material(s) from the list that best correspond to those used and specify the corresponding quantities. Additionally, select the most likely final destination based on the consumer's typical disposal behaviour. If the question is not applicable, mark as "Not Applicable"`,
      'checkbox',
      ['Batteries waste - Landfill']
    )
    //Batteries waste - Landfill
    questionPage.addValue(
      'Batteries waste - Landfill',
      200,
      'kg'
    )
    //1.2
    questionPage.answerQuestion(
      `For goods sold, where the transport and distribution services to their final destination are not covered by the undertaking, can an estimate be provided for the transport and distribution activities involved?`,
      'radio',
      'No'
    )
    //1.3
    questionPage.answerQuestion(
      `Did the undertaking sell goods that, when used, result in the direct consumption of fuels, electricity, or refrigeration gases?`,
      'radio',
      'No'
    )
    //1.4
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking sell products that require additional processing by third parties?`,
      'radio',
      'No'
    )
    questionPage.clickNext()
    //****************/
    //5th Segment
    //****************/
    //1
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking lease assets (of which it is the lessor) which have not yet been included in previous questions?`,
      'radio',
      'Yes'
    )
    //1.2
    questionPage.answerQuestion(
      `Can the undertaking provide the total amount of emissions (scope 1 and 2) associated with the asset(s) in the reporting period?`,
      'radio',
      'No',
      0 //questionIndex
    )
    //2
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking have leased assets (of which it is the lessee) which have not yet been included in the previous questions?`,
      'radio',
      'Yes'
    )
    //2.1
    questionPage.answerQuestion(
      `Can the undertaking provide the total amount of emissions (scope 1 and 2) associated with the asset(s) in the reporting period?`,
      'radio',
      'No',
      1 //questionIndex
    )
    //3
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking grant any license or permission to a franchise whose data was not included in the previous questions?`,
      'radio',
      'Yes'
    )
    //3.1
    questionPage.answerQuestion(
      `Can the undertaking provide the total amount of emissions (scope 1 and 2) associated with the franchisee(s) in the reporting period?`,
      'radio',
      'No'
    )
    //4
    questionPage.answerQuestion(
      `During the reporting period, did the undertaking make investments in other companies?`,
      'radio',
      'Yes'
    )
    //4.1
    questionPage.answerQuestion(
      `Can the undertaking provide the total amount of emissions associated with the investment(s) in the reporting period?`,
      'radio',
      'No'
    )
    questionPage.clickSubmit()
    questionPage.refreshAndConfirmSubmission(questionName)
  })
  it.skip('Submit Taxonomy Questionnaire', () => {
    let questionName = 'Taxonomy'
    homePage.gotoCompanies()
    companyPage.gotoCompanyList()
    companyPage.gotoCompanyDetail('Load Test Streich - Champlin')
    companyPage.gotoAdditionalInfo()
    companyPage.openQuestionnaire(questionName)

  })
})