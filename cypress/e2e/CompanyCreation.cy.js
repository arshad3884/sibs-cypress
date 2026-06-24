/// <reference types="cypress" />

import { LoginPage } from "../PageObject/LoginPage";
import { HomePage } from "../PageObject/HomePage";
import { CompanyPage } from "../PageObject/CompanyPage";

const loginPage = new LoginPage();
const homePage = new HomePage()
const companyPage = new CompanyPage()

describe("SIBS Company Creation", () => {
  it("logs in on tenant", () => {
    cy.env(["TENANT_URL", "USERS"]).then(({ TENANT_URL, USERS }) => {
      cy.visit(`${TENANT_URL}/login`);
      loginPage.loginOnTenant(USERS.TENANT_USERNAME, USERS.TENANT_PASSWORD);
      let tinNumber;
      companyPage.getTINnumber().then(number => {
        tinNumber = number
        cy.go('back')
        homePage.gotoCompanies()
        companyPage.clickOnAddCompany()
        companyPage.fillCompanyForm({
          enabledStatus: 'Active',
          companyName: faker.company.name(),
          companyCommercialName: faker.company.name() + 'TC Ltd',
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
        
      })
    })
  })
})