# Extraction des Énumérations en Constantes

## Résumé
Tous les énumérations des modèles Mongoose ont été extraites en fichiers constantes séparés pour une meilleure maintenabilité et réutilisabilité.

## Fichiers Constantes Créés/Modifiés

### 1. **userConstants.js**
- `USER_ROLES`: Company, jury, Candidat, Admin
- `AUTH_METHODS`: OTP, Password, OAuth
- `AUTH_STATUS`: Success, Failed

**Modèles utilisant ces constantes:**
- UserModel.js

---

### 2. **skillConstants.js**
- `SKILL_LEVELS`: beginner, intermediate, advanced, expert
- `SKILL_IMPORTANCE`: low, medium, high, critical

**Modèles utilisant ces constantes:**
- PostModel.js

---

### 3. **topicConstants.js**
- `TOPIC_STATUS`: active, closed

**Modèles utilisant ces constantes:**
- TopicModel.js

---

### 4. **tokenTransactionConstants.js**
- `TOKEN_TRANSACTION_TYPES`: purchase, spend, refund, bonus, adjustment
- `TOKEN_TRANSACTION_STATUS`: pending, completed, failed, cancelled
- `PAYMENT_METHODS`: hedera, hashpack, admin

**Modèles utilisant ces constantes:**
- TokenTransactionModel.js

---

### 5. **todoConstants.js**
- `TODO_TYPES`: Profile, Skill
- `TASK_TYPES`: Course, Certification, Project, Article
- `TASK_PRIORITIES`: low, medium, high

**Modèles utilisant ces constantes:**
- todoListModel.js

---

### 6. **stepConstants.js**
- `STEP_STATUS`: pending, inProgress, done

**Modèles utilisant ces constantes:**
- post_StepsModel.js
- candidate_Post_Step_Progress.js

---

### 7. **notificationConstants.js**
- `NOTIFICATION_TYPES`: info, success, warning, error, custom

**Modèles utilisant ces constantes:**
- notificationModel.js

---

### 8. **evaluationConstants.js**
- `EVALUATION_STATUS`: active, completed, cancelled

**Modèles utilisant ces constantes:**
- EvaluationTopicModel.js

---

### 9. **bidConstants.js**
- `BID_STATUS`: pending, active, refunded, won

**Modèles utilisant ces constantes:**
- BidModel.js

---

### 10. **profileConstants.js** (MISE À JOUR)
Ajouts:
- `PROFILE_TYPES`: Candidate, Company, jury
- `GENDER_OPTIONS`: Male, Female, Other, Prefer not to say
- `REQUIRED_EXPERIENCE_LEVELS`: Entry Level, Junior, Mid Level, Senior, Expert
- `EMPLOYMENT_TYPES`: Remote, Hybrid, On-site

**Modèles utilisant ces constantes:**
- ProfileModel.js

---

### 11. **interviewDetailsConstants.js** (EXISTANT)
Constants existantes:
- `ANSWER_STATUS`: correct, partial_correct, incorrect
- `INTERVIEW_TYPES`: post, onboarding, hr, skill, post_interview

**Modèles utilisant ces constantes:**
- InterviewDetailsModel.js

---

## Modèles Mis à Jour

| Modèle | Constantes Importées | Énumérations Extraites |
|--------|----------------------|------------------------|
| UserModel.js | USER_ROLES, AUTH_METHODS, AUTH_STATUS | role, authHistory.method, authHistory.status |
| PostModel.js | SKILL_LEVELS, SKILL_IMPORTANCE | level, importance |
| TopicModel.js | TOPIC_STATUS | status |
| TokenTransactionModel.js | TOKEN_TRANSACTION_TYPES, TOKEN_TRANSACTION_STATUS, PAYMENT_METHODS | type, status, paymentMethod |
| todoListModel.js | TODO_TYPES, TASK_TYPES, TASK_PRIORITIES | type, priority |
| post_StepsModel.js | STEP_STATUS | status |
| notificationModel.js | NOTIFICATION_TYPES | type |
| EvaluationTopicModel.js | EVALUATION_STATUS | status |
| candidate_Post_Step_Progress.js | STEP_STATUS | status |
| BidModel.js | BID_STATUS | status |
| ProfileModel.js | PROFILE_TYPES, GENDER_OPTIONS, REQUIRED_EXPERIENCE_LEVELS, EMPLOYMENT_TYPES | type, gender, employmentType, requiredExperienceLevel |

---

## Bénéfices

✅ **Centralisation**: Toutes les énumérations sont maintenant dans des fichiers constants dédiés
✅ **Réutilisabilité**: Les constantes peuvent être réutilisées dans les contrôleurs et services
✅ **Maintenabilité**: Modifications faciles des énumérations sans toucher aux modèles
✅ **Cohérence**: Format uniforme avec `Object.freeze()` pour l'immutabilité
✅ **Typage**: Facilite le typage et la documentation

---

## Localisation

Tous les fichiers constantes sont localisés dans:
```
Backend/constants/
```
