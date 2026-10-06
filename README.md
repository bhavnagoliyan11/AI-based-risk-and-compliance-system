# RiskIntel AI — Milestone 2 Final Predictive Analytics

RiskIntel AI is a full-stack predictive analytics prototype extending the Milestone 1 user profile and activity foundation.

## Milestone 2 capabilities
1. Financial forecasting: next day, next 7 days and next month.
2. Category forecasting: rent, shopping, food, healthcare, taxes, installment/EMI, transport, education, entertainment and other.
3. Behavioral signals: mood, screen time, study hours, work hours, sleep, exercise, productivity, tasks and energy.
4. Historical/current/predicted analytics graphs for finance, study/productivity and wellness.
5. What-if simulation that changes temporary inputs without changing the saved profile.
6. Personalized XGBoost regression models.
7. ARIMA(1,1,1) dated trend model used as a secondary population trend signal.
8. SHAP TreeExplainer feature-level explanation of the XGBoost forecast.
9. Authenticated forecast snapshots persisted in the database and used for user history when enough snapshots exist.
10. Controlled dataset with exactly 1,000 unique non-null records.

## ML methodology
- Train/test split: 80/20, random_state=42.
- Primary model: XGBoost Regressor.
- Secondary model: ARIMA(1,1,1) on the dated synthetic expenditure target.
- Final hybrid forecast: 85% personalized XGBoost + 15% time-series trend signal.
- Explainability: SHAP TreeExplainer; a feature-importance fallback keeps the API available if SHAP cannot initialize.

## Important academic note
The included 1,000-row dataset is **synthetic and controlled**. Its model metrics demonstrate the implementation and learning pipeline, not real-world financial or health prediction accuracy. Mood, sleep, exercise and energy are treated only as self-reported behavioral/wellness signals.

## Run
See `START_HERE.md`.

## Milestone 3 — Digital Twin Simulation Engine
Milestone 3 adds three future scenarios (Expected/Follow Trend, Best Case, Risk Case), decision analysis, exploratory historical analysis with scatter plots, and a personalized recommendation engine. The Digital Twin uses current user inputs and the validated Milestone 2 dataset, then applies the existing hybrid XGBoost + ARIMA forecast engine to each scenario.

## New Milestone 3 enhancements
- **AI chatbot + voice assistant:** the floating RiskIntel assistant lets the user choose any chatbot name, type questions, use browser speech recognition, and hear answers with speech synthesis. Project-aware answers work locally; open-ended AI answers are enabled by setting `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in `backend/.env`.
- **Project Highlights:** Milestone 3 now includes a dedicated highlights page covering the complete project, ML layer, Digital Twin, analytics, recommendations, purchases and voice assistant.
- **Exploratory Analysis:** scatter plots were replaced with bar/line visualizations. The selected horizon (Next day / Next 7 days / Next month) now changes the forecast outlook and category/scenario graphs.
- **Safety note:** forecast and scenario values are simulations based on the project dataset and assumptions; they are not guaranteed financial outcomes.
