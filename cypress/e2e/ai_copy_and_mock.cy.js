import { USER_DATA, FLIGHT_INFO } from '../support/utils/constants';

describe('Korean Air Test', function() {
  beforeEach(function() {
    // 커스텀 커맨드인 cy.interCeptTranslate()를 호출해서 다국어 가져오기
    // --- 페이지 로드 속도 저하를 유발할 수 있는 외부 스크립트를 차단합니다. ---
    // 예: Google Analytics, Google Tag Manager 등 분석/광고 스크립트
    cy.intercept('**/*google-analytics.com/**', { statusCode: 200 }).as('googleAnalytics');
    cy.intercept('**/*googletagmanager.com/**', { statusCode: 200 }).as('googleTagManager');
    
   
    // --------------------------------------------------------------------

    cy.interCeptTranslate();

    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/allPromotionCoupon`,{ fixture: 'availPromotionCoupon.json' }).as('allPromotionCoupon')

    // 기프트카드 금액 정보
    // cy.intercept(`${Cypress.env('baseUrl')}/api/pp/payment/GiftCardList?**`,{ fixture: 'giftCardList.json' }).as('giftCardList')

    // 결제페이지 plcc 쿠폰
    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/availablePlccCoupon`,{ fixture: 'availablePlccCoupon.json' }).as('availablePlccCoupon')
    
    // 결제페이지 promotion 쿠폰
    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/availPromotionCoupon`,{ fixture: 'availPromotionCoupon.json' }).as('availPromotionCoupon')
    
    // 결제페이지 전자우대할인권
    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/electronCouponByTraveller?**`,{ fixture: 'electronCouponByTraveller.json' }).as('electronCouponByTraveller')

    // 사이트 접속
    cy.visit(Cypress.env('baseUrl'));
    // 커스텀 커맨드인 cy.handleCookieBanner()를 호출해서 쿠키 배너를 닫아줍니다.
    cy.handleCookieBanner();
    // 커스텀 커맨드인 cy.hangleLogin('kalmanpay', 'selcdi2024!')를 호출해서 로그인합니다.
    cy.handleLogin(USER_DATA.PAYMENT);
  });

  it('Test', function() {
    cy.wait('@handleLogin')
    cy.waitForLoadingComplete(10000);  // 로딩 화면이 사라질 때까지 대기

    //커스텀 커맨드인 cy.setQuickDestination를 호출해서 도착지를 선택합니다.
    cy.setQuickDestination({departure:FLIGHT_INFO.departure, arrival:FLIGHT_INFO.arrival});

    //커스텀 커맨드인 cy.setQuickDate 호출해서 날짜를 선택합니다.
    cy.setQuickDate({departureDate:FLIGHT_INFO.departureDate, arrivalDate: FLIGHT_INFO.arrivalDate});

    // //커스텀 커맨드인 cy.setQuickClass를 호출해서 좌석등급을 선택합니다.
    cy.setQuickClass({cabin: FLIGHT_INFO.cabin});

    // //커스텀 커맨드인 cy.handleBookingSearch를 호출해서 검색합니다.
    cy.handleBookingSearch();
  });

});