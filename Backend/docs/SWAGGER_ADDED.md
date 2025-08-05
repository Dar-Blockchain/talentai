# Swagger Documentation Added

## ✅ **New Endpoints Added to Swagger**

### **1. Create Evaluation Topic**
```
POST /hedera-tools/create-evaluation-topic
```

**Purpose**: Creates a new evaluation topic for candidate pipeline

**Request Body**:
```json
{
  "company": "TalentAI",
  "postId": "DEV-001",
  "candidateName": "Hatem",
  "candidateId": "candidate_123",
  "agentId": "675a123456789abcdef12345"
}
```

**Response**: Returns topic ID for future message submissions

---

### **2. Submit Evaluation Message**
```
POST /hedera-tools/submit-evaluation-message
```

**Purpose**: Submit HCS-11 evaluation message to existing topic

**Request Body**:
```json
{
  "topicId": "0.0.123456",
  "agentId": "675a123456789abcdef12345",
  "evaluation": {
    "passed": true,
    "score": 85,
    "feedback": "Candidate demonstrates excellent technical skills",
    "interviewNotes": "Strong problem-solving abilities"
  }
}
```

**Response**: Returns HCS-11 compliant message details

---

## 📋 **New Schemas Added**

### **1. AgentProfile**
```json
{
  "name": "Olga-Technical-Agent",
  "avatarName": "olga",
  "role": "Technical Skills Evaluator",
  "accountId": "0.0.789012"
}
```

### **2. EvaluationResult**
```json
{
  "topicId": "0.0.123456",
  "candidate": "Hatem",
  "company": "TalentAI",
  "postId": "DEV-001",
  "result": {
    "passed": true,
    "score": 85,
    "feedback": "Excellent technical skills",
    "interviewNotes": "Strong problem-solving abilities"
  },
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

### **3. CoordinatorMessage**
```json
{
  "to": "coordinator_agent",
  "action": "candidate_approved",
  "summary": "Technical Skills Evaluator evaluation: PASSED (Score: 85)"
}
```

---

## 🎯 **Features Documented**

- **HCS-11 Compliance**: All messages follow standard format
- **Agent Authentication**: JWT token required for all endpoints
- **Error Handling**: Complete error responses documented
- **Request/Response Examples**: Full examples provided
- **Schema References**: Proper $ref linking to schemas

---

## 📖 **How to Use in Swagger UI**

1. **Navigate to Swagger UI**: `http://localhost:PORT/api/docs`
2. **Find "Hedera Tools" Section**: Look for the new endpoints
3. **Test the Workflow**:
   - First: `POST /hedera-tools/create-evaluation-topic`
   - Then: `POST /hedera-tools/submit-evaluation-message`
4. **Use "Try it out"**: Test directly in the browser
5. **View Complete Schemas**: Check the Components → Schemas section

---

## ✅ **Validation Status**

- ✅ JSON syntax validated
- ✅ All schema references properly linked
- ✅ Request/response examples provided
- ✅ Error codes documented
- ✅ Security requirements specified

**The Swagger documentation is now complete and ready for testing! 🚀**

### **Quick Test Flow in Swagger UI:**

1. **Create Topic**:
   ```
   POST /hedera-tools/create-evaluation-topic
   → Returns: { "topicId": "0.0.123456" }
   ```

2. **Submit Message**:
   ```
   POST /hedera-tools/submit-evaluation-message
   → Use topicId from step 1
   → Returns: HCS-11 formatted response
   ```

The endpoints are now fully documented and ready for integration! 🎉