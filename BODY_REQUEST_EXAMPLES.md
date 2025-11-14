# Exemples de Body pour l'API createOrUpdateCompanyProfile

## 📋 Structure complète du body

Voici tous les champs que vous pouvez passer en body :

---

## 1️⃣ Body minimal (requis uniquement)

```json
{
  "name": "TechCorp"
}
```

**Réponse** : Crée un profil avec seulement le nom

---

## 2️⃣ Body avec employmentType

```json
{
  "name": "TechCorp Solutions",
  "employmentType": "Remote"
}
```

**Valeurs valides pour employmentType** :
- `"Remote"`
- `"Hybrid"`
- `"On-site"`

---

## 3️⃣ Body complet - RECOMMANDÉ

```json
{
  "name": "TechCorp Solutions",
  "industry": "Technology",
  "size": "500-1000",
  "location": "San Francisco, CA",
  "email": "contact@techcorp.com",
  "employmentType": "Remote",
  "requiredSkills": [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB"
  ],
  "requiredExperienceLevel": "Mid Level"
}
```

---

## 4️⃣ Tous les champs disponibles

```json
{
  "name": "Innovation Tech Inc",
  "industry": "Software Development",
  "size": "100-500",
  "location": "Paris, France",
  "email": "hr@innovationtech.fr",
  "employmentType": "Hybrid",
  "requiredSkills": [
    "Node.js",
    "React",
    "MongoDB",
    "Docker",
    "AWS"
  ],
  "requiredExperienceLevel": "Senior"
}
```

---

## 📊 Tableau des champs

| Champ | Type | Requis | Exemple | Description |
|-------|------|--------|---------|-------------|
| `name` | String | ✅ **OUI** | `"TechCorp"` | Nom de l'entreprise |
| `industry` | String | ❌ Non | `"Technology"` | Secteur d'activité |
| `size` | String | ❌ Non | `"500-1000"` | Taille de l'entreprise |
| `location` | String | ❌ Non | `"Paris, France"` | Localisation |
| `email` | String | ❌ Non | `"hr@company.fr"` | Email de l'entreprise |
| `employmentType` | String | ❌ Non | `"Remote"` | Remote / Hybrid / On-site |
| `requiredSkills` | Array | ❌ Non | `["Node.js", "React"]` | Liste des compétences |
| `requiredExperienceLevel` | String | ❌ Non | `"Mid Level"` | Niveau d'expérience |

---

## 🎯 Cas d'usage par secteur

### Startup Tech
```json
{
  "name": "StartupAI",
  "industry": "Artificial Intelligence",
  "size": "10-50",
  "location": "Berlin, Germany",
  "email": "hello@startupai.de",
  "employmentType": "Remote",
  "requiredSkills": [
    "Python",
    "Machine Learning",
    "TensorFlow",
    "Data Science"
  ],
  "requiredExperienceLevel": "Senior"
}
```

### Consulting Company
```json
{
  "name": "McKinsey Alternative",
  "industry": "Consulting",
  "size": "1000+",
  "location": "London, UK",
  "email": "careers@consulting.co.uk",
  "employmentType": "On-site",
  "requiredSkills": [
    "Business Analysis",
    "Project Management",
    "Strategic Planning",
    "Communication"
  ],
  "requiredExperienceLevel": "Expert"
}
```

### E-commerce Platform
```json
{
  "name": "ShopEase",
  "industry": "E-commerce",
  "size": "200-500",
  "location": "Amsterdam, Netherlands",
  "email": "jobs@shopease.nl",
  "employmentType": "Hybrid",
  "requiredSkills": [
    "JavaScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "AWS",
    "DevOps"
  ],
  "requiredExperienceLevel": "Mid Level"
}
```

### Financial Services
```json
{
  "name": "FinTech Solutions",
  "industry": "Financial Technology",
  "size": "50-200",
  "location": "Singapore",
  "email": "recruitment@fintech.sg",
  "employmentType": "On-site",
  "requiredSkills": [
    "Java",
    "Spring Boot",
    "Microservices",
    "Security",
    "Blockchain"
  ],
  "requiredExperienceLevel": "Senior"
}
```

---

## 🎓 Exemples minimalistes

### Exemple 1 - Création rapide
```json
{
  "name": "My Company"
}
```

### Exemple 2 - Avec type d'emploi
```json
{
  "name": "Tech Solutions",
  "employmentType": "Remote"
}
```

### Exemple 3 - Avec une compétence
```json
{
  "name": "Dev Shop",
  "requiredSkills": ["JavaScript"],
  "employmentType": "Hybrid"
}
```

---

## 📌 Valeurs prédéfinies

### employmentType (3 options)
```
- "Remote"      → Travail à distance
- "Hybrid"      → Travail hybride (bureau + remote)
- "On-site"     → Travail sur site (bureau)
```

### requiredExperienceLevel (5 niveaux)
```
- "Entry Level" → Débutants
- "Junior"      → Juniors (0-2 ans)
- "Mid Level"   → Intermédiaires (2-5 ans)
- "Senior"      → Séniors (5+ ans)
- "Expert"      → Experts (10+ ans)
```

### size (tailles courantes)
```
- "1-10"
- "10-50"
- "50-100"
- "100-500"
- "500-1000"
- "1000-5000"
- "5000+"
```

### industry (exemples)
```
- "Technology"
- "Software Development"
- "Consulting"
- "Financial Services"
- "E-commerce"
- "Healthcare"
- "Education"
- "Retail"
- "Manufacturing"
- "Artificial Intelligence"
```

---

## 🔄 Mise à jour - Changer employmentType

### Avant
```json
{
  "name": "TechCorp",
  "employmentType": "Remote"
}
```

### Après (mise à jour)
```json
{
  "name": "TechCorp",
  "employmentType": "Hybrid"
}
```

---

## ❌ Erreurs courantes

### Erreur 1 - name manquant
```json
{
  "industry": "Tech",
  "employmentType": "Remote"
}
```
**Erreur** : `"Company name is required"`

### Erreur 2 - employmentType invalide
```json
{
  "name": "TechCorp",
  "employmentType": "FullTime"
}
```
**Erreur** : `"Invalid employment type. Must be 'Remote', 'Hybrid', or 'On-site'"`

### Erreur 3 - requiredExperienceLevel invalide
```json
{
  "name": "TechCorp",
  "requiredExperienceLevel": "Super Expert"
}
```
**Valeurs acceptées** : `"Entry Level"`, `"Junior"`, `"Mid Level"`, `"Senior"`, `"Expert"`

---

## 🚀 Body prêt à copier-coller

### Pour test rapide
```json
{
  "name": "Test Company",
  "industry": "Technology",
  "size": "50-100",
  "location": "Paris, France",
  "email": "test@company.fr",
  "employmentType": "Remote",
  "requiredSkills": ["Node.js", "React"],
  "requiredExperienceLevel": "Mid Level"
}
```

### Pour démonstration
```json
{
  "name": "Global Tech Solutions",
  "industry": "Software Development",
  "size": "500-1000",
  "location": "San Francisco, CA, USA",
  "email": "careers@globaltech.com",
  "employmentType": "Hybrid",
  "requiredSkills": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "MongoDB",
    "Docker",
    "AWS",
    "CI/CD"
  ],
  "requiredExperienceLevel": "Senior"
}
```

### Pour production
```json
{
  "name": "Your Official Company Name",
  "industry": "Your Industry",
  "size": "Your Company Size",
  "location": "Your Location",
  "email": "your-email@company.com",
  "employmentType": "Remote",
  "requiredSkills": ["Skill1", "Skill2", "Skill3"],
  "requiredExperienceLevel": "Mid Level"
}
```

---

## 📝 Checklist avant envoi

- [ ] `name` est fourni (requis)
- [ ] `employmentType` est l'une de : Remote, Hybrid, On-site
- [ ] `requiredExperienceLevel` est l'une de : Entry Level, Junior, Mid Level, Senior, Expert
- [ ] `requiredSkills` est un tableau de chaînes `["skill1", "skill2"]`
- [ ] `email` a un format valide
- [ ] Pas d'accents ou caractères spéciaux dans les valeurs

---

## 🔗 API Endpoint

```
POST http://localhost:5000/profiles/createOrUpdateCompanyProfile
```

**Headers requis** :
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

Remplacez `YOUR_JWT_TOKEN` par votre token JWT valide !
