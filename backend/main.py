"""
Mental AI Companion — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.seed import seed_resources
from app.database import SessionLocal
from app.routers import auth, chat, dashboard, resources
from app.auth import init_firebase


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialise Firebase Admin SDK
    init_firebase()
    yield


app = FastAPI(
    title="Mental AI Companion API",
    description="A private, empathetic AI counselor backend for student wellness.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(resources.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Mental AI Companion API is running."}
