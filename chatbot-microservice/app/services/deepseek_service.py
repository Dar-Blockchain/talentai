"""
DeepSeek AI Service for Fallback Responses

Integrates with Together AI to provide intelligent fallback responses
when the chatbot doesn't understand user queries.
"""

import logging
import asyncio
from typing import Optional, Dict, Any
from together import Together

from app.core.config import settings


class DeepSeekService:
    """Service for handling DeepSeek AI fallback responses"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.client = None
        self.is_enabled = settings.ENABLE_DEEPSEEK_FALLBACK
        
        if self.is_enabled and settings.TOGETHER_API_KEY:
            try:
                self.client = Together(api_key=settings.TOGETHER_API_KEY)
                self.logger.info("✅ DeepSeek AI service initialized successfully")
            except Exception as e:
                self.logger.error(f"❌ Failed to initialize DeepSeek AI service: {str(e)}")
                self.is_enabled = False
        elif not settings.TOGETHER_API_KEY:
            self.logger.warning("⚠️ TOGETHER_API_KEY not configured - DeepSeek fallback disabled")
            self.is_enabled = False
    
    async def generate_fallback_response(
        self, 
        user_input: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """
        Generate an intelligent fallback response using DeepSeek AI
        
        Args:
            user_input: The user's original input
            context: Optional context from the conversation
            
        Returns:
            Generated response or None if service unavailable
        """
        if not self.is_enabled or not self.client:
            return None
        
        try:
            # Build context-aware prompt
            prompt = self._build_prompt(user_input, context)
            
            # Generate response using DeepSeek
            response = await self._call_deepseek(prompt)
            
            if response:
                self.logger.info(f"🤖 DeepSeek fallback response generated for: {user_input[:50]}...")
                return response
            
        except Exception as e:
            self.logger.error(f"❌ DeepSeek AI error: {str(e)}")
        
        return None
    
    def _build_prompt(self, user_input: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Build a context-aware prompt for DeepSeek AI"""
        
        # Base system context about TalentAI
        system_context = """You are TalentAI Assistant, a helpful AI chatbot for a recruitment and skill certification platform called TalentAI. 

TalentAI is an innovative platform that:
- Offers AI-powered skill assessments and tests
- Provides blockchain-secured certifications on Hedera network
- Enables intelligent talent-job matching
- Supports various skills: programming, data science, soft skills, languages
- Helps candidates showcase verified skills to recruiters
- Offers instant scoring and detailed analytics

Key features:
- Skill testing in 50+ categories
- Immutable blockchain certificates
- AI-driven recruitment matching
- Real-time performance analytics
- Free account registration
- 24/7 platform availability

Your role is to be helpful, informative, and encouraging. Always relate responses back to TalentAI's capabilities when relevant."""

        # Add conversation context if available
        conversation_context = ""
        if context:
            session_history = context.get("session_history", [])
            if session_history:
                recent_interactions = session_history[-3:]  # Last 3 interactions
                conversation_context = "\nRecent conversation:\n"
                for interaction in recent_interactions:
                    user_msg = interaction.get("user_input", "")
                    bot_msg = interaction.get("bot_response", "")
                    if user_msg and bot_msg:
                        conversation_context += f"User: {user_msg}\nBot: {bot_msg[:100]}...\n"
        
        # Build the full prompt
        prompt = f"""{system_context}

{conversation_context}

Current user message: "{user_input}"

Please provide a helpful, informative response that addresses the user's question or concern. If the question is about TalentAI features, explain them clearly. If it's a general question, provide a useful answer while gently relating it back to skill development or career growth when appropriate.

Keep the response conversational, encouraging, and under 200 words. Use emojis appropriately to make the response engaging."""

        return prompt
    
    async def _call_deepseek(self, prompt: str) -> Optional[str]:
        """Make async call to DeepSeek AI via Together API"""
        
        try:
            # Create completion
            response = await asyncio.to_thread(
                self._sync_call_deepseek,
                prompt
            )
            return response
        except Exception as e:
            self.logger.error(f"DeepSeek API call failed: {str(e)}")
            return None
    
    def _sync_call_deepseek(self, prompt: str) -> Optional[str]:
        """Synchronous call to DeepSeek AI"""
        
        try:
            stream = self.client.chat.completions.create(
                model=settings.DEEPSEEK_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are TalentAI Assistant, a helpful and knowledgeable AI chatbot for a skill certification platform. Provide concise, helpful responses."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=settings.DEEPSEEK_MAX_TOKENS,
                temperature=settings.DEEPSEEK_TEMPERATURE,
                top_p=0.9,
                stream=True
            )
            
            # Collect streaming response
            response_text = ""
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    response_text += content
            
            return response_text.strip() if response_text else None
            
        except Exception as e:
            self.logger.error(f"DeepSeek sync call error: {str(e)}")
            return None
    
    def is_available(self) -> bool:
        """Check if the DeepSeek service is available"""
        return self.is_enabled and self.client is not None
    
    def is_ready(self) -> bool:
        """Check if the DeepSeek service is ready (alias for is_available)"""
        return self.is_available()
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get service information"""
        return {
            "enabled": self.is_enabled,
            "model": settings.DEEPSEEK_MODEL,
            "api_configured": bool(settings.TOGETHER_API_KEY),
            "max_tokens": settings.DEEPSEEK_MAX_TOKENS,
            "temperature": settings.DEEPSEEK_TEMPERATURE,
            "fallback_threshold": settings.FALLBACK_CONFIDENCE_THRESHOLD
        }
    
    def reinitialize(self) -> bool:
        """Reinitialize the service with current settings"""
        self.is_enabled = settings.ENABLE_DEEPSEEK_FALLBACK
        
        if self.is_enabled and settings.TOGETHER_API_KEY:
            try:
                self.client = Together(api_key=settings.TOGETHER_API_KEY)
                self.logger.info("✅ DeepSeek AI service reinitialized successfully")
                return True
            except Exception as e:
                self.logger.error(f"❌ Failed to reinitialize DeepSeek AI service: {str(e)}")
                self.is_enabled = False
                self.client = None
                return False
        else:
            self.logger.warning("⚠️ DeepSeek service disabled due to missing configuration")
            self.is_enabled = False
            self.client = None
            return False


# Global service instance
deepseek_service = DeepSeekService() 