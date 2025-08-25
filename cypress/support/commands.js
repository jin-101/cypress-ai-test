// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * 대한항공 웹사이트의 복잡한 쿠키 배너를 처리하는 커스텀 커맨드입니다.
 * Shadow DOM과 중첩된 커스텀 엘리먼트 구조를 캡슐화하여 테스트 코드를 단순하게 만듭니다.
 */
Cypress.Commands.add('handleKoreanAirCookie', (options = {}) => {
  const { timeout = 200000 } = options;

  cy.log('대한항공 쿠키 배너 처리 시작');

  cy.get('ke-biscuit-banner', { timeout }).should('exist').within(() => {
    cy.get('kc-global-cookie-banner').shadow().find('button.-confirm').should('be.visible').click({ force: true });
  });

  // 쿠키 배너가 사라졌는지 최종 확인하여 안정성을 높입니다.
//   cy.get('ke-biscuit-banner', { timeout }).should('not.exist');
//   cy.log('대한항공 쿠키 배너 처리 완료');
});

/**
 * 대한항공 웹사이트의 로그인 과정을 처리하는 커스텀 커맨드입니다.
 * 아이디, 비밀번호 필드와 로그인 버튼의 실제 선택자(selector)를 찾아 수정해야 합니다.
 * @param {string} username - 로그인 아이디
 * @param {string} password - 로그인 비밀번호
 */
Cypress.Commands.add('login', (username, password, options = {}) => {
    const { timeout = 200000 } = options;
    cy.log(`'${username}' 계정으로 로그인 시도`);

  // 중요: 아래 선택자들은 실제 대한항공 웹사이트의 로그인 필드에 맞게 수정해야 합니다.
    cy.get('#floating_top', {includeShadowDom : true}) //includeShadowDom: shadow dom chaining
          .shadow()
          .find('li.-login > kc-button', {includeShadowDom : true})
          .shadow()
          .find('button.ux-button').should('exist').click({ force:true }); // 강제 클릭 (shadow Dom)

    // cy.wait()는 불안정한 테스트의 원인이 됩니다.
    // 대신 아이디 입력 필드가 나타날 때까지 기다리는 것이 더 안정적입니다.
    // cy.wait(5000);
    cy.get('[id^="textinput-"]', { timeout }).should('exist').type(username); // 아이디 입력 필드 선택자
    cy.get('[id^="passwordinput-"]', { timeout }).should('exist').type(password); // 비밀번호 입력 필드 선택자
    cy.get('.login__submit-act', { timeout }).contains(/로그인|Log in/i).click(); // 로그인 버튼 선택자
});