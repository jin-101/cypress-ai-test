describe('Cypress Test Scenario', () => {
  beforeEach(() => {
    // 1. Visit the website and get the translated text using cy.interCeptTranslate()
    cy.visit('wwwdevt.koreanair.com');
    cy.interCeptTranslate();

    // 2. Close the cookie banner using cy.handleCookieBanner()
    cy.handleCookieBanner();

    // 3. Login using cy.handleLogin() with provided parameters
    cy.handleLogin({ id: 'kalmanpay', password: 'selcdi2024!' });

    // 4. Set the destination using cy.handleDestination()
    cy.handleDestination('NRT');

    // 5. Set the travel dates using cy.setQuickDate()
    cy.setQuickDate({ departureDate: '20250830', arrivalDate: '20250904' });

    // 6. Set the cabin class using cy.setQuickClass()
    cy.setQuickClass('P');

    // 7. Search for booking using cy.handleBookingSearch()
    cy.handleBookingSearch();
  });
});