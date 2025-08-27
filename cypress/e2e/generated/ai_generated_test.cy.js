describe('Korean Air Test', () => {
  beforeEach(() => {
    // 1. Visit the website and get translated text using cy.interCeptTranslate()
    cy.visit('wwwdevt.koreanair.com');
    cy.interCeptTranslate();

    // 2. Close cookie banner using cy.handleCookie()
    cy.handleCookie();

    // 3. Login using cy.handleLogin()
    cy.handleLogin('kalmanpay', 'selcdi2024!');
  });

  it('Sets destination, date, cabin class and searches for booking', () => {
    // 4. Set destination using cy.handleDestination()
    cy.handleDestination('NRT');

    // 5. Set date using cy.handleDate()
    cy.handleDate('20250830', '20250904');

    // 6. Set cabin class using cy.handleCabinClass()
    cy.handleCabinClass('P');

    // 7. Search for booking using cy.handleBookingSearch()
    cy.handleBookingSearch();
  });
});