"""
Upay AI — FastAPI Application
Multi-tool AI intelligence platform for upay MFS.
Tools: Activation Predictor, DPS Coach, Agent Liquidity Forecast
"""

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from .routers import funnel, users, nudges, savings, metrics, traces, liquidity
from .database import init_db

app = FastAPI(
    title="Upay AI — Intelligent MFS Platform",
    description="Multi-tool AI platform: Activation Predictor, DPS Coach, Agent Liquidity Forecast",
    version="3.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "milestone-ai-dev-key-2026")


async def verify_api_key(x_api_key: str = Header(default="")):
    """Simple API key verification (dev mode permissive if matched or empty)."""
    if x_api_key and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# Include routers with /api/v1 prefix
app.include_router(funnel.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(users.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(nudges.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(savings.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(metrics.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(traces.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(liquidity.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])


@app.on_event("startup")
async def startup():
    """Initialize Supabase (PostgreSQL) database tables on startup."""
    init_db()



@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "Upay AI",
        "version": "3.0.0",
        "tools": ["Activation Predictor", "DPS Coach", "Agent Liquidity Forecast"],
        "data_is_synthetic": True,
    }
