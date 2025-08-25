const express = require('express');
const path = require('path');
const cypress = require('cypress');
const fs = require('fs/promises');

const app = express();
const port = 3000; // GUI 서버를 위한 포트

app.use(express.json());
// 현재 파일(server.js)의 위치를 기준으로 'public' 폴더의 절대 경로를 사용하도록 수정합니다.
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더의 정적 파일(html, css)을 제공

// 모든 요청을 로깅하는 미들웨어 (디버깅용)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// Ollama API를 호출하여 테스트 코드를 생성하는 함수
async function generateTestCode(prompt) {
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistral", prompt, stream: false }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Ollama API error:", errorText);
      return `// Ollama API Error: ${res.status}\n${errorText}`;
    }

    const data = await res.json();
    const codeBlockRegex = /```(?:javascript|js)?\n([\s\S]*?)\n```/;
    const match = data.response.match(codeBlockRegex);
    return (match ? match[1] : data.response).trim();
  } catch (e) {
    console.error("Failed to connect to Ollama:", e);
    return `// Failed to connect to Ollama: ${e.message}`;
  }
}

// GUI의 요청을 받아 테스트를 생성하고 실행하는 API 엔드포인트
app.post('/generate-and-run', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required.' });
  }

  console.log('1. Prompt 수신:', prompt);
  const code = await generateTestCode(prompt);
  console.log('2. AI가 테스트 코드 생성 완료');

  const specPath = path.join(__dirname, 'cypress/e2e/generated/test_from_gui.cy.js');
  await fs.writeFile(specPath, code, 'utf-8');
  console.log(`3. 테스트 파일 저장 완료: ${specPath}`);

  console.log('4. Cypress 자동 실행 시작...');
  try {
    const results = await cypress.run({
      spec: specPath,
      headed: true, // 테스터가 볼 수 있도록 headed 모드로 실행
      browser: 'chrome',
    });
    res.json({ success: true, results });
  } catch (err) {
    console.error('Cypress 실행 중 오류 발생:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 모든 다른 요청에 대해 404 에러를 처리하는 미들웨어 (가장 마지막에 위치해야 함)
app.use((req, res, next) => {
  console.error(`[404 Not Found] The server could not find the requested resource: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}.`);
});

app.listen(port, () => {
  console.log(`====================================================`);
  console.log(`  AI 테스트 생성기 GUI가 시작되었습니다.`);
  console.log(`  브라우저에서 http://localhost:${port} 로 접속하세요.`);
  console.log(`====================================================`);
});