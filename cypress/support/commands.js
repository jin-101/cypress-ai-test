import { getTodayDate, getCabinClassRegex } from './utils/helpers';
import { selectAirport, selectDate } from './utils/makeUnit';

const versionSuffix = `_${Cypress.env('wdsCapsuleVersion')}` || '';
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
 * 로딩 시간 대기하는 커스텀 커맨드입니다.
 * 로딩이 사라지고 주어진 시간만큼 대기합니다.
 */
Cypress.Commands.add('waitForLoadingComplete', (time) => {
  cy.get('ke-loading-splash > .loading')
    .should('have.css', 'display', 'none')
    .then(() => {
      // 추가로 DOM이 안정화될 시간을 줌
      cy.wait(time);
    });
});

/**
 * 대한항공 웹사이트의 복잡한 쿠키 배너를 처리하는 커스텀 커맨드입니다.
 * Shadow DOM과 중첩된 커스텀 엘리먼트 구조를 캡슐화하여 테스트 코드를 단순하게 만듭니다.
 */
Cypress.Commands.add('handleCookieBanner', (options = {}) => {
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
Cypress.Commands.add('handleLogin', (params, options = {}) => {
    const { id, password } = params;
    const { timeout = 200000 } = options;

    if(id && password) {
      cy.log(`'${id}' 계정으로 로그인 시도`);

      // 로그인 과정에서 wait을 위해 사용 ---  cy.wait('@handleLogin')
      cy.intercept(`${Cypress.env('baseUrl')}/api/li/auth/isUserLoggedIn`).as('handleLogin');
      
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
      
    } else {
      cy.log(`계정확인 필요 --- id: '${id}', pw: '${password}'`);
    }
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


Cypress.Commands.add('setQuickDestination', (params, options = {}) => {
  const { departure, arrival } = params;
  const { timeout = 200000 } = options;
  cy.log(`setQuickDestination --- departure: '${departure}', arrival: '${arrival}`);

  if (departure) {
    selectAirport('departure', departure, timeout);
  }
  if (arrival) {
    selectAirport('arrival', arrival, timeout);
  }
});

Cypress.Commands.add('handleDate', (params, options = {}) => {
  const { departureDate, arrivalDate } = params;
  const { timeout = 200000 } = options;
  const now = getTodayDate();
  if(
    (!!departureDate && Number(now) <= Number(departureDate)) && 
    (Number(departureDate) <= Number(arrivalDate) || !arrivalDate)
  ){
    cy.log(`handleDate --- departureDate: '${departureDate}', arrivalDate: '${arrivalDate}'`);
    selectDate([departureDate,arrivalDate].filter(arr => !!arr), timeout);
  } else {
     cy.log(`error --- 날짜를 확인해주세요.: '${departureDate}', arrivalDate: '${arrivalDate}'`);
  }
});


Cypress.Commands.add('handleCabinClass', (params, options = {}) => {
  const { cabin } = params;
  const { timeout = 200000 } = options;

  if(cabin){
    cy.log(`handleCabinClass --- cabin: '${cabin}'`);
    //좌석 등급
    cy.get('ke-main-quick-booking-ow-rt',{timeout})
      .find(`kds-class${versionSuffix}`, {timeout:timeout})
      .should('exist')     
      .contains(Cypress.env('translate').W011802)
      .click();

    const seat = cy.get('ke-kds-booking-seat-modal', { timeout })
    seat.should('exist')
        .contains(getCabinClassRegex(cabin))
        .click();
  } else {
    cy.error(`error --- 좌석등급을 확인해주세요.: '${cabin}'`);
  }
});

Cypress.Commands.add('handleBookingSearch', (options = {}) => {
  const { timeout = 200000 } = options;
  cy.get('ke-main-quick-booking-ow-rt',{timeout})
    .should('exist')
    .get('[data-click-name="Book Flights_Search"]')
    .find(`kds-button${versionSuffix}`, {includeShadowDom : true, timeout:timeout})
    .shadow()
    .get('[data-id="quickbookingOnSearch"]', { timeout })
    .click({ force: true });
});

