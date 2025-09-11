import { dateFixNumber } from './helpers';
const versionSuffix = `_${Cypress.env('wdsCapsuleVersion')}` || '';

/**
   * 공항(출발지/도착지)을 선택하는 내부 헬퍼 함수입니다.
   * @param {'departure' | 'arrival'} type - 선택할 종류
   * @param {string} airportCode - 선택할 공항 코드 (예: 'LAX')
   */
export function selectAirport (type, airportCode, timeout = 200000) {
    const isDeparture = type === 'departure';
    // 출발지/도착지 텍스트와 번역 키를 결정합니다.
    const buttonText = isDeparture
      ? (Cypress.env('translate').W000079 || '출발지')
      : (Cypress.env('translate').W000080 || '도착지');
    
    cy.log(`${isDeparture ? '출발지' : '도착지'} 선택: ${airportCode}`);

    // 1. '출발지' 또는 '도착지' 버튼을 클릭하여 공항 선택 레이어를 엽니다.
    cy.get('ke-main-quick-booking-ow-rt', { timeout })
      .find(`kds-fromto${versionSuffix}`, {includeShadowDom : true, timeout:timeout})
      .shadow()
      .get(`.-order${isDeparture ? 1 : 3}`, { timeout })
      .contains('span', buttonText)
      .click({ force: true });

    // 2. 검색 input에 공항 코드를 입력합니다.
    const airporChooser = cy.get('ke-kds-airport-chooser', { timeout });
    airporChooser
      .find(`kds-autocomplete${versionSuffix}`, {includeShadowDom : true, timeout:timeout})
      .shadow()
      .find('input', { timeout })
      .should('be.visible')
      .type(airportCode)
      .should('have.value', airportCode)
      .type('{enter}');
  };

  /**
   * 날짜를 선택하는 내부 헬퍼 함수입니다.
   * @param {'Array'} dateArray - 일자
   */
  export function selectDate (dateArray, timeout = 200000) {
    // 1. '출발일' 버튼을 클릭하여 날짜 선택 레이어를 엽니다.
    cy.get('ke-main-quick-booking-ow-rt',{timeout})
      .find(`kds-dateinput${versionSuffix}`, {includeShadowDom : true, timeout:timeout})
      .shadow()
      .get('button', { timeout })
      .contains('span', Cypress.env('translate').W000055)     
      .click({ force: true });


    const calendar = cy.get('ke-kds-calendar', { timeout });

    // 1.1 출발일만 있는경우 '편도'로 변경
    if(dateArray.length === 1) {
        calendar.find(`kds-chip-item${versionSuffix}`, {timeout:timeout})
        .should('exist')     
        .contains(Cypress.env('translate').W001145)
        .click(); // shadowDom이 아닐때는 force click 필요 없음
    }

    // 2. 날짜를 선택합니다.
    dateArray.forEach(date => {
    calendar.get(`#month${date.substring(0,6)} tbody`,{timeout})
            .should('exist')
            .contains('span', dateFixNumber(date.substring(6)))
            .click();
    });
  }