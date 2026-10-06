# RiskBot – Local AI troubleshooting

The chatbot uses WebLLM + Llama 3.2 1B locally in the browser. No OpenAI or Gemini key is required.

## Fix for `Cache.add() encountered a network error`

This version uses WebLLM's IndexedDB cache instead of the browser Cache API and retries the model download up to three times. WebLLM supports IndexedDB as a cache backend.

### Run

Backend terminal:
```powershell
cd "$HOME\Downloads\RiskIntel-AI-Demo\backend"
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

Frontend terminal:
```powershell
cd "$HOME\Downloads\RiskIntel-AI-Demo\frontend"
npm install
npm run dev
```

Open `http://localhost:5173` in a normal Chrome window.

## First model load

The first chatbot request must download the Llama model files. Keep the internet connection stable until the progress reaches completion. Later loads use the browser's local cache.

If download still fails:
1. Turn off VPN/proxy temporarily.
2. Disable aggressive browser extensions/ad blockers for `localhost`.
3. Refresh with Ctrl+Shift+R.
4. Make sure Chrome hardware acceleration is enabled.
5. Check WebGPU at https://webgpureport.org/.

The model is loaded from WebLLM's configured model repository; the application itself does not send chat questions to OpenAI or Gemini.
