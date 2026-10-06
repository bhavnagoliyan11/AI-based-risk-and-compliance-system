# Milestone 2 Updated UI — Domain Intelligence + Risk

This version keeps the complete Milestone 2 forecasting stack and changes the dashboard organization as requested.

## Left sidebar
- Financial Intelligence
- Health & Wellness
- Productivity & Habits
- Risk Overview
- What-If Simulation

The first three entries jump directly to their dedicated analytics sections on the Forecasting page.

## Financial Intelligence
- Next-day / 7-day / monthly forecast
- XGBoost personalized expenditure prediction
- Category expenditure bars
- Expenditure-mix donut chart
- Current vs predicted line chart
- Fixed vs variable expenditure
- Rent, shopping, food, healthcare, taxes, installments/EMI and other categories

## Health & Wellness
- Non-medical wellness index
- Sleep, exercise, energy and screen-time signals
- Wellness trend line graph
- Health/wellness risk score with Low / Moderate / High classification

## Productivity & Habits
- Study-hours trend
- Productivity trend
- Study, work and task signals
- Future behavioral outlook
- Productivity & habit risk score

## Risk Overview
- Overall risk index
- Financial risk
- Health & wellness risk
- Productivity & habit risk
- Visual risk bars and classifications
- Clear non-medical / decision-support disclaimer

## Model layer retained
- XGBoost regression
- ARIMA dated trend signal
- SHAP feature-impact explanation
- 1,000-record validated synthetic training dataset
- 80/20 validation
- What-if simulation

The risk scores are transparent prototype decision-support indicators. They are not medical diagnoses and do not guarantee future financial outcomes.
