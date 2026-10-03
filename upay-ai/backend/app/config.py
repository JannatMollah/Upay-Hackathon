"""
MilestoneAI — Configuration
"""

import os
import logging
from dotenv import load_dotenv

# Base directory: handles both Docker (/app) and local dev (.../upay-ai)
APP_DIR = os.path.dirname(os.path.abspath(__file__))
_parent = os.path.dirname(APP_DIR)
_grandparent = os.path.dirname(_parent)

if os.path.exists(os.path.join(_parent, "data")) or os.path.exists(os.path.join(_parent, "models")):
    BASE_DIR = _parent
else:
    BASE_DIR = _grandparent

# Load .env from BASE_DIR if present, else fallback
env_path = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)

logger = logging.getLogger("MilestoneAI")


class Config:
    BASE_DIR = BASE_DIR

    _raw_data_dir = os.getenv("DATA_DIR", "data")
    DATA_DIR = (
        _raw_data_dir
        if os.path.isabs(_raw_data_dir)
        else os.path.abspath(os.path.join(BASE_DIR, _raw_data_dir.lstrip("./")))
    )

    _raw_models_dir = os.getenv("MODELS_DIR", "models")
    MODELS_DIR = (
        _raw_models_dir
        if os.path.isabs(_raw_models_dir)
        else os.path.abspath(os.path.join(BASE_DIR, _raw_models_dir.lstrip("./")))
    )

    # Supabase / PostgreSQL connection (Session Mode Pooler)
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres.dqkkdxlicrmtamxicmms:R7Y2jvgA41cN8O3S@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
    )

    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dqkkdxlicrmtamxicmms.supabase.co")
    SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")

    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    API_KEY = os.getenv("API_KEY", "milestone-ai-dev-key-2026")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_model.joblib")
    BASELINE_PATH = os.path.join(MODELS_DIR, "baseline_lr.joblib")
    SURPLUS_MODEL_PATH = os.path.join(MODELS_DIR, "surplus_regressor.joblib")
