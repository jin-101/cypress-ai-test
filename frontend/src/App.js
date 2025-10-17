import React from "react";

const runTest = async (spec) => {
  const res = await fetch("/api/run-tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spec, runLabel: `UI run - ${spec || "all"}` }),
  });
  const data = await res.json();
  alert(JSON.stringify(data));
};

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>테스트 실행 대시보드</h2>
      <p>
        버튼을 클릭하면 해당 spec이 GitHub Actions → BrowserStack에서
        실행됩니다.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => runTest("cypress/e2e/ai_copy_and_mock.cy.js")}>
          propmt Test 실행
        </button>
        <button onClick={() => runTest("cypress/e2e/basic.cy.js")}>
          basic Test 실행
        </button>
        <button onClick={() => runTest("")}>전체 테스트 실행</button>
      </div>
      <p style={{ marginTop: 12, color: "#666" }}>
        실행 후 BrowserStack 대시보드에서 라이브·로그·비디오 확인
      </p>
    </div>
  );
}
