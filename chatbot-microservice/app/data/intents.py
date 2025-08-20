"""
Intent definitions and training data for TalentAI Chatbot
"""

from typing import Dict, List

# Intent training data with example utterances
INTENTS_DATA = {
    "greet": {
        "examples": [
            "hello",
            "hi",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
            "greetings",
            "hello there",
            "hi there",
            "hey there",
            "sup",
            "what's up",
            "howdy",
            "yo",
            "hiya",
            "salutations",
            "good day",
            "welcome",
            "start",
            "hello what is talentai",
            "hi what is this",
            "hey there what is this platform",
            "hello tell me about talentai",
            "hi, what is talentai",
            "hello, what is this",
            "hi, tell me about this platform"
        ],
        "description": "User greeting or starting conversation"
    },
    
    "platform_overview": {
        "examples": [
            "what is talentai",
            "tell me about talentai",
            "what does talentai do",
            "explain talentai",
            "what is this platform",
            "what is this site",
            "tell me about this platform",
            "what are you",
            "about talentai",
            "talentai overview",
            "platform information",
            "what can i do here",
            "how does talentai work",
            "talent ai explanation",
            "what services do you provide",
            "what is this service",
            "platform details",
            "tell me more about this",
            "what's talentai about",
            "describe talentai",
            "wgat is talentai",
            "what si talentai",
            "whta is talentai",
            "what id talentai",
            "wat is talentai",
            "what us talentai",
            "what's this platform",
            "what's this site",
            "what's this service",
            "tell me about talent ai",
            "explain talent ai",
            "what does this platform do",
            "how does this work",
            "what can this platform do",
            "what is talent ai",
            "wht is talentai",
            "waht is talentai"
        ],
        "description": "Questions about TalentAI platform overview"
    },
    
    "how_to_start": {
        "examples": [
            "how do i start",
            "how to begin",
            "how to get started",
            "where do i start",
            "how to start testing",
            "how do i choose skills",
            "how to select skills",
            "getting started",
            "start process",
            "begin testing",
            "first steps",
            "how to proceed",
            "what's the first step",
            "how do i begin testing",
            "starting guide",
            "setup process",
            "onboarding",
            "initial steps",
            "how to use this platform",
            "guide me through the process",
            "how do i get started with the platform",
            "how do i get started",
            "how can i get started",
            "how to get started with the platform",
            "how to get started here",
            "how do i start with this platform",
            "how do i begin with this platform",
            "how to start using this",
            "how to begin using this platform",
            "where should i start",
            "what should i do first",
            "how do i use this platform",
            "how to use this",
            "what are the first steps",
            "guide me to start",
            "help me get started",
            "help me start",
            "show me how to start",
            "show me how to get started",
            "walk me through getting started",
            "how do i get started with testing"
        ],
        "description": "Getting started and skill selection guidance"
    },
    
    "scoring": {
        "examples": [
            "how is the score calculated",
            "explain the scoring",
            "how do you calculate scores",
            "scoring system",
            "test scoring",
            "how are tests graded",
            "evaluation process",
            "score calculation",
            "how does scoring work",
            "grading system",
            "assessment scoring",
            "test evaluation",
            "score methodology",
            "scoring criteria",
            "how are answers evaluated",
            "rating system",
            "performance scoring",
            "skill scoring",
            "test results calculation",
            "how do you grade tests"
        ],
        "description": "Questions about score calculation and test evaluation"
    },
    
    "certification": {
        "examples": [
            "where is my certificate",
            "how does certification work",
            "blockchain certification",
            "certificate location",
            "my certificates",
            "certification process",
            "how to get certified",
            "certificate verification",
            "blockchain storage",
            "hedera blockchain",
            "skill certification",
            "digital certificates",
            "certificate validity",
            "certification verification",
            "where are certificates stored",
            "certificate security",
            "immutable certificates",
            "proof of skills",
            "skill validation",
            "credential verification",
            "tell me about certifications",
            "explain certifications",
            "about certifications",
            "certification details",
            "what are certifications",
            "how do certifications work",
            "certificate info",
            "certification system",
            "digital certification",
            "about certificates",
            "tell me about certificates",
            "certification information",
            "certificate process"
        ],
        "description": "Questions about certification and blockchain storage"
    },
    
    "skills_and_tests": {
        "examples": [
            "what skills can i test",
            "available skills",
            "skill categories",
            "types of tests",
            "programming languages",
            "technical skills",
            "soft skills",
            "skill options",
            "test subjects",
            "what can i be tested on",
            "skill list",
            "available assessments",
            "test categories",
            "skills offered",
            "which skills are available",
            "programming tests",
            "language tests",
            "framework tests",
            "technology tests",
            "skill domains"
        ],
        "description": "Questions about available skills and test categories"
    },
    
    "account_and_profile": {
        "examples": [
            "how to create account",
            "sign up process",
            "registration",
            "login issues",
            "forgot password",
            "profile setup",
            "account settings",
            "update profile",
            "personal information",
            "user account",
            "my profile",
            "account creation",
            "registration process",
            "user registration",
            "profile management",
            "account management",
            "user settings",
            "profile editing",
            "account details",
            "user information"
        ],
        "description": "Account creation, login, and profile management"
    },
    
    "results_and_reports": {
        "examples": [
            "where are my results",
            "test results",
            "performance report",
            "skill report",
            "assessment results",
            "my scores",
            "test outcomes",
            "result history",
            "performance summary",
            "detailed results",
            "analytics",
            "progress tracking",
            "skill analysis",
            "performance analytics",
            "result dashboard",
            "test analytics",
            "progress report",
            "skill progress",
            "improvement areas",
            "strength analysis"
        ],
        "description": "Questions about results, reports, and analytics"
    },
    
    "technical_support": {
        "examples": [
            "technical support",
            "help",
            "problem",
            "issue",
            "error",
            "bug",
            "not working",
            "broken",
            "troubleshooting",
            "support",
            "assistance",
            "technical help",
            "system issue",
            "platform problem",
            "need help",
            "contact support",
            "report issue",
            "report bug",
            "technical issue",
            "help desk"
        ],
        "description": "Technical support and troubleshooting requests"
    },
    
    "interview_preparation": {
        "examples": [
            "interview preparation",
            "interview help",
            "job interview",
            "interview tips",
            "interview guidance",
            "prepare for interview",
            "interview practice",
            "mock interview",
            "interview questions",
            "interview skills",
            "job interview help",
            "interview coaching",
            "interview training",
            "interview advice",
            "interview support",
            "interview readiness",
            "interview prep",
            "can you help me with interview preparation",
            "help me prepare for interview",
            "interview assistance"
        ],
        "description": "Interview preparation and job interview help"
    },
    
    "ai_recruitment": {
        "examples": [
            "ai recruitment",
            "how does ai recruitment work",
            "artificial intelligence recruitment",
            "ai hiring",
            "automated recruitment",
            "machine learning recruitment",
            "ai powered recruitment",
            "how does the ai recruitment work",
            "explain ai recruitment",
            "ai in hiring",
            "smart recruitment",
            "intelligent hiring",
            "automated hiring process",
            "ai assessment",
            "ai evaluation",
            "machine learning hiring",
            "ai job matching",
            "algorithmic recruitment"
        ],
        "description": "Questions about AI-powered recruitment processes"
    },
    
    "unique_features": {
        "examples": [
            "what makes talentai different",
            "unique features",
            "why choose talentai",
            "what's special about talentai",
            "talentai advantages",
            "benefits of talentai",
            "what sets talentai apart",
            "talentai differentiators",
            "competitive advantages",
            "why talentai",
            "what's unique",
            "special features",
            "standout features",
            "distinctive features",
            "key benefits",
            "main advantages",
            "what makes you different",
            "how are you different",
            "what's your advantage"
        ],
        "description": "Questions about TalentAI's unique features and advantages"
    },
    
    "accuracy": {
        "examples": [
            "how accurate are the skill assessments",
            "accuracy of tests",
            "test accuracy",
            "assessment accuracy",
            "how reliable are the tests",
            "test reliability",
            "assessment reliability",
            "accuracy rate",
            "precision of tests",
            "test validity",
            "assessment validity",
            "how precise are assessments",
            "measurement accuracy",
            "evaluation accuracy",
            "scoring accuracy",
            "result accuracy",
            "how trustworthy are results",
            "assessment precision",
            "test credibility"
        ],
        "description": "Questions about the accuracy and reliability of assessments"
    },
    
    "fallback": {
        "examples": [
            "random text",
            "nonsensical input",
            "gibberish",
            "unclear request",
            "ambiguous question",
            "vague inquiry"
        ],
        "description": "Fallback for unclear or unmatched inputs"
    }
}

def get_all_training_examples() -> List[tuple]:
    """
    Get all training examples as (text, intent) tuples
    """
    examples = []
    for intent, data in INTENTS_DATA.items():
        for example in data["examples"]:
            examples.append((example, intent))
    return examples

def get_intent_descriptions() -> Dict[str, str]:
    """
    Get intent descriptions
    """
    return {intent: data["description"] for intent, data in INTENTS_DATA.items()}

def get_intents_list() -> List[str]:
    """
    Get list of all available intents
    """
    return list(INTENTS_DATA.keys()) 