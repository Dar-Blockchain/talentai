#!/usr/bin/env python3
"""
Manual retraining script for the intent classifier
"""

import asyncio
import os
import sys

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.core.intent_classifier import IntentClassifier
from app.data.intents import get_all_training_examples


async def test_specific_queries():
    """Test the queries that were failing"""
    
    classifier = IntentClassifier()
    await classifier.initialize()
    
    print("\n🔍 Testing Specific Problem Queries:")
    print("=" * 60)
    
    test_queries = [
        "How do I get started with the platform?",
        "hello, what is talentai", 
        "how to begin",
        "what is this platform",
        "help me get started",
        "tell me about certifications",
        "how does ai recruitment work",
        "how accurate are the skill assessments"
    ]
    
    for query in test_queries:
        intent, confidence = await classifier.classify_intent(query)
        print(f"📝 '{query}'")
        print(f"   🎯 Intent: {intent}")
        print(f"   📊 Confidence: {confidence:.3f} ({confidence*100:.1f}%)")
        print(f"   ✅ Status: {'PASS' if intent != 'fallback' else 'FAIL'}")
        print()

async def manual_retrain():
    """Manually retrain the model"""
    print("🔄 Starting Manual Retraining...")
    
    # Remove existing model files
    model_files = ['models/intent_classifier.pkl', 'models/tfidf_vectorizer.pkl']
    for file_path in model_files:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"🗑️  Removed {file_path}")
    
    # Initialize classifier (this will trigger training)
    classifier = IntentClassifier()
    await classifier.initialize()
    
    # Get training data info
    training_data = get_all_training_examples()
    print(f"📊 Training data: {len(training_data)} examples")
    
    # Count examples per intent
    intent_counts = {}
    for text, intent in training_data:
        intent_counts[intent] = intent_counts.get(intent, 0) + 1
    
    print("\n📈 Examples per intent:")
    for intent, count in sorted(intent_counts.items()):
        print(f"   {intent}: {count} examples")
    
    print("\n✅ Retraining completed!")
    return classifier

async def main():
    """Main function"""
    print("🤖 TalentAI Chatbot Manual Retraining Tool")
    print("=" * 50)
    
    # Step 1: Retrain the model
    classifier = await manual_retrain()
    
    # Step 2: Test with problematic queries
    await test_specific_queries()

if __name__ == "__main__":
    asyncio.run(main()) 