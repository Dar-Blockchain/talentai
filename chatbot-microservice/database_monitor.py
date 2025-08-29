#!/usr/bin/env python3
"""
Comprehensive Database Monitoring and Learning Analytics Tool
"""

import os
import sys
import sqlite3
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List
import argparse

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

class ChatbotAnalytics:
    """Comprehensive analytics for the chatbot learning system"""
    
    def __init__(self):
        self.db_path = "app/learning/data/learning.db"
        self.api_base = "http://localhost:8001/api"
        
    def check_database_exists(self) -> bool:
        """Check if the learning database exists"""
        return os.path.exists(self.db_path)
    
    def create_database_if_missing(self):
        """Create the database if it doesn't exist"""
        if not self.check_database_exists():
            print("🔧 Database not found. Creating learning database...")
            try:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
                
                # Initialize database with basic structure
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                # Create basic tables
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS conversations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        user_id TEXT,
                        session_id TEXT,
                        user_message TEXT,
                        predicted_intent TEXT,
                        confidence REAL,
                        actual_response TEXT,
                        response_time REAL
                    )
                ''')
                
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS feedback (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        conversation_id INTEGER,
                        feedback_type TEXT,
                        feedback_value INTEGER,
                        user_comment TEXT,
                        FOREIGN KEY (conversation_id) REFERENCES conversations (id)
                    )
                ''')
                
                conn.commit()
                conn.close()
                print("✅ Database created successfully!")
                
            except Exception as e:
                print(f"❌ Error creating database: {str(e)}")
    
    def get_conversation_stats(self) -> Dict:
        """Get comprehensive conversation statistics"""
        if not self.check_database_exists():
            return {"error": "Database not found"}
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # Total conversations
        cursor.execute("SELECT COUNT(*) FROM conversations")
        stats['total_conversations'] = cursor.fetchone()[0]
        
        # Conversations by intent
        cursor.execute("""
            SELECT predicted_intent, COUNT(*) as count, AVG(confidence) as avg_confidence
            FROM conversations 
            GROUP BY predicted_intent 
            ORDER BY count DESC
        """)
        intent_stats = cursor.fetchall()
        stats['intent_distribution'] = [
            {
                'intent': intent,
                'count': count,
                'avg_confidence': round(conf, 3)
            } for intent, count, conf in intent_stats
        ]
        
        # Daily conversation trends
        cursor.execute("""
            SELECT DATE(timestamp) as date, COUNT(*) as count
            FROM conversations 
            GROUP BY DATE(timestamp) 
            ORDER BY date DESC 
            LIMIT 30
        """)
        daily_stats = cursor.fetchall()
        stats['daily_trends'] = [
            {'date': date, 'count': count} for date, count in daily_stats
        ]
        
        # Low confidence conversations
        cursor.execute("""
            SELECT user_message, predicted_intent, confidence
            FROM conversations 
            WHERE confidence < 0.5 
            ORDER BY timestamp DESC 
            LIMIT 20
        """)
        low_confidence = cursor.fetchall()
        stats['low_confidence_queries'] = [
            {
                'message': msg[:50] + '...' if len(msg) > 50 else msg,
                'intent': intent,
                'confidence': round(conf, 3)
            } for msg, intent, conf in low_confidence
        ]
        
        # Feedback statistics
        cursor.execute("""
            SELECT feedback_type, COUNT(*) as count
            FROM feedback 
            GROUP BY feedback_type
        """)
        feedback_stats = cursor.fetchall()
        stats['feedback_summary'] = dict(feedback_stats)
        
        conn.close()
        return stats
    
    def identify_learning_opportunities(self) -> List[Dict]:
        """Identify opportunities for improving the chatbot"""
        if not self.check_database_exists():
            return []
        
        opportunities = []
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Find frequently misclassified patterns
        cursor.execute("""
            SELECT user_message, predicted_intent, confidence, COUNT(*) as frequency
            FROM conversations 
            WHERE predicted_intent = 'fallback' AND confidence < 0.3
            GROUP BY user_message 
            HAVING frequency > 1
            ORDER BY frequency DESC
            LIMIT 10
        """)
        
        misclassified = cursor.fetchall()
        for msg, intent, conf, freq in misclassified:
            opportunities.append({
                'type': 'frequent_fallback',
                'message': msg,
                'frequency': freq,
                'confidence': conf,
                'suggestion': f"Add training examples similar to '{msg[:30]}...'"
            })
        
        # Find intents with low confidence
        cursor.execute("""
            SELECT predicted_intent, AVG(confidence) as avg_conf, COUNT(*) as count
            FROM conversations 
            WHERE predicted_intent != 'fallback'
            GROUP BY predicted_intent 
            HAVING avg_conf < 0.6 AND count > 3
            ORDER BY avg_conf ASC
        """)
        
        low_conf_intents = cursor.fetchall()
        for intent, avg_conf, count in low_conf_intents:
            opportunities.append({
                'type': 'low_confidence_intent',
                'intent': intent,
                'avg_confidence': avg_conf,
                'count': count,
                'suggestion': f"Review and expand training data for '{intent}' intent"
            })
        
        conn.close()
        return opportunities
    
    def generate_learning_report(self):
        """Generate a comprehensive learning report"""
        print("📊 TalentAI Chatbot Learning Analytics Report")
        print("=" * 60)
        print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Database status
        if not self.check_database_exists():
            print("❌ Learning database not found!")
            self.create_database_if_missing()
            return
        
        # Get statistics
        stats = self.get_conversation_stats()
        
        print(f"📈 Overview:")
        print(f"  Total Conversations: {stats['total_conversations']}")
        print(f"  Feedback Records: {sum(stats['feedback_summary'].values())}")
        print()
        
        # Intent distribution
        print("🎯 Intent Distribution:")
        for intent_data in stats['intent_distribution'][:10]:
            intent = intent_data['intent']
            count = intent_data['count']
            conf = intent_data['avg_confidence']
            print(f"  {intent:20} {count:4} conversations (avg conf: {conf:.3f})")
        print()
        
        # Recent trends
        if stats['daily_trends']:
            print("📅 Recent Activity:")
            for trend in stats['daily_trends'][:7]:
                print(f"  {trend['date']}: {trend['count']} conversations")
            print()
        
        # Low confidence queries
        if stats['low_confidence_queries']:
            print("⚠️  Low Confidence Queries (need attention):")
            for query in stats['low_confidence_queries'][:5]:
                print(f"  '{query['message']}' → {query['intent']} ({query['confidence']:.3f})")
            print()
        
        # Learning opportunities
        opportunities = self.identify_learning_opportunities()
        if opportunities:
            print("🎓 Learning Opportunities:")
            for opp in opportunities[:5]:
                print(f"  {opp['type']}: {opp['suggestion']}")
            print()
        
        # Feedback summary
        if stats['feedback_summary']:
            print("👍 Feedback Summary:")
            for feedback_type, count in stats['feedback_summary'].items():
                print(f"  {feedback_type}: {count}")
        else:
            print("👍 No feedback data yet")
        
        print("\n" + "=" * 60)
    
    def test_learning_system(self):
        """Test the learning system with various inputs"""
        print("🧪 Testing Learning System...")
        print("=" * 40)
        
        test_cases = [
            "How do I get started?",
            "wgat is talentai",  # typo
            "hlep me plese",     # multiple typos
            "tell me about AI recruitment",
            "how accurate r ur tests",  # informal
            "wat skills can i test",  # typo
        ]
        
        for test_input in test_cases:
            try:
                response = requests.post(
                    f"{self.api_base}/chat",
                    json={
                        'message': test_input,
                        'user_id': 'test_analytics',
                        'session_id': 'analytics_session'
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    intent = data.get('intent', 'unknown')
                    confidence = data.get('confidence', 0)
                    print(f"  '{test_input}' → {intent} ({confidence:.3f})")
                else:
                    print(f"  '{test_input}' → ERROR ({response.status_code})")
                    
            except Exception as e:
                print(f"  '{test_input}' → EXCEPTION: {str(e)}")
        
        print()
    
    def simulate_feedback(self):
        """Simulate user feedback to populate the system"""
        print("🎯 Simulating User Feedback...")
        
        try:
            # Get recent conversations from API insights
            insights_response = requests.get(f"{self.api_base}/learning/insights")
            if insights_response.status_code == 200:
                insights = insights_response.json()
                
                # Simulate positive feedback for high-confidence responses
                feedback_data = {
                    "conversation_id": "recent",
                    "feedback_type": "positive",
                    "comment": "Great response!"
                }
                
                feedback_response = requests.post(
                    f"{self.api_base}/feedback",
                    json=feedback_data
                )
                
                if feedback_response.status_code == 200:
                    print("✅ Simulated positive feedback")
                else:
                    print(f"❌ Failed to submit feedback: {feedback_response.status_code}")
            
        except Exception as e:
            print(f"❌ Error simulating feedback: {str(e)}")

def main():
    """Main function with command line interface"""
    parser = argparse.ArgumentParser(description='TalentAI Chatbot Analytics Tool')
    parser.add_argument('--report', action='store_true', help='Generate learning report')
    parser.add_argument('--test', action='store_true', help='Test the learning system')
    parser.add_argument('--feedback', action='store_true', help='Simulate feedback')
    parser.add_argument('--all', action='store_true', help='Run all analyses')
    
    args = parser.parse_args()
    
    analytics = ChatbotAnalytics()
    
    if args.all or not any([args.report, args.test, args.feedback]):
        # Run everything if no specific option chosen
        analytics.generate_learning_report()
        analytics.test_learning_system()
        analytics.simulate_feedback()
    else:
        if args.report:
            analytics.generate_learning_report()
        if args.test:
            analytics.test_learning_system()
        if args.feedback:
            analytics.simulate_feedback()

if __name__ == "__main__":
    main() 