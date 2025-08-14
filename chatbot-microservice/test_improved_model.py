#!/usr/bin/env python3
"""
Test script to verify improved chatbot model performance
"""

import requests
import json

def test_chatbot(message):
    """Test a message with the chatbot"""
    try:
        response = requests.post(
            'http://localhost:8001/api/chat', 
            json={
                'message': message, 
                'user_id': 'test', 
                'session_id': 'test_session'
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n📝 Message: {message}")
            print(f"🤖 Response: {data['response']}")
            print(f"🎯 Intent: {data['intent']}")
            print(f"📊 Confidence: {data['confidence']:.3f} ({data['confidence']*100:.1f}%)")
            print("-" * 80)
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def main():
    """Test the improved model with problematic queries"""
    print("🚀 Testing TalentAI Chatbot with Improved Training Data")
    print("=" * 80)
    
    # Test the queries that were previously failing
    test_queries = [
        "How do I get started with the platform?",
        "hello, what is talentai",
        "wgat is talentai",  # With typo
        "how to begin",
        "what is this platform",
        "help me get started",
        "what skills can i test",
        "tell me about certifications",
        "how does ai recruitment work",
        "what makes talentai different",
        "how accurate are the skill assessments"
    ]
    
    for query in test_queries:
        test_chatbot(query)

if __name__ == "__main__":
    main() 