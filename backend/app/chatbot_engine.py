import json
import os
import urllib.request
import urllib.error

PROJECT_CONTEXT = """
You are the AI assistant inside RiskIntel AI, an AI-Based Virtual Risk and Compliance Intelligent System.
The website has Milestone 1 profile/data collection and activity history; Milestone 2 financial forecasting,
health & wellness, productivity & habits, risk overview and What-If Simulation; and Milestone 3 Digital Twin
Simulation Engine, Decision Analysis, Exploratory Analysis, Recommendations and Scenario Analysis.
Milestone 2 forecasting uses horizon-specific XGBoost regression models plus ARIMA as a secondary time-series
trend signal. SHAP is used for explainability in the project design. The controlled Milestone 2 dataset has 1000
records with no nulls or duplicate rows. Reported held-out test metrics are project-dataset metrics, not real-world
accuracy guarantees. Milestone 3 simulates Expected/Follow Trend, Best Case and Risk Case, compares expenditure,
savings and risk, analyzes historical patterns, generates recommendations, and simulates purchases such as a BMW,
an apartment, iPhone 18 Pro Max, MacBook and diamond necklace using clearly labeled illustrative assumptions.
The site supports Next day, Next 7 days and Next month horizons. It also includes a voice-enabled chatbot and
project highlights. Never claim a prediction is guaranteed. For financial/medical/legal topics, provide general
information and advise appropriate professional verification when needed.
""".strip()

FAQ = {
    'simulation': "Simulation means creating a virtual what-if version of a real situation and comparing the outcome. In RiskIntel, Expected, Best and Risk scenarios change inputs and recalculate expenditure, savings and risk.",
    'xgboost': "RiskIntel uses XGBoost Regression as the primary ML model for horizon-specific expenditure forecasting. ARIMA provides a secondary time-series trend signal.",
    'accuracy': "On the controlled 1000-record project dataset, the previously reported total-expenditure XGBoost metrics were approximately MAE ₹1,756, RMSE ₹2,528 and R² 0.988. This is not the same as saying the system is 98.8% accurate, and it is not real-world validation.",
    'milestone 3': "Milestone 3 contains the Digital Twin Simulation Engine, Decision Analysis, Exploratory Analysis, Recommendation Engine and purchase Scenario Analysis.",
    'exploratory': "Exploratory Analysis compares historical spending, category averages, behavior patterns, mood, model correlations and horizon-specific forecast outlooks. The updated version uses bars and line-style trend charts rather than scatter plots.",
    'what if': "What-If Simulation temporarily changes inputs and shows how projected expenditure, savings and risk could change. It is a simulation, not a guaranteed future result.",
    'recommendation': "The recommendation engine compares current user inputs with historical dataset patterns and forecast results, then produces evidence, an action and an expected effect.",
    'voice': "The chatbot supports browser speech recognition for voice questions and speech synthesis for spoken answers. Availability depends on the browser and microphone permissions.",
}

def _local_answer(q: str, name: str, data: dict):
    ql = q.lower()
    for key, value in FAQ.items():
        if key in ql:
            return value
    if any(x in ql for x in ['hello', 'hi ', 'hey', 'who are you']):
        return f"Hello! I am {name}, your RiskIntel AI assistant. I can explain the website, its ML forecasting, Digital Twin simulations, graphs, recommendations and scenario analysis."
    if 'project' in ql or 'website' in ql or 'riskintel' in ql:
        return (f"RiskIntel AI is a virtual risk and compliance intelligence system. {name} can explain your profile data, "
                "forecasting, XGBoost and ARIMA, Digital Twin scenarios, decision analysis, exploratory graphs, recommendations and purchase simulations.")
    if 'my data' in ql or 'my profile' in ql:
        keys = ['income','rent','shopping','food','healthcare','taxes','installment','savings','study_hours','work_hours','screen_hours','sleep_hours','productivity_score','energy_level','mood']
        parts = [f"{k.replace('_',' ')}: {data.get(k)}" for k in keys if data.get(k) not in [None, '']]
        return "Your latest stored forecasting inputs are: " + ", ".join(parts) + "."
    return (f"I can answer RiskIntel project questions directly. For general questions, this assistant needs an AI provider key in the backend "
            "to generate open-ended answers. Add OPENAI_API_KEY to backend/.env and restart the backend; then I can answer broader questions while still using the RiskIntel project context.")

def _openai_answer(question: str, name: str, data: dict):
    key = os.getenv('OPENAI_API_KEY')
    if not key:
        return None
    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    body = {
        'model': model,
        'messages': [
            {'role':'system','content': PROJECT_CONTEXT + f"\nThe user named you {name}. Answer clearly, accurately and simply. Current user forecasting inputs: {json.dumps(data, default=str)}"},
            {'role':'user','content': question}
        ],
        'temperature': 0.3,
        'max_tokens': 700
    }
    req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=json.dumps(body).encode(),
                                 headers={'Content-Type':'application/json','Authorization':f'Bearer {key}'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            result = json.loads(r.read().decode())
        return result['choices'][0]['message']['content'].strip()
    except Exception:
        return None

def answer_question(question: str, name: str, data: dict):
    ai = _openai_answer(question, name, data)
    if ai:
        return {'answer': ai, 'source': 'ai'}
    return {'answer': _local_answer(question, name, data), 'source': 'local'}
