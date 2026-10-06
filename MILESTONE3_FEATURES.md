# RiskIntel AI — Milestone 3 Enhanced Features

## Digital Twin Simulation Engine
- Expected / Follow Trend scenario
- Best Case scenario
- Risk Case / Reduced Savings scenario
- Forecast horizon: next day, next 7 days, next month
- Expenditure, savings and domain-risk comparisons

## Decision Analysis
- Scenario comparison table
- Expenditure movement vs expected
- Savings movement vs expected
- Financial, health and productivity risk comparison
- Scenario risk chart

## Exploratory Analysis
- Historical expenditure/savings/productivity trend (last 60 records)
- Average spending by category
- Historical behavior profile: study, work, screen, sleep, productivity and energy
- Current vs historical financial benchmark
- Mood vs next-month expenditure analysis
- Feature correlation with next-month expenditure
- Six scatter plots:
  - Screen time vs productivity
  - Study hours vs productivity
  - Shopping vs savings
  - Sleep vs productivity
  - Mood vs next-month expenditure
  - Work hours vs productivity

## Scenario Analysis — Major Purchases
Users can click a purchase and see a dedicated what-if simulation for:
- BMW Car
- Apartment
- iPhone 18 Pro Max
- MacBook
- Diamond Necklace

For every selected purchase the UI shows:
- Assumed purchase price
- Current predicted savings
- Savings immediately after the purchase
- Savings change
- Illustrative monthly affordability commitment
- Price-to-income ratio
- Financial stress score
- Cash shortfall if purchase exceeds projected savings
- 5-year savings path with vs without purchase
- Difference in savings after 5 years
- Calculation methodology and assumptions

### Important
Purchase prices and monthly commitments are illustrative project assumptions for demonstration. They are not live market quotations, loan offers, or financial advice.

## Technologies
- React + Vite
- React Router
- Axios
- Lucide React icons
- Custom SVG charts (no extra chart package required)
- Python + FastAPI
- Pandas + NumPy
- XGBoost + ARIMA forecasting foundation from Milestone 2
- SQLAlchemy + SQLite/PostgreSQL-ready database
- JWT authentication + PBKDF2-SHA256 password hashing

## Data Flow
Current user data + 1,000-record historical dataset
→ forecasting context
→ scenario transformation
→ future outcome simulation
→ decision comparison / exploratory analysis
→ personalized recommendation

The Digital Twin is a decision-support prototype based on the project's synthetic historical dataset; its simulated outcomes are not guaranteed real-world results.
