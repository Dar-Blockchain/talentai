"""
Utility helper functions for TalentAI Chatbot
"""

import re
import hashlib
import secrets
import string
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json


def clean_text(text: str) -> str:
    """
    Clean and normalize text input
    
    Args:
        text: Raw text input
    
    Returns:
        Cleaned text
    """
    if not isinstance(text, str):
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?;:\'"()-]', '', text)
    
    return text


def generate_session_id() -> str:
    """
    Generate a unique session ID
    
    Returns:
        Unique session identifier
    """
    return f"session_{secrets.token_urlsafe(16)}"


def generate_request_id() -> str:
    """
    Generate a unique request ID
    
    Returns:
        Unique request identifier
    """
    return f"req_{secrets.token_urlsafe(12)}"


def hash_user_id(user_id: str, salt: Optional[str] = None) -> str:
    """
    Hash user ID for privacy
    
    Args:
        user_id: User identifier
        salt: Optional salt for hashing
    
    Returns:
        Hashed user ID
    """
    if not salt:
        salt = "talentai_chatbot_salt"
    
    combined = f"{user_id}:{salt}"
    return hashlib.sha256(combined.encode()).hexdigest()[:16]


def validate_message_length(message: str, max_length: int = 1000) -> bool:
    """
    Validate message length
    
    Args:
        message: Input message
        max_length: Maximum allowed length
    
    Returns:
        True if valid, False otherwise
    """
    return len(message.strip()) <= max_length


def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """
    Extract keywords from text
    
    Args:
        text: Input text
        min_length: Minimum keyword length
    
    Returns:
        List of keywords
    """
    # Simple keyword extraction
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Filter by length and remove common stop words
    stop_words = {
        'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'can', 'and',
        'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'among',
        'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself',
        'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
        'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
        'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
        'they', 'them', 'their', 'theirs', 'themselves'
    }
    
    keywords = [
        word for word in words 
        if len(word) >= min_length and word not in stop_words
    ]
    
    return list(set(keywords))  # Remove duplicates


def format_response_time(seconds: float) -> str:
    """
    Format response time in human-readable format
    
    Args:
        seconds: Time in seconds
    
    Returns:
        Formatted time string
    """
    if seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    else:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes:.0f}m {remaining_seconds:.0f}s"


def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculate simple text similarity using Jaccard index
    
    Args:
        text1: First text
        text2: Second text
    
    Returns:
        Similarity score between 0 and 1
    """
    # Convert to sets of words
    words1 = set(clean_text(text1).lower().split())
    words2 = set(clean_text(text2).lower().split())
    
    if not words1 and not words2:
        return 1.0
    
    if not words1 or not words2:
        return 0.0
    
    # Jaccard similarity
    intersection = len(words1.intersection(words2))
    union = len(words1.union(words2))
    
    return intersection / union if union > 0 else 0.0


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to specified length
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to add when truncated
    
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def mask_sensitive_data(data: Dict[str, Any], sensitive_fields: List[str] = None) -> Dict[str, Any]:
    """
    Mask sensitive data in dictionary
    
    Args:
        data: Input data dictionary
        sensitive_fields: List of fields to mask
    
    Returns:
        Dictionary with masked sensitive data
    """
    if sensitive_fields is None:
        sensitive_fields = ['password', 'token', 'api_key', 'secret', 'user_id']
    
    masked_data = data.copy()
    
    for field in sensitive_fields:
        if field in masked_data:
            value = str(masked_data[field])
            if len(value) > 8:
                masked_data[field] = value[:3] + "*" * (len(value) - 6) + value[-3:]
            else:
                masked_data[field] = "*" * len(value)
    
    return masked_data


def parse_user_agent(user_agent: str) -> Dict[str, str]:
    """
    Parse user agent string to extract basic information
    
    Args:
        user_agent: User agent string
    
    Returns:
        Dictionary with parsed information
    """
    if not user_agent:
        return {"browser": "unknown", "platform": "unknown"}
    
    ua_lower = user_agent.lower()
    
    # Detect browser
    browser = "unknown"
    if "chrome" in ua_lower:
        browser = "chrome"
    elif "firefox" in ua_lower:
        browser = "firefox"
    elif "safari" in ua_lower and "chrome" not in ua_lower:
        browser = "safari"
    elif "edge" in ua_lower:
        browser = "edge"
    elif "opera" in ua_lower:
        browser = "opera"
    
    # Detect platform
    platform = "unknown"
    if "windows" in ua_lower:
        platform = "windows"
    elif "mac" in ua_lower:
        platform = "macos"
    elif "linux" in ua_lower:
        platform = "linux"
    elif "android" in ua_lower:
        platform = "android"
    elif "iphone" in ua_lower or "ipad" in ua_lower:
        platform = "ios"
    
    return {"browser": browser, "platform": platform}


def rate_limit_key(identifier: str, endpoint: str) -> str:
    """
    Generate rate limit key
    
    Args:
        identifier: User or IP identifier
        endpoint: API endpoint
    
    Returns:
        Rate limit key
    """
    return f"rate_limit:{identifier}:{endpoint}"


def format_json_response(data: Any, pretty: bool = False) -> str:
    """
    Format data as JSON string
    
    Args:
        data: Data to format
        pretty: Whether to format with indentation
    
    Returns:
        JSON string
    """
    if pretty:
        return json.dumps(data, indent=2, ensure_ascii=False)
    return json.dumps(data, ensure_ascii=False)


def validate_session_id(session_id: str) -> bool:
    """
    Validate session ID format
    
    Args:
        session_id: Session identifier
    
    Returns:
        True if valid, False otherwise
    """
    if not session_id:
        return False
    
    # Should be alphanumeric with possible underscores and hyphens
    pattern = r'^[a-zA-Z0-9_-]+$'
    return bool(re.match(pattern, session_id)) and len(session_id) >= 8


def create_error_context(error: Exception, request_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Create error context for logging
    
    Args:
        error: Exception instance
        request_data: Optional request data
    
    Returns:
        Error context dictionary
    """
    context = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if request_data:
        context["request_data"] = mask_sensitive_data(request_data)
    
    return context


def calculate_confidence_level(score: float) -> str:
    """
    Convert confidence score to human-readable level
    
    Args:
        score: Confidence score (0-1)
    
    Returns:
        Confidence level string
    """
    if score >= 0.9:
        return "very_high"
    elif score >= 0.8:
        return "high"
    elif score >= 0.7:
        return "medium"
    elif score >= 0.5:
        return "low"
    else:
        return "very_low"


def generate_random_string(length: int = 8, charset: str = None) -> str:
    """
    Generate random string
    
    Args:
        length: String length
        charset: Character set to use
    
    Returns:
        Random string
    """
    if charset is None:
        charset = string.ascii_letters + string.digits
    
    return ''.join(secrets.choice(charset) for _ in range(length))


def is_valid_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address
    
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def time_ago(timestamp: datetime) -> str:
    """
    Get human-readable time difference
    
    Args:
        timestamp: Datetime object
    
    Returns:
        Human-readable time difference
    """
    now = datetime.utcnow()
    diff = now - timestamp
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    else:
        return "just now" 