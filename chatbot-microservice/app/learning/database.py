"""
Learning Database Module

Manages persistent storage for conversations, feedback, model versions,
and learning analytics with SQLite backend.
"""

import sqlite3
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from contextlib import contextmanager
import os
from app.core.config import settings


class LearningDatabase:
    """
    Advanced learning database with comprehensive conversation and feedback tracking
    """
    
    def __init__(self, db_path: str = "learning/chatbot_learning.db"):
        self.db_path = os.path.join(settings.MODEL_PATH, db_path)
        self.logger = logging.getLogger(__name__)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        self._setup_database()
    
    def _setup_database(self):
        """Setup database schema with all required tables"""
        with self._get_connection() as conn:
            # Conversations table - stores all chat interactions
            conn.execute('''
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    user_id TEXT,
                    user_input TEXT NOT NULL,
                    preprocessed_input TEXT,
                    predicted_intent TEXT NOT NULL,
                    actual_intent TEXT,  -- For correction/validation
                    confidence REAL NOT NULL,
                    response TEXT NOT NULL,
                    response_time REAL,
                    context_data TEXT,  -- JSON string
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Feedback table - user feedback on responses
            conn.execute('''
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id INTEGER NOT NULL,
                    feedback_type TEXT NOT NULL,  -- helpful/not_helpful/correction
                    rating INTEGER,  -- 1-5 scale
                    comment TEXT,
                    corrected_intent TEXT,  -- User-provided correct intent
                    improvement_suggestion TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
                )
            ''')
            
            # Model versions table - track model evolution
            conn.execute('''
                CREATE TABLE IF NOT EXISTS model_versions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version TEXT UNIQUE NOT NULL,
                    model_path TEXT NOT NULL,
                    vectorizer_path TEXT NOT NULL,
                    training_data_size INTEGER,
                    validation_accuracy REAL,
                    test_accuracy REAL,
                    training_config TEXT,  -- JSON string
                    performance_metrics TEXT,  -- JSON string
                    is_active BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    deployed_at DATETIME
                )
            ''')
            
            # Training data table - curated training examples
            conn.execute('''
                CREATE TABLE IF NOT EXISTS training_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT NOT NULL,
                    intent TEXT NOT NULL,
                    source TEXT NOT NULL,  -- original/conversation/manual
                    quality_score REAL DEFAULT 1.0,
                    validation_status TEXT DEFAULT 'pending',  -- pending/approved/rejected
                    conversation_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    validated_at DATETIME,
                    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
                )
            ''')
            
            # Learning metrics table - track learning performance
            conn.execute('''
                CREATE TABLE IF NOT EXISTS learning_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    metric_data TEXT,  -- JSON string for complex metrics
                    model_version TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indexes for performance
            conn.execute('CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_conversations_intent ON conversations(predicted_intent)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_feedback_conversation ON feedback(conversation_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_training_data_intent ON training_data(intent)')
            
            conn.commit()
            self.logger.info("✅ Learning database initialized successfully")
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        try:
            yield conn
        finally:
            conn.close()
    
    async def store_conversation(
        self,
        session_id: str,
        user_id: Optional[str],
        user_input: str,
        preprocessed_input: str,
        predicted_intent: str,
        confidence: float,
        response: str,
        response_time: float,
        context_data: Dict[str, Any]
    ) -> int:
        """Store a conversation interaction"""
        with self._get_connection() as conn:
            cursor = conn.execute('''
                INSERT INTO conversations 
                (session_id, user_id, user_input, preprocessed_input, predicted_intent, 
                 confidence, response, response_time, context_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                session_id, user_id, user_input, preprocessed_input, 
                predicted_intent, confidence, response, response_time,
                json.dumps(context_data)
            ))
            
            conversation_id = cursor.lastrowid
            conn.commit()
            
            self.logger.debug(f"Stored conversation {conversation_id}")
            return conversation_id
    
    async def store_feedback(
        self,
        conversation_id: int,
        feedback_type: str,
        rating: Optional[int] = None,
        comment: Optional[str] = None,
        corrected_intent: Optional[str] = None,
        improvement_suggestion: Optional[str] = None
    ) -> int:
        """Store user feedback"""
        with self._get_connection() as conn:
            cursor = conn.execute('''
                INSERT INTO feedback 
                (conversation_id, feedback_type, rating, comment, corrected_intent, improvement_suggestion)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (conversation_id, feedback_type, rating, comment, corrected_intent, improvement_suggestion))
            
            feedback_id = cursor.lastrowid
            
            # Update actual intent in conversations if corrected
            if corrected_intent:
                conn.execute(
                    'UPDATE conversations SET actual_intent = ? WHERE id = ?',
                    (corrected_intent, conversation_id)
                )
            
            conn.commit()
            
            self.logger.debug(f"Stored feedback {feedback_id} for conversation {conversation_id}")
            return feedback_id
    
    async def get_conversations_for_training(
        self,
        min_confidence: float = 0.7,
        with_positive_feedback: bool = True,
        limit: Optional[int] = None
    ) -> List[Tuple[str, str]]:
        """Get conversations suitable for training data"""
        query = '''
            SELECT DISTINCT c.preprocessed_input, 
                   COALESCE(c.actual_intent, c.predicted_intent) as intent
            FROM conversations c
            LEFT JOIN feedback f ON c.id = f.conversation_id
            WHERE c.confidence >= ?
        '''
        
        params = [min_confidence]
        
        if with_positive_feedback:
            query += ' AND (f.feedback_type = "helpful" OR f.rating >= 4 OR f.conversation_id IS NULL)'
        
        query += ' ORDER BY c.timestamp DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(limit)
        
        with self._get_connection() as conn:
            cursor = conn.execute(query, params)
            return [(row['preprocessed_input'], row['intent']) for row in cursor.fetchall()]
    
    async def get_model_performance_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get performance metrics for the specified period"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        with self._get_connection() as conn:
            # Get conversation stats
            cursor = conn.execute('''
                SELECT 
                    COUNT(*) as total_conversations,
                    AVG(confidence) as avg_confidence,
                    COUNT(CASE WHEN confidence >= 0.8 THEN 1 END) as high_confidence_count,
                    predicted_intent,
                    COUNT(*) as intent_count
                FROM conversations 
                WHERE timestamp >= ?
                GROUP BY predicted_intent
                ORDER BY intent_count DESC
            ''', (cutoff_date,))
            
            intent_stats = cursor.fetchall()
            
            # Get feedback stats
            cursor = conn.execute('''
                SELECT 
                    feedback_type,
                    COUNT(*) as count,
                    AVG(CASE WHEN rating IS NOT NULL THEN rating END) as avg_rating
                FROM feedback f
                JOIN conversations c ON f.conversation_id = c.id
                WHERE c.timestamp >= ?
                GROUP BY feedback_type
            ''', (cutoff_date,))
            
            feedback_stats = cursor.fetchall()
            
            # Get accuracy where we have corrections
            cursor = conn.execute('''
                SELECT 
                    COUNT(*) as total_corrected,
                    COUNT(CASE WHEN predicted_intent = actual_intent THEN 1 END) as correct_predictions
                FROM conversations
                WHERE actual_intent IS NOT NULL AND timestamp >= ?
            ''', (cutoff_date,))
            
            accuracy_stats = cursor.fetchone()
            
            return {
                'period_days': days,
                'intent_distribution': [dict(row) for row in intent_stats],
                'feedback_summary': [dict(row) for row in feedback_stats],
                'accuracy_on_corrections': {
                    'total_corrected': accuracy_stats['total_corrected'],
                    'correct_predictions': accuracy_stats['correct_predictions'],
                    'accuracy': accuracy_stats['correct_predictions'] / max(accuracy_stats['total_corrected'], 1)
                }
            }
    
    async def save_model_version(
        self,
        version: str,
        model_path: str,
        vectorizer_path: str,
        training_data_size: int,
        validation_accuracy: float,
        test_accuracy: float,
        training_config: Dict[str, Any],
        performance_metrics: Dict[str, Any]
    ) -> int:
        """Save a new model version"""
        with self._get_connection() as conn:
            # Deactivate current active model
            conn.execute('UPDATE model_versions SET is_active = FALSE')
            
            # Insert new model version
            cursor = conn.execute('''
                INSERT INTO model_versions 
                (version, model_path, vectorizer_path, training_data_size, 
                 validation_accuracy, test_accuracy, training_config, performance_metrics, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
            ''', (
                version, model_path, vectorizer_path, training_data_size,
                validation_accuracy, test_accuracy, 
                json.dumps(training_config), json.dumps(performance_metrics)
            ))
            
            model_id = cursor.lastrowid
            conn.execute(
                'UPDATE model_versions SET deployed_at = CURRENT_TIMESTAMP WHERE id = ?',
                (model_id,)
            )
            
            conn.commit()
            
            self.logger.info(f"Saved model version {version} (ID: {model_id})")
            return model_id
    
    async def get_learning_insights(self) -> Dict[str, Any]:
        """Get comprehensive learning insights"""
        with self._get_connection() as conn:
            # Get recent trends
            cursor = conn.execute('''
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as conversations,
                    AVG(confidence) as avg_confidence,
                    COUNT(CASE WHEN predicted_intent = 'fallback' THEN 1 END) as fallback_count
                FROM conversations 
                WHERE timestamp >= date('now', '-30 days')
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
                LIMIT 30
            ''')
            
            daily_trends = [dict(row) for row in cursor.fetchall()]
            
            # Get intent evolution
            cursor = conn.execute('''
                SELECT 
                    predicted_intent,
                    COUNT(*) as frequency,
                    AVG(confidence) as avg_confidence,
                    COUNT(CASE WHEN f.feedback_type = 'helpful' THEN 1 END) as positive_feedback,
                    COUNT(f.id) as total_feedback
                FROM conversations c
                LEFT JOIN feedback f ON c.id = f.conversation_id
                WHERE c.timestamp >= date('now', '-7 days')
                GROUP BY predicted_intent
                ORDER BY frequency DESC
            ''')
            
            intent_performance = [dict(row) for row in cursor.fetchall()]
            
            return {
                'daily_trends': daily_trends,
                'intent_performance': intent_performance,
                'generated_at': datetime.now().isoformat()
            }
    
    async def cleanup_old_data(self, days_to_keep: int = 90) -> int:
        """Clean up old conversation data while preserving valuable training examples"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        with self._get_connection() as conn:
            # Don't delete conversations with feedback or high confidence
            cursor = conn.execute('''
                DELETE FROM conversations 
                WHERE timestamp < ? 
                AND id NOT IN (
                    SELECT DISTINCT conversation_id FROM feedback 
                    WHERE conversation_id IS NOT NULL
                )
                AND confidence < 0.8
            ''', (cutoff_date,))
            
            deleted_count = cursor.rowcount
            conn.commit()
            
            self.logger.info(f"Cleaned up {deleted_count} old conversation records")
            return deleted_count 