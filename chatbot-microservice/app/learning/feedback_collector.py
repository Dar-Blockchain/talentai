"""
Feedback Collector

Advanced feedback collection and processing system for gathering
user interactions, ratings, corrections, and improvement suggestions.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime


class FeedbackCollector:
    """
    Advanced feedback collector with smart feedback processing
    """
    
    def __init__(self, learning_db):
        self.logger = logging.getLogger(__name__)
        self.learning_db = learning_db
        
    async def collect_implicit_feedback(
        self,
        conversation_id: int,
        user_behavior: Dict[str, Any]
    ) -> bool:
        """
        Collect implicit feedback from user behavior
        """
        try:
            # Analyze user behavior patterns
            feedback_type = self._analyze_behavior(user_behavior)
            
            if feedback_type:
                await self.learning_db.store_feedback(
                    conversation_id=conversation_id,
                    feedback_type=feedback_type,
                    comment=f"Implicit feedback from behavior: {user_behavior.get('action', 'unknown')}"
                )
                
                self.logger.debug(f"Stored implicit feedback: {feedback_type} for conversation {conversation_id}")
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"Error collecting implicit feedback: {str(e)}")
            return False
    
    def _analyze_behavior(self, behavior: Dict[str, Any]) -> Optional[str]:
        """Analyze user behavior to infer feedback"""
        
        action = behavior.get('action')
        duration = behavior.get('duration', 0)
        follow_up = behavior.get('follow_up_question', False)
        
        # Quick exit suggests unhelpful response
        if action == 'session_end' and duration < 5:
            return 'not_helpful'
        
        # Follow-up questions suggest helpful response
        if follow_up or action == 'continue_conversation':
            return 'helpful'
        
        # Long engagement suggests helpful response
        if duration > 30:
            return 'helpful'
        
        return None 