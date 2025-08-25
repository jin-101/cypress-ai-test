// 이 파일은 AI 생성 없이 직접 작성한 예제 테스트입니다.
// 대한항공 웹사이트의 쿠키 동의 버튼을 클릭하는 방법을 보여줍니다.

describe('대한항공 쿠키 동의 (직접 작성)', () => {
  it('웹사이트를 방문하고 쿠키 동의 버튼을 클릭합니다', () => {
    // 1. 대한항공 웹사이트 방문
    cy.visit('https://www.koreanair.com');

    // 2. 쿠키 동의 배너의 '확인' 버튼 클릭
    // 이 버튼은 Shadow DOM 내부에 있으므로,
    // { includeShadowDom: true } 옵션을 사용하여 DOM을 탐색해야 합니다.
    // cy.contains()는 텍스트로 요소를 찾는 가장 간단한 방법 중 하나입니다.
    cy.contains('확인', { includeShadowDom: true }).click();

    // 3. (검증 단계) 쿠키 배너가 사라졌는지 확인하여 테스트의 신뢰도를 높입니다.
    // '#cookie-notice' 요소가 화면에 보이지 않아야 테스트가 성공합니다.
    cy.get('#cookie-notice', { includeShadowDom: true }).should('not.be.visible');
  });
});