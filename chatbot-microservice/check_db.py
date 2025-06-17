#!/usr/bin/env python3
"""
Simple script to check database contents
"""

import sqlite3
import os

def check_database():
    db_path = "app/learning/data/learning.db"
    
    if not os.path.exists(db_path):
        print("❌ Database not found!")
        return
    
    print("📊 TalentAI Learning Database Analysis")
    print("=" * 50)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"📁 Tables found: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check conversations if table exists
    if any('conversations' in str(table) for table in tables):
        cursor.execute("SELECT COUNT(*) FROM conversations")
        count = cursor.fetchone()[0]
        print(f"\n💬 Total Conversations: {count}")
        
        if count > 0:
            cursor.execute("SELECT user_message, predicted_intent, confidence FROM conversations ORDER BY timestamp DESC LIMIT 5")
            recent = cursor.fetchall()
            print(f"\n📝 Recent Conversations:")
            for i, (msg, intent, conf) in enumerate(recent, 1):
                print(f"  {i}. '{msg[:40]}...' → {intent} ({conf:.3f})")
    
    # Check feedback if table exists  
    if any('feedback' in str(table) for table in tables):
        cursor.execute("SELECT COUNT(*) FROM feedback")
        feedback_count = cursor.fetchone()[0]
        print(f"\n👍 Total Feedback: {feedback_count}")
    
    conn.close()
    print("\n✅ Database check complete!")

if __name__ == "__main__":
    check_database() 