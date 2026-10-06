# RiskIntel AI — Milestone 3 Enhanced Project

## What was added
This version keeps the existing RiskIntel AI UI and adds an expanded Milestone 3 experience:

1. Simulation Engine — Expected, Best and Risk futures.
2. Decision Analysis — compare expenditure, savings and risk.
3. Exploratory Analysis — multiple historical charts, correlations and scatter plots.
4. Recommendations — personalized evidence → action → expected effect.
5. Scenario Analysis — click BMW, Apartment, iPhone 18 Pro Max, MacBook or Diamond Necklace to simulate savings impact.
6. Existing Settings and Sign out remain available in the sidebar.

## Run on Windows
### Backend terminal
```powershell
cd "$HOME\Downloads\RiskIntel-AI-Milestone3-Enhanced\RiskIntel-AI-Demo\backend"
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout 600 --retries 10
uvicorn app.main:app --reload
```

### Frontend terminal
```powershell
cd "$HOME\Downloads\RiskIntel-AI-Milestone3-Enhanced\RiskIntel-AI-Demo\frontend"
npm install
npm run dev
```

Open: http://localhost:5173
Backend docs: http://127.0.0.1:8000/docs

## Scenario Analysis
Open **Milestone 3 → Scenario Analysis**. Click any purchase card. The system calls the backend Digital Twin purchase endpoint and displays the savings impact and 5-year comparison.

### Purchase assumptions
The demo uses fixed illustrative assumptions so the feature is reproducible. These can be changed later in `backend/app/milestone3_engine.py` inside `PURCHASE_SCENARIOS`.
