# RiskIntel AI — Local General-Purpose Chatbot

The chatbot now runs a small Llama 3.2 model directly in the browser using WebLLM/WebGPU. It does **not** require an OpenAI API key, Gemini API key, or any cloud LLM account.

## How it works

Browser → WebGPU → local Llama 3.2 model → answer

The first time the chatbot is used, the browser downloads the model and caches it. Later uses can reuse the cached model.

## Requirements

- Latest Chrome or Edge recommended.
- WebGPU/hardware acceleration enabled.
- Internet connection for the first model download.
- Enough free storage/RAM for the model.

The model used is `Llama-3.2-1B-Instruct-q4f32_1-MLC`.

## Start

### Backend

The RiskIntel backend is still required for the rest of the application (login, profile, forecasting, etc.):

```powershell
cd "$HOME\Downloads\RiskIntel-AI-Demo\backend"
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

### Frontend

```powershell
cd "$HOME\Downloads\RiskIntel-AI-Demo\frontend"
npm install
npm run dev
```

Open `http://localhost:5173`.

## Important

The chatbot itself does not call OpenAI or Gemini. You can leave `OPENAI_API_KEY` and `GEMINI_API_KEY` empty.

The first model load may take time because model files have to be downloaded. WebLLM caches the model in the browser for later use.
