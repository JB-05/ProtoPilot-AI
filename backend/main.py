"""
ProtoPilot AI - FastAPI application entry point.
"""
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

import uvicorn
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routes import router as api_router
from core.config import get_settings
from core.errors import PipelineError, ValidationError
from core.schemas import ErrorDetail, StructuredErrorResponse

OPENAPI_TAGS = [
    {"name": "api", "description": "Health and core API"},
    {"name": "pipeline", "description": "Multi-agent pipeline"},
    {"name": "projects", "description": "Project workspace"},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load config and Supabase client (REST)."""
    from core.supabase_client import init_supabase
    app.state.settings = get_settings()
    if app.state.settings.supabase_configured:
        init_supabase(app.state.settings.supabase_url, app.state.settings.supabase_key)
    else:
        init_supabase("", "")
    yield


app = FastAPI(
    title="ProtoPilot AI",
    description="Multi-agent reasoning pipeline backend.",
    version="0.1.0",
    lifespan=lifespan,
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    """Structured error when agent output fails schema validation (registered before PipelineError)."""
    detail = ErrorDetail(
        code=exc.code,
        message=exc.message,
        agent_name=exc.agent_name,
        details=exc.details,
    )
    return JSONResponse(
        status_code=422,
        content=StructuredErrorResponse(success=False, error=detail).model_dump(),
    )


@app.exception_handler(PipelineError)
async def pipeline_error_handler(request: Request, exc: PipelineError):
    """Structured error when pipeline fails after retries. Malformed output never breaks the system."""
    detail = ErrorDetail(
        code=exc.code,
        message=exc.message,
        agent_name=exc.agent_name,
        details=exc.details,
    )
    return JSONResponse(
        status_code=422,
        content=StructuredErrorResponse(success=False, error=detail).model_dump(),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Return JSON on unhandled errors. Refine with status codes and logging later."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__},
    )


app.include_router(api_router, prefix="/api", tags=["api"])


@app.get("/", tags=["api"])
async def root(request: Request):
    """Service info and links to docs and health."""
    settings = request.app.state.settings
    return {
        "service": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/health",
        "pipeline": "/api/pipeline/run",
    }



if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
