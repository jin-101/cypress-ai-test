describe('Korean Air Test', function() {
  beforeEach(function() {
    // 커스텀 커맨드인 cy.interCeptTranslate()를 호출해서 다국어 가져오기
    cy.interCeptTranslate();
  });
});


  it('Test', function() {
    // cypress.config.js에 설정된 baseUrl로 사이트에 접속합니다.
    // onBeforeLoad 콜백을 사용하여 브라우저의 언어 설정을 env 값으로 동적 제어합니다.
    // cy.visit(Cypress.env('baseUrl'), {
    //     onBeforeLoad(win) {
    //         Object.defineProperty(win.navigator, 'language', { value: Cypress.env('language') });
    //     },
    // });
     cy.visit(Cypress.env('baseUrl'));
    // 커스텀 커맨드인 cy.handleCookieBanner()를 호출해서 쿠키 배너를 닫아줍니다.
    cy.handleCookieBanner();
  });