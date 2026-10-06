import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth_routes, profile_routes, activity_routes, dashboard_routes, forecast_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RiskIntel AI API",
    description="Milestones 1–2 — Data Foundation & Predictive Analytics",
    version="1.1.0"
)

front = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[front, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile_routes.router, prefix="/api/profile", tags=["Profile"])
app.include_router(activity_routes.router, prefix="/api/activity", tags=["Activity"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(forecast_routes.router, prefix="/api/forecast", tags=["Forecasting & Predictive Analytics"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "RiskIntel AI"}

@app.get("/")
def root():
    return {"message": "RiskIntel AI backend is running"}
