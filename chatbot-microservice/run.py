#!/usr/bin/env python3
"""
TalentAI Chatbot Microservice Startup Script

Simple script to run the chatbot service with proper configuration.
"""

import sys
import os
import argparse
import uvicorn

# Add the app directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings


def main():
    """Main function to run the chatbot service"""
    
    parser = argparse.ArgumentParser(description="TalentAI Chatbot Microservice")
    parser.add_argument(
        "--host", 
        default=settings.API_HOST,
        help=f"Host to bind to (default: {settings.API_HOST})"
    )
    parser.add_argument(
        "--port", 
        type=int,
        default=settings.API_PORT,
        help=f"Port to bind to (default: {settings.API_PORT})"
    )
    parser.add_argument(
        "--reload", 
        action="store_true",
        help="Enable auto-reload for development"
    )
    parser.add_argument(
        "--workers", 
        type=int,
        default=1,
        help="Number of worker processes (default: 1)"
    )
    parser.add_argument(
        "--log-level", 
        default=settings.LOG_LEVEL.lower(),
        choices=["critical", "error", "warning", "info", "debug"],
        help=f"Log level (default: {settings.LOG_LEVEL.lower()})"
    )
    
    args = parser.parse_args()
    
    print("🚀 Starting TalentAI Chatbot Microservice...")
    print(f"📍 Host: {args.host}")
    print(f"🔌 Port: {args.port}")
    print(f"🔧 Environment: {settings.API_ENVIRONMENT}")
    print(f"📝 Log Level: {args.log_level}")
    
    if args.reload:
        print("🔄 Auto-reload enabled (development mode)")
    
    print("🌟 Service starting...")
    print(f"📖 Documentation: http://{args.host}:{args.port}/docs")
    print(f"🔍 Health Check: http://{args.host}:{args.port}/health")
    print("-" * 50)
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1,
        log_level=args.log_level
    )


if __name__ == "__main__":
    main() 