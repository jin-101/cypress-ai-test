const myData = {
  id : 'testpayment',
  pw : 'selcdi2024!',
  arrival:'NRT',
  departureDate : '20250830',
  arrivalDate : '20250904',
  cabin : 'P'
}

describe('Korean Air Test', function() {
  beforeEach(function() {
    // 커스텀 커맨드인 cy.interCeptTranslate()를 호출해서 다국어 가져오기
    cy.interCeptTranslate();

    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/allPromotionCoupon`,{ fixture: 'availPromotionCoupon.json' }).as('allPromotionCoupon')

    // 기프트카드 금액 정보
    cy.intercept(`${Cypress.env('baseUrl')}/api/pp/payment/GiftCardList?**`,{ fixture: 'giftCardList.json' }).as('giftCardList')

    // 결제페이지 plcc 쿠폰
    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/availablePlccCoupon`,{ fixture: 'availablePlccCoupon.json' }).as('availablePlccCoupon')
    
    // 결제페이지 promotion 쿠폰
    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/availPromotionCoupon`,{ fixture: 'availPromotionCoupon.json' }).as('availPromotionCoupon')
    
    // 결제페이지 전자우대할인권
    // cy.intercept(`${Cypress.env('baseUrl')}/api/et/coupon/electronCouponByTraveller?**`,{ fixture: 'electronCouponByTraveller.json' }).as('electronCouponByTraveller')

    // 사이트 접속
    cy.visit('wwwdevt.koreanair.com');
    // 커스텀 커맨드인 cy.handleCookie()를 호출해서 쿠키 배너를 닫아줍니다.
    cy.handleCookie();
    // 커스텀 커맨드인 cy.hangleLogin('kalmanpay', 'selcdi2024!')를 호출해서 로그인합니다.
    cy.handleLogin('testpayment', 'selcdi2024!');
  });

  it('Test', function() {

    //커스텀 커맨드인 cy.handleDestination를 호출해서 도착지를 선택합니다.
    cy.handleDestination(myData.arrival);

    //커스텀 커맨드인 cy.handleDate를 호출해서 날짜를 선택합니다.
    cy.handleDate(myData.departureDate, myData.arrivalDate);

    //커스텀 커맨드인 cy.handleCabinClass를 호출해서 좌석등급을 선택합니다.
    cy.handleCabinClass(myData.cabin);

    //커스텀 커맨드인 cy.handleBookingSearch를 호출해서 검색합니다.
    cy.handleBookingSearch();
  });

});