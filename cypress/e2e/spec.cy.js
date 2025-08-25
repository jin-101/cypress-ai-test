describe("AI Test Generator", () => {
  it("Generates a Cypress test file from a prompt using a local LLM", () => {
    // 1. 로컬 Fixture UI 로드
    // 이 파일은 cypress/fixtures/prompt_ui.html 에 위치해야 합니다.
    cy.visit('cypress/fixtures/prompt_ui.html');

    // 2. AI에게 명확한 역할과 규칙을 부여하여 코드만 생성하도록 유도합니다.
    const strictPrompt = `너는 Cypress 테스트 코드만 작성하는 AI야. 다른 설명이나 마크다운 형식 없이, 요청에 맞는 자바스크립트 코드만 생성해줘.

요청: 대한항공(wwwdevt.koreanair.com) 사이트의 로그인 테스트 시나리오를 만들어줘.
1. cy.visit()로 사이트를 방문해.
2. 커스텀 커맨드인 cy.handleKoreanAirCookie()를 호출해서 쿠키 배너를 닫아줘.
3. 커스텀 커맨드인 cy.login('kalmanpay', 'selcdi2024!')를 호출해서 로그인해줘.
`;
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