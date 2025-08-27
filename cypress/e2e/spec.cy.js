describe("AI Test Generator", () => {
  it("Generates a Cypress test file from a prompt using a local LLM", () => {
    // 1. 로컬 Fixture UI 로드
    // 이 파일은 cypress/fixtures/prompt_ui.html 에 위치해야 합니다.
    cy.visit('cypress/fixtures/prompt_ui.html');

    // 2. AI에게 명확한 역할과 규칙을 부여하여 코드만 생성하도록 유도합니다.
    // AI가 학습한 일반적인 패턴으로 회귀하는 것을 막기 위해, 훨씬 더 구체적이고 명령적인 프롬프트를 사용합니다.
const strictPrompt = `너는 Cypress 테스트 코드만 작성하는 AI야. 아래의 주의사항을 지키면서 각 단계에 맞는 테스트 시나리오를 다음 단계에 맞게 만들어줘.
(주의사항, 커스텀 커맨드를 사용하라고 하면 반드시 commands.js에 있는 함수를 사용해줘. 검증과 관련된 코드는 만들지마. 1~3단계는 하나의 beforeEach에 만들고, 4~마지막 단계까지는 하나의 it안에 만들어줘.)
1. wwwdevt.koreanair.com 사이트를 방문해. 이때 커스텀 커맨드인 cy.interCeptTranslate()를 호출해서 다국어 가져와.
2. 커스텀 커맨드인 cy.handleCookie를 호출해서 쿠키 배너를 닫아줘.
3. 커스텀 커맨드인 cy.hangleLogin를 호출해서 로그인해줘. id는 kalmanpay, pw는 selcdi2024!로 해줘.
4. 커스텀 커맨드인 cy.handleDestination를 호출해서 도착지를 설정해줘. 도착지는 NRT로 해줘.
5. 커스텀 커맨드인 cy.handleDate를 호출해서 출도착 일자를 설정해줘. 출발일자는 20250830,도착일자는 20250904로 해줘.
6. 커스텀 커맨드인 cy.handleCabinClass를 호출해서 좌석등급을 설정해줘. 등급은 P로 해줘
7. 커스텀 커맨드인 cy.handleBookingSearch를 호출해서 항공권을 검색해줘.
`;

// 더 유연한 test prompt 만들기
// const strictPrompt = `너는 Cypress 테스트 코드만 작성하는 AI야. 아래의 주의사항을 지키면서 각 단계에 맞는 테스트 시나리오를 다음 단계에 맞게 만들어줘.
// (주의사항, 커스텀 함수를 사용하라고 하면 반드시 commands.js에 있는 cy.searchingCommand() 커스텀 커멘트를 실행시켜주는데 이때, keyword는 텍스트에서 키워드가 될 만한 부분을 너가 찾아서 넘겨주고, params는 내가 설정해준 값을 object형태로 넘겨줘. 검증과 관련된 코드는 만들지마. 1~3단계는 하나의 beforeEach에 만들고, 4~마지막 단계까지는 하나의 it안에 만들어줘.)
// 1. wwwdevt.koreanair.com 사이트를 방문해. 이때 커스텀 함수를 사용하여 cy.interCeptTranslate()를 호출해서 다국어 가져와.
// 2. 커스텀 함수를 사용하여 쿠키 배너를 닫아줘.
// 3. 커스텀 함수를 사용하여 로그인해줘. id는 kalmanpay, pw는 selcdi2024!로 해줘.
// 4. 커스텀 함수를 사용하여 호출해서 도착지를 설정해줘. 도착지는 NRT로 해줘.
// 5. 커스텀 함수를 사용하여 출도착 일자를 설정해줘. 출발일자는 20250830,도착일자는 20250904로 해줘.
// 6. 커스텀 함수를 사용하여 좌석등급을 설정해줘. 등급은 P로 해줘
// 7. 커스텀 함수를 사용하여 호출해서 항공권을 검색해줘.
// `;


    // {parseSpecialCharSequences: false} 옵션을 추가하여 프롬프트 안의 '{...}' 구문을 문자 그대로 입력하게 합니다.
    cy.get("#aiPrompt").type(strictPrompt, { delay: 0, parseSpecialCharSequences: false });

    // 3. 'AI 실행' 버튼 클릭
    cy.get("#aiRun").click();

    // 4. 입력된 프롬프트 값을 가져와서 Ollama API를 호출하는 task 실행
    // cy.window()를 통해 상태를 관리하는 대신, Cypress 명령 체인을 사용하여 값을 가져옵니다.
    // 이 방식이 더 안정적이고 Cypress의 의도에 맞습니다.
    cy.get('#aiPrompt').invoke('val').then(prompt => {
      // task가 실행 중임을 사용자에게 시각적으로 표시 (선택 사항)
      cy.get("#aiOutput").invoke("text", "AI가 테스트 코드를 생성 중입니다...");

      cy.task("generateTestCode", prompt).then(code => {
        // 생성된 코드를 파일로 쓰고, 화면에도 표시
        cy.writeFile("cypress/e2e/generated/ai_generated_test.cy.js", code);
        cy.get("#aiOutput").invoke("text", code);
      });
    });
  });
});