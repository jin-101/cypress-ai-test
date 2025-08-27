import { USER_DATA, FLIGHT_INFO } from '../support/utils/constants';

describe('Korean Air Test', function() {
  beforeEach(function() {
    // 커스텀 커맨드인 cy.interCeptTranslate()를 호출해서 다국어 가져오기
    cy.interCeptTranslate();
    // 사이트 접속
    cy.visit('wwwdevt.koreanair.com');
    // 커스텀 커맨드인 cy.handleCookie()를 호출해서 쿠키 배너를 닫아줍니다.
    cy.handleCookie();
    // 커스텀 커맨드인 cy.hangleLogin('kalmanpay', 'selcdi2024!')를 호출해서 로그인합니다.
    cy.handleLogin(USER_DATA.PAYMENT.id, USER_DATA.PAYMENT.pw);
  });

  it('Test', function() {

    //커스텀 커맨드인 cy.handleDestination를 호출해서 도착지를 선택합니다.
    cy.handleDestination(FLIGHT_INFO.NRT.arrival);

    //커스텀 커맨드인 cy.handleDate를 호출해서 날짜를 선택합니다.
    cy.handleDate(FLIGHT_INFO.departureDate, FLIGHT_INFO.arrivalDate);

    //커스텀 커맨드인 cy.handleCabinClass를 호출해서 좌석등급을 선택합니다.
    cy.handleCabinClass(FLIGHT_INFO.cabin);

    //커스텀 커맨드인 cy.handleBookingSearch를 호출해서 검색합니다.
    cy.handleBookingSearch();
  });

});