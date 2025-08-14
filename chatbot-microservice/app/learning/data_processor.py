"""
Data Processing Pipeline

Advanced data processing for conversation data, quality validation,
and intelligent training data preparation.
"""

import logging
import re
from typing import List, Tuple, Dict, Set, Any
from collections import Counter
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy

from app.core.config import settings
from app.data.intents import get_all_training_examples, get_intents_list


class DataProcessor:
    """
    Advanced data processor with quality validation and intelligent filtering
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.nlp = None
        self.original_training_data = get_all_training_examples()
        self.known_intents = set(get_intents_list())
        self._load_nlp_model()
    
    def _load_nlp_model(self):
        """Load spaCy model for advanced text processing"""
        try:
            self.nlp = spacy.load(settings.NLP_MODEL)
            self.logger.info(f"✅ Loaded spaCy model for data processing")
        except OSError:
            self.logger.warning("⚠️ spaCy model not available for advanced processing")
    
    async def validate_conversation_data(
        self, 
        conversation_data: List[Tuple[str, str]]
    ) -> List[Tuple[str, str, float]]:
        """
        Validate and score conversation data for training quality
        
        Returns: List of (text, intent, quality_score) tuples
        """
        validated_data = []
        
        for text, intent in conversation_data:
            quality_score = await self._calculate_quality_score(text, intent)
            
            # Only include data with minimum quality
            if quality_score >= 0.5:
                validated_data.append((text, intent, quality_score))
        
        self.logger.info(f"Validated {len(validated_data)}/{len(conversation_data)} conversation examples")
        return validated_data
    
    async def _calculate_quality_score(self, text: str, intent: str) -> float:
        """Calculate quality score for a training example"""
        score = 1.0
        
        # Length validation
        if len(text.strip()) < 3:
            score *= 0.1
        elif len(text.strip()) < 5:
            score *= 0.5
        elif len(text.strip()) > 200:
            score *= 0.7
        
        # Content quality checks
        if not re.search(r'[a-zA-Z]', text):  # No letters
            score *= 0.1
        
        if len(set(text.lower().split())) < 2:  # Too few unique words
            score *= 0.3
        
        # Intent validation
        if intent not in self.known_intents:
            score *= 0.2
        
        # Semantic coherence (if spaCy is available)
        if self.nlp:
            doc = self.nlp(text)
            
            # Check for meaningful tokens
            meaningful_tokens = [token for token in doc if not token.is_stop and not token.is_punct]
            if len(meaningful_tokens) == 0:
                score *= 0.1
            
            # Check sentence structure
            if len(list(doc.sents)) == 0:
                score *= 0.5
        
        # Check for similarity to existing training data
        similarity_penalty = await self._check_similarity_to_existing(text, intent)
        score *= (1.0 - similarity_penalty)
        
        return max(0.0, min(1.0, score))
    
    async def _check_similarity_to_existing(self, text: str, intent: str) -> float:
        """Check similarity to existing training data to avoid duplicates"""
        intent_examples = [example[0] for example in self.original_training_data if example[1] == intent]
        
        if not intent_examples:
            return 0.0
        
        # Use TF-IDF for similarity check
        try:
            vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
            all_texts = intent_examples + [text]
            
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            similarity_scores = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
            
            max_similarity = np.max(similarity_scores)
            
            # Return penalty based on similarity (0.0 = no penalty, 0.8 = high penalty)
            if max_similarity > 0.9:
                return 0.8  # Very similar, high penalty
            elif max_similarity > 0.7:
                return 0.4  # Moderately similar, medium penalty
            else:
                return 0.0  # Not similar, no penalty
        
        except Exception as e:
            self.logger.warning(f"Similarity check failed: {e}")
            return 0.0
    
    async def balance_training_data(
        self, 
        original_data: List[Tuple[str, str]], 
        conversation_data: List[Tuple[str, str, float]]
    ) -> List[Tuple[str, str]]:
        """
        Balance training data to prevent bias towards certain intents
        """
        # Count examples per intent in original data
        original_counts = Counter([intent for _, intent in original_data])
        
        # Count examples per intent in conversation data
        conversation_counts = Counter([intent for _, intent, _ in conversation_data])
        
        balanced_data = list(original_data)  # Start with original data
        
        # Add conversation data with intelligent balancing
        for intent, original_count in original_counts.items():
            # Target: don't let conversation data overwhelm original data
            max_additional = max(original_count // 2, 5)  # At most 50% additional, minimum 5
            
            # Get conversation examples for this intent, sorted by quality
            intent_examples = [
                (text, intent) for text, intent_val, quality in conversation_data 
                if intent_val == intent
            ]
            intent_examples = sorted(
                [(text, intent_val) for text, intent_val, quality in conversation_data if intent_val == intent],
                key=lambda x: next(quality for text_q, intent_q, quality in conversation_data if text_q == x[0] and intent_q == x[1]),
                reverse=True
            )
            
            # Add best examples up to the limit
            balanced_data.extend(intent_examples[:max_additional])
        
        # Add examples for new intents that weren't in original data
        for intent in conversation_counts:
            if intent not in original_counts:
                # For new intents, add top quality examples
                intent_examples = [
                    (text, intent_val) for text, intent_val, quality in conversation_data 
                    if intent_val == intent and quality >= 0.8
                ]
                balanced_data.extend(intent_examples[:10])  # Max 10 for new intents
        
        self.logger.info(f"Balanced training data: {len(balanced_data)} total examples")
        return balanced_data
    
    async def detect_intent_drift(
        self, 
        recent_conversations: List[Tuple[str, str]]
    ) -> Dict[str, Any]:
        """
        Detect if there's intent drift in recent conversations
        """
        # Count recent intent distribution
        recent_intent_counts = Counter([intent for _, intent in recent_conversations])
        
        # Count original intent distribution
        original_intent_counts = Counter([intent for _, intent in self.original_training_data])
        
        # Calculate drift metrics
        drift_analysis = {}
        
        for intent in self.known_intents:
            original_ratio = original_intent_counts.get(intent, 0) / len(self.original_training_data)
            recent_ratio = recent_intent_counts.get(intent, 0) / max(len(recent_conversations), 1)
            
            drift_score = abs(recent_ratio - original_ratio)
            
            drift_analysis[intent] = {
                'original_ratio': original_ratio,
                'recent_ratio': recent_ratio,
                'drift_score': drift_score,
                'trend': 'increasing' if recent_ratio > original_ratio else 'decreasing'
            }
        
        # Overall drift score
        overall_drift = np.mean([data['drift_score'] for data in drift_analysis.values()])
        
        # Detect new patterns
        new_intents = set(recent_intent_counts.keys()) - self.known_intents
        
        return {
            'overall_drift_score': overall_drift,
            'intent_analysis': drift_analysis,
            'new_potential_intents': list(new_intents),
            'drift_level': 'high' if overall_drift > 0.3 else 'medium' if overall_drift > 0.1 else 'low'
        }
    
    async def suggest_training_improvements(
        self, 
        conversation_data: List[Tuple[str, str, float]],
        performance_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Suggest improvements to training data based on performance analysis
        """
        suggestions = {
            'data_quality': [],
            'coverage_gaps': [],
            'balance_issues': [],
            'new_patterns': []
        }
        
        # Analyze data quality
        quality_scores = [score for _, _, score in conversation_data]
        avg_quality = np.mean(quality_scores) if quality_scores else 0
        
        if avg_quality < 0.7:
            suggestions['data_quality'].append({
                'issue': 'Low average quality',
                'description': f'Average quality score is {avg_quality:.2f}',
                'recommendation': 'Review feedback collection and add more validation'
            })
        
        # Analyze coverage gaps
        intent_distribution = Counter([intent for _, intent, _ in conversation_data])
        
        for intent in self.known_intents:
            if intent not in intent_distribution:
                suggestions['coverage_gaps'].append({
                    'intent': intent,
                    'issue': 'No conversation examples',
                    'recommendation': 'Encourage users to test this intent'
                })
            elif intent_distribution[intent] < 3:
                suggestions['coverage_gaps'].append({
                    'intent': intent,
                    'issue': f'Only {intent_distribution[intent]} examples',
                    'recommendation': 'Need more diverse examples for this intent'
                })
        
        # Analyze balance issues
        total_examples = len(conversation_data)
        for intent, count in intent_distribution.items():
            ratio = count / max(total_examples, 1)
            if ratio > 0.4:  # More than 40% of data
                suggestions['balance_issues'].append({
                    'intent': intent,
                    'issue': f'Overrepresented ({ratio:.1%})',
                    'recommendation': 'Consider reducing weight or increasing other intents'
                })
        
        return suggestions
    
    async def prepare_training_data(
        self, 
        conversation_data: List[Tuple[str, str]],
        include_original: bool = True,
        balance_data: bool = True
    ) -> List[Tuple[str, str]]:
        """
        Prepare final training data combining original and conversation data
        """
        # Validate conversation data
        validated_data = await self.validate_conversation_data(conversation_data)
        
        # Start with original data if requested
        training_data = self.original_training_data.copy() if include_original else []
        
        # Balance and add conversation data
        if balance_data:
            final_data = await self.balance_training_data(training_data, validated_data)
        else:
            # Just add all validated conversation data
            final_data = training_data + [(text, intent) for text, intent, _ in validated_data]
        
        # Remove exact duplicates
        final_data = list(set(final_data))
        
        self.logger.info(f"Prepared {len(final_data)} training examples (original: {len(self.original_training_data)}, added: {len(final_data) - len(self.original_training_data)})")
        
        return final_data 