# Candidate Onboarding API Guide

## Endpoint: POST /profiles/createOrUpdateProfile

### Description
Creates or updates a candidate profile with comprehensive onboarding information including personal details, work preferences, and salary expectations.

### Base URL
```
http://localhost:5000
```

### Headers Required
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## Request Body - Full Onboarding Example

```json
{
  "type": "Candidate",
  "firstName": "John",
  "lastName": "Doe",
  "age": "28",
  "gender": "Male",
  "educationLevel": "Bachelor's degree",
  "country": "Tunisia",
  "language": "English",
  "timeZone": "UTC+1",
  "location": "Tunis, Tunisia",
  "expectedSalary": {
    "min": 1500,
    "max": 2500,
    "currency": "EUR"
  },
  "preferredContractType": "Full-time",
  "workModePreference": "Remote",
  "skills": [
    {
      "name": "JavaScript",
      "proficiencyLevel": 4,
      "experienceLevel": "Mid Level",
      "ScoreTest": 85
    },
    {
      "name": "React",
      "proficiencyLevel": 4,
      "experienceLevel": "Mid Level",
      "ScoreTest": 88
    },
    {
      "name": "Node.js",
      "proficiencyLevel": 3,
      "experienceLevel": "Mid Level",
      "ScoreTest": 80
    }
  ],
  "overallScore": 84.3
}
```

---

## Request Fields Documentation

### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | String | Profile type (must be "Candidate") | `"Candidate"` |
| `firstName` | String | First name (supports both firstName and FirstName) | `"John"` |
| `lastName` | String | Last name (supports both lastName and LastName) | `"Doe"` |

### Optional Personal Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `age` | String | Age in years | `"28"` |
| `gender` | String | Gender (Male, Female, Other, Prefer not to say) | `"Male"` |
| `educationLevel` | String | Highest education level | `"Bachelor's degree"` |
| `country` | String | Country of residence | `"Tunisia"` |
| `language` | String | Preferred language | `"English"` |
| `timeZone` | String | Timezone | `"UTC+1"` |
| `location` | String | City/Region | `"Tunis, Tunisia"` |

### Work Preferences
| Field | Type | Description | Valid Values |
|-------|------|-------------|--------------|
| `workModePreference` | String | Preferred work mode | `"Remote"`, `"Hybrid"`, `"On-site"` |
| `preferredContractType` | String | Preferred contract type | `"Full-time"`, `"Part-time"`, `"Freelance"`, etc. |

### Salary Expectations
```json
{
  "expectedSalary": {
    "min": 1500,      // Minimum salary (positive number, can be null)
    "max": 2500,      // Maximum salary (positive number, can be null)
    "currency": "EUR" // Currency code (required)
  }
}
```

### Skills Array
```json
{
  "skills": [
    {
      "name": "JavaScript",           // Skill name (required)
      "proficiencyLevel": 4,          // 0-5 scale (optional)
      "experienceLevel": "Mid Level", // Experience level (optional)
      "ScoreTest": 85                 // Test score (optional)
    }
  ]
}
```

---

## Response Examples

### Success Response (200 OK)
```json
{
  "message": "Profile created/updated successfully",
  "profile": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "type": "Candidate",
    "firstName": "John",
    "lastName": "Doe",
    "age": "28",
    "gender": "Male",
    "educationLevel": "Bachelor's degree",
    "country": "Tunisia",
    "language": "English",
    "timeZone": "UTC+1",
    "location": "Tunis, Tunisia",
    "expectedSalary": {
      "min": 1500,
      "max": 2500,
      "currency": "EUR"
    },
    "preferredContractType": "Full-time",
    "workModePreference": "Remote",
    "skills": [
      {
        "name": "JavaScript",
        "proficiencyLevel": 4,
        "experienceLevel": "Mid Level",
        "ScoreTest": 85
      },
      {
        "name": "React",
        "proficiencyLevel": 4,
        "experienceLevel": "Mid Level",
        "ScoreTest": 88
      },
      {
        "name": "Node.js",
        "proficiencyLevel": 3,
        "experienceLevel": "Mid Level",
        "ScoreTest": 80
      }
    ],
    "overallScore": 84.3,
    "createdAt": "2025-11-17T10:30:00.000Z",
    "updatedAt": "2025-11-17T10:30:00.000Z"
  }
}
```

---

## Validation Rules

### Field Validations
| Field | Validation Rule | Error Message |
|-------|-----------------|----------------|
| `firstName`, `lastName` | Required, cannot be empty | "First name and last name are required" |
| `age` | Must be a valid number (if provided) | "Age must be a valid number" |
| `gender` | Must be one of: Male, Female, Other, Prefer not to say | "Invalid gender value" |
| `workModePreference` | Must be one of: Remote, Hybrid, On-site | "Invalid work mode preference. Must be 'Remote', 'Hybrid', or 'On-site'" |
| `expectedSalary.min` | Must be positive number or null | "Expected salary min must be a positive number" |
| `expectedSalary.max` | Must be positive number or null | "Expected salary max must be a positive number" |
| `expectedSalary.min/max` | min cannot be > max | "Expected salary min cannot be greater than max" |
| `expectedSalary.currency` | Must be non-empty string | "Currency must be a valid string (e.g., EUR, USD, GBP)" |

---

## Error Responses

### 400 Bad Request - Missing Required Field
```json
{
  "message": "First name and last name are required"
}
```

### 400 Bad Request - Invalid Age
```json
{
  "message": "Age must be a valid number"
}
```

### 400 Bad Request - Invalid Gender
```json
{
  "message": "Invalid gender value"
}
```

### 400 Bad Request - Invalid Work Mode
```json
{
  "message": "Invalid work mode preference. Must be 'Remote', 'Hybrid', or 'On-site'"
}
```

### 400 Bad Request - Invalid Salary Range
```json
{
  "message": "Expected salary min cannot be greater than max"
}
```

### 401 Unauthorized - Missing Token
```json
{
  "message": "Unauthorized - Authentication required"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating/updating candidate profile"
}
```

---

## Minimal Request (Create Profile with Only Required Fields)

```json
{
  "type": "Candidate",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

---

## Partial Update Example (Updating Only Some Fields)

When updating an existing profile, you can send only the fields you want to update:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "age": "30",
  "workModePreference": "Hybrid",
  "expectedSalary": {
    "min": 2000,
    "max": 3000,
    "currency": "EUR"
  }
}
```

---

## Field Name Compatibility

The API accepts both **camelCase** and **PascalCase** for name fields:

✅ Valid:
```json
{ "firstName": "John", "lastName": "Doe" }
```

✅ Also Valid (legacy support):
```json
{ "FirstName": "John", "LastName": "Doe" }
```

---

## Postman Collection Example

### Request 1: Create Complete Profile
```
Method: POST
URL: {{base_url}}/profiles/createOrUpdateProfile
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

Body:
{
  "type": "Candidate",
  "firstName": "John",
  "lastName": "Doe",
  "age": "28",
  "gender": "Male",
  "educationLevel": "Master's degree",
  "country": "France",
  "language": "French",
  "timeZone": "UTC+1",
  "location": "Paris, France",
  "expectedSalary": {
    "min": 2000,
    "max": 3500,
    "currency": "EUR"
  },
  "preferredContractType": "Full-time",
  "workModePreference": "Hybrid",
  "skills": [
    {
      "name": "JavaScript",
      "proficiencyLevel": 5,
      "experienceLevel": "Senior",
      "ScoreTest": 92
    },
    {
      "name": "React",
      "proficiencyLevel": 5,
      "experienceLevel": "Senior",
      "ScoreTest": 95
    }
  ],
  "overallScore": 93.5
}
```

### Request 2: Quick Update (Only Age & Salary)
```
Method: POST
URL: {{base_url}}/profiles/createOrUpdateProfile
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "age": "29",
  "expectedSalary": {
    "min": 2200,
    "max": 3700,
    "currency": "EUR"
  }
}
```

---

## Workflow: Complete Onboarding Flow

### Step 1: Basic Information
```json
{
  "type": "Candidate",
  "firstName": "Alex",
  "lastName": "Johnson",
  "age": "25",
  "gender": "Male"
}
```

### Step 2: Education & Location
```json
{
  "firstName": "Alex",
  "lastName": "Johnson",
  "educationLevel": "Bachelor's degree",
  "location": "London, UK",
  "country": "United Kingdom"
}
```

### Step 3: Work Preferences
```json
{
  "firstName": "Alex",
  "lastName": "Johnson",
  "preferredContractType": "Full-time",
  "workModePreference": "Remote"
}
```

### Step 4: Salary Expectations
```json
{
  "firstName": "Alex",
  "lastName": "Johnson",
  "expectedSalary": {
    "min": 1800,
    "max": 2800,
    "currency": "GBP"
  }
}
```

### Step 5: Skills & Overall Score
```json
{
  "firstName": "Alex",
  "lastName": "Johnson",
  "skills": [
    {
      "name": "Python",
      "proficiencyLevel": 4,
      "experienceLevel": "Mid Level",
      "ScoreTest": 88
    },
    {
      "name": "FastAPI",
      "proficiencyLevel": 4,
      "experienceLevel": "Mid Level",
      "ScoreTest": 85
    }
  ],
  "overallScore": 86.5
}
```

---

## Notes

- ✅ All fields except `firstName`, `lastName`, and `type` are optional
- ✅ The API will create a new profile if the user doesn't have one
- ✅ The API will update existing profiles with new values
- ✅ Sending `null` values will preserve existing data (partial updates)
- ✅ Currency should be ISO 4217 codes: EUR, USD, GBP, CHF, etc.
- ✅ The backend automatically normalizes firstName/lastName field mapping
- ✅ A TodoList is automatically created for new candidate profiles
- ✅ Profile data is linked to the authenticated user

---

## Currency Codes (Examples)

| Code | Currency | Country |
|------|----------|---------|
| EUR | Euro | European Union |
| USD | US Dollar | United States |
| GBP | British Pound | United Kingdom |
| CHF | Swiss Franc | Switzerland |
| CAD | Canadian Dollar | Canada |
| AUD | Australian Dollar | Australia |
| JPY | Japanese Yen | Japan |
| TND | Tunisian Dinar | Tunisia |

