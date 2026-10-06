# RiskIntel — AI-Based Virtual Risk & Compliance Intelligent System

RiskIntel is an AI-powered virtual risk and compliance intelligence system designed to analyze user data, predict potential risks, simulate future scenarios, and provide intelligent recommendations for better decision-making.

The system combines **predictive analytics, explainable AI, digital twin simulations, financial and lifestyle risk analysis, and a browser-based local AI assistant** into a single interactive platform.

---

## 🚀 Key Features

### 📊 Risk & Compliance Dashboard
- Centralized dashboard for monitoring user risk indicators
- Financial, health, productivity, and lifestyle analysis
- Risk scores and actionable insights
- Historical activity tracking

### 🤖 AI-Based Risk Prediction
- Machine-learning-based risk prediction
- Predictive analytics using structured user data
- Future trend forecasting
- Risk classification and decision support

### 🔮 Digital Twin Simulation

The system provides a virtual representation of the user's current situation and allows different scenarios to be simulated.

Users can compare:

- Current Situation
- Expected Situation
- Best-Case Scenario
- Risk Scenario

The system evaluates how different decisions may affect future outcomes.

### 💰 Financial Impact Analysis

Users can simulate major financial decisions such as:

- Purchasing a car
- Buying an apartment
- Purchasing a smartphone
- Buying a laptop
- High-value purchases
- Savings and installment decisions
- Rent and recurring expenses

The system estimates the potential impact of these decisions on financial risk and savings.

### 📈 Forecasting & Analytics

The platform provides:

- Future predictions
- 7-day forecasting
- Monthly forecasting
- Trend analysis
- Interactive graphs
- Historical vs predicted comparisons

Forecasting models include:

- **XGBoost Regressor**
- **ARIMA**
- **SHAP Explainability**

### 🧠 Explainable AI

Risk predictions are supported with explainability techniques so that users can understand which factors contribute to the predicted outcome.

**SHAP (SHapley Additive exPlanations)** is used to provide feature-level interpretation.

### 💬 Local AI Assistant

RiskIntel includes a browser-based AI assistant designed to operate locally without requiring an OpenAI or Gemini API key.

The assistant provides:

- General question answering
- Risk-related assistance
- Project-related guidance
- Local browser inference
- No external API key requirement

The local AI model is executed through browser-based WebGPU technology where supported.

### 🔐 Authentication & User Data

The backend includes:

- User authentication
- Password hashing
- User profiles
- Activity history
- Stored user information
- Last-updated information

### 📋 Data Validation

The system validates incoming data before processing.

The project includes a **1,000-record validated dataset** used for analytics and prediction.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │      Vite Frontend   │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │     FastAPI Backend   │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐    ┌─────────────┐   ┌──────────────┐
       │ Risk      │    │ Forecasting │   │ Digital Twin │
       │ Analysis  │    │ Engine      │   │ Simulation   │
       └───────────┘    └─────────────┘   └──────────────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ PostgreSQL Database  │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │ Local AI Assistant   │
                    │ WebGPU / Browser LLM │
                    └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- JavaScript
- CSS
- WebGPU
- Browser-based Local LLM

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Pydantic
- Passlib / bcrypt

## Machine Learning

- Python
- XGBoost
- ARIMA
- SHAP
- Pandas
- NumPy
- Scikit-learn

## Development Tools

- Git
- GitHub
- VS Code
- PowerShell
- npm
- Python Virtual Environment

---

# 📁 Project Structure

```text
RiskIntel-AI-Demo/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── chatbot_engine.py
│   │   ├── data_validation.py
│   │   ├── database.py
│   │   ├── forecasting_engine.py
│   │   ├── milestone3_engine.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   │
│   │   └── routers/
│   │       ├── activity_routes.py
│   │       ├── auth_routes.py
│   │       ├── dashboard_routes.py
│   │       ├── forecast_routes.py
│   │       └── profile_routes.py
│   │
│   ├── requirements.txt
│   └── start_backend.bat
│
├── frontend/
│   ├── src/
│   │   ├── Forecasting.jsx
│   │   ├── Milestone3.jsx
│   │   ├── localAI.js
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── start_frontend.bat
│
├── dataset_riskintel_m2_1000.csv
├── DATASET_VALIDATION.txt
├── MILESTONE2_FEATURES.md
├── MILESTONE2_UPDATED.md
├── MILESTONE3_FEATURES.md
├── CHATBOT_SETUP.md
├── CHATBOT_TROUBLESHOOTING.md
├── START_HERE.md
├── run_all.ps1
├── .gitignore
├── LICENSE
└── README.md
```

---

# 📊 Dataset

RiskIntel uses a structured dataset containing **1,000 validated records** for the project's risk analysis and predictive analytics.

The dataset covers multiple dimensions including:

- Financial behavior
- Health-related indicators
- Productivity
- Habits
- Work and study patterns
- Mood
- Screen time
- Savings
- Expenses
- Risk-related features

### Data Quality

```text
Records:        1,000
Data Quality:   Validated
Null Issues:    0
```

---

# 🔮 Forecasting

RiskIntel provides multiple prediction horizons:

```text
Next Day
   ↓
7 Days
   ↓
1 Month
```

The system combines predictive models with historical data to generate future estimates and trends.

### Models

**XGBoost Regressor**

Used as the primary machine-learning forecasting model.

**ARIMA**

Used as a time-series trend-support model.

**SHAP**

Used to explain the contribution of individual features to model predictions.

---

# 🧬 Digital Twin

The Digital Twin module allows users to explore possible future outcomes before making decisions.

Example:

```text
Current Financial State
          │
          ▼
     User Decision
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
 Expected Best  Risk
 Scenario Case  Scenario
    │     │     │
    └─────┼─────┘
          ▼
   Impact Analysis
          │
          ▼
 Recommendations
```

This enables users to understand the potential consequences of different financial and lifestyle decisions.

---

# 💬 Local AI Chatbot

RiskIntel includes a browser-based local AI assistant.

### Key characteristics

- No OpenAI API key required
- No Gemini API key required
- Runs locally in the browser where supported
- Uses WebGPU for accelerated inference
- Designed to provide general and project-related assistance
- Model files are cached locally by the browser

> The first use may require downloading the local model into the browser cache.

Browser/WebGPU compatibility may affect local model performance.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/bhavnagoliyan11/AI-based-risk-and-compliance-system.git
```

Move into the project:

```bash
cd AI-based-risk-and-compliance-system
```

---

# 🐍 Backend Setup

Open a terminal in the project directory.

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

---

## 🔐 Environment Configuration

The repository contains example environment files.

Backend:

```text
backend/.env.example
```

Frontend:

```text
frontend/.env.example
```

Create your local `.env` files as required.

**Do not commit `.env` files or secrets to GitHub.**

---

# ▶️ Start the Backend

From the project root:

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# 🌐 Start the Frontend

Open another terminal.

```powershell
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

# 🚀 Running the Complete System

The project also includes:

```text
run_all.ps1
```

which can be used to start the frontend and backend together where the local environment is configured correctly.

---

# 📈 Project Impact

RiskIntel aims to transform raw personal and behavioral data into understandable risk insights.

Instead of only showing historical information, the system focuses on:

```text
Data
 ↓
Analysis
 ↓
Risk Prediction
 ↓
Simulation
 ↓
Impact Analysis
 ↓
Recommendation
 ↓
Decision Support
```

This makes the platform useful for exploring how different decisions can affect future risk and outcomes.

---

# 🔒 Security & Privacy

The project is designed with privacy and security considerations including:

- Password hashing
- Environment-based configuration
- No hard-coded API keys
- `.gitignore` protection for secrets
- Local AI inference for the chatbot
- User authentication
- Database-backed user data

Never commit passwords, API keys, database credentials, or private environment variables to the repository.

---

# 🎯 Future Improvements

Potential future enhancements include:

- Advanced compliance rule engines
- More financial risk models
- Personalized recommendation systems
- More forecasting algorithms
- Improved local LLM support
- Multi-user deployment
- Cloud deployment
- Advanced anomaly detection
- Automated compliance reports
- More digital twin scenarios
- Real-time data integration

---

# 👩‍💻 Author

**Bhavna Goliyan**

B.Tech Computer Science & Engineering

GitHub:  
https://github.com/bhavnagoliyan11

---

# 📄 License

This project is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for details.

---

## ⭐ Project

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
