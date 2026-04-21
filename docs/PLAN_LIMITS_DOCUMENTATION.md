# Plan Limits Management System

## Overview
Le système de gestion des limites de plans permet de gérer les forfaits (plans) d'abonnement pour les entreprises et de tracker leur utilisation.

## Architecture

### 1. Model: `PlanLimits.model.js`
Table globale contenant les définitions des plans d'abonnement.

**Champs:**
- `name` (String, required) - Nom du plan (Basic, Professional, Enterprise, Trial)
- `postsLimit` (Number) - Limite maximale de posts pouvant être créés
- `candidateUnlockLimit` (Number) - Limite maximale de déblocages de candidats
- `monthlyInterviewLimit` (Number) - Limite maximale d'interviews par mois
- `isActive` (Boolean) - Statut du plan
- `description` (String) - Description du plan
- `timestamps` - Dates de création et modification

### 2. Profile Model - Company Extension
Les champs d'utilisation sont stockés dans le Profile du type "Company".

**Champs ajoutés:**
```javascript
planLimits: ObjectId (référence au PlanLimits)
planUsage: {
  postsUsed: Number,
  monthlyInterviewsUsed: Number,
  lastMonthlyResetDate: Date
}
```

## API Endpoints

### 1. Plans Management (Admin)

#### Créer un nouveau plan
```
POST /plan-limits
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Premium",
  "postsLimit": 50,
  "candidateUnlockLimit": 100,
  "monthlyInterviewLimit": 100,
  "description": "Plan premium pour entreprises en croissance",
  "isActive": true
}
```

#### Récupérer tous les plans
```
GET /plan-limits
GET /plan-limits?isActive=true
```

#### Récupérer un plan par ID
```
GET /plan-limits/:id
```

#### Mettre à jour un plan
```
PUT /plan-limits/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "postsLimit": 75,
  "candidateUnlockLimit": 150
}
```

#### Supprimer un plan
```
DELETE /plan-limits/:id
Authorization: Bearer <token>
```

### 2. Company Plan Assignment

#### Assigner un plan à une company
```
POST /plan-limits/assign/:companyProfileId/:planId
Authorization: Bearer <token>
```

### 3. Usage Tracking

#### Consulter l'utilisation d'une company
```
GET /plan-limits/usage/:companyProfileId
Authorization: Bearer <token>

Réponse:
{
  "success": true,
  "data": {
    "plan": { /* PlanLimits object */ },
    "usage": {
      "postsUsed": 3,
      "monthlyInterviewsUsed": 5,
      "lastMonthlyResetDate": "2026-02-05T..."
    },
    "remainingPosts": 17,
    "remainingMonthlyInterviews": 10
  }
}
```

#### Mettre à jour l'utilisation
```
PUT /plan-limits/usage/:companyProfileId
Content-Type: application/json
Authorization: Bearer <token>

{
  "postsUsed": 5
}
```

#### Incrémenter un compteur d'utilisation
```
PUT /plan-limits/increment/:companyProfileId/:counterType
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 1
}

Compteurs disponibles:
- postsUsed
- monthlyInterviewsUsed
```

#### Réinitialiser le compteur mensuel si nécessaire
```
PUT /plan-limits/reset-monthly/:companyProfileId
Authorization: Bearer <token>

Note: Vérifie automatiquement si un mois a passé avant de réinitialiser
```

## Initialization

### Seeding par défaut
Pour ajouter les plans par défaut à la base de données:

```bash
cd Backend
node seeders/planLimits.seeder.js
```

Cela crée automatiquement 4 plans par défaut:
1. **Basic** - 5 posts, 10 déblocages, 15 interviews
2. **Professional** - 20 posts, 50 déblocages, 50 interviews
3. **Enterprise** - 100 posts, 500 déblocages, 200 interviews
4. **Trial** - 2 posts, 5 déblocages, 5 interviews

## Service Functions

### planLimits.service.js

```javascript
// Créer un plan
createPlan(planData)

// Récupérer tous les plans
getAllPlans(filters)

// Récupérer un plan par ID
getPlanById(planId)

// Mettre à jour un plan
updatePlan(planId, updateData)

// Supprimer un plan
deletePlan(planId)

// Assigner un plan à une company
assignPlanToCompany(companyProfileId, planId)

// Consulter l'utilisation d'une company
getCompanyPlanUsage(companyProfileId)

// Mettre à jour l'utilisation
updateCompanyUsage(companyProfileId, usageData)

// Incrémenter un compteur
incrementUsageCounter(companyProfileId, counterType, amount)

// Réinitialiser le compteur mensuel
resetMonthlyInterviewCounterIfNeeded(companyProfileId)
```

## Usage Examples

### 1. Create a Company with Plan
```javascript
// 1. Create company profile
const profile = new Profile({
  userId: userId,
  type: "Company",
  companyDetails: { name: "My Company" }
});
await profile.save();

// 2. Assign a plan to the company
const planId = "..."; // Get from getAllPlans()
await planLimitsService.assignPlanToCompany(profile._id, planId);
```

### 2. Track Usage - When creating a post
```javascript
// When a company creates a post
await planLimitsService.incrementUsageCounter(
  companyProfileId,
  "postsUsed",
  1
);
```

### 3. Check Usage before action
```javascript
// Before allowing an action
const usage = await planLimitsService.getCompanyPlanUsage(companyProfileId);

if (usage.data.remainingPosts > 0) {
  // Allow creating post
} else {
  // Show "limit reached" error
}
```

### 4. Monthly Reset
```javascript
// Call before checking monthly limit
await planLimitsService.resetMonthlyInterviewCounterIfNeeded(companyProfileId);

// Then check usage
const usage = await planLimitsService.getCompanyPlanUsage(companyProfileId);
```

## Integration Points

### Where to integrate usage tracking:

1. **Post Creation** (`Post.controller.js`)
   - Incrémenter `postsUsed` quand une company crée un post

2. **Interview Creation** (`IntelligentInterview.controller.js`)
   - Incrémenter `monthlyInterviewsUsed` quand une interview est créée
   - Appeler `resetMonthlyInterviewCounterIfNeeded` avant chaque vérification

## Notes

- Les plans par défaut doivent être créés via le seeder lors de la première initialisation
- Chaque company profile doit avoir un plan assigné
- Le reset mensuel est automatique et se déclenche lors du changement de mois
- Les limites négatives (remaining < 0) indiquent un dépassement (à gérer dans l'UI)
