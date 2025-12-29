# Changements apportés: importance → level dans softSkillSchema

## 📋 Résumé
Le champ `importance` dans le schéma `softSkillSchema` a été remplacé par le champ `level` pour plus de cohérence avec le schéma `skillSchema` qui utilise également `level`.

## ✅ Fichiers modifiés

### 1. Backend/models/PostModel.js
**Changement dans softSkillSchema:**
```javascript
// AVANT:
const softSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  importance: { type: String },  // ❌ supprimé
  percentage: { ... }
});

// APRÈS:
const softSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String },        // ✅ ajouté
  percentage: { ... }
});
```

**Raison:** Uniformité avec `skillSchema` qui utilise également `level` pour représenter le niveau d'une compétence.

## 📝 Structure actuelle

### SoftSkill object:
```javascript
{
  name: String,        // Ex: "Communication", "Problem Solving"
  level: String,       // Ex: "1", "2", "3", "4", "5" ou "Entry", "Intermediate", "Expert"
  percentage: Number   // 0-100: poids de la compétence soft skill dans le job
}
```

### Comparaison avec requiredSkill:
```javascript
{
  name: String,        // Ex: "React", "Node.js"
  level: String,       // Ex: "1", "2", "3", "4", "5"
  importance: String,  // Ex: "Required", "Nice to have"
  category: String,    // Ex: "Frontend", "Backend"
  percentage: Number   // 0-100: poids dans le job
}
```

## 🔄 Impact sur les requêtes

### Prompt de génération
✅ **Déjà compatible** - Le prompt `generateJobPostPrompts.js` génère déjà `level` pour softSkills (ligne 227)

### Requêtes MongoDB
Aucun changement nécessaire - MongoDB s'adapte automatiquement au schéma mis à jour.

## 💾 Migration des données existantes (si nécessaire)

Si vous avez des données existantes avec le champ `importance` dans softSkills, vous pouvez les migrer avec:

```javascript
// Migration script
db.posts.updateMany(
  { "skillAnalysis.softSkills.importance": { $exists: true } },
  [
    {
      $set: {
        "skillAnalysis.softSkills": {
          $map: {
            input: "$skillAnalysis.softSkills",
            as: "skill",
            in: {
              name: "$$skill.name",
              level: "$$skill.importance",  // Renommer importance en level
              percentage: "$$skill.percentage"
            }
          }
        }
      }
    }
  ]
);
```

## ✨ Avantages
- ✅ Cohérence avec `skillSchema`
- ✅ Clarté sémantique: "level" représente le niveau de maîtrise
- ✅ Uniformité des champs à travers tous les types de compétences
- ✅ Facilite les comparaisons et les analyses entre requiredSkills et softSkills
