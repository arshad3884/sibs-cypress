/// <reference types="cypress" />

import { LoginPage } from "../PageObject/LoginPage";
import { HomePage } from "../PageObject/HomePage";
import { CompanyPage } from "../PageObject/CompanyPage";

const loginPage = new LoginPage();
const homePage = new HomePage()
const companyPage = new CompanyPage()

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

  it.only('Submit ESG - SIBS v2025 Questionnaire', () => {
    homePage.gotoCompanies()
    companyPage.gotoCompanyList()
    //companyPage.gotoCompanyDetail(companyName)
    companyPage.gotoCompanyDetail('Zboncak - Herman')
    companyPage.gotoAdditionalInfo()
    companyPage.openQuestionnaire('Questionnaire ESG - SIBS v2025')
    companyPage.answerQuestion(
      `State the most relevant countries where the organisation's products and/or services are offered`,
      'countries',
      ['Portugal']
    )
    companyPage.answerQuestion(
      `State the countries of the most relevant suppliers`,
      'countries',
      ['Portugal']
    )
    companyPage.answerQuestion(
      `State the transition risks to which the organisation is subject`,
      'checkbox',
      ['Political and Legal Domain', 'Technology', 'Market', 'Reputation']
    )
    companyPage.answerQuestion(
      'Are there any physical risks to which the organisation is subject in any of the geographical areas in which it operates?',
      'radio',
      'Yes'
    )
    companyPage.answerQuestion(
      "Within the respective time horizons, quantify the estimated planned investments required to respond to impacts and risks, as well as the expected impact value",
      'currency/unit',
      { value: 25000, unit: 'unit' }
    )
    companyPage.answerQuestion(
      'Provide a brief description of the investments planned to respond to the impacts and risks, as well as the value of the expected impacts.',
      'text',
      'The company plans to invest €2M in energy efficiency initiatives and renewable energy projects.'
    )
    companyPage.answerQuestion(
      'Does the company have any certifications relevant to ESG?',
      'radio',
      'No'
    )
    companyPage.answerQuestion(
      `Do the organisation's financial statements include disclosure of non-financial information?`,
      'radio',
      'No'
    )
    companyPage.answerQuestion(
      'Please supplement the information provided with additional information that is relevant to the ESG scope and that has not been previously stated.',
      'text',
      'Additional ESG information has been disclosed in the sustainability report and annual management report.'
    )

  })
})