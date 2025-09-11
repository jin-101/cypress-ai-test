import { USER_DATA, FLIGHT_INFO } from '../support/utils/constants';

describe('Korean Air Test', function() {
  beforeEach(function() {
    // 커스텀 커맨드인 cy.interCeptTranslate()를 호출해서 다국어 가져오기
    cy.interCeptTranslate();
    // 사이트 접속
    cy.visit(Cypress.env('baseUrl'));
    // 커스텀 커맨드인 cy.handleCookieBanner()를 호출해서 쿠키 배너를 닫아줍니다.
    cy.handleCookieBanner();
    // 커스텀 커맨드인 cy.hangleLogin('kalmanpay', 'selcdi2024!')를 호출해서 로그인합니다.
    cy.handleLogin(USER_DATA.KALMAN);
  });

  it('Test', function() {

    //커스텀 커맨드인 cy.setQuickDestination를 호출해서 도착지를 선택합니다.
    cy.setQuickDestination({arrival:FLIGHT_INFO.arrival});

    //커스텀 커맨드인 cy.setQuickDate를 호출해서 날짜를 선택합니다.
    cy.setQuickDate({departureDate:FLIGHT_INFO.departureDate, arrivalDate: FLIGHT_INFO.arrivalDate});

    //커스텀 커맨드인 cy.setQuickClass를 호출해서 좌석등급을 선택합니다.
    cy.setQuickClass({cabin: FLIGHT_INFO.cabin});

    //커스텀 커맨드인 cy.handleBookingSearch를 호출해서 검색합니다.
    cy.handleBookingSearch();
  });

});