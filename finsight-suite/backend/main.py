import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.supabase_client import get_service_client
import app.ml_inference as ml_inference

from app.routes import budget, risk, ml

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Financial Intelligence Suite...")
    supabase = get_service_client()
    if supabase:
        ml_inference.load_model(supabase)
    else:
        logger.warning("Supabase not configured — ML model loading skipped. Running in demo mode.")
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="Financial Intelligence Suite",
    version="1.0.0",
    lifespan=lifespan
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(budget.router)
app.include_router(risk.router)
app.include_router(ml.router)

@app.get("/")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
