const express = require("express");
require("dotenv").config();

// Use a dynamic import for the ESM-only `node-fetch` package.
// This creates a wrapper function that ensures the module is imported before being used.
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const OWNER = "jin-101";
const REPO = "cypress-ai-test";
const WORKFLOW_FILE = "run-cypress-browserstack.yml";
const GITHUB_API = "https://api.github.com";

const app = express();
app.use(express.json());

app.post("/api/run-tests", async (req, res) => {
  try {
    const { spec = "", runLabel = "Triggered via UI" } = req.body;
    const pat = process.env.GITHUB_PAT;
    if (!pat) return res.status(500).json({ error: "Server missing PAT" });

    const url = `${GITHUB_API}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
    const body = {
      ref: "main",
      inputs: { spec, runLabel },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (r.status === 204) {
      return res.json({ status: "dispatched" });
    } else {
      const text = await r.text();
      return res
        .status(500)
        .json({ status: "error", code: r.status, body: text });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on ${port}`));
