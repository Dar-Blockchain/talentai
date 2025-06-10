#!/usr/bin/env python3
"""
Enhanced Typo Handling and Learning Analytics for TalentAI Chatbot
"""

import sys
import os
import asyncio
import sqlite3
import re
from difflib import SequenceMatcher
from typing import Dict, List, Tuple
import requests
import json

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def fuzzy_spell_correct(text: str, vocabulary: List[str], threshold: float = 0.6) -> str:
    """
    Enhanced spell correction using fuzzy matching
    """
    words = text.lower().split()
    corrected_words = []
    
    for word in words:
        if len(word) < 3:  # Skip very short words
            corrected_words.append(word)
            continue
            
        best_match = None
        best_score = 0
        
        for vocab_word in vocabulary:
            # Calculate similarity
            similarity = SequenceMatcher(None, word, vocab_word.lower()).ratio()
            
            if similarity > best_score and similarity >= threshold:
                best_match = vocab_word.lower()
                best_score = similarity
        
        if best_match and best_score > threshold:
            corrected_words.append(best_match)
        else:
            corrected_words.append(word)
    
    return ' '.join(corrected_words)

def enhanced_text_preprocessing(text: str) -> str:
    """
    Enhanced text preprocessing with better typo handling
    """
    # Common typo patterns and their corrections
    typo_corrections = {
        r'\bwgat\b': 'what',
        r'\bwhta\b': 'what', 
        r'\bwhat si\b': 'what is',
        r'\bwht\b': 'what',
        r'\btalentai\b': 'talentai',
        r'\btalent ai\b': 'talentai',
        r'\bhwo\b': 'how',
        r'\bhow\s+do\s+i\s+get\s+start\b': 'how do i get started',
        r'\bget\s+start\b': 'get started',
        r'\bstrat\b': 'start',
        r'\bbegin\b': 'start',
        r'\bskils\b': 'skills',
        r'\bskill\b': 'skills',
        r'\btets\b': 'test',
        r'\btset\b': 'test',
        r'\btest\b': 'testing',
        r'\bcertificat\b': 'certificate',
        r'\bcertification\b': 'certifications',
        r'\bai\s+recrut\b': 'ai recruitment',
        r'\brecruit\b': 'recruitment',
        r'\baccurat\b': 'accurate',
        r'\bassesment\b': 'assessment',
        r'\bassess\b': 'assessment',
        r'\bplaform\b': 'platform',
        r'\bplatform\b': 'platform',
    }
    
    # Apply corrections
    corrected_text = text.lower()
    for pattern, replacement in typo_corrections.items():
        corrected_text = re.sub(pattern, replacement, corrected_text, flags=re.IGNORECASE)
    
    return corrected_text

def check_learning_database():
    """
    Check the learning database and display analytics
    """
    print("🔍 Analyzing Learning Database...")
    print("=" * 60)
    
    try:
        # Connect to the database
        db_path = "app/learning/data/learning.db"
        if not os.path.exists(db_path):
            print("❌ Learning database not found!")
            return
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check conversations
        cursor.execute("SELECT COUNT(*) FROM conversations")
        total_conversations = cursor.fetchone()[0]
        print(f"📊 Total Conversations: {total_conversations}")
        
        # Check feedback
        cursor.execute("SELECT COUNT(*) FROM feedback")
        total_feedback = cursor.fetchone()[0]
        print(f"👍 Total Feedback: {total_feedback}")
        
        # Check recent conversations
        cursor.execute("""
            SELECT user_message, predicted_intent, confidence, response_time 
            FROM conversations 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        recent_conversations = cursor.fetchall()
        
        print(f"\n📝 Recent Conversations ({len(recent_conversations)}):")
        for i, (msg, intent, conf, resp_time) in enumerate(recent_conversations, 1):
            print(f"  {i}. Message: '{msg[:50]}...'")
            print(f"     Intent: {intent} (confidence: {conf:.3f})")
            print(f"     Response time: {resp_time:.3f}s")
            print()
        
        # Check feedback patterns
        cursor.execute("""
            SELECT feedback_type, COUNT(*) as count 
            FROM feedback 
            GROUP BY feedback_type
        """)
        feedback_stats = cursor.fetchall()
        
        if feedback_stats:
            print("📈 Feedback Statistics:")
            for feedback_type, count in feedback_stats:
                print(f"  {feedback_type}: {count}")
        
        # Check model versions
        cursor.execute("SELECT COUNT(*) FROM model_versions")
        model_versions = cursor.fetchone()[0]
        print(f"\n🤖 Model Versions: {model_versions}")
        
        # Check training data
        cursor.execute("SELECT COUNT(*) FROM training_data")
        training_data_count = cursor.fetchone()[0]
        print(f"📚 Training Data Records: {training_data_count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error accessing database: {str(e)}")

def test_typo_handling():
    """
    Test the chatbot with various typos to see how well it handles them
    """
    print("\n🔬 Testing Typo Handling Capabilities...")
    print("=" * 60)
    
    typo_test_cases = [
        ("wgat is talentai", "What is TalentAI"),
        ("hwo do i get strated", "How do I get started"),
        ("tell me abut certifikation", "Tell me about certification"),
        ("wat skils can i tset", "What skills can I test"),
        ("hwo does ai recrut work", "How does AI recruitment work"),
        ("hwo accurat are assesments", "How accurate are assessments"),
        ("hlep me get startd", "Help me get started"),
        ("wat is this plaform", "What is this platform"),
        ("tel me mor about talnt ai", "Tell me more about TalentAI"),
        ("hw 2 begin testin", "How to begin testing")
    ]
    
    for typo_text, intended_text in typo_test_cases:
        try:
            response = requests.post(
                'http://localhost:8001/api/chat',
                json={
                    'message': typo_text,
                    'user_id': 'typo_test',
                    'session_id': 'typo_test_session'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                intent = data.get('intent', 'unknown')
                confidence = data.get('confidence', 0)
                
                print(f"📝 Typo: '{typo_text}'")
                print(f"🎯 Intended: '{intended_text}'")
                print(f"🤖 Intent: {intent} (confidence: {confidence:.3f})")
                print(f"✅ Status: {'PASS' if intent != 'fallback' else 'FAIL'}")
                print("-" * 50)
            else:
                print(f"❌ Error testing '{typo_text}': {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception testing '{typo_text}': {str(e)}")

def simulate_learning_data():
    """
    Simulate some conversations to populate the learning database
    """
    print("\n🎯 Simulating Learning Data...")
    print("=" * 40)
    
    test_conversations = [
        "How do I get started with TalentAI?",
        "What is this platform about?",
        "Tell me about certifications",
        "How does AI recruitment work?",
        "What skills can I test?",
        "How accurate are the assessments?",
        "wgat is talentai",  # with typo
        "hwo to begin",     # with typo
        "help me get started",
        "what makes talentai different"
    ]
    
    for msg in test_conversations:
        try:
            response = requests.post(
                'http://localhost:8001/api/chat',
                json={
                    'message': msg,
                    'user_id': f'test_user_{hash(msg) % 100}',
                    'session_id': f'session_{hash(msg) % 50}'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Processed: '{msg[:30]}...' → {data.get('intent', 'unknown')}")
            else:
                print(f"❌ Failed: '{msg[:30]}...'")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print(f"\n📊 Processed {len(test_conversations)} test conversations")

def check_learning_insights():
    """
    Check learning insights via API
    """
    print("\n📈 Learning Insights...")
    print("=" * 30)
    
    try:
        response = requests.get('http://localhost:8001/api/learning/insights')
        if response.status_code == 200:
            insights = response.json()
            print(json.dumps(insights, indent=2))
        else:
            print(f"❌ Failed to get insights: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    """
    Main function to run all analyses
    """
    print("🚀 TalentAI Chatbot: Enhanced Typo Handling & Learning Analytics")
    print("=" * 80)
    
    # 1. Check current learning database
    check_learning_database()
    
    # 2. Simulate some learning data
    simulate_learning_data()
    
    # 3. Test typo handling
    test_typo_handling()
    
    # 4. Check learning insights
    check_learning_insights()
    
    # 5. Check database again after simulation
    print("\n" + "=" * 80)
    print("🔄 Updated Database Status:")
    check_learning_database()

if __name__ == "__main__":
    main() 