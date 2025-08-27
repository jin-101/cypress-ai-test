import { dateFixNumber, getCabinClassRegex } from './utils/helpers';

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
Cypress.Commands.add('handleCookie', (options = {}) => {
  const { timeout = 200000 } = options;

  cy.log('대한항공 쿠키 배너 처리 시작');

  cy.get('ke-biscuit-banner', { timeout }).should('exist').within(() => {
    cy.get('kc-global-cookie-banner').shadow({timeout:timeout}).find('button.-confirm', { timeout }).should('be.visible').click({ force: true });
  });

  // 쿠키 배너가 사라졌는지 최종 확인하여 안정성을 높입니다.
//   cy.get('ke-biscuit-banner', { timeout }).should('not.exist');
//   cy.log('대한항공 쿠키 배너 처리 완료');
});

/**
 * 대한항공 웹사이트의 로그인 과정을 처리하는 커스텀 커맨드입니다.
 * 아이디, 비밀번호 필드와 로그인 버튼의 실제 선택자(selector)를 찾아 수정해야 합니다.
 * @param {string} id - 로그인 아이디
 * @param {string} password - 로그인 비밀번호
 */
Cypress.Commands.add('handleLogin', (id, password, options = {}) => {
    const { timeout = 200000 } = options;
    cy.log(`'${id}' 계정으로 로그인 시도`);

    // 중요: 아래 선택자들은 실제 대한항공 웹사이트의 로그인 필드에 맞게 수정해야 합니다.
    cy.get('#floating_top', {includeShadowDom : true}) //includeShadowDom: shadow dom chaining
          .shadow({timeout:timeout})
          .find('li.-login > kc-button', {includeShadowDom : true, timeout:timeout})
          .shadow({timeout:timeout})
          .find('button.ux-button', { timeout }).should('exist').click({ force:true }); // 강제 클릭 (shadow Dom)

    cy.get('[id^="textinput-"]', { timeout }).should('exist').type(id); // 아이디 입력 필드 선택자
    cy.get('[id^="passwordinput-"]', { timeout }).should('exist').type(password); // 비밀번호 입력 필드 선택자
    
    // id, pw 입력 더 간단하게 만들기 위해 test
    // cy.findByLabelText(/아이디|User ID/i, { timeout }).should('exist').type(id);
    // cy.findByLabelText(/비밀번호|password/i, { timeout }).should('be.visible').type(password);
    cy.get('.login__submit-act', { timeout }).contains(/로그인|Log in/i).click(); // 로그인 버튼 선택자
});


Cypress.Commands.add('interCeptTranslate', () => {
  cy.intercept(`${Cypress.env('baseUrl')}${Cypress.env('translateApiCommonPath')}/**`, (req)=> {
      req.continue(res => {
        if(res.body && res.statusCode === 200){
          const copyTranslate = JSON.parse(JSON.stringify( Cypress.env('translate')));
          Cypress.env('translate',{...copyTranslate, ...res.body}) 
        }
      })
    }).as(`translation`)
});

Cypress.Commands.add('handleDestination', (arrival, options = {}) => {
  //도착지 선택
  const { timeout = 200000 } = options;
  
  cy.get('[id^="destinationBtn"]', {timeout})
      .should('exist')
      .contains('span', Cypress.env('translate').W000080)
      .click(); //도착지
  cy.get('ke-airport-chooser input',{timeout})
      .should('exist')
      .type(`${arrival}{enter}`);
});

Cypress.Commands.add('handleDate', (departureDate, arrivalDate , options = {}) => {
  const { timeout = 200000 } = options;
  cy.get('button.quickbookings__datepicker',{timeout})
      .should('exist')
      .contains('span', Cypress.env('translate').W000055)
      .click();
  //출발일 선택
  // cy.get(':nth-child(2) > .selection > .label.ng-tns-c44-2',{timeout:loadingTerm}).should('exist').click(); // 왕복 편도 설정
  cy.get(`#month${departureDate.substring(0,6)} > [role="application"] > table.datepicker__table > tbody`,{timeout})
      .should('exist')
      .contains(dateFixNumber(departureDate.substring(6)))
      .click();
  
  //도착일 선택
  cy.get(`#month${arrivalDate.substring(0,6)} > [role="application"] > table.datepicker__table > tbody`,{timeout})
      .should('exist')
      .contains(dateFixNumber(arrivalDate.substring(6)))
      .click();
});


Cypress.Commands.add('handleCabinClass', (cabin, options = {}) => {
  const { timeout = 200000 } = options;
  //좌석 등급
  // cy.contains('span', translate.W011802,{timeout:maxTimeout}).click({force:true}); // 다국어로 찾아 클릭
  cy.get('.quickbookings__seatclass',{timeout})
      .should('exist')
      .contains('span', Cypress.env('translate').W011802)
      .click();
  cy.get('.seatclass.-main-quick',{timeout})
      .should('exist')
      .contains(getCabinClassRegex(cabin))
      .click();
});

Cypress.Commands.add('handleBookingSearch', (options = {}) => {
  const { timeout = 200000 } = options;
 cy.get('#quickbookingOnSearch',{timeout})
    .should('exist')
    .contains('button', Cypress.env('translate').W012240)
    .click();
});

// Cypress.Commands.add('searchingCommand', (keyword,params) => {
//   const searchingCommand = (params) => {
//     switch(keyword){
//       case '쿠키': 
//         return cy.handleCookie();
//         break;
//       case '로그인':
//         return cy.hangleLogin(...params);
//         break;
//       case '도착지':
//         return cy.handleDestination(...params);
//         break;
//       case '출도착 일자':
//         return cy.handleDate(...params);
//         break;
//       case '좌석등급':
//         return cy.handleCabinClass(...params);
//         break;
//       case '항공권 검색':
//         return  cy.handleBookingSearch();
//         break;
//     }
//   }
// })
