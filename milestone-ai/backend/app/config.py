"""
MilestoneAI — Configuration
"""

import os
import logging
from dotenv import load_dotenv

# Base directory is the milestone-ai directory
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(APP_DIR)
BASE_DIR = os.path.dirname(BACKEND_DIR)

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

    _raw_db_path = os.getenv("DB_PATH", os.path.join("data", "milestone_ai.db"))
    DB_PATH = (
        _raw_db_path
        if os.path.isabs(_raw_db_path)
        else os.path.abspath(os.path.join(BASE_DIR, _raw_db_path.lstrip("./")))
    )

    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    API_KEY = os.getenv("API_KEY", "milestone-ai-dev-key-2026")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_model.joblib")
    BASELINE_PATH = os.path.join(MODELS_DIR, "baseline_lr.joblib")
    SURPLUS_MODEL_PATH = os.path.join(MODELS_DIR, "surplus_regressor.joblib")
