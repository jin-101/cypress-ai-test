import { dateFixNumber } from "./helpers";
const versionSuffix = `_${Cypress.env("wdsCapsuleVersion")}` || "";

/**
 * 공항(출발지/도착지)을 선택하는 내부 헬퍼 함수입니다.
 * @param {'departure' | 'arrival'} type - 선택할 종류
 * @param {string} airportCode - 선택할 공항 코드 (예: 'LAX')
 */
export function selectAirport(type, airportCode, timeout = 200000) {
  const isDeparture = type === "departure";
  // 출발지/도착지 텍스트와 번역 키를 결정합니다.
  const buttonText = isDeparture
    ? Cypress.env("translate").W000079 || "출발지"
    : Cypress.env("translate").W000080 || "도착지";

  cy.log(`${isDeparture ? "출발지" : "도착지"} 선택: ${airportCode}`);

  // 1. '출발지' 또는 '도착지' 버튼을 클릭하여 공항 선택 레이어를 엽니다.
  cy.get("ke-main-quick-booking-ow-rt", { timeout })
    .find(`kds-fromto${versionSuffix}`, {
      includeShadowDom: true,
      timeout: timeout,
    })
    .shadow()
    .get(`.-order${isDeparture ? 1 : 3}`, { timeout })
    .contains("span", buttonText)
    .click({ force: true });

  // 2. 검색 input에 공항 코드를 입력합니다.
  const airporChooser = cy.get("ke-kds-airport-chooser", { timeout });
  airporChooser
    .find(`kds-autocomplete${versionSuffix}`, {
      includeShadowDom: true,
      timeout: timeout,
    })
    .shadow()
    .find("input", { timeout })
    .wait(500)
    .should("be.visible")
    .type(airportCode)
    .should("have.value", airportCode)
    .type("{enter}");
}

/**
 * 날짜를 선택하는 내부 헬퍼 함수입니다.
 * @param {'Array'} dateArray - 일자
 */
export function selectDate(dateArray, timeout = 200000) {
  // 1. '출발일' 버튼을 클릭하여 날짜 선택 레이어를 엽니다.
  cy.get("ke-main-quick-booking-ow-rt", { timeout })
    .find(`kds-dateinput${versionSuffix}`, {
      includeShadowDom: true,
      timeout: timeout,
    })
    .shadow()
    .get("button", { timeout })
    .contains("span", Cypress.env("translate").W000055)
    .click({ force: true });

  const calendar = cy.get("ke-kds-calendar", { timeout });

  // 1.1 출발일만 있는경우 '편도'로 변경
  if (dateArray.length === 1) {
    calendar
      .find(`kds-chip-item${versionSuffix}`, { timeout: timeout })
      .should("exist")
      .contains(Cypress.env("translate").W001145)
      .click(); // shadowDom이 아닐때는 force click 필요 없음
  }

  // 2. 날짜를 선택합니다.
  dateArray.forEach((date) => {
    calendar
      .get(`#month${date.substring(0, 6)} tbody`, { timeout })
      .should("exist")
      .contains("span", dateFixNumber(date.substring(6)))
      .click();
  });
}

/**
 * 항공편을 선택하는 내부 헬퍼 함수입니다.
 * @param {'String'} findCabinName - 세부 클래스 선택
 * @param {'Number'} n - 세부 클래스 중 n번째 항공편 선택 (매진 제외)
 * @param {'String'} buttonType - 세부 클래스 선택 후 다음으로 진행하기 위한 버튼 종류 (next | next2 | guest | login)
 *
 */
export function selectFlight(findCabinName, n, buttonType, timeout = 200000) {
  cy.log(
    "selectFlight params : (findCabinName: " +
      findCabinName +
      " n: " +
      n +
      " buttonType: " +
      buttonType
  );
  const disabledClass = "span.flight-n__disabled";
  const cabinNameClass = "span.flight-n__cabin-name";
  let btnText;

  switch (buttonType) {
    case "next":
      btnText = Cypress.env("translate").W000907;
      break;
    case "next2": // step3 진입 바로 전 '다음' 버튼
      btnText = Cypress.env("translate").W000365;
      break;
    case "Guest":
      btnText = Cypress.env("translate").W000169;
      break;
    case "login":
      btnText = Cypress.env("translate").W000170;
      break;
    default:
      btnText = "";
  }

  cy.get("ke-revenue-flight-item", { timeout })
    .should("exist")
    .then(($items) => {
      return cy.wrap(
        $items.filter((_, el) => {
          const $el = Cypress.$(el);
          try {
            // disabled 클래스를 가진 span이 없는지 확인
            const isNotDisabled = $el.find(disabledClass).length === 0;
            // cabin-name span의 텍스트가 일치하는지 확인 flight-n__cabin-name
            const cabinNameMatch =
              $el.find(cabinNameClass).text().trim() === findCabinName;
            return isNotDisabled && cabinNameMatch;
          } catch (error) {
            cy.log("항목 필터링 중 오류 발생:", error);
            return false;
          }
        })
      );
    })
    .should(($filteredItems) => {
      // 결과가 있는지 확인
      expect($filteredItems.length).to.be.at.least(
        1,
        "조건에 맞는 항목이 최소 1개 이상 있어야 합니다"
      );
    })
    .then(($matchedItems) => {
      // 찾은 항목들에 대한 추가 작업
      cy.wrap($matchedItems)
        .eq(n) // n 번째 매칭된 항목 선택
        .should("be.visible")
        .and("not.have.descendants", disabledClass)
        .find(cabinNameClass)
        .contains(findCabinName)
        .click();
    });

  if (!!btnText) {
    cy.get("ke-revenue-payment-widget", { timeout })
      .should("exist")
      .find("button.payment-widget__confirm")
      .contains(btnText)
      .click();
  } else {
    cy.log("버튼에 존재하는 다국어 코드가 매칭이 안됩니다.");
  }
}
