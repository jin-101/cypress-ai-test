import { getTodayDate, getCabinClassRegex } from './utils/helpers';
import { selectAirport, selectDate, selectFlight } from './utils/makeUnit';

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
      Cypress.env('isLogin', true); 
      cy.log('로그인 완료');
    } else {
      cy.log(`계정확인 필요 --- id: '${id}', pw: '${password}'`);
    }
});

/**
 * 다국어 api를 intercept하여 모두 env에 저장하는 커스텀 커맨드입니다.
 */
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

/**
 * 대한항공 웹사이트의 퀵부킹 출도착지를 선택하는 커스텀 커맨드입니다.
 * @param {string} departure - 출발지 코드
 * @param {string} arrival - 도착지 코드
 */
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

  cy.log('step1 출도착지 선택 완료');
});

/**
 * 대한항공 웹사이트의 퀵부킹 출도착일자를 선택하는 커스텀 커맨드입니다.
 * @param {string} departureDate - 출발일자 코드
 * @param {string} arrivalDate - 도착일자 코드
 */
Cypress.Commands.add('setQuickDate', (params, options = {}) => {
  const { departureDate, arrivalDate } = params;
  const { timeout = 200000 } = options;
  const now = getTodayDate();
  if(
    (!!departureDate && Number(now) <= Number(departureDate)) && 
    (Number(departureDate) <= Number(arrivalDate) || !arrivalDate)
  ){
    cy.log(`setQuickDate --- departureDate: '${departureDate}', arrivalDate: '${arrivalDate}'`);
    selectDate([departureDate,arrivalDate].filter(arr => !!arr), timeout);
    
    cy.log('step1 날짜 선택 완료');
  } else {
     cy.log(`error --- 날짜를 확인해주세요.: '${departureDate}', arrivalDate: '${arrivalDate}'`);
  }
});

/**
 * 대한항공 웹사이트의 퀵부킹 좌성등급을 선택하는 커스텀 커맨드입니다.
 * @param {string} cabin - 좌석등급
 * @param {string} arrival - 도착지코드 (국내선의 경우 ALL로 선택하기 위해 param check )
 */
Cypress.Commands.add('setQuickClass', (params, options = {}) => {
  const { cabin, arrival } = params;
  const { timeout = 200000 } = options;

  if(!!cabin){
    cy.log(`setQuickClass --- cabin: '${cabin}'`);
    const remakeCabin = (!!arrival && arrival === 'CJU') ? 'ALL' : cabin; // 국내선일 때, ALL로 설정하기 
    //좌석 등급
    cy.get('ke-main-quick-booking-ow-rt',{timeout})
      .find(`kds-class${versionSuffix}`, {timeout:timeout})
      .should('exist')     
      .contains(Cypress.env('translate').W011802)
      .click();

    const seat = cy.get('ke-kds-booking-seat-modal', { timeout })
    seat.should('exist')
        .contains(getCabinClassRegex(remakeCabin))
        .click();

    cy.log('step1 좌석 선택 완료');
  } else {
    cy.log(`error --- 좌석등급을 확인해주세요.: '${cabin}'`);
  }
});

/**
 * 대한항공 웹사이트의 퀵부킹 검색을 실행하는 커스텀 커맨드입니다.
 */
Cypress.Commands.add('handleBookingSearch', (options = {}) => {
  const { timeout = 200000 } = options;
  cy.get('ke-main-quick-booking-ow-rt',{timeout})
    .should('exist')
    .get('[data-click-name="Book Flights_Search"]')
    .find(`kds-button${versionSuffix}`, {includeShadowDom : true, timeout:timeout})
    .shadow()
    .get('[data-id="quickbookingOnSearch"]', { timeout })
    .click({ force: true });

   cy.log('step1 항공권 검색 클릭 완료');
});

/**
 * 대한항공 웹사이트의 항공편을 선택하는 커스텀 커맨드입니다.
 * @param {string} departureFindCabinName - 출발지 항공편 세부 좌석명
 * @param {string} departureFindOrder - 출발지 항공편 세부 좌석명과 일치하는 좌석의 n번째 (매진 제외)
 * @param {string} arrivalFindCabinName - 도착지 항공편 세부 좌석명
 * @param {string} arrivalFindOrder - 도착지 항공편 세부 좌석명과 일치하는 좌석의 n번째 (매진 제외)
 */
Cypress.Commands.add('setSelectFlight', (params, options = {}) => {
  const { timeout = 200000 } = options;
  const { departureFindCabinName, departureFindOrder, arrivalFindCabinName, arrivalFindOrder } = params;
  const isLogin = Cypress.env('isLogin')

  if(!!departureFindCabinName){
    selectFlight(departureFindCabinName, departureFindOrder, (!!arrivalFindCabinName ? 'next' : 'next2'), timeout);
  }
  if(!!arrivalFindCabinName){
    cy.waitForLoadingComplete(5000) // 로딩 화면이 사라질 때까지 대기
    selectFlight(arrivalFindCabinName, arrivalFindOrder, (isLogin ? 'next2' : 'Guest'), timeout);
  }

   cy.log('step2 항공편 선택 완료');
});

/**
 * 대한항공 웹사이트의 탑승객의 정보를 입력하는 커스텀 커맨드입니다. (현재는 수정없이 다음으로 진행하도록 하드코딩 되어 있음! - 추후 로직 수정 필요) 
 */
Cypress.Commands.add('setPassengerInformation', (params, options = {}) => {
  const { timeout = 200000 } = options;
  const { info } = params;

  cy.get('ke-passenger-cont', { timeout })
    .should('be.visible')
    .then(() => {
      // 여기 승객정보 입력하는 부분
      cy.get('ke-accordion-row', { timeout })
        .should('be.visible')
        .then(($el) => {
          cy.log('승객선택!!',$el)
          if(info.arrival === 'CJU') { // 국내선인 경우 국가 선택 (현재 하드코딩으로 KOR을 입력)
            cy.wrap($el)
              .find('#sel-nation-ADT-0', {timeout})
              .should('exist')
              .select('KOR')
          }
          cy.wrap($el)
            .find('[id^="submit-passenger-"]', {timeout})
            .should('exist')
            .click();
        })
    })
  cy.get('ke-passenger-contact-info-pres', { timeout })
    .should('exist')
    .find('#submit-contact').click();
    
    cy.log('step3 탑승객 정보 입력 완료');
});

/**
 * 대한항공 웹사이트의 결제단계에서 '동의하기' 부분을 실행하는 커스텀 커맨드입니다. 
 * @param {Array} agreeIndex - 동의하기 버튼의 인덱스 배열
 */
 Cypress.Commands.add('handleCheckAgree', (params, options = {}) => {
  const { timeout = 200000 } = options;
  const { agreeIndex } = params;

  const handleScrollDown = () => {
    let isFirstEnter = true;
    return new Cypress.Promise((resolve) => {
      const checkAndClickScroll = () => {
        cy.get('ke-dynamic-modal', { timeout })
        .should('exist')
        .then($modal => {
          if (isFirstEnter || $modal.find('#btnScrollDown').length > 0) {
            isFirstEnter = false;
            cy.get('#btnScrollDown', { timeout })
              .should('exist')
              .click()
              .then(() => {
                // 잠시 대기 후 다음 스크롤 확인
                cy.wait(500);
                checkAndClickScroll();
              });
          } else {
            resolve();
          }
        });
      };
      checkAndClickScroll();
    });
  }

  agreeIndex.forEach(idx => {
    cy.get(`ke-payment-gate-main-pres .agree__list #btn-resv-agree-${idx}`, { timeout })
     .should('exist')
     .click();

    handleScrollDown().then(() => {
      // 확인 버튼 클릭
      cy.get('#btnConfirm', { timeout })
        .should('be.visible')
        .click();
    });
  });

  // cy.get(`ke-payment-gate-main-pres .agree__list #btn-resv-agree-${idx}`, { timeout })
  //    .should('exist')
  //    .click();

  //   handleScrollDown().then(() => {
  //     // 확인 버튼 클릭
  //     cy.get('#btnConfirm', { timeout })
  //       .should('be.visible')
  //       .click();
  //   });
  
  // cy.get('ke-payment-gate-main-pres .agree__list #btn-resv-agree-3', { timeout })
  //    .should('exist')
  //    .click();
  
  // handleScrollDown().then(() => {
  //   // 확인 버튼 클릭
  //   cy.get('#btnConfirm', { timeout })
  //     .should('be.visible')
  //     .click();
  // });
 });

/**
 * 대한항공 웹사이트의 결제수단을 선택하는 커스텀 커맨드입니다. (현재는 삼성페이를 선택하도록 하드코딩 되어 있음! - 추후 로직 수정 필요) 
 */
 Cypress.Commands.add('setPaymentSelect',(options = {}) => {
  const { timeout = 200000 } = options;
  cy.get('ke-payment-interface-cont', { timeout })
    .find('.payment-method__item', { timeout })
    .find('input[data-ga4-click-name="Samsung Pay"]', { timeout })
    .should('exist')
    .check({ force: true });
 });

 /**
 * 대한항공 웹사이트의 결제하기 버튼을 실행하는 커스텀 커맨드입니다.
 */
 Cypress.Commands.add('handlePaymentStart',(options = {}) => {
  const { timeout = 200000 } = options;
  cy.get('#btn-payment',{ timeout })
    .should('exist')
    .click();
 })