from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import generations_router, health_router, projects_router
from app.core.config import get_settings
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema exists on startup
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Database initialization error: {e}")
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(projects_router)
app.include_router(generations_router)

