"""
Response Generation Module for TalentAI Chatbot

Handles context-aware response generation, conversation flow management,
and personalized responses based on user intent and context.
"""

import logging
import time
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from app.data.responses import (
    get_response, 
    get_contextual_response, 
    get_follow_up_suggestions
)
from app.services.deepseek_service import deepseek_service
from app.core.config import settings


class ResponseGenerator:
    """
    Advanced response generator with context awareness and conversation management
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.conversation_sessions = {}  # In-memory storage for conversation context
        
    async def generate_response(
        self, 
        intent: str, 
        confidence: float,
        user_input: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        additional_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive response based on intent and context
        
        Args:
            intent: Classified intent
            confidence: Confidence score of intent classification
            user_input: Original user input
            user_id: Optional user identifier
            session_id: Optional session identifier
            additional_context: Additional context information
        
        Returns:
            Dictionary containing response and metadata
        """
        try:
            # Create or update session context
            context = await self._build_context(
                user_input, intent, confidence, user_id, session_id, additional_context
            )
            
            # Check if we should use DeepSeek AI fallback
            should_use_deepseek = (
                settings.ENABLE_DEEPSEEK_FALLBACK and  # Check if feature is enabled
                (intent == "fallback" or confidence < settings.FALLBACK_CONFIDENCE_THRESHOLD) 
                and deepseek_service.is_available()
            )
            
            self.logger.debug(f"DeepSeek fallback check - Intent: {intent}, Confidence: {confidence:.3f}, Threshold: {settings.FALLBACK_CONFIDENCE_THRESHOLD}, Enabled: {settings.ENABLE_DEEPSEEK_FALLBACK}, Available: {deepseek_service.is_available()}, Should use: {should_use_deepseek}")
            
            # Try DeepSeek AI fallback first if conditions are met
            if should_use_deepseek:
                self.logger.info(f"🤖 Triggering DeepSeek AI fallback for query: '{user_input[:50]}...' (intent: {intent}, confidence: {confidence:.3f})")
                
                deepseek_response = await deepseek_service.generate_fallback_response(
                    user_input, context
                )
                
                if deepseek_response:
                    # Build comprehensive response with DeepSeek content
                    response = {
                        "response": deepseek_response,
                        "intent": "deepseek_fallback",
                        "confidence": 0.85,  # Set higher confidence for AI-generated response
                        "session_id": session_id or str(uuid.uuid4()),
                        "timestamp": datetime.utcnow().isoformat(),
                        "suggestions": [
                            "Tell me more about that",
                            "What else can you help with?",
                            "How does TalentAI work?"
                        ],
                        "context": {
                            "user_id": user_id,
                            "conversation_turn": context.get("conversation_turn", 1),
                            "session_duration": context.get("session_duration", 0),
                            "powered_by": "DeepSeek AI",
                            "original_intent": intent,
                            "original_confidence": round(confidence, 3)
                        }
                    }
                    
                    # Add personalization elements
                    response = await self._add_personalization(response, context)
                    
                    # Update conversation history
                    await self._update_conversation_history(response, context)
                    
                    self.logger.info(f"✅ DeepSeek fallback response generated successfully for: {user_input[:50]}...")
                    return response
                else:
                    self.logger.warning("⚠️ DeepSeek AI returned empty response, falling back to standard response")
            else:
                if intent == "fallback" or confidence < settings.FALLBACK_CONFIDENCE_THRESHOLD:
                    if not settings.ENABLE_DEEPSEEK_FALLBACK:
                        self.logger.debug("🔄 DeepSeek fallback disabled in settings, using standard fallback")
                    elif not deepseek_service.is_available():
                        self.logger.warning("⚠️ DeepSeek service not available, using standard fallback")
            
            # Generate standard response if DeepSeek is not used or failed
            response_text = get_contextual_response(intent, context, confidence)
            
            # Get follow-up suggestions
            suggestions = get_follow_up_suggestions(intent)
            
            # Build comprehensive response
            response = {
                "response": response_text,
                "intent": intent,
                "confidence": round(confidence, 3),
                "session_id": session_id or str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "suggestions": suggestions[:3] if suggestions else [],
                "context": {
                    "user_id": user_id,
                    "conversation_turn": context.get("conversation_turn", 1),
                    "session_duration": context.get("session_duration", 0)
                }
            }
            
            # Add personalization elements
            response = await self._add_personalization(response, context)
            
            # Update conversation history
            await self._update_conversation_history(response, context)
            
            self.logger.debug(f"Generated response for intent: {intent}")
            return response
            
        except Exception as e:
            self.logger.error(f"Error generating response: {str(e)}")
            return await self._generate_error_response(session_id)
    
    async def _build_context(
        self,
        user_input: str,
        intent: str,
        confidence: float,
        user_id: Optional[str],
        session_id: Optional[str],
        additional_context: Optional[Dict]
    ) -> Dict[str, Any]:
        """Build comprehensive context for response generation"""
        
        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Get or create session data
        session_data = self.conversation_sessions.get(session_id, {
            "start_time": time.time(),
            "conversation_history": [],
            "user_preferences": {},
            "session_metadata": {}
        })
        
        # Calculate session duration
        session_duration = time.time() - session_data["start_time"]
        
        # Build context
        context = {
            "user_id": user_id,
            "session_id": session_id,
            "original_text": user_input,
            "current_intent": intent,
            "confidence": confidence,
            "conversation_turn": len(session_data["conversation_history"]) + 1,
            "session_duration": round(session_duration, 2),
            "session_history": session_data["conversation_history"],
            "user_preferences": session_data.get("user_preferences", {}),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add additional context if provided
        if additional_context:
            context.update(additional_context)
        
        # Store session data
        self.conversation_sessions[session_id] = session_data
        
        return context
    
    async def _add_personalization(self, response: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Add personalization elements to the response"""
        
        # Get conversation turn number
        turn_number = context.get("conversation_turn", 1)
        intent = response["intent"]
        
        # First-time user greeting
        if turn_number == 1 and intent == "greet":
            response["response"] += "\n\n💡 **Quick tip:** You can ask me about getting started, available skills, or how our certification works!"
        
        # Add contextual help for certain intents
        if intent == "fallback" and turn_number > 1:
            recent_intents = [
                msg.get("intent") for msg in context.get("session_history", [])[-3:]
            ]
            
            if "platform_overview" in recent_intents:
                response["response"] += "\n\n**Maybe you'd like to know:** How to get started with skill testing?"
        
        # Add encouragement for long sessions
        session_duration = context.get("session_duration", 0)
        if session_duration > 300:  # 5 minutes
            response["context"]["session_note"] = "You've been exploring for a while! Feel free to ask if you need help finding something specific."
        
        # Add user-specific information if available
        user_preferences = context.get("user_preferences", {})
        if user_preferences.get("skill_area"):
            skill_area = user_preferences["skill_area"]
            if intent == "skills_and_tests":
                response["response"] += f"\n\n🎯 **Personalized for you:** Since you're interested in {skill_area}, you might want to explore our {skill_area} certification paths!"
        
        return response
    
    async def _update_conversation_history(self, response: Dict[str, Any], context: Dict[str, Any]) -> None:
        """Update conversation history with current interaction"""
        
        session_id = context.get("session_id")
        if not session_id:
            return
        
        # Create history entry
        history_entry = {
            "timestamp": response["timestamp"],
            "user_input": context.get("original_text", ""),
            "intent": response["intent"],
            "confidence": response["confidence"],
            "bot_response": response["response"][:100] + "..." if len(response["response"]) > 100 else response["response"],
            "suggestions_provided": response.get("suggestions", [])
        }
        
        # Update session data
        if session_id in self.conversation_sessions:
            self.conversation_sessions[session_id]["conversation_history"].append(history_entry)
            
            # Limit history to last 10 interactions to prevent memory issues
            if len(self.conversation_sessions[session_id]["conversation_history"]) > 10:
                self.conversation_sessions[session_id]["conversation_history"] = \
                    self.conversation_sessions[session_id]["conversation_history"][-10:]
    
    async def _generate_error_response(self, session_id: Optional[str]) -> Dict[str, Any]:
        """Generate a fallback error response"""
        return {
            "response": "I apologize, but I'm experiencing some technical difficulties. Please try again, or feel free to ask me about TalentAI's features, getting started, or our certification process.",
            "intent": "error",
            "confidence": 0.0,
            "session_id": session_id or str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "suggestions": [
                "What is TalentAI?",
                "How do I get started?",
                "Technical support"
            ],
            "context": {
                "error": True,
                "conversation_turn": 1
            }
        }
    
    async def get_conversation_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a summary of the conversation session"""
        
        session_data = self.conversation_sessions.get(session_id)
        if not session_data:
            return None
        
        history = session_data.get("conversation_history", [])
        if not history:
            return None
        
        # Analyze conversation patterns
        intents_discussed = [entry["intent"] for entry in history]
        unique_intents = list(set(intents_discussed))
        
        # Calculate session metrics
        session_duration = time.time() - session_data["start_time"]
        total_turns = len(history)
        avg_confidence = sum(entry["confidence"] for entry in history) / total_turns if total_turns > 0 else 0
        
        return {
            "session_id": session_id,
            "total_turns": total_turns,
            "session_duration": round(session_duration, 2),
            "intents_discussed": unique_intents,
            "most_common_intent": max(set(intents_discussed), key=intents_discussed.count) if intents_discussed else None,
            "average_confidence": round(avg_confidence, 3),
            "conversation_flow": [entry["intent"] for entry in history],
            "start_time": datetime.fromtimestamp(session_data["start_time"]).isoformat(),
            "last_interaction": history[-1]["timestamp"] if history else None
        }
    
    async def update_user_preferences(self, session_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences for personalization"""
        
        if session_id not in self.conversation_sessions:
            return False
        
        try:
            current_prefs = self.conversation_sessions[session_id].get("user_preferences", {})
            current_prefs.update(preferences)
            self.conversation_sessions[session_id]["user_preferences"] = current_prefs
            
            self.logger.debug(f"Updated preferences for session {session_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error updating user preferences: {str(e)}")
            return False
    
    async def clear_session(self, session_id: str) -> bool:
        """Clear a conversation session"""
        
        try:
            if session_id in self.conversation_sessions:
                del self.conversation_sessions[session_id]
                self.logger.debug(f"Cleared session {session_id}")
                return True
            return False
            
        except Exception as e:
            self.logger.error(f"Error clearing session: {str(e)}")
            return False
    
    async def cleanup_old_sessions(self, max_age_hours: int = 24) -> int:
        """Clean up old conversation sessions"""
        
        try:
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            sessions_to_remove = []
            
            for session_id, session_data in self.conversation_sessions.items():
                session_age = current_time - session_data["start_time"]
                if session_age > max_age_seconds:
                    sessions_to_remove.append(session_id)
            
            for session_id in sessions_to_remove:
                del self.conversation_sessions[session_id]
            
            self.logger.info(f"Cleaned up {len(sessions_to_remove)} old sessions")
            return len(sessions_to_remove)
            
        except Exception as e:
            self.logger.error(f"Error cleaning up sessions: {str(e)}")
            return 0
    
    def get_active_sessions_count(self) -> int:
        """Get the number of active conversation sessions"""
        return len(self.conversation_sessions)
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get statistics about conversation sessions"""
        
        if not self.conversation_sessions:
            return {
                "total_sessions": 0,
                "active_sessions": 0,
                "total_conversations": 0,
                "average_session_length": 0
            }
        
        total_conversations = sum(
            len(session_data.get("conversation_history", []))
            for session_data in self.conversation_sessions.values()
        )
        
        current_time = time.time()
        session_durations = [
            current_time - session_data["start_time"]
            for session_data in self.conversation_sessions.values()
        ]
        
        avg_duration = sum(session_durations) / len(session_durations) if session_durations else 0
        
        return {
            "total_sessions": len(self.conversation_sessions),
            "active_sessions": len(self.conversation_sessions),
            "total_conversations": total_conversations,
            "average_session_length": round(avg_duration, 2)
        } 