describe('Korean Air Test', function() {
  beforeEach(function() {
    cy.visit('wwwdevt.koreanair.com');
    // 커스텀 커맨드인 cy.handleCookie()를 호출해서 쿠키 배너를 닫아줍니다.
    cy.handleCookie();
  });

  it('Login Test', function() {
    // 커스텀 커맨드인 cy.hangleLogin('kalmanpay', 'selcdi2024!')를 호출해서 로그인합니다.
    cy.handleLogin('kalmanpay', 'selcdi2024!');
  });
});