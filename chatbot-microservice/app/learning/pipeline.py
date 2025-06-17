"""
Learning Pipeline Orchestrator

Main pipeline that coordinates all learning components:
- Data collection and validation
- Model training and evaluation
- Deployment and monitoring
- Automated learning cycles
"""

import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import time

from .database import LearningDatabase
from .data_processor import DataProcessor
from .model_manager import ModelManager
from .feedback_collector import FeedbackCollector


class LearningPipeline:
    """
    Comprehensive learning pipeline with automated learning cycles
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.db = LearningDatabase()
        self.data_processor = DataProcessor()
        self.model_manager = ModelManager(self.db)
        self.feedback_collector = FeedbackCollector(self.db)
        
        # Pipeline state
        self.is_learning_active = False
        self.last_training_time = None
        self.learning_metrics = {}
        
        # Configuration
        self.config = {
            'auto_retrain_threshold': 100,  # Retrain after 100 new conversations
            'min_feedback_for_retraining': 20,  # Need 20 feedback examples
            'retrain_interval_hours': 24,  # Max 24 hours between retrains
            'quality_threshold': 0.7,  # Minimum data quality for training
            'performance_degradation_threshold': 0.05,  # 5% performance drop triggers retrain
        }
    
    async def initialize(self):
        """Initialize the learning pipeline"""
        try:
            self.logger.info("🚀 Initializing Learning Pipeline...")
            
            # Set up background learning task
            asyncio.create_task(self._learning_loop())
            
            self.logger.info("✅ Learning Pipeline initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize learning pipeline: {str(e)}")
            raise
    
    async def process_conversation(
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
        """
        Process a conversation for learning
        """
        try:
            # Store conversation in database
            conversation_id = await self.db.store_conversation(
                session_id=session_id,
                user_id=user_id,
                user_input=user_input,
                preprocessed_input=preprocessed_input,
                predicted_intent=predicted_intent,
                confidence=confidence,
                response=response,
                response_time=response_time,
                context_data=context_data
            )
            
            # Check if learning triggers are met
            await self._check_learning_triggers()
            
            return conversation_id
            
        except Exception as e:
            self.logger.error(f"Error processing conversation for learning: {str(e)}")
            return -1
    
    async def process_feedback(
        self,
        conversation_id: int,
        feedback_type: str,
        rating: Optional[int] = None,
        comment: Optional[str] = None,
        corrected_intent: Optional[str] = None,
        improvement_suggestion: Optional[str] = None
    ) -> int:
        """
        Process user feedback for learning
        """
        try:
            feedback_id = await self.db.store_feedback(
                conversation_id=conversation_id,
                feedback_type=feedback_type,
                rating=rating,
                comment=comment,
                corrected_intent=corrected_intent,
                improvement_suggestion=improvement_suggestion
            )
            
            # Update learning metrics
            await self._update_learning_metrics(feedback_type, rating)
            
            # Check if we need to retrain
            await self._check_learning_triggers()
            
            return feedback_id
            
        except Exception as e:
            self.logger.error(f"Error processing feedback: {str(e)}")
            return -1
    
    async def _check_learning_triggers(self):
        """Check if any learning triggers are met"""
        try:
            # Get recent conversation count
            recent_conversations = await self._get_recent_conversation_count()
            recent_feedback = await self._get_recent_feedback_count()
            
            # Check auto-retrain threshold
            if recent_conversations >= self.config['auto_retrain_threshold']:
                self.logger.info(f"Auto-retrain triggered: {recent_conversations} new conversations")
                await self._trigger_learning_cycle("conversation_threshold")
                return
            
            # Check feedback threshold
            if recent_feedback >= self.config['min_feedback_for_retraining']:
                self.logger.info(f"Feedback-based retrain triggered: {recent_feedback} feedback examples")
                await self._trigger_learning_cycle("feedback_threshold")
                return
            
            # Check time-based trigger
            if self._should_retrain_by_time():
                self.logger.info("Time-based retrain triggered")
                await self._trigger_learning_cycle("time_threshold")
                return
            
            # Check performance degradation
            if await self._detect_performance_degradation():
                self.logger.info("Performance degradation detected")
                await self._trigger_learning_cycle("performance_degradation")
                return
                
        except Exception as e:
            self.logger.error(f"Error checking learning triggers: {str(e)}")
    
    async def _trigger_learning_cycle(self, trigger_reason: str):
        """Trigger a complete learning cycle"""
        if self.is_learning_active:
            self.logger.info("Learning cycle already active, skipping")
            return
        
        try:
            self.is_learning_active = True
            start_time = time.time()
            
            self.logger.info(f"🔄 Starting learning cycle (trigger: {trigger_reason})")
            
            # Execute learning cycle
            result = await self._execute_learning_cycle()
            
            # Update metrics
            cycle_time = time.time() - start_time
            await self._record_learning_cycle(trigger_reason, result, cycle_time)
            
            self.last_training_time = datetime.now()
            
            self.logger.info(f"✅ Learning cycle completed in {cycle_time:.2f}s")
            
        except Exception as e:
            self.logger.error(f"❌ Learning cycle failed: {str(e)}")
            
        finally:
            self.is_learning_active = False
    
    async def _execute_learning_cycle(self) -> Dict[str, Any]:
        """Execute a complete learning cycle"""
        result = {
            'success': False,
            'model_trained': False,
            'model_deployed': False,
            'metrics': {}
        }
        
        try:
            # Step 1: Collect and validate training data
            self.logger.info("📊 Collecting training data...")
            conversation_data = await self.db.get_conversations_for_training(
                min_confidence=self.config['quality_threshold'],
                with_positive_feedback=True
            )
            
            if len(conversation_data) < 10:
                self.logger.info("Insufficient training data, skipping learning cycle")
                return result
            
            # Step 2: Process and validate data
            self.logger.info("🔍 Processing and validating data...")
            training_data = await self.data_processor.prepare_training_data(
                conversation_data=conversation_data,
                include_original=True,
                balance_data=True
            )
            
            # Step 3: Detect intent drift
            drift_analysis = await self.data_processor.detect_intent_drift(conversation_data)
            result['metrics']['drift_analysis'] = drift_analysis
            
            # Step 4: Train new model
            self.logger.info("🏋️ Training new model...")
            model_info = await self.model_manager.train_new_model(
                training_data=training_data,
                validation_split=0.2,
                cross_validation=True
            )
            
            result['model_trained'] = True
            result['metrics']['model_info'] = model_info
            
            # Step 5: Evaluate deployment
            current_performance = await self._get_current_model_performance()
            should_deploy, reason = await self.model_manager.should_deploy_model(
                model_info['version'], current_performance
            )
            
            result['metrics']['deployment_decision'] = {
                'should_deploy': should_deploy,
                'reason': reason
            }
            
            # Step 6: Deploy if recommended
            if should_deploy:
                self.logger.info(f"🚀 Deploying new model: {reason}")
                
                # Use A/B testing for risky deployments
                deployment_strategy = "ab_test" if model_info['validation_accuracy'] < 0.8 else "immediate"
                
                deployed = await self.model_manager.deploy_model(
                    model_info['version'], 
                    deployment_strategy
                )
                
                result['model_deployed'] = deployed
                result['metrics']['deployment_strategy'] = deployment_strategy
            
            # Step 7: Generate improvement suggestions
            suggestions = await self.data_processor.suggest_training_improvements(
                [(text, intent, 1.0) for text, intent in conversation_data],  # Mock quality scores
                current_performance or {}
            )
            
            result['metrics']['improvement_suggestions'] = suggestions
            result['success'] = True
            
            return result
            
        except Exception as e:
            self.logger.error(f"Learning cycle execution failed: {str(e)}")
            result['error'] = str(e)
            return result
    
    async def _learning_loop(self):
        """Background learning loop that runs continuously"""
        while True:
            try:
                await asyncio.sleep(3600)  # Check every hour
                
                # Perform health checks
                await self._health_check()
                
                # Check for A/B test conclusions
                if self.model_manager.ab_test_config:
                    await self._check_ab_test_results()
                
                # Clean up old data
                await self._cleanup_old_data()
                
            except Exception as e:
                self.logger.error(f"Error in learning loop: {str(e)}")
                await asyncio.sleep(300)  # Wait 5 minutes before retry
    
    async def _check_ab_test_results(self):
        """Check and act on A/B test results"""
        try:
            ab_results = await self.model_manager.analyze_ab_test()
            
            if not ab_results or ab_results.get('status') == 'insufficient_data':
                return
            
            recommendation = ab_results.get('recommendation')
            confidence = ab_results.get('confidence')
            
            if recommendation == 'deploy_new_model' and confidence in ['high', 'medium']:
                # Deploy the new model
                new_version = self.model_manager.ab_test_config['new_model_version']
                await self.model_manager.deploy_model(new_version, "immediate")
                
                self.logger.info(f"✅ A/B test concluded: Deployed {new_version} (confidence: {confidence})")
                
            elif recommendation == 'keep_current_model' and confidence == 'high':
                # Clear A/B test and keep current model
                self.model_manager.ab_test_config = {}
                self.logger.info("✅ A/B test concluded: Keeping current model")
                
        except Exception as e:
            self.logger.error(f"Error checking A/B test results: {str(e)}")
    
    async def _get_current_model_performance(self) -> Optional[Dict[str, Any]]:
        """Get current model performance metrics"""
        try:
            return await self.db.get_model_performance_metrics(days=7)
        except Exception as e:
            self.logger.error(f"Error getting current model performance: {str(e)}")
            return None
    
    async def _detect_performance_degradation(self) -> bool:
        """Detect if model performance has degraded"""
        try:
            recent_metrics = await self.db.get_model_performance_metrics(days=3)
            baseline_metrics = await self.db.get_model_performance_metrics(days=14)
            
            if not recent_metrics or not baseline_metrics:
                return False
            
            recent_accuracy = recent_metrics.get('accuracy_on_corrections', {}).get('accuracy', 0)
            baseline_accuracy = baseline_metrics.get('accuracy_on_corrections', {}).get('accuracy', 0)
            
            if baseline_accuracy > 0 and recent_accuracy > 0:
                degradation = baseline_accuracy - recent_accuracy
                return degradation > self.config['performance_degradation_threshold']
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error detecting performance degradation: {str(e)}")
            return False
    
    async def _get_recent_conversation_count(self) -> int:
        """Get count of recent conversations since last training"""
        try:
            cutoff_time = self.last_training_time or datetime.now() - timedelta(hours=24)
            
            # This would need a specific database query
            # For now, return a mock value
            return 0
            
        except Exception as e:
            self.logger.error(f"Error getting recent conversation count: {str(e)}")
            return 0
    
    async def _get_recent_feedback_count(self) -> int:
        """Get count of recent feedback since last training"""
        try:
            cutoff_time = self.last_training_time or datetime.now() - timedelta(hours=24)
            
            # This would need a specific database query
            # For now, return a mock value
            return 0
            
        except Exception as e:
            self.logger.error(f"Error getting recent feedback count: {str(e)}")
            return 0
    
    def _should_retrain_by_time(self) -> bool:
        """Check if enough time has passed for time-based retraining"""
        if not self.last_training_time:
            return True
        
        time_since_training = datetime.now() - self.last_training_time
        return time_since_training.total_seconds() > self.config['retrain_interval_hours'] * 3600
    
    async def _update_learning_metrics(self, feedback_type: str, rating: Optional[int]):
        """Update internal learning metrics"""
        try:
            if 'feedback_counts' not in self.learning_metrics:
                self.learning_metrics['feedback_counts'] = {}
            
            if feedback_type not in self.learning_metrics['feedback_counts']:
                self.learning_metrics['feedback_counts'][feedback_type] = 0
            
            self.learning_metrics['feedback_counts'][feedback_type] += 1
            
            if rating:
                if 'ratings' not in self.learning_metrics:
                    self.learning_metrics['ratings'] = []
                self.learning_metrics['ratings'].append(rating)
                
        except Exception as e:
            self.logger.error(f"Error updating learning metrics: {str(e)}")
    
    async def _record_learning_cycle(self, trigger_reason: str, result: Dict[str, Any], cycle_time: float):
        """Record learning cycle results"""
        try:
            # Store detailed learning metrics in database
            await self.db.learning_db.execute('''
                INSERT INTO learning_metrics (metric_name, metric_value, metric_data)
                VALUES ('learning_cycle', ?, ?)
            ''', (cycle_time, {
                'trigger_reason': trigger_reason,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }))
            
        except Exception as e:
            self.logger.error(f"Error recording learning cycle: {str(e)}")
    
    async def _health_check(self):
        """Perform health checks on the learning system"""
        try:
            # Check database health
            await self.db.get_learning_insights()
            
            # Check model manager health
            status = self.model_manager.get_model_status()
            
            if not status.get('current_model'):
                self.logger.warning("⚠️ No current model available")
            
        except Exception as e:
            self.logger.error(f"Learning system health check failed: {str(e)}")
    
    async def _cleanup_old_data(self):
        """Clean up old data to prevent database bloat"""
        try:
            deleted_count = await self.db.cleanup_old_data(days_to_keep=90)
            
            if deleted_count > 0:
                self.logger.info(f"🧹 Cleaned up {deleted_count} old conversation records")
                
        except Exception as e:
            self.logger.error(f"Error during data cleanup: {str(e)}")
    
    # Public API methods
    
    async def get_learning_status(self) -> Dict[str, Any]:
        """Get comprehensive learning status"""
        try:
            return {
                'is_active': self.is_learning_active,
                'last_training': self.last_training_time.isoformat() if self.last_training_time else None,
                'configuration': self.config,
                'metrics': self.learning_metrics,
                'model_status': self.model_manager.get_model_status(),
                'recent_insights': await self.db.get_learning_insights()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting learning status: {str(e)}")
            return {'error': str(e)}
    
    async def manual_learning_cycle(self, force: bool = False) -> Dict[str, Any]:
        """Manually trigger a learning cycle"""
        if self.is_learning_active and not force:
            return {'error': 'Learning cycle already active'}
        
        await self._trigger_learning_cycle("manual_trigger")
        return {'success': True, 'message': 'Learning cycle triggered'}
    
    async def update_learning_config(self, config_updates: Dict[str, Any]) -> bool:
        """Update learning pipeline configuration"""
        try:
            for key, value in config_updates.items():
                if key in self.config:
                    self.config[key] = value
            
            self.logger.info(f"Updated learning configuration: {config_updates}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error updating learning config: {str(e)}")
            return False 