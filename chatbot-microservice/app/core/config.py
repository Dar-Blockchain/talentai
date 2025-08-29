"""
Configuration settings for TalentAI Chatbot Microservice
"""

import os
from typing import List
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", env="API_HOST")
    API_PORT: int = Field(default=8001, env="API_PORT")
    API_ENVIRONMENT: str = Field(default="development", env="API_ENVIRONMENT")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="logs/chatbot.log", env="LOG_FILE")
    
    # NLP Configuration
    NLP_MODEL: str = Field(default="en_core_web_sm", env="NLP_MODEL")
    CONFIDENCE_THRESHOLD: float = Field(default=0.4, env="CONFIDENCE_THRESHOLD")
    USE_TRANSFORMERS: bool = Field(default=False, env="USE_TRANSFORMERS")
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_METHODS: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        env="ALLOWED_METHODS"
    )
    ALLOWED_HEADERS: List[str] = Field(default=["*"], env="ALLOWED_HEADERS")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Session Configuration
    SESSION_TIMEOUT: int = Field(default=3600, env="SESSION_TIMEOUT")
    
    # Model Configuration
    MODEL_PATH: str = Field(default="models/", env="MODEL_PATH")
    INTENT_MODEL_NAME: str = Field(default="intent_classifier.pkl", env="INTENT_MODEL_NAME")
    VECTORIZER_NAME: str = Field(default="tfidf_vectorizer.pkl", env="VECTORIZER_NAME")
    
    # External APIs
    TALENTAI_API_URL: str = Field(default="http://localhost:3001/api", env="TALENTAI_API_URL")
    TALENTAI_API_KEY: str = Field(default="", env="TALENTAI_API_KEY")
    
    # Together AI Configuration for DeepSeek Fallback
    TOGETHER_API_KEY: str = Field(default="", env="TOGETHER_API_KEY")
    DEEPSEEK_MODEL: str = Field(default="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free", env="DEEPSEEK_MODEL")
    ENABLE_DEEPSEEK_FALLBACK: bool = Field(default=True, env="ENABLE_DEEPSEEK_FALLBACK")
    DEEPSEEK_MAX_TOKENS: int = Field(default=500, env="DEEPSEEK_MAX_TOKENS")
    DEEPSEEK_TEMPERATURE: float = Field(default=0.7, env="DEEPSEEK_TEMPERATURE")
    FALLBACK_CONFIDENCE_THRESHOLD: float = Field(default=0.4, env="FALLBACK_CONFIDENCE_THRESHOLD")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        
    def __init__(self, **kwargs):
        # Load environment variables from Backend directory
        from pathlib import Path
        from dotenv import load_dotenv
        
        # Explicitly load from Backend directory
        backend_env_path = "../Backend/.env"
        
        # Try multiple possible paths to the Backend .env file
        possible_env_files = [
            Path(".env"),  # Current working directory
            Path("../.env"),  # Parent of working directory  
            Path("../Backend/.env"),  # Backend directory from chatbot-microservice
            Path("../../Backend/.env"),  # In case we're nested deeper
        ]
        
        for env_file in possible_env_files:
            if env_file.exists():
                print(f"✅ Loading .env from: {env_file.resolve()}")
                load_dotenv(dotenv_path=str(env_file))
                break
        else:
            print("⚠️ No .env file found in expected locations")
        
        super().__init__(**kwargs)
        
        # Parse comma-separated lists from environment variables
        if isinstance(self.ALLOWED_ORIGINS, str):
            self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        
        if isinstance(self.ALLOWED_METHODS, str):
            self.ALLOWED_METHODS = [method.strip() for method in self.ALLOWED_METHODS.split(",")]
        
        if isinstance(self.ALLOWED_HEADERS, str):
            self.ALLOWED_HEADERS = [header.strip() for header in self.ALLOWED_HEADERS.split(",")]
        
        # Ensure directories exist
        os.makedirs(os.path.dirname(self.LOG_FILE), exist_ok=True)
        os.makedirs(self.MODEL_PATH, exist_ok=True)


# Global settings instance
settings = Settings() 