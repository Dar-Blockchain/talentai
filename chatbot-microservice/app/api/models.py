"""
Pydantic models for API request and response validation
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="User message to process"
    )
    user_id: Optional[str] = Field(
        None,
        description="Optional user identifier"
    )
    session_id: Optional[str] = Field(
        None,
        description="Optional session identifier"
    )
    context: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional context information"
    )
    
    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Hello, what is TalentAI?",
                "user_id": "user123",
                "session_id": "session456",
                "context": {
                    "user_type": "new_user",
                    "platform": "web"
                }
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    
    response: str = Field(
        ...,
        description="Generated chatbot response"
    )
    intent: str = Field(
        ...,
        description="Classified intent"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score of intent classification"
    )
    session_id: str = Field(
        ...,
        description="Session identifier"
    )
    timestamp: str = Field(
        ...,
        description="Response timestamp in ISO format"
    )
    suggestions: List[str] = Field(
        default=[],
        description="Follow-up question suggestions"
    )
    context: Dict[str, Any] = Field(
        default={},
        description="Response context and metadata"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Hello! Welcome to TalentAI! I'm here to help you navigate our AI-powered recruitment and certification platform.",
                "intent": "greet",
                "confidence": 0.95,
                "session_id": "session456",
                "timestamp": "2024-01-15T10:30:00Z",
                "suggestions": [
                    "What is TalentAI?",
                    "How do I get started?",
                    "What skills can I test?"
                ],
                "context": {
                    "user_id": "user123",
                    "conversation_turn": 1,
                    "session_duration": 0
                }
            }
        }


class IntentAnalysisRequest(BaseModel):
    """Request model for intent analysis endpoint"""
    
    text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Text to analyze for intent"
    )
    
    @validator('text')
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()


class IntentAnalysisResponse(BaseModel):
    """Response model for intent analysis endpoint"""
    
    intent: str = Field(
        ...,
        description="Primary predicted intent"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score"
    )
    all_intents: Dict[str, float] = Field(
        ...,
        description="All intent probabilities"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "intent": "platform_overview",
                "confidence": 0.89,
                "all_intents": {
                    "platform_overview": 0.89,
                    "greet": 0.05,
                    "how_to_start": 0.03,
                    "fallback": 0.03
                }
            }
        }


class ConversationSummaryResponse(BaseModel):
    """Response model for conversation summary endpoint"""
    
    session_id: str
    total_turns: int
    session_duration: float
    intents_discussed: List[str]
    most_common_intent: Optional[str]
    average_confidence: float
    conversation_flow: List[str]
    start_time: str
    last_interaction: Optional[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session456",
                "total_turns": 5,
                "session_duration": 180.5,
                "intents_discussed": ["greet", "platform_overview", "how_to_start"],
                "most_common_intent": "platform_overview",
                "average_confidence": 0.87,
                "conversation_flow": ["greet", "platform_overview", "how_to_start", "skills_and_tests", "certification"],
                "start_time": "2024-01-15T10:30:00Z",
                "last_interaction": "2024-01-15T10:33:00Z"
            }
        }


class UserPreferencesRequest(BaseModel):
    """Request model for updating user preferences"""
    
    session_id: str = Field(
        ...,
        description="Session identifier"
    )
    preferences: Dict[str, Any] = Field(
        ...,
        description="User preferences to update"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session456",
                "preferences": {
                    "skill_area": "programming",
                    "experience_level": "intermediate",
                    "preferred_language": "en"
                }
            }
        }


class SessionStatsResponse(BaseModel):
    """Response model for session statistics"""
    
    total_sessions: int
    active_sessions: int
    total_conversations: int
    average_session_length: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_sessions": 150,
                "active_sessions": 25,
                "total_conversations": 750,
                "average_session_length": 240.5
            }
        }


class ModelInfoResponse(BaseModel):
    """Response model for model information"""
    
    is_initialized: bool
    model_type: str
    spacy_model: Optional[str]
    confidence_threshold: float
    supported_intents: List[str]
    total_intents: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_initialized": True,
                "model_type": "TF-IDF + Naive Bayes Pipeline",
                "spacy_model": "en_core_web_sm",
                "confidence_threshold": 0.7,
                "supported_intents": ["greet", "platform_overview", "how_to_start"],
                "total_intents": 12
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check"""
    
    status: str
    service: str
    version: str
    environment: str
    classifier_ready: bool
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "service": "TalentAI Chatbot",
                "version": "1.0.0",
                "environment": "development",
                "classifier_ready": True
            }
        }


class ErrorResponse(BaseModel):
    """Response model for errors"""
    
    error: str = Field(
        ...,
        description="Error type"
    )
    message: str = Field(
        ...,
        description="Error message"
    )
    request_id: Optional[str] = Field(
        None,
        description="Request identifier for tracking"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Error timestamp"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "validation_error",
                "message": "Message cannot be empty",
                "request_id": "req123",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


# Learning API Models

class FeedbackRequest(BaseModel):
    """Request model for feedback collection"""
    
    conversation_id: int = Field(
        ...,
        description="ID of the conversation to provide feedback for"
    )
    feedback_type: str = Field(
        ...,
        description="Type of feedback: helpful, not_helpful, correction"
    )
    rating: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Rating from 1-5 stars"
    )
    comment: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional comment about the response"
    )
    corrected_intent: Optional[str] = Field(
        None,
        description="Correct intent if the bot was wrong"
    )
    improvement_suggestion: Optional[str] = Field(
        None,
        max_length=500,
        description="Suggestion for improving the response"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 123,
                "feedback_type": "helpful",
                "rating": 4,
                "comment": "Good response but could be more detailed",
                "corrected_intent": None,
                "improvement_suggestion": "Add more specific examples"
            }
        }


class FeedbackResponse(BaseModel):
    """Response model for feedback submission"""
    
    success: bool = Field(
        ...,
        description="Whether feedback was stored successfully"
    )
    feedback_id: int = Field(
        ...,
        description="ID of the stored feedback"
    )
    message: str = Field(
        ...,
        description="Confirmation message"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "feedback_id": 456,
                "message": "Thank you for your feedback! It helps improve our AI."
            }
        }


class LearningStatusResponse(BaseModel):
    """Response model for learning pipeline status"""
    
    is_active: bool = Field(
        ...,
        description="Whether learning pipeline is currently active"
    )
    last_training: Optional[str] = Field(
        None,
        description="Timestamp of last training cycle"
    )
    total_conversations: int = Field(
        ...,
        description="Total conversations processed"
    )
    total_feedback: int = Field(
        ...,
        description="Total feedback collected"
    )
    model_version: Optional[str] = Field(
        None,
        description="Current model version"
    )
    learning_metrics: Dict[str, Any] = Field(
        default={},
        description="Current learning metrics"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_active": False,
                "last_training": "2024-01-15T14:30:00Z",
                "total_conversations": 1250,
                "total_feedback": 89,
                "model_version": "v20240115_143000",
                "learning_metrics": {
                    "accuracy_trend": "improving",
                    "feedback_sentiment": "positive"
                }
            }
        }


class LearningInsightsResponse(BaseModel):
    """Response model for learning insights and analytics"""
    
    intent_performance: List[Dict[str, Any]] = Field(
        default=[],
        description="Performance metrics per intent"
    )
    quality_trends: List[Dict[str, Any]] = Field(
        default=[],
        description="Quality trends over time"
    )
    improvement_suggestions: List[Dict[str, Any]] = Field(
        default=[],
        description="Suggested improvements"
    )
    drift_analysis: Dict[str, Any] = Field(
        default={},
        description="Intent drift analysis"
    )
    generated_at: str = Field(
        ...,
        description="When insights were generated"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "intent_performance": [
                    {
                        "intent": "greet",
                        "frequency": 45,
                        "avg_confidence": 0.92,
                        "positive_feedback": 38
                    }
                ],
                "quality_trends": [
                    {
                        "date": "2024-01-15",
                        "avg_confidence": 0.85,
                        "conversations": 67
                    }
                ],
                "improvement_suggestions": [
                    {
                        "type": "coverage_gap",
                        "intent": "technical_support",
                        "recommendation": "Need more training examples"
                    }
                ],
                "drift_analysis": {
                    "overall_drift_score": 0.12,
                    "drift_level": "low"
                },
                "generated_at": "2024-01-15T15:00:00Z"
            }
        }


class ModelVersionResponse(BaseModel):
    """Response model for model version information"""
    
    version: str = Field(
        ...,
        description="Model version identifier"
    )
    training_accuracy: float = Field(
        ...,
        description="Training accuracy of the model"
    )
    validation_accuracy: float = Field(
        ...,
        description="Validation accuracy of the model"
    )
    training_data_size: int = Field(
        ...,
        description="Size of training dataset"
    )
    created_at: str = Field(
        ...,
        description="When model was created"
    )
    is_active: bool = Field(
        ...,
        description="Whether this model is currently active"
    )
    deployment_strategy: Optional[str] = Field(
        None,
        description="How the model was deployed"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "version": "v20240115_143000",
                "training_accuracy": 0.94,
                "validation_accuracy": 0.87,
                "training_data_size": 1450,
                "created_at": "2024-01-15T14:30:00Z",
                "is_active": True,
                "deployment_strategy": "immediate"
            }
        }


class LearningConfigRequest(BaseModel):
    """Request model for updating learning configuration"""
    
    auto_retrain_threshold: Optional[int] = Field(
        None,
        ge=10,
        le=1000,
        description="Number of conversations to trigger auto-retraining"
    )
    min_feedback_for_retraining: Optional[int] = Field(
        None,
        ge=5,
        le=100,
        description="Minimum feedback examples needed for retraining"
    )
    retrain_interval_hours: Optional[int] = Field(
        None,
        ge=1,
        le=168,
        description="Maximum hours between retraining cycles"
    )
    quality_threshold: Optional[float] = Field(
        None,
        ge=0.1,
        le=1.0,
        description="Minimum data quality threshold for training"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "auto_retrain_threshold": 150,
                "min_feedback_for_retraining": 25,
                "retrain_interval_hours": 48,
                "quality_threshold": 0.75
            }
        } 