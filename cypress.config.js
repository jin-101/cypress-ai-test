const { defineConfig } = require("cypress");
module.exports = defineConfig({
  projectId: "now2ta",
  env: {
    language: "ko",
    baseUrl: "https://wwwdevt.koreanair.com",
    translateApiCommonPath: "/api/et/uiCommon/c/i/languageInfo",
    translate: {},
    isLogin: false,
    wdsCapsuleVersion: 1,
  },
  e2e: {
    // viewport는 여기서 설정
    viewportWidth: 1280,
    viewportHeight: 1000,
    includeShadowDom: true,
    // 페이지 로드 타임아웃을 60초에서 120초(120000ms)로 늘립니다.
    // 개발 서버 응답이 느리거나 네트워크 상태가 좋지 않을 때 타임아웃 오류를 방지합니다.
    // https://docs.cypress.io/guides/references/configuration#Timeouts
    pageLoadTimeout: 120000,
    setupNodeEvents(on, config) {
      on("task", {
        // Ollama를 호출하여 프롬프트에 맞는 Cypress 테스트 코드를 생성하는 task
        async generateTestCode(prompt) {
          try {
            // Ollama API는 기본적으로 스트리밍 응답을 반환합니다.
            // stream: false 옵션으로 간단한 JSON 응답을 받도록 변경하면 코드가 간결해집니다.
            const res = await fetch("http://localhost:11434/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "mistral", // 사용하는 모델명
                prompt,
                stream: false,
                // [수정] AI의 응답을 일관성 있게 만들기 위해 temperature를 0으로 설정합니다.
                // 0으로 설정하면 AI는 무작위성을 배제하고 항상 가장 확률 높은 결과물을 생성합니다.
                options: {
                  temperature: 0,
                },
              }),
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error("Ollama API error:", errorText);
              return `// Ollama API returned an error: ${res.status} ${res.statusText}\n${errorText}`;
            }

            const data = await res.json();

            // LLM이 응답에 markdown 코드 블록(```)을 포함하는 경우가 많으므로, 순수 코드만 추출합니다.
            const codeBlockRegex = /```(?:javascript|js)?\n([\s\S]*?)\n```/;
            const match = data.response.match(codeBlockRegex);

            return (match ? match[1] : data.response).trim();
          } catch (e) {
            console.error("Failed to connect to Ollama:", e);
            return `// Failed to connect to Ollama at http://localhost:11434\n// Error: ${e.message}`;
          }
        },
      });
    },
  },
  video: true, // video: true가 포함되어 있는지 확인
});
