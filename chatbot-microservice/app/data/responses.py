"""
Response templates for TalentAI Chatbot
"""

import random
from typing import Dict, List, Union


# Response templates for each intent
RESPONSE_TEMPLATES = {
    "greet": [
        "Hello! Welcome to TalentAI! 👋 I'm here to help you navigate our AI-powered recruitment and certification platform. How can I assist you today?",
        "Hi there! Great to see you on TalentAI! 🌟 I'm your virtual assistant, ready to help you with skill testing, certification, and more. What would you like to know?",
        "Welcome to TalentAI! 🚀 I'm here to guide you through our innovative platform for skill evaluation and blockchain certification. How can I help you get started?",
        "Hello and welcome! 👋 TalentAI is your gateway to AI-driven skill assessment and secure certification. I'm here to make your journey smooth. What can I do for you?",
        "Hi! Welcome to the future of talent evaluation! 🎯 I'm your TalentAI assistant, ready to help you explore our platform. What would you like to learn about?"
    ],
    
    "platform_overview": [
        "TalentAI is an innovative AI-powered recruitment and certification platform that revolutionizes how skills are evaluated and verified! 🚀\n\nHere's what makes us special:\n• 🤖 AI-driven skill assessments\n• 🔗 Blockchain-secured certifications on Hedera\n• 🎯 Intelligent talent-job matching\n• 📊 Comprehensive skill analytics\n• 🔒 Immutable credential verification\n\nWe help candidates showcase their true abilities and enable recruiters to find the perfect talent match!",
        
        "Welcome to TalentAI - where talent meets technology! 🌟\n\nWe're transforming recruitment through:\n✨ Smart AI assessments that truly understand your skills\n🏆 Blockchain certificates that can't be faked\n🤝 Perfect matching between candidates and opportunities\n📈 Real-time skill gap analysis\n🔐 Secure, permanent credential storage\n\nWhether you're looking to prove your skills or find amazing talent, we've got you covered!",
        
        "TalentAI is your next-generation platform for skill validation and career growth! 💫\n\nOur cutting-edge features include:\n🧠 AI-powered skill evaluation\n⛓️ Hedera blockchain certification\n🎪 Advanced talent matching algorithms\n📋 Detailed performance analytics\n🛡️ Tamper-proof credential verification\n\nJoin thousands of professionals who trust TalentAI for authentic skill certification!"
    ],
    
    "how_to_start": [
        "Getting started with TalentAI is easy! Here's your roadmap: 🗺️\n\n1️⃣ **Create Your Account** - Sign up with your email\n2️⃣ **Choose Your Skills** - Select 3-5 skills you want to be tested on\n3️⃣ **Take the Assessment** - Complete AI-powered skill tests\n4️⃣ **Get Certified** - Receive blockchain-secured certificates\n5️⃣ **Share & Match** - Connect with opportunities that fit your skills!\n\nReady to showcase your talents? Let's get you started! 🚀",
        
        "Welcome aboard! Here's how to begin your TalentAI journey: 🌟\n\n📝 **Step 1:** Register your account (it's free!)\n🎯 **Step 2:** Pick the skills you're confident in\n💡 **Step 3:** Take our smart assessments\n🏆 **Step 4:** Earn your blockchain certificates\n🔍 **Step 5:** Get discovered by top recruiters!\n\nThe whole process is designed to be intuitive and engaging. Need help with any specific step?",
        
        "Starting your skill certification journey is simple! 🎪\n\n🚀 **Quick Start Guide:**\n• Log in or create your free account\n• Browse our skill categories (tech, soft skills, languages)\n• Select skills that match your expertise\n• Complete interactive assessments\n• Receive instant AI scoring\n• Get your certificates stored on blockchain\n• Start matching with opportunities!\n\nWhat skills are you excited to get certified in?"
    ],
    
    "scoring": [
        "Great question! Our scoring system is powered by advanced AI for maximum accuracy and fairness: 🧠\n\n🎯 **How It Works:**\n• Your answers are analyzed in real-time by our AI\n• Multiple factors are considered: correctness, efficiency, best practices\n• Scores are calculated instantly with detailed feedback\n• Results are immediately certified on Hedera blockchain\n\n📊 **Scoring Factors:**\n• Technical accuracy (40%)\n• Problem-solving approach (30%)\n• Code quality & best practices (20%)\n• Time efficiency (10%)\n\nThe AI ensures consistent, unbiased evaluation every time!",
        
        "Our scoring system combines cutting-edge AI with industry standards! 🏆\n\n⚡ **Instant Evaluation:**\n• AI analyzes your responses immediately\n• Compares against thousands of expert solutions\n• Provides detailed performance breakdown\n• Generates personalized improvement suggestions\n\n🔍 **What Gets Measured:**\n• Correctness and completeness\n• Methodology and reasoning\n• Industry best practices\n• Practical application skills\n\nEvery score comes with actionable insights to help you grow!",
        
        "Excellent question! Here's how our AI scoring magic works: ✨\n\n🤖 **AI-Powered Analysis:**\n• Advanced algorithms evaluate your solutions\n• Contextual understanding of your approach\n• Comparison with expert benchmarks\n• Real-time feedback generation\n\n📈 **Comprehensive Scoring:**\n• Multi-dimensional skill assessment\n• Weighted scoring based on skill complexity\n• Immediate blockchain certification\n• Detailed performance analytics\n\nThe result? Fair, accurate, and instantly verifiable skill scores!"
    ],
    
    "certification": [
        "Your certificates are securely stored on the Hedera blockchain - making them permanent and tamper-proof! 🔐\n\n🏆 **Certificate Features:**\n• Stored immutably on Hedera blockchain\n• Instantly verifiable by anyone, anywhere\n• Cannot be forged or altered\n• Accessible through your TalentAI dashboard\n• Shareable via secure links\n\n📱 **Access Your Certificates:**\n• Visit your profile dashboard\n• Click on 'My Certificates'\n• Download or share directly\n• Verify authenticity anytime\n\nYour achievements are now permanent and globally trusted!",
        
        "Welcome to the future of credentials! Your TalentAI certificates live on the blockchain forever! ⛓️\n\n🛡️ **Blockchain Benefits:**\n• Immutable storage on Hedera network\n• Global verification without intermediaries\n• Zero risk of certificate fraud\n• Permanent accessibility\n• Industry-recognized authenticity\n\n🎖️ **Your Certificate Hub:**\n• Access all certificates in one place\n• Share with employers instantly\n• Embed in professional profiles\n• Track your skill progression\n\nYour skills are now backed by unbreakable blockchain technology!",
        
        "Your certificates are revolutionizing how credentials work! 🌟\n\n⚡ **Hedera Blockchain Storage:**\n• Lightning-fast certificate generation\n• Energy-efficient blockchain technology\n• Enterprise-grade security\n• Instant global verification\n• Future-proof storage\n\n🔍 **Easy Verification:**\n• Employers can verify in seconds\n• No need to contact institutions\n• Cryptographically secured authenticity\n• QR codes for instant checking\n\nYour skills are now certified with unmatched security and accessibility!"
    ],
    
    "skills_and_tests": [
        "We offer a comprehensive range of skill assessments across multiple domains! 🎯\n\n💻 **Technical Skills:**\n• Programming (Python, JavaScript, Java, C++, etc.)\n• Web Development (React, Node.js, Vue, Angular)\n• Data Science & ML (TensorFlow, PyTorch, Pandas)\n• Cloud Platforms (AWS, Azure, GCP)\n• DevOps & System Administration\n\n🧠 **Soft Skills:**\n• Communication & Leadership\n• Problem-solving & Critical thinking\n• Project Management\n• Team Collaboration\n\n🌐 **Languages:** English, Spanish, French, German, and more!\n\nWhat skills would you like to get certified in?",
        
        "Explore our extensive skill testing library! 📚\n\n🔧 **Development & Engineering:**\n• Full-stack development\n• Mobile app development\n• Database management\n• API design & integration\n• Software architecture\n\n📊 **Data & Analytics:**\n• Data analysis & visualization\n• Machine learning algorithms\n• Statistical modeling\n• Business intelligence\n• Big data processing\n\n🎨 **Design & Creative:**\n• UI/UX Design\n• Graphic Design\n• Digital Marketing\n• Content Creation\n\nWe're constantly adding new skills based on industry demand!",
        
        "Discover your potential across diverse skill categories! 🌈\n\n🚀 **Emerging Technologies:**\n• Blockchain development\n• AI/ML engineering\n• IoT and embedded systems\n• Cybersecurity\n• Quantum computing basics\n\n💼 **Business & Management:**\n• Strategic planning\n• Financial analysis\n• Digital transformation\n• Agile methodologies\n• Customer success\n\n🔬 **Specialized Fields:**\n• Healthcare technology\n• Fintech solutions\n• EdTech development\n• Gaming & AR/VR\n\nEvery test is designed by industry experts and validated by AI!"
    ],
    
    "account_and_profile": [
        "Setting up your TalentAI account is quick and straightforward! 👤\n\n📝 **Account Creation:**\n• Visit our signup page\n• Enter your email and create a secure password\n• Verify your email address\n• Complete your basic profile\n• Start testing immediately!\n\n⚙️ **Profile Management:**\n• Update personal information anytime\n• Add professional experience\n• Set skill preferences\n• Manage privacy settings\n• Connect social profiles\n\n🔐 **Account Security:**\n• Two-factor authentication available\n• Secure password requirements\n• Regular security updates\n\nNeed help with any specific account features?",
        
        "Your TalentAI profile is your professional showcase! ✨\n\n🎯 **Profile Setup:**\n• Complete registration in under 2 minutes\n• Add your professional background\n• Select areas of expertise\n• Set career goals and preferences\n• Upload professional photo\n\n📊 **Profile Features:**\n• Skill progress tracking\n• Achievement badges\n• Certificate gallery\n• Performance analytics\n• Recruiter visibility settings\n\n🔧 **Account Management:**\n• Easy profile editing\n• Privacy controls\n• Notification preferences\n• Data export options\n\nYour profile grows more valuable with each certification!",
        
        "Welcome to your professional identity hub! 🏠\n\n🌟 **Getting Started:**\n• Fast, secure account creation\n• Email verification for security\n• Guided profile completion\n• Skill preference selection\n• Immediate access to assessments\n\n📈 **Profile Growth:**\n• Track certification progress\n• Build skill portfolio\n• Showcase achievements\n• Connect with opportunities\n• Network with professionals\n\n🛡️ **Security & Privacy:**\n• GDPR compliant data handling\n• Granular privacy controls\n• Secure authentication\n• Data portability rights\n\nYour professional journey starts here!"
    ],
    
    "results_and_reports": [
        "Your results and reports are waiting for you in your dashboard! 📊\n\n🎯 **Instant Results:**\n• Scores available immediately after tests\n• Detailed performance breakdown\n• Skill-specific feedback\n• Improvement recommendations\n• Benchmarking against peers\n\n📈 **Comprehensive Reports:**\n• Overall skill progression\n• Strengths and growth areas\n• Industry comparison metrics\n• Certification timeline\n• Achievement milestones\n\n📱 **Easy Access:**\n• Visit your dashboard\n• Click 'My Results' section\n• Filter by skill or date\n• Download detailed reports\n• Share achievements\n\nYour progress story is beautifully visualized!",
        
        "Dive deep into your skill analytics! 🔍\n\n⚡ **Real-time Results:**\n• Immediate scoring after each assessment\n• AI-generated feedback\n• Performance trends over time\n• Skill gap analysis\n• Personalized learning paths\n\n📋 **Detailed Analytics:**\n• Multi-dimensional skill mapping\n• Competency level indicators\n• Market demand insights\n• Certification validity tracking\n• Professional growth metrics\n\n🎪 **Visual Reports:**\n• Interactive skill radar charts\n• Progress timelines\n• Achievement galleries\n• Comparative analysis\n• Export to professional profiles\n\nYour data tells your professional story!",
        
        "Your performance insights are just a click away! 🎊\n\n🏆 **Achievement Center:**\n• All test results in one place\n• Certification status tracking\n• Skill level progression\n• Time-based performance trends\n• Success rate analytics\n\n📊 **Advanced Reporting:**\n• Custom report generation\n• Multi-skill comparisons\n• Industry benchmarking\n• Recruiter-ready summaries\n• Portfolio export options\n\n🔄 **Continuous Tracking:**\n• Real-time progress updates\n• Goal achievement monitoring\n• Skill refresh recommendations\n• Career pathway suggestions\n\nTransform your results into career opportunities!"
    ],
    
    "recruitment_and_matching": [
        "Our AI-powered matching system connects talent with perfect opportunities! 🤝\n\n🎯 **Smart Matching:**\n• AI analyzes your certified skills\n• Matches with relevant job openings\n• Considers experience level and preferences\n• Provides compatibility scores\n• Updates matches in real-time\n\n👥 **For Candidates:**\n• Get discovered by top recruiters\n• Receive personalized job recommendations\n• Showcase verified skills\n• Skip traditional screening steps\n• Access exclusive opportunities\n\n🏢 **For Recruiters:**\n• Find pre-verified talent\n• Access skill-specific candidate pools\n• Reduce hiring time and costs\n• Make data-driven hiring decisions\n\nReady to connect with your next opportunity?",
        
        "Experience the future of recruitment matching! 🚀\n\n🧠 **Intelligent Algorithms:**\n• Deep skill analysis and matching\n• Cultural fit assessment\n• Career trajectory prediction\n• Market demand optimization\n• Bias-free candidate evaluation\n\n🌟 **Candidate Benefits:**\n• Proactive job matching\n• Skills-first recruitment\n• Direct recruiter connections\n• Interview scheduling assistance\n• Negotiation support\n\n🎪 **Recruiter Tools:**\n• Advanced candidate filtering\n• Skill authenticity verification\n• Batch candidate evaluation\n• Hiring pipeline management\n• Performance prediction models\n\nWhere authentic talent meets genuine opportunities!",
        
        "Revolutionizing how talent and opportunities connect! 💫\n\n⚡ **Precision Matching:**\n• Real-time skill verification\n• Advanced compatibility algorithms\n• Geographic and remote preferences\n• Salary expectation alignment\n• Career goal synchronization\n\n🎭 **Platform Features:**\n• Verified skill portfolios\n• Anonymous initial screening\n• Direct communication channels\n• Interview scheduling tools\n• Feedback and rating systems\n\n🏆 **Success Metrics:**\n• Higher match success rates\n• Reduced time-to-hire\n• Better candidate satisfaction\n• Improved retention rates\n• Enhanced diversity outcomes\n\nYour next career move starts with authentic skills!"
    ],
    
    "technical_support": [
        "I'm here to help you resolve any technical issues! 🛠️\n\n🚨 **Quick Support:**\n• Try refreshing your browser first\n• Clear your browser cache\n• Ensure stable internet connection\n• Use supported browsers (Chrome, Firefox, Safari)\n• Disable browser extensions temporarily\n\n📞 **Contact Support:**\n• Email: support@talentai.com\n• Live chat available 24/7\n• Response time: < 2 hours\n• Phone support for urgent issues\n• Community forum for common questions\n\n🔧 **Common Solutions:**\n• Login issues → Password reset\n• Test not loading → Browser refresh\n• Slow performance → Cache clearing\n• Certificate access → Dashboard reload\n\nWhat specific issue are you experiencing?",
        
        "Let's get you back on track! I'm here to help with any technical difficulties! 🚑\n\n⚡ **Immediate Steps:**\n• Check your internet connection\n• Try a different browser or device\n• Disable ad blockers temporarily\n• Update your browser to latest version\n• Clear cookies and site data\n\n🎯 **Detailed Support:**\n• Screen sharing assistance available\n• Step-by-step troubleshooting guides\n• Video tutorials for common issues\n• One-on-one technical support calls\n• Remote assistance when needed\n\n📋 **Report Issues:**\n• Include error messages\n• Describe what you were trying to do\n• Mention your browser and device\n• Screenshot if possible\n• Steps to reproduce the problem\n\nOur tech team is standing by to help!",
        
        "Don't worry - technical hiccups happen! Let's fix this together! 🔧\n\n🛡️ **System Status:**\n• Check our status page for outages\n• Server maintenance notifications\n• Real-time system performance\n• Known issues and workarounds\n• Estimated resolution times\n\n💡 **Self-Help Resources:**\n• Comprehensive FAQ section\n• Video troubleshooting guides\n• Step-by-step tutorials\n• Community help forum\n• Mobile app alternatives\n\n🎪 **Premium Support:**\n• Priority support queue\n• Direct phone support\n• Dedicated account manager\n• Custom integration assistance\n• Advanced troubleshooting tools\n\nWe're committed to keeping your experience smooth!"
    ],
    
    "goodbye": [
        "Thank you for using TalentAI! 👋 It's been great helping you today. Feel free to come back anytime you need assistance with skill testing, certification, or platform navigation. Good luck with your professional journey! 🌟",
        
        "Goodbye for now! 🎊 I hope I was able to help you with your TalentAI questions. Remember, your skills are your superpowers - keep developing them! Don't hesitate to reach out if you need any more help. Take care! 🚀",
        
        "Thanks for chatting with me! 😊 I'm always here whenever you need guidance on TalentAI. Whether it's skill testing, certification questions, or platform features - I've got you covered. Have a fantastic day and happy learning! 📚✨",
        
        "It's been a pleasure assisting you today! 🌈 TalentAI is here to support your professional growth journey. Keep pushing your boundaries and showcasing your amazing skills! Until next time! 👋🏆",
        
        "See you later! 🎯 Thanks for choosing TalentAI for your skill certification needs. Remember, every skill you master opens new doors. I'm here whenever you need help navigating your path to success! 🔥"
    ],
    
    "fallback": [
        "I'm sorry, I didn't quite understand that. 🤔 Could you please rephrase your question or ask me about:\n\n• TalentAI platform overview\n• How to get started with skill testing\n• Scoring and certification process\n• Account setup and management\n• Technical support\n\nWhat would you like to know more about?",
        
        "Hmm, I'm not sure I understand what you're looking for. 😅 Let me help you with some common topics:\n\n🎯 **Popular Questions:**\n• What is TalentAI?\n• How do I start testing my skills?\n• Where are my certificates stored?\n• How does the scoring work?\n• What skills can I test?\n\nPlease feel free to ask about any of these or rephrase your question!",
        
        "I want to help, but I'm not sure what you're asking about. 🤷‍♀️ Here are some things I can assist you with:\n\n✨ **I can help with:**\n• Platform features and navigation\n• Skill testing and certification\n• Account and profile management\n• Technical support and troubleshooting\n• Recruitment and matching process\n\nCould you please ask your question in a different way?",
        
        "I'm having trouble understanding your request. 💭 Let me offer some guidance on what I can help you with:\n\n🌟 **My expertise includes:**\n• Getting started with TalentAI\n• Understanding our scoring system\n• Blockchain certification details\n• Available skills and tests\n• Troubleshooting common issues\n\nWould you like to know about any of these topics?"
    ]
}

def get_response(intent: str, context: Dict = None) -> str:
    """
    Get a response for the given intent
    
    Args:
        intent: The classified intent
        context: Optional context information (user_id, session_id, etc.)
    
    Returns:
        Appropriate response string
    """
    if intent not in RESPONSE_TEMPLATES:
        intent = "fallback"
    
    responses = RESPONSE_TEMPLATES[intent]
    response = random.choice(responses)
    
    # Add personalization if context is provided
    if context:
        user_name = context.get("user_name")
        if user_name and intent in ["greet", "platform_overview"]:
            response = f"Hi {user_name}! " + response
    
    return response

def get_contextual_response(intent: str, context: Dict = None, confidence: float = 1.0) -> str:
    """
    Get a contextual response with confidence handling
    
    Args:
        intent: The classified intent
        context: Context information
        confidence: Confidence score of the intent classification
    
    Returns:
        Contextual response string
    """
    # Handle low confidence predictions
    if confidence < 0.5:
        return get_response("fallback", context)
    
    # Get base response
    response = get_response(intent, context)
    
    # Add confidence-based modifications
    if confidence < 0.7 and intent != "fallback":
        response += "\n\nIf this doesn't answer your question, please feel free to rephrase or ask something else!"
    
    return response

def get_follow_up_suggestions(intent: str) -> List[str]:
    """
    Get follow-up question suggestions based on intent
    
    Args:
        intent: The current intent
    
    Returns:
        List of suggested follow-up questions
    """
    suggestions = {
        "greet": [
            "What is TalentAI?",
            "How do I get started?",
            "What skills can I test?"
        ],
        "platform_overview": [
            "How do I start testing?",
            "What skills are available?",
            "How does certification work?"
        ],
        "how_to_start": [
            "What skills can I choose?",
            "How long do tests take?",
            "Is registration free?"
        ],
        "scoring": [
            "How are certificates generated?",
            "Can I retake tests?",
            "How do I improve my scores?"
        ],
        "certification": [
            "How do I share my certificates?",
            "Are certificates industry-recognized?",
            "Can employers verify them?"
        ]
    }
    
    return suggestions.get(intent, [
        "How can I contact support?",
        "What other features are available?",
        "Can you help me with something else?"
    ]) 