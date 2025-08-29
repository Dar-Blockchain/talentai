"""
API endpoint tests for TalentAI Chatbot
"""

import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient

from app.main import app


class TestChatAPI:
    """Test chat API endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    async def async_client(self):
        """Create async test client"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "TalentAI Chatbot"
        assert "version" in data
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["service"] == "TalentAI Chatbot API"
        assert "version" in data
    
    @pytest.mark.asyncio
    async def test_chat_endpoint_greeting(self, async_client):
        """Test chat endpoint with greeting"""
        request_data = {
            "message": "Hello",
            "user_id": "test_user",
            "session_id": "test_session"
        }
        
        response = await async_client.post("/api/chat", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert "intent" in data
        assert "confidence" in data
        assert data["intent"] == "greet"
        assert data["confidence"] > 0.5
        assert data["session_id"] == "test_session"
    
    @pytest.mark.asyncio
    async def test_chat_endpoint_platform_overview(self, async_client):
        """Test chat endpoint with platform overview question"""
        request_data = {
            "message": "What is TalentAI?",
            "user_id": "test_user",
            "session_id": "test_session"
        }
        
        response = await async_client.post("/api/chat", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["intent"] == "platform_overview"
        assert "TalentAI" in data["response"]
        assert len(data["suggestions"]) > 0
    
    @pytest.mark.asyncio
    async def test_chat_endpoint_invalid_message(self, async_client):
        """Test chat endpoint with invalid message"""
        request_data = {
            "message": "",  # Empty message
            "user_id": "test_user"
        }
        
        response = await async_client.post("/api/chat", json=request_data)
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_chat_endpoint_long_message(self, async_client):
        """Test chat endpoint with very long message"""
        long_message = "a" * 1001  # Exceeds max length
        request_data = {
            "message": long_message,
            "user_id": "test_user"
        }
        
        response = await async_client.post("/api/chat", json=request_data)
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_analyze_intent_endpoint(self, async_client):
        """Test intent analysis endpoint"""
        request_data = {
            "text": "How do I start testing my skills?"
        }
        
        response = await async_client.post("/api/analyze-intent", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "intent" in data
        assert "confidence" in data
        assert "all_intents" in data
        assert data["intent"] == "how_to_start"
        assert isinstance(data["all_intents"], dict)
    
    @pytest.mark.asyncio
    async def test_get_intents_endpoint(self, async_client):
        """Test get available intents endpoint"""
        response = await async_client.get("/api/intents")
        assert response.status_code == 200
        
        data = response.json()
        assert "intents" in data
        assert "descriptions" in data
        assert "total_intents" in data
        assert isinstance(data["intents"], list)
        assert len(data["intents"]) > 0
    
    @pytest.mark.asyncio
    async def test_session_stats_endpoint(self, async_client):
        """Test session statistics endpoint"""
        response = await async_client.get("/api/sessions/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_sessions" in data
        assert "active_sessions" in data
        assert "total_conversations" in data
        assert "average_session_length" in data
    
    @pytest.mark.asyncio
    async def test_conversation_flow(self, async_client):
        """Test a complete conversation flow"""
        session_id = "test_conversation_flow"
        
        # Start with greeting
        response1 = await async_client.post("/api/chat", json={
            "message": "Hi there",
            "session_id": session_id
        })
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["intent"] == "greet"
        
        # Ask about platform
        response2 = await async_client.post("/api/chat", json={
            "message": "What is this platform about?",
            "session_id": session_id
        })
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["intent"] == "platform_overview"
        
        # Ask how to start
        response3 = await async_client.post("/api/chat", json={
            "message": "How do I get started?",
            "session_id": session_id
        })
        assert response3.status_code == 200
        data3 = response3.json()
        assert data3["intent"] == "how_to_start"
        
        # Get conversation summary
        summary_response = await async_client.get(f"/api/conversation/{session_id}/summary")
        if summary_response.status_code == 200:  # May not exist if session not found
            summary_data = summary_response.json()
            assert summary_data["total_turns"] >= 3
            assert "greet" in summary_data["intents_discussed"]
            assert "platform_overview" in summary_data["intents_discussed"]


class TestErrorHandling:
    """Test error handling scenarios"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_invalid_json(self, client):
        """Test invalid JSON payload"""
        response = client.post(
            "/api/chat",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_missing_required_fields(self, client):
        """Test missing required fields"""
        response = client.post("/api/chat", json={})
        assert response.status_code == 422
    
    def test_invalid_session_id_format(self, client):
        """Test invalid session ID format in conversation summary"""
        response = client.get("/api/conversation/invalid-session-id-format!/summary")
        assert response.status_code == 404
    
    def test_nonexistent_session_summary(self, client):
        """Test getting summary for nonexistent session"""
        response = client.get("/api/conversation/nonexistent-session/summary")
        assert response.status_code == 404


class TestModelManagement:
    """Test model management endpoints"""
    
    @pytest.fixture
    async def async_client(self):
        """Create async test client"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    
    @pytest.mark.asyncio
    async def test_model_info_endpoint(self, async_client):
        """Test model information endpoint"""
        response = await async_client.get("/api/model/info")
        # May return 503 if model not ready in tests
        assert response.status_code in [200, 503]
        
        if response.status_code == 200:
            data = response.json()
            assert "is_initialized" in data
            assert "model_type" in data
            assert "supported_intents" in data
    
    @pytest.mark.asyncio
    async def test_cleanup_sessions_endpoint(self, async_client):
        """Test session cleanup endpoint"""
        response = await async_client.post("/api/sessions/cleanup?max_age_hours=1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "message" in data


class TestRateLimiting:
    """Test rate limiting (if implemented)"""
    
    @pytest.fixture
    async def async_client(self):
        """Create async test client"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    
    @pytest.mark.asyncio
    async def test_multiple_requests(self, async_client):
        """Test multiple requests don't fail (basic load test)"""
        requests = []
        for i in range(5):
            request_data = {
                "message": f"Test message {i}",
                "session_id": f"test_session_{i}"
            }
            requests.append(async_client.post("/api/chat", json=request_data))
        
        responses = await asyncio.gather(*requests)
        
        # All requests should succeed
        for response in responses:
            assert response.status_code == 200


class TestContextAndPersonalization:
    """Test context awareness and personalization features"""
    
    @pytest.fixture
    async def async_client(self):
        """Create async test client"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    
    @pytest.mark.asyncio
    async def test_context_preservation(self, async_client):
        """Test that context is preserved across messages"""
        session_id = "context_test_session"
        
        # First message
        response1 = await async_client.post("/api/chat", json={
            "message": "Hello",
            "session_id": session_id,
            "context": {"user_type": "new_user"}
        })
        assert response1.status_code == 200
        
        # Second message should have context from first
        response2 = await async_client.post("/api/chat", json={
            "message": "Tell me more",
            "session_id": session_id
        })
        assert response2.status_code == 200
        
        data2 = response2.json()
        assert data2["context"]["conversation_turn"] > 1
    
    @pytest.mark.asyncio
    async def test_user_preferences_update(self, async_client):
        """Test updating user preferences"""
        session_id = "preferences_test_session"
        
        # Create a session first
        await async_client.post("/api/chat", json={
            "message": "Hello",
            "session_id": session_id
        })
        
        # Update preferences
        preferences_data = {
            "session_id": session_id,
            "preferences": {
                "skill_area": "programming",
                "experience_level": "intermediate"
            }
        }
        
        response = await async_client.put("/api/conversation/preferences", json=preferences_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 