"""
Intent Classification Module for TalentAI Chatbot

Uses multiple NLP techniques including TF-IDF, spaCy, and optional transformers
for accurate intent classification with confidence scoring.
"""

import os
import pickle
import logging
import re
from typing import Dict, List, Tuple, Optional
import asyncio

import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from app.core.config import settings
from app.data.intents import get_all_training_examples, get_intents_list


class IntentClassifier:
    """
    Advanced intent classifier combining multiple NLP approaches
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.nlp = None
        self.model = None
        self.vectorizer = None
        self.intent_labels = get_intents_list()
        self.is_initialized = False
        
    async def initialize(self) -> None:
        """Initialize the classifier with models and training data"""
        try:
            self.logger.info("Initializing Intent Classifier...")
            
            # Load spaCy model
            await self._load_spacy_model()
            
            # Load or train the classification model
            await self._load_or_train_model()
            
            self.is_initialized = True
            self.logger.info("✅ Intent Classifier initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize Intent Classifier: {str(e)}")
            raise
    
    async def _load_spacy_model(self) -> None:
        """Load spaCy model for text preprocessing"""
        try:
            self.nlp = spacy.load(settings.NLP_MODEL)
            self.logger.info(f"✅ Loaded spaCy model: {settings.NLP_MODEL}")
        except OSError:
            self.logger.warning(f"⚠️ spaCy model {settings.NLP_MODEL} not found. Using basic preprocessing.")
            self.nlp = None
    
    async def _load_or_train_model(self) -> None:
        """Load existing model or train a new one"""
        model_path = os.path.join(settings.MODEL_PATH, settings.INTENT_MODEL_NAME)
        vectorizer_path = os.path.join(settings.MODEL_PATH, settings.VECTORIZER_NAME)
        
        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            await self._load_model(model_path, vectorizer_path)
        else:
            await self._train_and_save_model(model_path, vectorizer_path)
    
    async def _load_model(self, model_path: str, vectorizer_path: str) -> None:
        """Load pre-trained model and vectorizer"""
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            self.logger.info("✅ Loaded pre-trained intent classification model")
        
        except Exception as e:
            self.logger.warning(f"⚠️ Failed to load model: {str(e)}. Training new model...")
            await self._train_and_save_model(model_path, vectorizer_path)
    
    async def _train_and_save_model(self, model_path: str, vectorizer_path: str) -> None:
        """Train a new model and save it"""
        try:
            self.logger.info("🔄 Training new intent classification model...")
            
            # Get training data
            training_data = get_all_training_examples()
            texts = [example[0] for example in training_data]
            labels = [example[1] for example in training_data]
            
            # Preprocess texts
            processed_texts = [await self._preprocess_text(text) for text in texts]
            
            # Create and train pipeline
            self.vectorizer = TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                strip_accents='ascii'
            )
            
            classifier = MultinomialNB(alpha=0.1)
            
            self.model = Pipeline([
                ('vectorizer', self.vectorizer),
                ('classifier', classifier)
            ])
            
            # Train the model
            X_train, X_test, y_train, y_test = train_test_split(
                processed_texts, labels, test_size=0.2, random_state=42, stratify=labels
            )
            
            self.model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Save model and vectorizer
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            # Note: Vectorizer is already part of the pipeline, but we save it separately for reference
            with open(vectorizer_path, 'wb') as f:
                pickle.dump(self.vectorizer, f)
            
            self.logger.info(f"✅ Model trained and saved. Accuracy: {accuracy:.3f}")
        
        except Exception as e:
            self.logger.error(f"❌ Failed to train model: {str(e)}")
            raise
    
    async def _preprocess_text(self, text: str) -> str:
        """Enhanced text preprocessing with advanced typo handling"""
        if not isinstance(text, str):
            return ""
        
        # Basic preprocessing
        text = text.lower().strip()
        
        # Enhanced typo corrections - Add comprehensive patterns
        typo_corrections = {
            # Common what/how variations
            r'\bwgat\b': 'what',
            r'\bwhta\b': 'what', 
            r'\bwhat si\b': 'what is',
            r'\bwht\b': 'what',
            r'\bwat\b': 'what',
            r'\bhwo\b': 'how',
            r'\bhow\s+do\s+i\s+get\s+start\w*': 'how do i get started',
            r'\bget\s+start\w*': 'get started',
            r'\bstrat\w*': 'start',
            r'\bstartd\b': 'started',
            
            # Platform and service terms
            r'\btalentai\b': 'talentai',
            r'\btalnt\s*ai\b': 'talentai',
            r'\btalent\s+ai\b': 'talentai',
            r'\bplaform\b': 'platform',
            r'\bplatfrom\b': 'platform',
            r'\bplatorm\b': 'platform',
            
            # Skills and testing
            r'\bskils\b': 'skills',
            r'\bskil\b': 'skill',
            r'\btets\b': 'test',
            r'\btset\b': 'test',
            r'\btets\b': 'tests',
            r'\btestin\b': 'testing',
            r'\btset\b': 'test',
            
            # Certification terms
            r'\bcertificat\w*': 'certification',
            r'\bcertifikation\b': 'certification',
            r'\bcertifiation\b': 'certification',
            r'\babut\b': 'about',
            r'\babout\b': 'about',
            
            # AI and recruitment
            r'\bai\s+recrut\w*': 'ai recruitment',
            r'\brecruit\w*': 'recruitment',
            r'\brecrut\w*': 'recruitment',
            
            # Accuracy and assessment
            r'\baccurat\w*': 'accurate',
            r'\bassesment\w*': 'assessment',
            r'\bassess\w*': 'assessment',
            r'\basesment\w*': 'assessment',
            
            # Help and start variations
            r'\bhlep\b': 'help',
            r'\bhelp\b': 'help',
            r'\bbegin\b': 'start',
            r'\bbegin\w*': 'start',
            
            # Common letter swaps and missing letters
            r'\btel\b': 'tell',
            r'\bmore?\b': 'more',
            r'\bmor\b': 'more',
            r'\b2\b': 'to',
            r'\bu\b': 'you',
            r'\bhw\b': 'how',
        }
        
        # Apply typo corrections
        for pattern, replacement in typo_corrections.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Fuzzy word correction for remaining words
        text = await self._apply_fuzzy_correction(text)
        
        # Use spaCy for advanced preprocessing if available
        if self.nlp:
            try:
                doc = self.nlp(text)
                # Extract lemmatized tokens, excluding stop words and punctuation
                tokens = [
                    token.lemma_.lower() 
                    for token in doc 
                    if not token.is_stop and not token.is_punct and token.text.strip()
                ]
                text = ' '.join(tokens) if tokens else text
            except Exception:
                # Fallback to original text if spaCy fails
                pass
        
        return text
    
    async def _apply_fuzzy_correction(self, text: str) -> str:
        """Apply fuzzy string matching for typo correction"""
        from difflib import SequenceMatcher
        
        # Build vocabulary from training data
        if not hasattr(self, '_vocabulary'):
            from app.data.intents import get_all_training_examples
            training_data = get_all_training_examples()
            vocab_words = set()
            for example, intent in training_data:
                words = example.lower().split()
                vocab_words.update(words)
            
            # Add common domain words
            domain_words = [
                'talentai', 'platform', 'skills', 'test', 'testing', 'certification', 
                'certificates', 'recruitment', 'accurate', 'assessment', 'started',
                'what', 'how', 'where', 'when', 'why', 'help', 'get', 'begin',
                'about', 'tell', 'explain', 'describe', 'different', 'work'
            ]
            vocab_words.update(domain_words)
            self._vocabulary = list(vocab_words)
        
        words = text.split()
        corrected_words = []
        
        for word in words:
            if len(word) < 3:  # Skip very short words
                corrected_words.append(word)
                continue
            
            best_match = word
            best_score = 0.6  # Minimum similarity threshold
            
            for vocab_word in self._vocabulary:
                if len(vocab_word) < 3:
                    continue
                    
                similarity = SequenceMatcher(None, word, vocab_word).ratio()
                
                # Give higher weight to words of similar length
                length_penalty = abs(len(word) - len(vocab_word)) * 0.1
                adjusted_similarity = similarity - length_penalty
                
                if adjusted_similarity > best_score:
                    best_match = vocab_word
                    best_score = adjusted_similarity
            
            corrected_words.append(best_match)
        
        return ' '.join(corrected_words)
    
    async def classify_intent(self, text: str, context: Optional[Dict] = None) -> Tuple[str, float]:
        """
        Classify intent from user input text
        
        Args:
            text: User input text
            context: Optional context information
        
        Returns:
            Tuple of (intent, confidence_score)
        """
        if not self.is_initialized:
            raise RuntimeError("Intent classifier not initialized")
        
        if not text or not text.strip():
            return "fallback", 0.0
        
        try:
            # Preprocess the input text
            processed_text = await self._preprocess_text(text)
            
            if not processed_text:
                return "fallback", 0.0
            
            # Get prediction and probabilities
            prediction = self.model.predict([processed_text])[0]
            probabilities = self.model.predict_proba([processed_text])[0]
            
            # Get confidence score
            max_prob = np.max(probabilities)
            confidence = float(max_prob)
            
            # Apply confidence threshold
            if confidence < settings.CONFIDENCE_THRESHOLD:
                return "fallback", confidence
            
            # Apply context-based adjustments if available
            if context:
                prediction, confidence = await self._apply_context_adjustments(
                    prediction, confidence, context
                )
            
            self.logger.debug(f"Intent classified: {prediction} (confidence: {confidence:.3f})")
            return prediction, confidence
        
        except Exception as e:
            self.logger.error(f"Error classifying intent: {str(e)}")
            return "fallback", 0.0
    
    async def _apply_context_adjustments(self, intent: str, confidence: float, context: Dict) -> Tuple[str, float]:
        """Apply context-based adjustments to classification results"""
        
        # Example context adjustments
        session_history = context.get("session_history", [])
        
        # If user just greeted and asks "what is this", it's likely platform_overview
        if (intent == "fallback" and session_history and 
            session_history[-1].get("intent") == "greet"):
            
            # Simple keyword matching for context
            text_lower = context.get("original_text", "").lower()
            if any(word in text_lower for word in ["what", "this", "platform", "site"]):
                return "platform_overview", max(confidence, 0.6)
        
        # Boost confidence for certain intents based on context
        user_type = context.get("user_type")
        if user_type == "new_user" and intent == "how_to_start":
            confidence = min(confidence * 1.1, 1.0)
        
        return intent, confidence
    
    async def get_intent_probabilities(self, text: str) -> Dict[str, float]:
        """
        Get probabilities for all intents
        
        Args:
            text: User input text
        
        Returns:
            Dictionary mapping intents to their probabilities
        """
        if not self.is_initialized:
            raise RuntimeError("Intent classifier not initialized")
        
        try:
            processed_text = await self._preprocess_text(text)
            
            if not processed_text:
                return {"fallback": 1.0}
            
            probabilities = self.model.predict_proba([processed_text])[0]
            classes = self.model.classes_
            
            return dict(zip(classes, probabilities.tolist()))
        
        except Exception as e:
            self.logger.error(f"Error getting intent probabilities: {str(e)}")
            return {"fallback": 1.0}
    
    async def retrain_model(self) -> bool:
        """
        Retrain the model with current training data
        
        Returns:
            True if successful, False otherwise
        """
        try:
            model_path = os.path.join(settings.MODEL_PATH, settings.INTENT_MODEL_NAME)
            vectorizer_path = os.path.join(settings.MODEL_PATH, settings.VECTORIZER_NAME)
            
            # Backup existing models
            if os.path.exists(model_path):
                os.rename(model_path, f"{model_path}.backup")
            if os.path.exists(vectorizer_path):
                os.rename(vectorizer_path, f"{vectorizer_path}.backup")
            
            # Train new model
            await self._train_and_save_model(model_path, vectorizer_path)
            
            self.logger.info("✅ Model retrained successfully")
            return True
        
        except Exception as e:
            self.logger.error(f"❌ Failed to retrain model: {str(e)}")
            
            # Restore backup if training failed
            backup_model = f"{model_path}.backup"
            backup_vectorizer = f"{vectorizer_path}.backup"
            
            if os.path.exists(backup_model):
                os.rename(backup_model, model_path)
            if os.path.exists(backup_vectorizer):
                os.rename(backup_vectorizer, vectorizer_path)
            
            return False
    
    async def _train_and_save_model_custom(self, texts: List[str], labels: List[str], model_version: str) -> None:
        """
        Train and save model with custom data and version
        """
        try:
            # Preprocess texts
            processed_texts = [await self._preprocess_text(text) for text in texts]
            
            # Create and train pipeline
            self.vectorizer = TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                strip_accents='ascii'
            )
            
            classifier = MultinomialNB(alpha=0.1)
            
            self.model = Pipeline([
                ('vectorizer', self.vectorizer),
                ('classifier', classifier)
            ])
            
            # Train the model
            self.model.fit(processed_texts, labels)
            
            # Save model with version
            model_path = os.path.join(settings.MODEL_PATH, f"models/{model_version}_{settings.INTENT_MODEL_NAME}")
            vectorizer_path = os.path.join(settings.MODEL_PATH, f"models/{model_version}_{settings.VECTORIZER_NAME}")
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            with open(vectorizer_path, 'wb') as f:
                pickle.dump(self.vectorizer, f)
            
            self.logger.info(f"✅ Model {model_version} trained and saved")
        
        except Exception as e:
            self.logger.error(f"❌ Failed to train custom model: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict:
        """Get information about the current model"""
        return {
            "is_initialized": self.is_initialized,
            "model_type": "TF-IDF + Naive Bayes Pipeline",
            "spacy_model": settings.NLP_MODEL if self.nlp else None,
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
            "supported_intents": self.intent_labels,
            "total_intents": len(self.intent_labels)
        } 