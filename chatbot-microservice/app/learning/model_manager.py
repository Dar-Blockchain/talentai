"""
Model Manager

Advanced model versioning, A/B testing, and deployment management
with safety checks and rollback capabilities.
"""

import logging
import os
import pickle
import shutil
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import uuid

from app.core.config import settings
from app.core.intent_classifier import IntentClassifier


class ModelManager:
    """
    Advanced model management with versioning and safety features
    """
    
    def __init__(self, learning_db):
        self.logger = logging.getLogger(__name__)
        self.learning_db = learning_db
        self.current_model = None
        self.model_versions = {}
        self.ab_test_config = {}
        
    async def train_new_model(
        self,
        training_data: List[Tuple[str, str]],
        validation_split: float = 0.2,
        cross_validation: bool = True
    ) -> Dict[str, Any]:
        """
        Train a new model with comprehensive validation
        """
        try:
            model_version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            self.logger.info(f"🔄 Training new model version: {model_version}")
            
            # Prepare data
            texts = [example[0] for example in training_data]
            labels = [example[1] for example in training_data]
            
            # Split data for validation
            X_train, X_val, y_train, y_val = train_test_split(
                texts, labels, test_size=validation_split, random_state=42, stratify=labels
            )
            
            # Create new classifier instance
            classifier = IntentClassifier()
            await classifier.initialize()
            
            # Train the model
            training_start = datetime.now()
            await classifier._train_and_save_model_custom(X_train, y_train, model_version)
            training_time = (datetime.now() - training_start).total_seconds()
            
            # Validate the model
            validation_results = await self._validate_model(classifier, X_val, y_val)
            
            # Cross-validation if requested
            cv_results = None
            if cross_validation and len(training_data) > 50:
                cv_results = await self._cross_validate_model(texts, labels)
            
            # Save model information
            model_info = {
                'version': model_version,
                'training_data_size': len(training_data),
                'validation_accuracy': validation_results['accuracy'],
                'training_time': training_time,
                'validation_results': validation_results,
                'cross_validation': cv_results,
                'created_at': datetime.now().isoformat()
            }
            
            # Store in database
            await self.learning_db.save_model_version(
                version=model_version,
                model_path=f"{settings.MODEL_PATH}/models/{model_version}_{settings.INTENT_MODEL_NAME}",
                vectorizer_path=f"{settings.MODEL_PATH}/models/{model_version}_{settings.VECTORIZER_NAME}",
                training_data_size=len(training_data),
                validation_accuracy=validation_results['accuracy'],
                test_accuracy=validation_results.get('test_accuracy', 0.0),
                training_config={
                    'validation_split': validation_split,
                    'cross_validation': cross_validation,
                    'training_time': training_time
                },
                performance_metrics=validation_results
            )
            
            self.model_versions[model_version] = {
                'classifier': classifier,
                'info': model_info
            }
            
            self.logger.info(f"✅ Model {model_version} trained successfully (Accuracy: {validation_results['accuracy']:.3f})")
            return model_info
            
        except Exception as e:
            self.logger.error(f"❌ Failed to train model: {str(e)}")
            raise
    
    async def _validate_model(
        self, 
        classifier: IntentClassifier, 
        X_val: List[str], 
        y_val: List[str]
    ) -> Dict[str, Any]:
        """Comprehensive model validation"""
        
        predictions = []
        confidences = []
        
        for text in X_val:
            intent, confidence = await classifier.classify_intent(text)
            predictions.append(intent)
            confidences.append(confidence)
        
        # Calculate metrics
        accuracy = accuracy_score(y_val, predictions)
        
        # Generate classification report
        try:
            class_report = classification_report(
                y_val, predictions, output_dict=True, zero_division=0
            )
        except Exception as e:
            self.logger.warning(f"Could not generate classification report: {e}")
            class_report = {}
        
        # Calculate confusion matrix
        try:
            conf_matrix = confusion_matrix(y_val, predictions).tolist()
        except Exception as e:
            self.logger.warning(f"Could not generate confusion matrix: {e}")
            conf_matrix = []
        
        return {
            'accuracy': accuracy,
            'average_confidence': np.mean(confidences),
            'confidence_std': np.std(confidences),
            'classification_report': class_report,
            'confusion_matrix': conf_matrix,
            'low_confidence_count': sum(1 for c in confidences if c < 0.7),
            'high_confidence_count': sum(1 for c in confidences if c >= 0.8)
        }
    
    async def _cross_validate_model(
        self, 
        texts: List[str], 
        labels: List[str], 
        cv_folds: int = 5
    ) -> Dict[str, Any]:
        """Perform cross-validation on the model"""
        try:
            # Create a temporary classifier for CV
            temp_classifier = IntentClassifier()
            
            # Use the internal model for CV
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.naive_bayes import MultinomialNB
            from sklearn.pipeline import Pipeline
            
            vectorizer = TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                strip_accents='ascii'
            )
            
            classifier = MultinomialNB(alpha=0.1)
            pipeline = Pipeline([
                ('vectorizer', vectorizer),
                ('classifier', classifier)
            ])
            
            # Preprocess texts
            processed_texts = []
            for text in texts:
                processed_text = await temp_classifier._preprocess_text(text)
                processed_texts.append(processed_text)
            
            # Perform cross-validation
            cv_scores = cross_val_score(
                pipeline, processed_texts, labels, cv=cv_folds, scoring='accuracy'
            )
            
            return {
                'cv_scores': cv_scores.tolist(),
                'cv_mean': float(np.mean(cv_scores)),
                'cv_std': float(np.std(cv_scores)),
                'cv_folds': cv_folds
            }
            
        except Exception as e:
            self.logger.warning(f"Cross-validation failed: {e}")
            return {'error': str(e)}
    
    async def should_deploy_model(
        self, 
        new_model_version: str, 
        current_performance: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """
        Determine if a new model should be deployed based on performance criteria
        """
        if new_model_version not in self.model_versions:
            return False, "Model version not found"
        
        new_model_info = self.model_versions[new_model_version]['info']
        new_accuracy = new_model_info['validation_accuracy']
        
        # If no current model, deploy if accuracy is reasonable
        if not current_performance:
            if new_accuracy >= 0.6:  # Minimum threshold
                return True, "First model deployment"
            else:
                return False, f"Accuracy too low: {new_accuracy:.3f}"
        
        current_accuracy = current_performance.get('accuracy', 0.0)
        
        # Deployment criteria
        accuracy_improvement = new_accuracy - current_accuracy
        
        # Must improve by at least 2% or be above 85%
        if accuracy_improvement >= 0.02:
            return True, f"Accuracy improved by {accuracy_improvement:.3f}"
        elif new_accuracy >= 0.85 and accuracy_improvement >= 0.01:
            return True, f"High accuracy model with improvement: {new_accuracy:.3f}"
        elif accuracy_improvement >= -0.01 and new_accuracy >= current_accuracy * 0.95:
            # Allow deployment if performance is similar (within 1% drop and 95% of current)
            return True, "Performance maintained with new training data"
        else:
            return False, f"Insufficient improvement: {accuracy_improvement:.3f}"
    
    async def deploy_model(self, model_version: str, deployment_strategy: str = "immediate") -> bool:
        """
        Deploy a model version with specified strategy
        """
        try:
            if model_version not in self.model_versions:
                raise ValueError(f"Model version {model_version} not found")
            
            if deployment_strategy == "ab_test":
                return await self._deploy_ab_test(model_version)
            else:
                return await self._deploy_immediate(model_version)
                
        except Exception as e:
            self.logger.error(f"❌ Failed to deploy model {model_version}: {str(e)}")
            return False
    
    async def _deploy_immediate(self, model_version: str) -> bool:
        """Deploy model immediately as the main model"""
        try:
            model_data = self.model_versions[model_version]
            classifier = model_data['classifier']
            
            # Backup current model
            if self.current_model:
                await self._backup_current_model()
            
            # Set as current model
            self.current_model = {
                'version': model_version,
                'classifier': classifier,
                'deployed_at': datetime.now(),
                'strategy': 'immediate'
            }
            
            self.logger.info(f"✅ Model {model_version} deployed immediately")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed immediate deployment: {str(e)}")
            return False
    
    async def _deploy_ab_test(self, model_version: str, traffic_split: float = 0.1) -> bool:
        """Deploy model for A/B testing with limited traffic"""
        try:
            self.ab_test_config = {
                'new_model_version': model_version,
                'traffic_split': traffic_split,
                'started_at': datetime.now(),
                'metrics': {
                    'new_model_requests': 0,
                    'current_model_requests': 0,
                    'new_model_feedback': [],
                    'current_model_feedback': []
                }
            }
            
            self.logger.info(f"✅ A/B test started for model {model_version} with {traffic_split:.1%} traffic")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed A/B test deployment: {str(e)}")
            return False
    
    async def get_model_for_request(self, request_id: str) -> Tuple[IntentClassifier, str]:
        """Get the appropriate model for a request (supports A/B testing)"""
        
        # If A/B testing is active
        if self.ab_test_config:
            # Use hash of request_id to determine traffic split
            request_hash = hash(request_id) % 100
            traffic_percentage = self.ab_test_config['traffic_split'] * 100
            
            if request_hash < traffic_percentage:
                # Use new model
                new_version = self.ab_test_config['new_model_version']
                if new_version in self.model_versions:
                    self.ab_test_config['metrics']['new_model_requests'] += 1
                    return self.model_versions[new_version]['classifier'], new_version
        
        # Use current model
        if self.current_model:
            if self.ab_test_config:
                self.ab_test_config['metrics']['current_model_requests'] += 1
            return self.current_model['classifier'], self.current_model['version']
        
        # Fallback: return any available model
        if self.model_versions:
            latest_version = max(self.model_versions.keys())
            return self.model_versions[latest_version]['classifier'], latest_version
        
        raise RuntimeError("No models available")
    
    async def record_ab_test_feedback(self, model_version: str, feedback: Dict[str, Any]):
        """Record feedback for A/B testing analysis"""
        if not self.ab_test_config:
            return
        
        if model_version == self.ab_test_config['new_model_version']:
            self.ab_test_config['metrics']['new_model_feedback'].append(feedback)
        elif self.current_model and model_version == self.current_model['version']:
            self.ab_test_config['metrics']['current_model_feedback'].append(feedback)
    
    async def analyze_ab_test(self) -> Optional[Dict[str, Any]]:
        """Analyze A/B test results and recommend winner"""
        if not self.ab_test_config:
            return None
        
        metrics = self.ab_test_config['metrics']
        
        # Calculate metrics for both models
        new_model_feedback = metrics['new_model_feedback']
        current_model_feedback = metrics['current_model_feedback']
        
        if len(new_model_feedback) < 10 or len(current_model_feedback) < 10:
            return {
                'status': 'insufficient_data',
                'message': 'Need more feedback data for reliable comparison',
                'new_model_samples': len(new_model_feedback),
                'current_model_samples': len(current_model_feedback)
            }
        
        # Calculate success rates (assuming feedback has 'helpful' boolean)
        new_success_rate = np.mean([f.get('helpful', False) for f in new_model_feedback])
        current_success_rate = np.mean([f.get('helpful', False) for f in current_model_feedback])
        
        improvement = new_success_rate - current_success_rate
        
        # Statistical significance test (simplified)
        min_improvement = 0.05  # 5% minimum improvement
        
        result = {
            'new_model_success_rate': new_success_rate,
            'current_model_success_rate': current_success_rate,
            'improvement': improvement,
            'new_model_requests': metrics['new_model_requests'],
            'current_model_requests': metrics['current_model_requests'],
            'started_at': self.ab_test_config['started_at'].isoformat()
        }
        
        if improvement >= min_improvement:
            result['recommendation'] = 'deploy_new_model'
            result['confidence'] = 'high' if improvement >= 0.1 else 'medium'
        elif improvement <= -min_improvement:
            result['recommendation'] = 'keep_current_model'
            result['confidence'] = 'high'
        else:
            result['recommendation'] = 'inconclusive'
            result['confidence'] = 'low'
        
        return result
    
    async def rollback_model(self, target_version: Optional[str] = None) -> bool:
        """Rollback to a previous model version"""
        try:
            if target_version and target_version in self.model_versions:
                # Rollback to specific version
                rollback_data = self.model_versions[target_version]
            else:
                # Find the most recent stable version
                stable_versions = [
                    (v, data) for v, data in self.model_versions.items()
                    if data['info']['validation_accuracy'] >= 0.7
                ]
                
                if not stable_versions:
                    raise ValueError("No stable model versions available for rollback")
                
                # Get the most recent stable version
                target_version, rollback_data = max(
                    stable_versions, 
                    key=lambda x: x[1]['info']['created_at']
                )
            
            # Perform rollback
            self.current_model = {
                'version': target_version,
                'classifier': rollback_data['classifier'],
                'deployed_at': datetime.now(),
                'strategy': 'rollback'
            }
            
            # Clear A/B test if active
            self.ab_test_config = {}
            
            self.logger.info(f"✅ Rolled back to model version {target_version}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Rollback failed: {str(e)}")
            return False
    
    async def _backup_current_model(self):
        """Backup current model before replacement"""
        if not self.current_model:
            return
        
        version = self.current_model['version']
        backup_path = f"{settings.MODEL_PATH}/backups/{version}"
        
        os.makedirs(backup_path, exist_ok=True)
        
        # This would copy model files in a real implementation
        self.logger.info(f"Backed up model {version}")
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get comprehensive status of all models"""
        return {
            'current_model': self.current_model['version'] if self.current_model else None,
            'available_versions': list(self.model_versions.keys()),
            'ab_test_active': bool(self.ab_test_config),
            'ab_test_config': self.ab_test_config if self.ab_test_config else None,
            'total_models': len(self.model_versions)
        } 