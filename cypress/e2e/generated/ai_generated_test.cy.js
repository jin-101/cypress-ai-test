describe('Korean Air Login Test', () => {
  beforeEach(() => {
    cy.visit('wwwdevt.koreanair.com');
    cy.handleKoreanAirCookie(); // Assuming you have a custom command for handling the cookie banner
  });

  it('Login Success', () => {
    cy.login('kalmanpay', 'selcdi2024!'); // Assuming you have a custom command for performing login
  });
});