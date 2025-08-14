"""
NLP functionality tests for TalentAI Chatbot
"""

import pytest
import asyncio

from app.core.intent_classifier import IntentClassifier
from app.core.response_generator import ResponseGenerator
from app.data.intents import get_all_training_examples, get_intents_list


class TestIntentClassifier:
    """Test intent classification functionality"""
    
    @pytest.fixture
    async def classifier(self):
        """Create and initialize intent classifier"""
        classifier = IntentClassifier()
        await classifier.initialize()
        return classifier
    
    @pytest.mark.asyncio
    async def test_classifier_initialization(self, classifier):
        """Test classifier initialization"""
        assert classifier.is_initialized
        assert classifier.intent_labels is not None
        assert len(classifier.intent_labels) > 0
    
    @pytest.mark.asyncio
    async def test_greeting_classification(self, classifier):
        """Test greeting intent classification"""
        test_cases = [
            "hello",
            "hi there",
            "good morning",
            "hey",
            "greetings"
        ]
        
        for message in test_cases:
            intent, confidence = await classifier.classify_intent(message)
            assert intent == "greet", f"Failed for message: {message}"
            assert confidence > 0.5, f"Low confidence for message: {message}"
    
    @pytest.mark.asyncio
    async def test_platform_overview_classification(self, classifier):
        """Test platform overview intent classification"""
        test_cases = [
            "what is talentai",
            "tell me about this platform",
            "what does talentai do",
            "explain this service",
            "what are you"
        ]
        
        for message in test_cases:
            intent, confidence = await classifier.classify_intent(message)
            assert intent == "platform_overview", f"Failed for message: {message}"
            assert confidence > 0.5, f"Low confidence for message: {message}"
    
    @pytest.mark.asyncio
    async def test_how_to_start_classification(self, classifier):
        """Test how to start intent classification"""
        test_cases = [
            "how do i start",
            "how to get started",
            "where do i begin",
            "getting started guide",
            "first steps"
        ]
        
        for message in test_cases:
            intent, confidence = await classifier.classify_intent(message)
            assert intent == "how_to_start", f"Failed for message: {message}"
            assert confidence > 0.5, f"Low confidence for message: {message}"
    
    @pytest.mark.asyncio
    async def test_scoring_classification(self, classifier):
        """Test scoring intent classification"""
        test_cases = [
            "how is the score calculated",
            "explain the scoring system",
            "how do you grade tests",
            "scoring methodology",
            "evaluation process"
        ]
        
        for message in test_cases:
            intent, confidence = await classifier.classify_intent(message)
            assert intent == "scoring", f"Failed for message: {message}"
            assert confidence > 0.5, f"Low confidence for message: {message}"
    
    @pytest.mark.asyncio
    async def test_certification_classification(self, classifier):
        """Test certification intent classification"""
        test_cases = [
            "where is my certificate",
            "blockchain certification",
            "how does certification work",
            "certificate verification",
            "hedera blockchain"
        ]
        
        for message in test_cases:
            intent, confidence = await classifier.classify_intent(message)
            assert intent == "certification", f"Failed for message: {message}"
            assert confidence > 0.5, f"Low confidence for message: {message}"
    
    @pytest.mark.asyncio
    async def test_fallback_classification(self, classifier):
        """Test fallback intent for unclear messages"""
        test_cases = [
            "asdfghjkl",
            "random text here",
            "gibberish",
            "xyz123",
            ""
        ]
        
        for message in test_cases:
            intent, confidence = await classifier.classify_intent(message)
            # Should either be fallback or have low confidence
            if intent != "fallback":
                assert confidence < 0.7, f"Unexpected high confidence for gibberish: {message}"
    
    @pytest.mark.asyncio
    async def test_empty_message_handling(self, classifier):
        """Test handling of empty messages"""
        intent, confidence = await classifier.classify_intent("")
        assert intent == "fallback"
        assert confidence == 0.0
    
    @pytest.mark.asyncio
    async def test_intent_probabilities(self, classifier):
        """Test getting all intent probabilities"""
        message = "hello there"
        probabilities = await classifier.get_intent_probabilities(message)
        
        assert isinstance(probabilities, dict)
        assert len(probabilities) > 0
        
        # Probabilities should sum to approximately 1
        total_prob = sum(probabilities.values())
        assert 0.99 <= total_prob <= 1.01
        
        # Highest probability should be greet
        max_intent = max(probabilities, key=probabilities.get)
        assert max_intent == "greet"
    
    @pytest.mark.asyncio
    async def test_context_aware_classification(self, classifier):
        """Test context-aware intent classification"""
        context = {
            "session_history": [{"intent": "greet"}],
            "original_text": "what is this platform",
            "user_type": "new_user"
        }
        
        intent, confidence = await classifier.classify_intent(
            "what is this",
            context=context
        )
        
        # Should boost platform_overview confidence due to context
        assert intent in ["platform_overview", "fallback"]
    
    @pytest.mark.asyncio
    async def test_text_preprocessing(self, classifier):
        """Test text preprocessing functionality"""
        # Test with messy input
        messy_text = "  HeLLo   ThErE!!!   "
        clean_text = await classifier._preprocess_text(messy_text)
        
        assert clean_text.strip() != ""
        assert clean_text.lower() == clean_text  # Should be lowercase
        assert "hello" in clean_text
        assert "there" in clean_text


class TestResponseGenerator:
    """Test response generation functionality"""
    
    @pytest.fixture
    def generator(self):
        """Create response generator"""
        return ResponseGenerator()
    
    @pytest.mark.asyncio
    async def test_greeting_response_generation(self, generator):
        """Test greeting response generation"""
        response = await generator.generate_response(
            intent="greet",
            confidence=0.9,
            user_input="hello",
            session_id="test_session"
        )
        
        assert "response" in response
        assert "intent" in response
        assert response["intent"] == "greet"
        assert "welcome" in response["response"].lower() or "hello" in response["response"].lower()
        assert len(response["suggestions"]) > 0
    
    @pytest.mark.asyncio
    async def test_platform_overview_response(self, generator):
        """Test platform overview response generation"""
        response = await generator.generate_response(
            intent="platform_overview",
            confidence=0.85,
            user_input="what is talentai",
            session_id="test_session"
        )
        
        assert response["intent"] == "platform_overview"
        assert "talentai" in response["response"].lower()
        assert "ai" in response["response"].lower() or "blockchain" in response["response"].lower()
    
    @pytest.mark.asyncio
    async def test_how_to_start_response(self, generator):
        """Test how to start response generation"""
        response = await generator.generate_response(
            intent="how_to_start",
            confidence=0.8,
            user_input="how do i start",
            session_id="test_session"
        )
        
        assert response["intent"] == "how_to_start"
        assert any(keyword in response["response"].lower() 
                  for keyword in ["start", "begin", "step", "account", "skill"])
    
    @pytest.mark.asyncio
    async def test_fallback_response(self, generator):
        """Test fallback response generation"""
        response = await generator.generate_response(
            intent="fallback",
            confidence=0.3,
            user_input="asdfghjkl",
            session_id="test_session"
        )
        
        assert response["intent"] == "fallback"
        assert any(keyword in response["response"].lower() 
                  for keyword in ["sorry", "understand", "help", "rephrase"])
    
    @pytest.mark.asyncio
    async def test_session_context_building(self, generator):
        """Test session context building"""
        session_id = "context_test_session"
        
        # First interaction
        response1 = await generator.generate_response(
            intent="greet",
            confidence=0.9,
            user_input="hello",
            session_id=session_id
        )
        
        assert response1["context"]["conversation_turn"] == 1
        
        # Second interaction
        response2 = await generator.generate_response(
            intent="platform_overview",
            confidence=0.8,
            user_input="what is this",
            session_id=session_id
        )
        
        assert response2["context"]["conversation_turn"] == 2
        assert response2["context"]["session_duration"] > 0
    
    @pytest.mark.asyncio
    async def test_personalization(self, generator):
        """Test response personalization"""
        session_id = "personalization_test"
        
        # First, create a session with preferences
        await generator.update_user_preferences(
            session_id,
            {"skill_area": "programming", "experience_level": "beginner"}
        )
        
        response = await generator.generate_response(
            intent="skills_and_tests",
            confidence=0.8,
            user_input="what skills can i test",
            session_id=session_id
        )
        
        # Should include personalized content
        assert "programming" in response["response"].lower() or "personalized" in response["response"].lower()
    
    @pytest.mark.asyncio
    async def test_conversation_summary(self, generator):
        """Test conversation summary generation"""
        session_id = "summary_test_session"
        
        # Create a conversation
        await generator.generate_response("greet", 0.9, "hello", session_id=session_id)
        await generator.generate_response("platform_overview", 0.8, "what is this", session_id=session_id)
        await generator.generate_response("how_to_start", 0.85, "how to start", session_id=session_id)
        
        summary = await generator.get_conversation_summary(session_id)
        
        assert summary is not None
        assert summary["total_turns"] == 3
        assert "greet" in summary["intents_discussed"]
        assert "platform_overview" in summary["intents_discussed"]
        assert "how_to_start" in summary["intents_discussed"]
        assert summary["average_confidence"] > 0.8
    
    @pytest.mark.asyncio
    async def test_session_cleanup(self, generator):
        """Test session cleanup functionality"""
        # Create some sessions
        for i in range(3):
            await generator.generate_response(
                "greet", 0.9, "hello", session_id=f"cleanup_test_{i}"
            )
        
        initial_count = generator.get_active_sessions_count()
        assert initial_count >= 3
        
        # Clean up very old sessions (0 hours = all sessions)
        cleaned = await generator.cleanup_old_sessions(max_age_hours=0)
        
        final_count = generator.get_active_sessions_count()
        assert final_count < initial_count
    
    @pytest.mark.asyncio
    async def test_error_response_generation(self, generator):
        """Test error response generation"""
        response = await generator._generate_error_response("error_test_session")
        
        assert response["intent"] == "error"
        assert response["confidence"] == 0.0
        assert "error" in response["response"].lower() or "sorry" in response["response"].lower()
        assert len(response["suggestions"]) > 0


class TestTrainingData:
    """Test training data quality and coverage"""
    
    def test_training_data_structure(self):
        """Test training data structure"""
        training_data = get_all_training_examples()
        
        assert isinstance(training_data, list)
        assert len(training_data) > 0
        
        # Check data structure
        for example in training_data[:5]:  # Check first 5
            assert isinstance(example, tuple)
            assert len(example) == 2
            assert isinstance(example[0], str)  # Text
            assert isinstance(example[1], str)  # Intent
    
    def test_intent_coverage(self):
        """Test that all intents have training examples"""
        training_data = get_all_training_examples()
        intents_list = get_intents_list()
        
        # Get intents from training data
        training_intents = set(example[1] for example in training_data)
        
        # Check coverage
        for intent in intents_list:
            assert intent in training_intents, f"Intent {intent} has no training examples"
    
    def test_intent_balance(self):
        """Test that intents have reasonable balance in training data"""
        training_data = get_all_training_examples()
        
        # Count examples per intent
        intent_counts = {}
        for _, intent in training_data:
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        # Check that each intent has reasonable number of examples
        for intent, count in intent_counts.items():
            assert count >= 5, f"Intent {intent} has too few training examples: {count}"
            assert count <= 50, f"Intent {intent} has too many training examples: {count}"
    
    def test_training_data_quality(self):
        """Test training data quality"""
        training_data = get_all_training_examples()
        
        for text, intent in training_data[:10]:  # Check first 10
            # Text should not be empty
            assert text.strip() != "", f"Empty training text for intent {intent}"
            
            # Text should be reasonable length
            assert 1 <= len(text.split()) <= 20, f"Unusual text length for: {text}"
            
            # Intent should be valid
            assert intent in get_intents_list(), f"Invalid intent: {intent}"


class TestPerformance:
    """Test performance of NLP components"""
    
    @pytest.mark.asyncio
    async def test_classification_speed(self):
        """Test intent classification speed"""
        classifier = IntentClassifier()
        await classifier.initialize()
        
        import time
        
        messages = ["hello", "what is talentai", "how do i start", "scoring system"]
        
        start_time = time.time()
        
        for message in messages * 10:  # 40 classifications
            await classifier.classify_intent(message)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Should classify at least 10 messages per second
        assert total_time < 4.0, f"Classification too slow: {total_time:.2f}s for 40 messages"
    
    @pytest.mark.asyncio
    async def test_response_generation_speed(self):
        """Test response generation speed"""
        generator = ResponseGenerator()
        
        import time
        
        start_time = time.time()
        
        for i in range(10):
            await generator.generate_response(
                intent="greet",
                confidence=0.9,
                user_input="hello",
                session_id=f"speed_test_{i}"
            )
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Should generate at least 5 responses per second
        assert total_time < 2.0, f"Response generation too slow: {total_time:.2f}s for 10 responses"


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 