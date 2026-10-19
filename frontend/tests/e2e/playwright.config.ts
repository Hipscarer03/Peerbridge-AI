import { defineConfig } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// E2E đăng ký và điều hướng trên backend FastAPI với database tạm và frontend Next.js.
// Máy đã có sẵn hai server thì đặt E2E_REUSE=1; chạy bằng Edge có sẵn: PW_CHANNEL=msedge.
const API_PORT = 8765;
const WEB_PORT = 3123;
const python = process.env.E2E_PYTHON || "python";
const dataDir = mkdtempSync(path.join(os.tmpdir(), "peerbridge-e2e-"));
process.once("exit", () => {
  try {
    rmSync(dataDir, { recursive: true, force: true });
  } catch {
    // Máy chủ thử nghiệm có thể còn giữ tệp SQLite trên Windows.
  }
});

export default defineConfig({
  testDir: ".",
  timeout: 300_000,
  expect: { timeout: 20_000 },
  workers: 1,
  reporter: [["list", { printSteps: true }]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    viewport: { width: 1280, height: 860 },
    channel: process.env.PW_CHANNEL || undefined,
    launchOptions: {
      args: process.env.CI ? ["--disable-dev-shm-usage"] : [],
    },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `${python} -m uvicorn app.main:app --host 127.0.0.1 --port ${API_PORT}`,
      cwd: "../../../backend",
      port: API_PORT,
      reuseExistingServer: !!process.env.E2E_REUSE,
      timeout: 300_000,
      env: {
        APP_ENV: "development",
        JWT_SECRET: "e2e-only-not-a-secret",
        DEMO_MODE: "true",
        DATABASE_PATH: process.env.E2E_DB || path.join(dataDir, "e2e.db"),
        UPLOAD_DIRECTORY: path.join(dataDir, "uploads"),
        CORS_ORIGINS: `http://localhost:${WEB_PORT}`,
        OPENAI_API_KEY: "",
        LLM_PROVIDER: "fake",
        VISION_LLM_PROVIDER: "fake",
        PLAN_LLM_PROVIDER: "template",
        PLAN_CATALOG_PATH: path.resolve(__dirname, "../../../backend/data/concepts/plan_catalog.json"),
        RETRIEVER_PROVIDER: "fake",
        RAG_DEFAULT_COURSE_ID: "aicb",
        MATCH_RERANK_ENABLED: "false",
        LOOP_INTERVAL_MINUTES: "0",
      },
    },
    {
      command: `npm run build && npx next start -p ${WEB_PORT}`,
      cwd: "../..",
      port: WEB_PORT,
      reuseExistingServer: !!process.env.E2E_REUSE,
      timeout: 300_000,
      env: { NEXT_PUBLIC_API_URL: `http://localhost:${API_PORT}`, NEXT_TELEMETRY_DISABLED: "1" },
    },
  ],
});
