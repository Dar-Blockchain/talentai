"""
Main FastAPI application for TalentAI Chatbot Microservice
"""

import os
import logging
import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.intent_classifier import IntentClassifier
from app.learning.pipeline import LearningPipeline
from app.api.routes import router
from app.utils.logger import setup_logging

# Global instances
classifier = None
learning_pipeline = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global classifier, learning_pipeline
    
    # Startup
    setup_logging()
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Starting TalentAI Chatbot Microservice...")
    
    # Initialize the intent classifier
    try:
        classifier = IntentClassifier()
        await classifier.initialize()
        app.state.classifier = classifier
        logger.info("✅ Intent classifier initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize intent classifier: {str(e)}")
        raise
    
    # Initialize learning pipeline
    try:
        learning_pipeline = LearningPipeline()
        await learning_pipeline.initialize()
        app.state.learning_pipeline = learning_pipeline
        logger.info("✅ Learning pipeline initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize learning pipeline: {str(e)}")
        # Don't fail startup if learning pipeline fails
        logger.warning("🔄 Continuing without learning pipeline")
    
    logger.info(f"🌟 TalentAI Chatbot Service is ready on port {settings.API_PORT}")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down TalentAI Chatbot Microservice...")

# Create FastAPI app
app = FastAPI(
    title="TalentAI Chatbot API",
    description="NLP-powered chatbot microservice for TalentAI recruitment platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.API_ENVIRONMENT == "development" else ["talentai.com", "*.talentai.com"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger = logging.getLogger(__name__)
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": getattr(request.state, "request_id", "unknown")
        }
    )

# Include API routes
app.include_router(router, prefix="/api")

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "TalentAI Chatbot",
        "version": "1.0.0",
        "environment": settings.API_ENVIRONMENT,
        "classifier_ready": hasattr(app.state, 'classifier') and app.state.classifier is not None,
        "learning_pipeline_ready": hasattr(app.state, 'learning_pipeline') and app.state.learning_pipeline is not None
    }

# Root endpoint
@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with service information"""
    return {
        "service": "TalentAI Chatbot API",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower()
    ) 