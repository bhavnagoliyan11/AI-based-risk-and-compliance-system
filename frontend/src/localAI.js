import { CreateMLCEngine, prebuiltAppConfig } from "@mlc-ai/web-llm";

// Runs entirely in the browser. No OpenAI/Gemini API key is used.
// The first use downloads the model once and then the browser caches it.
const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let enginePromise = null;

export const LOCAL_AI_MODEL = MODEL_ID;

export function isLocalAIAvailable() {
  return typeof navigator !== "undefined" && !!navigator.gpu;
}

export async function getLocalAI(onProgress = () => {}) {
  if (!isLocalAIAvailable()) {
    throw new Error("WebGPU is not available in this browser. Please use an up-to-date Chrome or Edge browser with hardware acceleration enabled.");
  }

  if (!enginePromise) {
    // IndexedDB avoids the browser Cache API path that can fail with
    // `Cache.add() encountered a network error` on some Windows/Chrome setups.
    const appConfig = {
      ...prebuiltAppConfig,
      cacheBackend: "indexeddb",
    };

    const load = async (attempt = 1) => {
      try {
        onProgress(`Downloading local AI model… attempt ${attempt}/3`);
        return await CreateMLCEngine(MODEL_ID, {
          appConfig,
          initProgressCallback: (report) => onProgress(report?.text || "Loading local AI model…"),
          logLevel: "ERROR",
        }, {
          context_window_size: 4096,
        });
      } catch (error) {
        if (attempt < 3) {
          onProgress(`Model download interrupted. Retrying (${attempt + 1}/3)…`);
          await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
          return load(attempt + 1);
        }
        throw new Error(
          `The local AI model could not be downloaded after 3 attempts. ` +
          `Please check your internet connection, disable VPN/proxy temporarily, ` +
          `then refresh the page and try again. Original error: ${error?.message || error}`
        );
      }
    };

    enginePromise = load().catch((error) => {
      enginePromise = null;
      throw error;
    });
  }

  return enginePromise;
}

export async function localAIAnswer(question, conversation = [], onProgress = () => {}) {
  const engine = await getLocalAI(onProgress);

  const system = `You are RiskBot, the helpful AI assistant built into RiskIntel AI.

You can answer BOTH general questions and questions about the RiskIntel AI project.
For general questions, answer normally and clearly. Do not say that an API key is required.
For RiskIntel questions, use this project context:
- RiskIntel AI is an AI-Based Virtual Risk and Compliance Intelligent System.
- Milestone 1: authentication, profile/data collection, persistent storage and activity history.
- Milestone 2: Financial Intelligence, Health & Wellness, Productivity & Habits, Risk Overview and What-If Simulation.
- Milestone 2 forecasting uses XGBoost regression as the primary model and ARIMA as a secondary time-series signal; SHAP is used for explainability in the project design.
- The controlled Milestone 2 dataset contains exactly 1,000 unique non-null records.
- Milestone 3: Digital Twin Simulation Engine, Decision Analysis, Exploratory Analysis, Recommendations and Scenario Analysis.
- Digital Twin scenarios include Expected/Follow Trend, Best Case and Risk Case.
- Scenario Analysis includes illustrative BMW, apartment, iPhone 18 Pro Max, MacBook and diamond necklace purchase simulations.
- The site supports Next day, Next 7 days and Next month horizons.
- The chatbot also supports browser voice input and spoken answers.
- Forecasts and purchase simulations are project simulations and should never be described as guaranteed real-world outcomes.

Answer in a friendly, concise way. For coding questions, provide useful examples. For medical, legal or financial questions, give general information and encourage appropriate professional verification when needed.`;

  const messages = [
    { role: "system", content: system },
    ...conversation.slice(-10).map((m) => ({ role: m.role, content: m.text })),
    { role: "user", content: question },
  ];

  const response = await engine.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 500,
    stream: false,
  });

  return response?.choices?.[0]?.message?.content?.trim() || "I could not generate an answer.";
}
