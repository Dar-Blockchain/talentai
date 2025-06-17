#!/usr/bin/env python3
"""
Test script for DeepSeek AI integration
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.config import settings
from app.services.deepseek_service import deepseek_service
from app.core.response_generator import ResponseGenerator


async def test_deepseek_integration():
    """Test the DeepSeek AI integration"""
    
    print("🧪 Testing DeepSeek AI Integration")
    print("=" * 50)
    
    # 1. Check configuration
    print(f"📋 Configuration Check:")
    print(f"   ENABLE_DEEPSEEK_FALLBACK: {settings.ENABLE_DEEPSEEK_FALLBACK}")
    print(f"   TOGETHER_API_KEY configured: {bool(settings.TOGETHER_API_KEY)}")
    print(f"   DEEPSEEK_MODEL: {settings.DEEPSEEK_MODEL}")
    print(f"   FALLBACK_CONFIDENCE_THRESHOLD: {settings.FALLBACK_CONFIDENCE_THRESHOLD}")
    print()
    
    # 2. Check service status
    print(f"🤖 DeepSeek Service Status:")
    print(f"   Service enabled: {deepseek_service.is_enabled}")
    print(f"   Service available: {deepseek_service.is_available()}")
    print(f"   Client initialized: {deepseek_service.client is not None}")
    print()
    
    if not deepseek_service.is_available():
        print("❌ DeepSeek service is not available!")
        if not settings.TOGETHER_API_KEY:
            print("   💡 Please set TOGETHER_API_KEY in your environment or .env file")
        return
    
    # 3. Test direct service call
    print("🎯 Testing Direct Service Call:")
    test_query = "What is quantum computing and how does it work?"
    
    try:
        response = await deepseek_service.generate_fallback_response(
            test_query,
            {"conversation_turn": 1, "session_history": []}
        )
        
        if response:
            print(f"   ✅ Success! Response length: {len(response)} characters")
            print(f"   📝 Response preview: {response[:150]}...")
        else:
            print("   ❌ Failed! Empty response received")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    print()
    
    # 4. Test response generator integration
    print("🔄 Testing Response Generator Integration:")
    generator = ResponseGenerator()
    
    # Test with low confidence (should trigger DeepSeek)
    test_cases = [
        ("What is the meaning of life?", "fallback", 0.1),
        ("How do I bake a cake?", "fallback", 0.3),
        ("Tell me about machine learning", "unknown_topic", 0.2)
    ]
    
    for i, (query, intent, confidence) in enumerate(test_cases, 1):
        print(f"   Test {i}: '{query}' (intent: {intent}, confidence: {confidence})")
        
        try:
            response = await generator.generate_response(
                intent=intent,
                confidence=confidence,
                user_input=query,
                user_id="test_user",
                session_id="test_session"
            )
            
            response_intent = response.get("intent", "unknown")
            powered_by = response.get("context", {}).get("powered_by", "Standard")
            
            print(f"      Response intent: {response_intent}")
            print(f"      Powered by: {powered_by}")
            print(f"      Response preview: {response['response'][:100]}...")
            print()
            
        except Exception as e:
            print(f"      ❌ Error: {str(e)}")
            print()


async def test_toggle_functionality():
    """Test the toggle functionality"""
    
    print("🔄 Testing Toggle Functionality:")
    print("=" * 50)
    
    original_state = deepseek_service.is_enabled
    
    # Disable service
    deepseek_service.is_enabled = False
    settings.ENABLE_DEEPSEEK_FALLBACK = False
    print(f"   Disabled service - Available: {deepseek_service.is_available()}")
    
    # Enable service 
    deepseek_service.is_enabled = True and bool(settings.TOGETHER_API_KEY)
    settings.ENABLE_DEEPSEEK_FALLBACK = True
    print(f"   Enabled service - Available: {deepseek_service.is_available()}")
    
    # Restore original state
    deepseek_service.is_enabled = original_state
    print(f"   Restored original state - Available: {deepseek_service.is_available()}")


if __name__ == "__main__":
    print("🚀 Starting DeepSeek AI Integration Tests\n")
    
    asyncio.run(test_deepseek_integration())
    asyncio.run(test_toggle_functionality())
    
    print("\n✨ Test completed!")
    print("\n💡 If DeepSeek is not working:")
    print("   1. Set TOGETHER_API_KEY in your .env file")
    print("   2. Ensure ENABLE_DEEPSEEK_FALLBACK=true")
    print("   3. Check your internet connection")
    print("   4. Verify your Together AI credits/quota") 