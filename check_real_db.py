#!/usr/bin/env python3
"""
Check the real learning database
"""

import sqlite3
import os

def check_real_database():
    db_path = "models/learning/chatbot_learning.db"
    
    if not os.path.exists(db_path):
        print("❌ Real database not found!")
        return
    
    print("📊 TalentAI REAL Learning Database Analysis")
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
            # Get columns first
            cursor.execute("PRAGMA table_info(conversations)")
            columns = cursor.fetchall()
            print(f"\n📋 Columns in conversations table:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
                
            # Get recent conversations
            cursor.execute("SELECT * FROM conversations ORDER BY rowid DESC LIMIT 3")
            recent = cursor.fetchall()
            print(f"\n📝 Recent Conversations (latest 3):")
            for i, row in enumerate(recent, 1):
                print(f"  {i}. {row}")
    
    conn.close()
    print("\n✅ Real database check complete!")

if __name__ == "__main__":
    check_real_database() 