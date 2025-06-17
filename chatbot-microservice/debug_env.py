#!/usr/bin/env python3
"""
Debug script to check environment variable loading
"""

import os
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

print("🔍 Environment Variable Debug")
print("=" * 50)

# Check current working directory
print(f"Current working directory: {os.getcwd()}")
print()

# Check for .env files
current_dir = Path(".")
parent_dir = Path("..")

env_files_to_check = [
    current_dir / ".env",
    parent_dir / ".env",
    Path(os.path.expanduser("~")) / ".env"
]

print("🔍 Checking for .env files:")
for env_file in env_files_to_check:
    if env_file.exists():
        print(f"   ✅ Found: {env_file.absolute()}")
        try:
            with open(env_file, 'r') as f:
                content = f.read()
                if 'TOGETHER_API_KEY' in content:
                    print(f"      📝 Contains TOGETHER_API_KEY")
                else:
                    print(f"      ❌ No TOGETHER_API_KEY found")
        except Exception as e:
            print(f"      ❌ Error reading file: {e}")
    else:
        print(f"   ❌ Not found: {env_file.absolute()}")
print()

# Check environment variables directly
print("🔍 Environment Variables:")
together_key = os.getenv('TOGETHER_API_KEY')
enable_deepseek = os.getenv('ENABLE_DEEPSEEK_FALLBACK')

print(f"   TOGETHER_API_KEY: {'✅ SET' if together_key else '❌ NOT SET'}")
if together_key:
    print(f"   Key preview: {together_key[:10]}...{together_key[-4:] if len(together_key) > 14 else 'too_short'}")

print(f"   ENABLE_DEEPSEEK_FALLBACK: {enable_deepseek or '❌ NOT SET'}")
print()

# Try loading with python-dotenv
try:
    from dotenv import load_dotenv
    
    print("🔍 Loading with python-dotenv:")
    
    # Try different .env file locations
    for env_file in env_files_to_check:
        if env_file.exists():
            print(f"   Trying to load: {env_file}")
            load_dotenv(env_file)
            
            # Check if variables are now available
            together_key_after = os.getenv('TOGETHER_API_KEY')
            enable_deepseek_after = os.getenv('ENABLE_DEEPSEEK_FALLBACK')
            
            print(f"   TOGETHER_API_KEY after load: {'✅ SET' if together_key_after else '❌ NOT SET'}")
            print(f"   ENABLE_DEEPSEEK_FALLBACK after load: {enable_deepseek_after or '❌ NOT SET'}")
            
            if together_key_after:
                break
    
except ImportError:
    print("❌ python-dotenv not available")
print()

# Try importing settings to see what they contain
try:
    from app.core.config import settings
    print("🔍 Settings from app.core.config:")
    print(f"   TOGETHER_API_KEY: {'✅ SET' if settings.TOGETHER_API_KEY else '❌ NOT SET'}")
    print(f"   ENABLE_DEEPSEEK_FALLBACK: {settings.ENABLE_DEEPSEEK_FALLBACK}")
    print(f"   DEEPSEEK_MODEL: {settings.DEEPSEEK_MODEL}")
    print(f"   FALLBACK_CONFIDENCE_THRESHOLD: {settings.FALLBACK_CONFIDENCE_THRESHOLD}")
    
except Exception as e:
    print(f"❌ Error importing settings: {e}")

print("\n💡 Recommendations:")
print("   1. Make sure your .env file is in the chatbot-microservice directory")
print("   2. Check that the variable name is exactly 'TOGETHER_API_KEY'")
print("   3. Ensure no extra spaces around the = sign")
print("   4. Make sure the file is saved as '.env' (not .env.txt)")
print("\n📝 Example .env file content:")
print("TOGETHER_API_KEY=your_api_key_here")
print("ENABLE_DEEPSEEK_FALLBACK=true") 