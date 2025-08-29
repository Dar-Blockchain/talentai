"""
API Routes for TalentAI Chatbot Microservice
"""

import logging
import uuid
import time
from typing import Dict, Any, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse

from app.api.models import (
    ChatRequest,
    ChatResponse,
    IntentAnalysisRequest,
    IntentAnalysisResponse,
    ConversationSummaryResponse,
    UserPreferencesRequest,
    SessionStatsResponse,
    ModelInfoResponse,
    ErrorResponse,
    FeedbackRequest,
    FeedbackResponse,
    LearningStatusResponse,
    LearningInsightsResponse,
    ModelVersionResponse,
    LearningConfigRequest
)
from app.core.response_generator import ResponseGenerator

# Create router
router = APIRouter()

# Global response generator instance
response_generator = ResponseGenerator()

# Logger
logger = logging.getLogger(__name__)

# Import DeepSeek service
from app.services.deepseek_service import deepseek_service


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with TalentAI Assistant",
    description="Send a message to the TalentAI chatbot and receive an intelligent response with intent classification and context awareness."
)
async def chat(request: ChatRequest, fastapi_request: Request) -> ChatResponse:
    """
    Main chat endpoint for interacting with TalentAI chatbot
    """
    start_time = time.time()
    
    try:
        # Get classifier from app state
        classifier = getattr(fastapi_request.app.state, 'classifier', None)
        if not classifier:
            raise HTTPException(
                status_code=503,
                detail="Chatbot service is not ready. Please try again later."
            )
        
        # Get learning pipeline (optional)
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        
        # Add request ID for tracking
        request_id = str(uuid.uuid4())
        
        # Preprocess input for learning
        preprocessed_input = await classifier._preprocess_text(request.message)
        
        # Classify intent
        intent, confidence = await classifier.classify_intent(
            request.message,
            context={
                "user_id": request.user_id,
                "session_id": request.session_id,
                "request_id": request_id,
                **(request.context or {})
            }
        )
        
        # Generate response
        response = await response_generator.generate_response(
            intent=intent,
            confidence=confidence,
            user_input=request.message,
            user_id=request.user_id,
            session_id=request.session_id,
            additional_context=request.context
        )
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Store conversation for learning (if learning pipeline is available)
        conversation_id = None
        if learning_pipeline:
            try:
                conversation_id = await learning_pipeline.process_conversation(
                    session_id=response.get('session_id', ''),
                    user_id=request.user_id,
                    user_input=request.message,
                    preprocessed_input=preprocessed_input,
                    predicted_intent=intent,
                    confidence=confidence,
                    response=response.get('response', ''),
                    response_time=response_time,
                    context_data={
                        'request_id': request_id,
                        'original_context': request.context or {},
                        'response_context': response.get('context', {})
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to store conversation for learning: {str(e)}")
        
        # Add conversation ID to response context for feedback
        if conversation_id and conversation_id > 0:
            response['context']['conversation_id'] = conversation_id
        
        logger.info(f"Chat response generated - Intent: {intent}, Confidence: {confidence:.3f}, Time: {response_time:.3f}s")
        
        return ChatResponse(**response)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your message. Please try again."
        )


@router.post(
    "/analyze-intent",
    response_model=IntentAnalysisResponse,
    summary="Analyze Text Intent",
    description="Analyze text to classify intent and get confidence scores for all possible intents."
)
async def analyze_intent(request: IntentAnalysisRequest, fastapi_request: Request) -> IntentAnalysisResponse:
    """
    Analyze text for intent classification without generating a response
    """
    try:
        classifier = getattr(fastapi_request.app.state, 'classifier', None)
        if not classifier:
            raise HTTPException(
                status_code=503,
                detail="Intent classifier is not ready"
            )
        
        # Get primary intent
        intent, confidence = await classifier.classify_intent(request.text)
        
        # Get all intent probabilities
        all_intents = await classifier.get_intent_probabilities(request.text)
        
        return IntentAnalysisResponse(
            intent=intent,
            confidence=confidence,
            all_intents=all_intents
        )
        
    except Exception as e:
        logger.error(f"Error in analyze intent endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while analyzing intent"
        )


@router.get(
    "/conversation/{session_id}/summary",
    response_model=ConversationSummaryResponse,
    summary="Get Conversation Summary",
    description="Get a detailed summary of a conversation session including metrics and analysis."
)
async def get_conversation_summary(session_id: str) -> ConversationSummaryResponse:
    """
    Get conversation summary for a specific session
    """
    try:
        summary = await response_generator.get_conversation_summary(session_id)
        
        if not summary:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation session {session_id} not found"
            )
        
        return ConversationSummaryResponse(**summary)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving conversation summary"
        )


@router.put(
    "/conversation/preferences",
    summary="Update User Preferences",
    description="Update user preferences for personalized responses."
)
async def update_user_preferences(request: UserPreferencesRequest) -> Dict[str, Any]:
    """
    Update user preferences for personalization
    """
    try:
        success = await response_generator.update_user_preferences(
            request.session_id,
            request.preferences
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Session {request.session_id} not found"
            )
        
        return {
            "success": True,
            "message": "User preferences updated successfully",
            "session_id": request.session_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user preferences: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating preferences"
        )


@router.delete(
    "/conversation/{session_id}",
    summary="Clear Conversation Session",
    description="Clear a specific conversation session and its history."
)
async def clear_conversation_session(session_id: str) -> Dict[str, Any]:
    """
    Clear a conversation session
    """
    try:
        success = await response_generator.clear_session(session_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Session {session_id} not found"
            )
        
        return {
            "success": True,
            "message": f"Session {session_id} cleared successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while clearing session"
        )


@router.get(
    "/sessions/stats",
    response_model=SessionStatsResponse,
    summary="Get Session Statistics",
    description="Get statistics about active conversation sessions."
)
async def get_session_stats() -> SessionStatsResponse:
    """
    Get session statistics
    """
    try:
        stats = response_generator.get_session_stats()
        return SessionStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error getting session stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving session statistics"
        )


@router.post(
    "/sessions/cleanup",
    summary="Cleanup Old Sessions",
    description="Clean up old conversation sessions to free memory."
)
async def cleanup_old_sessions(
    background_tasks: BackgroundTasks,
    max_age_hours: int = 24
) -> Dict[str, Any]:
    """
    Clean up old sessions in the background
    """
    try:
        # Run cleanup in background
        background_tasks.add_task(
            response_generator.cleanup_old_sessions,
            max_age_hours
        )
        
        return {
            "success": True,
            "message": f"Cleanup task started for sessions older than {max_age_hours} hours"
        }
        
    except Exception as e:
        logger.error(f"Error starting cleanup task: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while starting cleanup task"
        )


@router.get(
    "/model/info",
    response_model=ModelInfoResponse,
    summary="Get Model Information",
    description="Get information about the current NLP model and its configuration."
)
async def get_model_info(fastapi_request: Request) -> ModelInfoResponse:
    """
    Get information about the current model
    """
    try:
        classifier = getattr(fastapi_request.app.state, 'classifier', None)
        if not classifier:
            raise HTTPException(
                status_code=503,
                detail="Model is not ready"
            )
        
        model_info = classifier.get_model_info()
        return ModelInfoResponse(**model_info)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving model information"
        )


@router.post(
    "/model/retrain",
    summary="Retrain Model",
    description="Retrain the intent classification model with current training data."
)
async def retrain_model(
    fastapi_request: Request,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Retrain the intent classification model
    """
    try:
        classifier = getattr(fastapi_request.app.state, 'classifier', None)
        if not classifier:
            raise HTTPException(
                status_code=503,
                detail="Model is not ready"
            )
        
        # Run retraining in background
        background_tasks.add_task(classifier.retrain_model)
        
        return {
            "success": True,
            "message": "Model retraining started in background"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting model retrain: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while starting model retraining"
        )


@router.get(
    "/intents",
    summary="Get Available Intents",
    description="Get list of all supported intents and their descriptions."
)
async def get_available_intents() -> Dict[str, Any]:
    """
    Get list of available intents
    """
    try:
        from app.data.intents import get_intent_descriptions, get_intents_list
        
        intents = get_intents_list()
        descriptions = get_intent_descriptions()
        
        return {
            "intents": intents,
            "descriptions": descriptions,
            "total_intents": len(intents)
        }
        
    except Exception as e:
        logger.error(f"Error getting intents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving intents"
        )


# Learning API Endpoints

@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    summary="Submit Feedback",
    description="Submit feedback for a conversation to help improve the chatbot."
)
async def submit_feedback(request: FeedbackRequest, fastapi_request: Request) -> FeedbackResponse:
    """
    Submit user feedback for a conversation
    """
    try:
        # Get learning pipeline from app state
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        # Process feedback
        feedback_id = await learning_pipeline.process_feedback(
            conversation_id=request.conversation_id,
            feedback_type=request.feedback_type,
            rating=request.rating,
            comment=request.comment,
            corrected_intent=request.corrected_intent,
            improvement_suggestion=request.improvement_suggestion
        )
        
        if feedback_id <= 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to store feedback"
            )
        
        # Generate thank you message
        thank_you_messages = {
            'helpful': "Thank you for the positive feedback! It helps us improve.",
            'not_helpful': "Thank you for letting us know. We'll work on improving this response.",
            'correction': "Thank you for the correction! This helps train our AI better."
        }
        
        message = thank_you_messages.get(
            request.feedback_type, 
            "Thank you for your feedback! It helps improve our AI."
        )
        
        return FeedbackResponse(
            success=True,
            feedback_id=feedback_id,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while submitting feedback"
        )


@router.get(
    "/learning/status",
    response_model=LearningStatusResponse,
    summary="Get Learning Status",
    description="Get current status of the learning pipeline including metrics and progress."
)
async def get_learning_status(fastapi_request: Request) -> LearningStatusResponse:
    """
    Get comprehensive learning pipeline status
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        status = await learning_pipeline.get_learning_status()
        
        # Convert to response model format
        return LearningStatusResponse(
            is_active=status.get('is_active', False),
            last_training=status.get('last_training'),
            total_conversations=status.get('metrics', {}).get('total_conversations', 0),
            total_feedback=status.get('metrics', {}).get('total_feedback', 0),
            model_version=status.get('model_status', {}).get('current_model'),
            learning_metrics=status.get('metrics', {})
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting learning status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving learning status"
        )


@router.get(
    "/learning/insights",
    response_model=LearningInsightsResponse,
    summary="Get Learning Insights",
    description="Get detailed analytics and insights about the learning pipeline performance."
)
async def get_learning_insights(fastapi_request: Request) -> LearningInsightsResponse:
    """
    Get learning insights and analytics
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        insights = await learning_pipeline.db.get_learning_insights()
        
        return LearningInsightsResponse(
            intent_performance=insights.get('intent_performance', []),
            quality_trends=insights.get('daily_trends', []),
            improvement_suggestions=[],  # Would be populated from data processor
            drift_analysis={},  # Would be populated from recent analysis
            generated_at=insights.get('generated_at', datetime.utcnow().isoformat())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting learning insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving learning insights"
        )


@router.post(
    "/learning/retrain",
    summary="Trigger Manual Retraining",
    description="Manually trigger a learning cycle to retrain the model with current data."
)
async def trigger_manual_retrain(
    fastapi_request: Request,
    background_tasks: BackgroundTasks,
    force: bool = False
) -> Dict[str, Any]:
    """
    Manually trigger model retraining
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        # Trigger learning cycle in background
        result = await learning_pipeline.manual_learning_cycle(force=force)
        
        if 'error' in result:
            raise HTTPException(
                status_code=409,
                detail=result['error']
            )
        
        return {
            "success": True,
            "message": "Manual retraining triggered successfully",
            "background_task": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering manual retrain: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while triggering retraining"
        )


@router.get(
    "/learning/models",
    response_model=List[ModelVersionResponse],
    summary="Get Model Versions",
    description="Get information about all available model versions."
)
async def get_model_versions(fastapi_request: Request) -> List[ModelVersionResponse]:
    """
    Get all available model versions
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        model_status = learning_pipeline.model_manager.get_model_status()
        versions = []
        
        # This would typically query the database for model versions
        for version in model_status.get('available_versions', []):
            if version in learning_pipeline.model_manager.model_versions:
                model_info = learning_pipeline.model_manager.model_versions[version]['info']
                
                versions.append(ModelVersionResponse(
                    version=version,
                    training_accuracy=model_info.get('validation_accuracy', 0.0),
                    validation_accuracy=model_info.get('validation_accuracy', 0.0),
                    training_data_size=model_info.get('training_data_size', 0),
                    created_at=model_info.get('created_at', ''),
                    is_active=version == model_status.get('current_model'),
                    deployment_strategy=model_info.get('deployment_strategy')
                ))
        
        return versions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model versions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving model versions"
        )


@router.post(
    "/learning/config",
    summary="Update Learning Configuration",
    description="Update learning pipeline configuration parameters."
)
async def update_learning_config(
    request: LearningConfigRequest,
    fastapi_request: Request
) -> Dict[str, Any]:
    """
    Update learning pipeline configuration
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        # Convert request to config updates dict
        config_updates = {}
        for field, value in request.dict(exclude_none=True).items():
            config_updates[field] = value
        
        success = await learning_pipeline.update_learning_config(config_updates)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to update learning configuration"
            )
        
        return {
            "success": True,
            "message": "Learning configuration updated successfully",
            "updated_config": config_updates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating learning config: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating learning configuration"
        )


@router.post(
    "/learning/rollback/{model_version}",
    summary="Rollback Model",
    description="Rollback to a previous model version."
)
async def rollback_model(
    model_version: str,
    fastapi_request: Request
) -> Dict[str, Any]:
    """
    Rollback to a specific model version
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        success = await learning_pipeline.model_manager.rollback_model(model_version)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Model version {model_version} not found or rollback failed"
            )
        
        return {
            "success": True,
            "message": f"Successfully rolled back to model version {model_version}",
            "active_model": model_version
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rolling back model: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while rolling back model"
        )


@router.get(
    "/learning/ab-test",
    summary="Get A/B Test Status",
    description="Get current A/B test status and results."
)
async def get_ab_test_status(fastapi_request: Request) -> Dict[str, Any]:
    """
    Get A/B test status and results
    """
    try:
        learning_pipeline = getattr(fastapi_request.app.state, 'learning_pipeline', None)
        if not learning_pipeline:
            raise HTTPException(
                status_code=503,
                detail="Learning system is not available"
            )
        
        ab_results = await learning_pipeline.model_manager.analyze_ab_test()
        
        if not ab_results:
            return {
                "active": False,
                "message": "No A/B test currently running"
            }
        
        return {
            "active": True,
            "results": ab_results
        }
        
    except Exception as e:
        logger.error(f"Error getting A/B test status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving A/B test status"
        )


@router.get(
    "/deepseek/status",
    summary="Get DeepSeek AI Service Status",
    description="Get status and configuration information about the DeepSeek AI fallback service."
)
async def get_deepseek_status() -> Dict[str, Any]:
    """
    Get DeepSeek AI service status and configuration
    """
    try:
        # Reinitialize service to ensure latest configuration
        deepseek_service.reinitialize()
        
        service_info = deepseek_service.get_service_info()
        
        return {
            "service": "DeepSeek AI Fallback",
            "status": "available" if deepseek_service.is_available() else "unavailable",
            "configuration": service_info,
            "description": "Provides intelligent fallback responses using DeepSeek R1 Distill model when chatbot confidence is low"
        }
        
    except Exception as e:
        logger.error(f"Error getting DeepSeek status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving DeepSeek service status"
        )


@router.post(
    "/deepseek/toggle",
    summary="Toggle DeepSeek AI Service",
    description="Enable or disable the DeepSeek AI fallback service."
)
async def toggle_deepseek_service(enabled: bool) -> Dict[str, Any]:
    """
    Toggle DeepSeek AI service on/off
    """
    try:
        # Update the global settings
        settings.ENABLE_DEEPSEEK_FALLBACK = enabled
        
        # Reinitialize the service with new settings
        success = deepseek_service.reinitialize()
        
        if enabled and not success:
            return {
                "success": False,
                "message": "Failed to enable DeepSeek AI - check API key configuration",
                "status": "unavailable",
                "enabled": False,
                "api_key_configured": bool(settings.TOGETHER_API_KEY)
            }
        
        status = "enabled" if deepseek_service.is_available() else "disabled"
        
        logger.info(f"DeepSeek AI service {status} by user request")
        
        return {
            "success": True,
            "message": f"DeepSeek AI service has been {status}",
            "status": status,
            "enabled": deepseek_service.is_available(),
            "api_key_configured": bool(settings.TOGETHER_API_KEY)
        }
        
    except Exception as e:
        logger.error(f"Error toggling DeepSeek service: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while toggling DeepSeek service"
        )


@router.post(
    "/deepseek/test",
    summary="Test DeepSeek AI Service", 
    description="Test the DeepSeek AI service with a sample query."
)
async def test_deepseek_service(test_query: str = "What is artificial intelligence?") -> Dict[str, Any]:
    """
    Test DeepSeek AI service with a sample query
    """
    try:
        if not deepseek_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="DeepSeek service is not available. Check configuration and API key."
            )
        
        # Generate test response
        test_response = await deepseek_service.generate_fallback_response(
            test_query, 
            {"conversation_turn": 1, "session_history": []}
        )
        
        if test_response:
            return {
                "success": True,
                "test_query": test_query,
                "test_response": test_response,
                "service_status": "working",
                "response_length": len(test_response)
            }
        else:
            return {
                "success": False,
                "test_query": test_query,
                "test_response": None,
                "service_status": "error",
                "message": "DeepSeek service returned empty response"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing DeepSeek service: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while testing DeepSeek service: {str(e)}"
        ) 