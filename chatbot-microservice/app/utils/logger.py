"""
Logging configuration for TalentAI Chatbot
"""

import logging
import logging.config
import os
import sys
from typing import Dict, Any

from app.core.config import settings


def setup_logging() -> None:
    """
    Setup comprehensive logging configuration
    """
    
    # Ensure log directory exists
    log_file = settings.LOG_FILE
    log_dir = os.path.dirname(log_file)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
    
    # Logging configuration
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "simple": {
                "format": "%(levelname)s - %(message)s"
            },
            "json": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "detailed",
                "stream": sys.stdout
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "detailed",
                "filename": log_file,
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8"
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": log_file.replace('.log', '_errors.log'),
                "maxBytes": 10485760,  # 10MB
                "backupCount": 3,
                "encoding": "utf8"
            }
        },
        "loggers": {
            "app": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file", "error_file"],
                "propagate": False
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console", "file", "error_file"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console", "file"],
                "propagate": False
            }
        },
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": ["console", "file"]
        }
    }
    
    # Apply configuration
    logging.config.dictConfig(logging_config)
    
    # Set specific loggers
    logging.getLogger("app").setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Suppress some noisy loggers in production
    if settings.API_ENVIRONMENT == "production":
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        logging.getLogger("requests").setLevel(logging.WARNING)
    
    # Log startup message
    logger = logging.getLogger("app.logger")
    logger.info("🔧 Logging system initialized")
    logger.info(f"📝 Log level: {settings.LOG_LEVEL}")
    logger.info(f"📁 Log file: {log_file}")


def get_logger(name: str = None) -> logging.Logger:
    """
    Get a logger instance
    
    Args:
        name: Logger name (defaults to calling module)
    
    Returns:
        Logger instance
    """
    if name is None:
        # Get the calling module name
        import inspect
        frame = inspect.currentframe().f_back
        name = frame.f_globals.get('__name__', 'app')
    
    return logging.getLogger(name)


class ChatbotLoggerAdapter(logging.LoggerAdapter):
    """
    Custom logger adapter for chatbot with context information
    """
    
    def process(self, msg, kwargs):
        """Add context information to log messages"""
        extra = self.extra
        
        if extra:
            context_parts = []
            
            if 'session_id' in extra:
                context_parts.append(f"session:{extra['session_id'][:8]}")
            
            if 'user_id' in extra:
                context_parts.append(f"user:{extra['user_id']}")
            
            if 'intent' in extra:
                context_parts.append(f"intent:{extra['intent']}")
            
            if context_parts:
                msg = f"[{', '.join(context_parts)}] {msg}"
        
        return msg, kwargs


def get_contextual_logger(name: str = None, **context) -> ChatbotLoggerAdapter:
    """
    Get a contextual logger with extra information
    
    Args:
        name: Logger name
        **context: Context information to include in logs
    
    Returns:
        Contextual logger adapter
    """
    logger = get_logger(name)
    return ChatbotLoggerAdapter(logger, context)


# Performance logging decorator
def log_performance(operation_name: str = None):
    """
    Decorator to log performance metrics
    """
    def decorator(func):
        import time
        import asyncio
        from functools import wraps
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            logger = get_logger(f"app.performance.{func.__module__}")
            op_name = operation_name or func.__name__
            
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(f"⏱️ {op_name} completed in {duration:.3f}s")
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"❌ {op_name} failed after {duration:.3f}s: {str(e)}")
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            logger = get_logger(f"app.performance.{func.__module__}")
            op_name = operation_name or func.__name__
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(f"⏱️ {op_name} completed in {duration:.3f}s")
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"❌ {op_name} failed after {duration:.3f}s: {str(e)}")
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Request logging middleware helper
def log_request_response(request_data: Dict, response_data: Dict, duration: float):
    """
    Log request/response information
    """
    logger = get_logger("app.api")
    
    # Extract key information
    endpoint = request_data.get("endpoint", "unknown")
    method = request_data.get("method", "unknown")
    status_code = response_data.get("status_code", 0)
    
    # Log request
    logger.info(
        f"🌐 {method} {endpoint} - {status_code} - {duration:.3f}s"
    )
    
    # Log detailed info in debug mode
    if settings.LOG_LEVEL == "DEBUG":
        logger.debug(f"Request data: {request_data}")
        logger.debug(f"Response data: {response_data}")


# Security logging
def log_security_event(event_type: str, details: Dict[str, Any], severity: str = "INFO"):
    """
    Log security-related events
    """
    logger = get_logger("app.security")
    
    message = f"🔒 Security Event: {event_type}"
    if details:
        message += f" - {details}"
    
    if severity.upper() == "ERROR":
        logger.error(message)
    elif severity.upper() == "WARNING":
        logger.warning(message)
    else:
        logger.info(message) 