# TalentAI - Analyse Complète des Tokens AI et Pricing

## 📊 Vue d'ensemble

Cette documentation fournit une analyse détaillée de l'utilisation des tokens AI dans le système TalentAI, incluant les coûts estimés et les optimisations possibles.

---

## 🤖 Modèles AI Utilisés (Together AI)

### Modèles par Type d'Interview

| Interview Type | Fast Model | Thinking Model | Analysis Model |
|----------------|------------|----------------|----------------|
| **HR Interview** | Llama-3.2-11B-Vision-Instruct-Turbo | Meta-Llama-3.1-70B-Instruct-Turbo | Meta-Llama-3.1-405B-Instruct-Turbo |
| **Technical Skill** | Llama-3.2-3B-Instruct-Turbo | Meta-Llama-3.1-70B-Instruct-Turbo | Meta-Llama-3.1-405B-Instruct-Turbo |
| **Soft Skill** | Llama-3.2-11B-Vision-Instruct-Turbo | Meta-Llama-3.1-70B-Instruct-Turbo | Meta-Llama-3.1-70B-Instruct-Turbo |
| **Salary Interview** | Llama-3.2-11B-Vision-Instruct-Turbo | Meta-Llama-3.1-70B-Instruct-Turbo | Meta-Llama-3.1-70B-Instruct-Turbo |
| **Psychotechnic** | Llama-3.2-11B-Vision-Instruct-Turbo | Meta-Llama-3.1-405B-Instruct-Turbo | Meta-Llama-3.1-405B-Instruct-Turbo |

### Pricing Together AI (Octobre 2025)

| Modèle | Input ($/M tokens) | Output ($/M tokens) | Utilisation |
|--------|-------------------|---------------------|-------------|
| **Llama-3.2-3B-Instruct-Turbo** | $0.04 | $0.04 | Questions rapides |
| **Llama-3.2-11B-Vision-Instruct-Turbo** | $0.18 | $0.18 | Génération de salutations |
| **Meta-Llama-3.1-70B-Instruct-Turbo** | $0.88 | $0.88 | Analyse principale |
| **Meta-Llama-3.1-405B-Instruct-Turbo** | $3.50 | $3.50 | Analyse approfondie |

---

## 📈 Analyse Détaillée par Fonction AI

### 1. **MemoryAI Class** (Gestion de la mémoire conversationnelle)

#### 1.1 analyzeQuestionSimilarity
**Modèle**: Meta-Llama-3.1-70B-Instruct-Turbo
**Température**: 0.2 (précision maximale)
**Max Tokens**: 800

**Prompt Structure:**
```
System Prompt: ~400 tokens (instructions d'analyse)
User Prompt: ~300 tokens (question + historique)
Total Input: ~700 tokens
Output Attendu: ~200 tokens (JSON structuré)
```

**Utilisation par Interview:**
- Appelé: 1-2 fois par question générée (vérification de redondance)
- Fréquence: 10-15 fois par interview (15-20 questions totales)

**Coût Estimé par Appel:**
- Input: 0.7k tokens × $0.88/M = $0.000616
- Output: 0.2k tokens × $0.88/M = $0.000176
- **Total: $0.000792 par appel**
- **Par Interview: $0.0119 (15 appels)**

#### 1.2 analyzeResponseIntelligence
**Modèle**: Meta-Llama-3.1-70B-Instruct-Turbo
**Température**: 0.3
**Max Tokens**: 600

**Prompt Structure:**
```
System Prompt: ~350 tokens (instructions d'extraction)
User Prompt: ~200-500 tokens (réponse du candidat)
Total Input: ~700 tokens (moyenne)
Output Attendu: ~300 tokens (compétences + insights)
```

**Utilisation par Interview:**
- Appelé: À chaque réponse du candidat
- Fréquence: 15-20 fois par interview

**Coût Estimé par Appel:**
- Input: 0.7k tokens × $0.88/M = $0.000616
- Output: 0.3k tokens × $0.88/M = $0.000264
- **Total: $0.00088 par appel**
- **Par Interview: $0.0176 (20 réponses)**

---

### 2. **CoverageAI Class** (Analyse de couverture)

#### 2.1 analyzeCoverageIntelligently
**Modèle**: Meta-Llama-3.1-70B-Instruct-Turbo
**Température**: 0.3
**Max Tokens**: 1200

**Prompt Structure:**
```
System Prompt: ~500 tokens (contexte d'analyse)
User Prompt: ~600-800 tokens (focus areas + réponse)
Total Input: ~1200 tokens
Output Attendu: ~600 tokens (mises à jour de couverture)
```

**Utilisation par Interview:**
- Appelé: Après chaque réponse du candidat
- Fréquence: 15-20 fois par interview

**Coût Estimé par Appel:**
- Input: 1.2k tokens × $0.88/M = $0.001056
- Output: 0.6k tokens × $0.88/M = $0.000528
- **Total: $0.001584 par appel**
- **Par Interview: $0.0317 (20 appels)**

#### 2.2 determineIfCoverageIsSufficient
**Modèle**: Meta-Llama-3.1-70B-Instruct-Turbo
**Température**: 0.2
**Max Tokens**: 600

**Prompt Structure:**
```
System Prompt: ~300 tokens
User Prompt: ~400 tokens (état de couverture actuel)
Total Input: ~700 tokens
Output Attendu: ~200 tokens (décision binaire)
```

**Utilisation par Interview:**
- Appelé: Toutes les 3-4 questions
- Fréquence: 4-5 fois par interview

**Coût Estimé par Appel:**
- Input: 0.7k tokens × $0.88/M = $0.000616
- Output: 0.2k tokens × $0.88/M = $0.000176
- **Total: $0.000792 par appel**
- **Par Interview: $0.00396 (5 appels)**

---

### 3. **QuestionAI Class** (Génération de questions)

#### 3.1 generateIntelligentQuestion
**Modèle**: Meta-Llama-3.2-8B-Instruct-Turbo
**Température**: 0.7 (créativité)
**Max Tokens**: 500

**Prompt Structure:**
```
System Prompt: ~400 tokens (style interviewer)
User Prompt: ~500 tokens (contexte + couverture)
Total Input: ~900 tokens
Output Attendu: ~250 tokens (question structurée)
```

**Utilisation par Interview:**
- Appelé: Pour générer chaque nouvelle question
- Fréquence: 15-20 fois par interview

**Coût Estimé par Appel:**
- Input: 0.9k tokens × $0.88/M = $0.000792
- Output: 0.25k tokens × $0.88/M = $0.00022
- **Total: $0.001012 par appel**
- **Par Interview: $0.0202 (20 questions)**

#### 3.2 generateTargetedQuestionForArea
**Modèle**: Meta-Llama-3.2-8B-Instruct-Turbo
**Température**: 0.6
**Max Tokens**: 400

**Prompt Structure:**
```
System Prompt: ~350 tokens
User Prompt: ~400 tokens (zone ciblée)
Total Input: ~750 tokens
Output Attendu: ~200 tokens
```

**Utilisation par Interview:**
- Appelé: 5-8 fois (questions ciblées)

**Coût Estimé par Appel:**
- Input: 0.75k tokens × $0.88/M = $0.00066
- Output: 0.2k tokens × $0.88/M = $0.000176
- **Total: $0.000836 par appel**
- **Par Interview: $0.00669 (8 appels)**

---

### 4. **DecisionAI Class** (Prise de décision)

#### 4.1 makeIntelligentDecision
**Modèle**: Meta-Llama-3.1-70B-Instruct-Turbo
**Température**: 0.3
**Max Tokens**: 600

**Prompt Structure:**
```
System Prompt: ~500 tokens (critères de décision)
User Prompt: ~600-800 tokens (état complet de l'interview)
Total Input: ~1200 tokens
Output Attendu: ~300 tokens (décision + raisonnement)
```

**Utilisation par Interview:**
- Appelé: Après chaque réponse du candidat
- Fréquence: 15-20 fois par interview

**Coût Estimé par Appel:**
- Input: 1.2k tokens × $0.88/M = $0.001056
- Output: 0.3k tokens × $0.88/M = $0.000264
- **Total: $0.00132 par appel**
- **Par Interview: $0.0264 (20 appels)**

#### 4.2 shouldEndInterview
**Modèle**: Meta-Llama-3.1-70B-Instruct-Turbo
**Température**: 0.2
**Max Tokens**: 500

**Prompt Structure:**
```
System Prompt: ~400 tokens
User Prompt: ~500 tokens (metrics de l'interview)
Total Input: ~900 tokens
Output Attendu: ~200 tokens (décision finale)
```

**Utilisation par Interview:**
- Appelé: Toutes les 4-5 questions
- Fréquence: 3-4 fois par interview

**Coût Estimé par Appel:**
- Input: 0.9k tokens × $0.88/M = $0.000792
- Output: 0.2k tokens × $0.88/M = $0.000176
- **Total: $0.000968 par appel**
- **Par Interview: $0.00387 (4 appels)**

---

### 5. **ReportAI Class** (Génération de rapports)

#### 5.1 updateRealTimeReport
**Modèle**: Meta-Llama-3.1-405B-Instruct-Turbo (Analyse approfondie)
**Température**: 0.4
**Max Tokens**: 800

**Prompt Structure:**
```
System Prompt: ~600 tokens (structure de rapport)
User Prompt: ~1000-1500 tokens (conversation complète)
Total Input: ~2000 tokens
Output Attendu: ~600 tokens (rapport structuré)
```

**Utilisation par Interview:**
- Appelé: Après chaque réponse significative
- Fréquence: 15-20 fois par interview

**Coût Estimé par Appel:**
- Input: 2.0k tokens × $3.50/M = $0.007
- Output: 0.6k tokens × $3.50/M = $0.0021
- **Total: $0.0091 par appel**
- **Par Interview: $0.182 (20 mises à jour)**

---

### 6. **Greeting Generation** (Salutation initiale)

**Modèle**: Llama-3.2-11B-Vision-Instruct-Turbo
**Température**: 0.6
**Max Tokens**: 200

**Prompt Structure:**
```
System Prompt: ~300 tokens (style + persona)
User Prompt: ~200 tokens (contexte candidat)
Total Input: ~500 tokens
Output Attendu: ~150 tokens (salutation)
```

**Utilisation par Interview:**
- Appelé: 1 fois au début

**Coût Estimé:**
- Input: 0.5k tokens × $0.18/M = $0.00009
- Output: 0.15k tokens × $0.18/M = $0.000027
- **Total: $0.000117 par interview**

---

## 💰 Coût Total par Interview Type

### Interview HR Standard (15-20 questions, 25-30 minutes)

| Fonction | Appels | Coût Unitaire | Coût Total |
|----------|--------|---------------|------------|
| Greeting | 1 | $0.000117 | $0.000117 |
| Question Similarity | 15 | $0.000792 | $0.0119 |
| Response Intelligence | 20 | $0.00088 | $0.0176 |
| Coverage Analysis | 20 | $0.001584 | $0.0317 |
| Coverage Sufficiency | 5 | $0.000792 | $0.00396 |
| Generate Question | 20 | $0.001012 | $0.0202 |
| Targeted Question | 8 | $0.000836 | $0.00669 |
| Intelligent Decision | 20 | $0.00132 | $0.0264 |
| Should End | 4 | $0.000968 | $0.00387 |
| Real-time Report | 20 | $0.0091 | $0.182 |
| **TOTAL** | **153** | - | **$0.3066** |

### Interview Technique (Plus de profondeur, 20-25 questions)

| Fonction | Appels | Coût Total |
|----------|--------|------------|
| Toutes fonctions (70B) | 110 | $0.145 |
| Real-time Report (405B) | 25 | $0.2275 |
| **TOTAL** | **135** | **$0.3725** |

### Interview Soft Skills (Plus d'échanges, 18-22 questions)

| Fonction | Appels | Coût Total |
|----------|--------|------------|
| Toutes fonctions (70B) | 100 | $0.132 |
| Real-time Report (70B) | 22 | $0.029 |
| **TOTAL** | **122** | **$0.161** |

### Interview Psychotechnic (Analyse approfondie, 15-18 questions)

| Fonction | Appels | Coût Total |
|----------|--------|------------|
| Toutes fonctions (405B) | 95 | $0.523 |
| Real-time Report (405B) | 18 | $0.164 |
| **TOTAL** | **113** | **$0.687** |

---

## 📊 Statistiques Globales

### Tokens Moyens par Interview

| Type Interview | Input Tokens | Output Tokens | Total Tokens | Coût |
|----------------|--------------|---------------|--------------|------|
| **HR Standard** | ~165,000 | ~45,000 | ~210,000 | $0.31 |
| **Technique** | ~195,000 | ~52,000 | ~247,000 | $0.37 |
| **Soft Skills** | ~145,000 | ~38,000 | ~183,000 | $0.16 |
| **Psychotechnic** | ~210,000 | ~58,000 | ~268,000 | $0.69 |
| **Salary** | ~125,000 | ~35,000 | ~160,000 | $0.14 |

### Distribution des Coûts

```
Real-time Reports (405B): 59.4% du coût total (HR)
Decision Making (70B): 8.6%
Coverage Analysis (70B): 10.3%
Question Generation (8B): 6.6%
Response Analysis (70B): 5.7%
Autres fonctions: 9.4%
```

---

## 🔄 Utilisation par Volume (Projections Mensuelles)

### Scénario 1: Petite Entreprise (50 interviews/mois)

| Type Interview | Quantité | Coût Unitaire | Coût Total |
|----------------|----------|---------------|------------|
| HR | 20 | $0.31 | $6.20 |
| Technique | 15 | $0.37 | $5.55 |
| Soft Skills | 10 | $0.16 | $1.60 |
| Psychotechnic | 5 | $0.69 | $3.45 |
| **TOTAL** | **50** | - | **$16.80/mois** |

### Scénario 2: Moyenne Entreprise (200 interviews/mois)

| Type Interview | Quantité | Coût Unitaire | Coût Total |
|----------------|----------|---------------|------------|
| HR | 80 | $0.31 | $24.80 |
| Technique | 60 | $0.37 | $22.20 |
| Soft Skills | 40 | $0.16 | $6.40 |
| Psychotechnic | 20 | $0.69 | $13.80 |
| **TOTAL** | **200** | - | **$67.20/mois** |

### Scénario 3: Grande Entreprise (1000 interviews/mois)

| Type Interview | Quantité | Coût Unitaire | Coût Total |
|----------------|----------|---------------|------------|
| HR | 400 | $0.31 | $124.00 |
| Technique | 300 | $0.37 | $111.00 |
| Soft Skills | 200 | $0.16 | $32.00 |
| Psychotechnic | 100 | $0.69 | $69.00 |
| **TOTAL** | **1000** | - | **$336.00/mois** |

### Scénario 4: Enterprise Scale (5000 interviews/mois)

| Type Interview | Quantité | Coût Unitaire | Coût Total |
|----------------|----------|---------------|------------|
| HR | 2000 | $0.31 | $620.00 |
| Technique | 1500 | $0.37 | $555.00 |
| Soft Skills | 1000 | $0.16 | $160.00 |
| Psychotechnic | 500 | $0.69 | $345.00 |
| **TOTAL** | **5000** | - | **$1,680.00/mois** |

---

## 🎯 Agents HR Multi-Agents (Communication HCS-11)

### Configuration des Agents

| Agent | Modèle | Rôle | Coût par Message |
|-------|--------|------|------------------|
| **Yuka (Coordinator)** | Meta-Llama-3.1-70B-Instruct-Turbo | Coordination générale | ~$0.002 |
| **Sinda (Soft Skills)** | Meta-Llama-3.1-70B-Instruct-Turbo | Évaluation soft skills | ~$0.002 |
| **Olga (Technical)** | Meta-Llama-3.1-70B-Instruct-Turbo | Évaluation technique | ~$0.002 |

### Conversation Multi-Agents Typique

**Scénario**: Évaluation complète d'un candidat

```
1. Sinda → Yuka: Rapport soft skills
   Input: ~800 tokens (évaluation détaillée)
   Output: ~0 tokens (envoi uniquement)
   Coût: $0.0007

2. Yuka → Sinda: Réponse AI-générée
   Input: ~1200 tokens (contexte + prompt)
   Output: ~400 tokens (réponse professionnelle)
   Coût: $0.00141

3. Olga → Yuka: Rapport technique
   Input: ~900 tokens
   Output: ~0 tokens
   Coût: $0.00079

4. Yuka → Olga: Feedback coordinator
   Input: ~1300 tokens
   Output: ~450 tokens
   Coût: $0.00154

Total par évaluation complète: ~$0.00444
Nombre moyen de messages: 6-10 par candidat
Coût total communication agents: $0.00888 - $0.0148
```

### Utilisation Mensuelle Agents HR

| Volume | Candidats | Messages/Candidat | Coût Total Agents |
|--------|-----------|-------------------|-------------------|
| 50 candidats | 50 | 8 | $0.74 |
| 200 candidats | 200 | 8 | $2.96 |
| 1000 candidats | 1000 | 8 | $14.80 |
| 5000 candidats | 5000 | 8 | $74.00 |

---

## 💡 Optimisations Possibles

### 1. Optimisation des Modèles

**Actuel:**
- Real-time Reports: 405B model ($3.50/M)
- Decision Making: 70B model ($0.88/M)

**Optimisé:**
```
Remplacer certains appels 405B par 70B pour:
- Mises à jour de rapport intermédiaires (garder 405B pour rapport final)
- Économie estimée: 30-40% sur rapports
```

**Impact:**
- HR Interview: $0.31 → $0.23 (-26%)
- Technical: $0.37 → $0.28 (-24%)
- Psychotechnic: $0.69 → $0.52 (-25%)

### 2. Caching Intelligent

**Prompts système réutilisables:**
- System prompts peuvent être cachés (Together AI supporte le caching)
- Économie: 20-30% sur input tokens

**Impact estimé:**
- Réduction: ~$0.04 par interview
- Économie mensuelle (1000 interviews): ~$40/mois

### 3. Batching des Analyses

**Approche actuelle:**
- Analyse temps réel après chaque réponse (20 appels)

**Approche optimisée:**
- Analyse par batch de 3-4 réponses
- Réduction de 50% des appels d'analyse
- Économie: ~$0.05 par interview

### 4. Modèles Plus Petits pour Questions Simples

**Remplacer:**
- 70B → 8B pour questions de suivi simples
- Économie: $0.02 par interview

---

## 📉 Analyse Coût/Bénéfice

### Coût AI vs Valeur Générée

**Par Interview (HR Standard):**
- Coût AI: $0.31
- Coût humain équivalent: $50-100 (temps recruteur)
- **ROI: 161x - 323x**

**Par 1000 Interviews/Mois:**
- Coût AI: $336
- Économie temps humain: $50,000 - $100,000
- **Économie nette: $49,664 - $99,664**

### Répartition des Coûts TalentAI

```
Coûts d'exploitation mensuels (1000 interviews):
├── Together AI: $336 (11.2%)
├── Hedera Network: ~$100 (3.3%)
├── MongoDB Atlas: ~$200 (6.7%)
├── Infrastructure AWS: ~$500 (16.7%)
├── Redis Cache: ~$50 (1.7%)
└── Autres: ~$1,814 (60.4%)
Total: ~$3,000/mois

Coût AI: Seulement 11.2% des coûts totaux
```

---

## 🔮 Projections de Croissance

### Année 1: 500 interviews/mois moyenne
- **Coût AI mensuel**: $168
- **Coût AI annuel**: $2,016
- **Revenue potentiel** (@ $199/plan): $99,500

### Année 2: 2500 interviews/mois
- **Coût AI mensuel**: $840
- **Coût AI annuel**: $10,080
- **Revenue potentiel**: $497,500

### Année 3: 10,000 interviews/mois
- **Coût AI mensuel**: $3,360
- **Coût AI annuel**: $40,320
- **Revenue potentiel**: $1,990,000

### Marge Brute AI
```
Revenue: $1,990,000
- Coût AI: $40,320
- Autres coûts: ~$120,000
= Marge: $1,829,680 (92%)
```

---

## 📋 Recommandations

### Court Terme (0-3 mois)

1. **Implémenter le caching** des system prompts
   - Économie: ~$40/mois (1000 interviews)
   - Effort: 2-3 jours dev

2. **Optimiser la fréquence** des real-time reports
   - Passer de 20 → 12 mises à jour par interview
   - Économie: ~$90/mois

3. **A/B testing** des modèles
   - Tester 70B vs 405B pour certains usages
   - Objectif: -25% coûts sans perte qualité

### Moyen Terme (3-6 mois)

4. **Système de batching** intelligent
   - Analyser 2-3 réponses ensemble
   - Économie estimée: 30-35%

5. **Monitoring avancé** tokens
   - Dashboard temps réel usage/coûts
   - Alertes sur anomalies

6. **Négociation volume** avec Together AI
   - Remises possibles à partir de 10M tokens/mois
   - Réduction potentielle: 10-15%

### Long Terme (6-12 mois)

7. **Fine-tuning** de modèles personnalisés
   - Modèle 13B custom pour questions standards
   - Réduction coût: 40-50% pour 60% des appels

8. **Infrastructure multi-provider**
   - Basculer entre Together AI / OpenAI / Anthropic
   - Optimisation coût selon disponibilité

9. **Caching sémantique** avancé
   - Réutiliser analyses similaires
   - Réduction: 20-25% appels API

---

## 📊 Comparaison avec Concurrents

### Coût par Interview

| Platform | Coût AI/Interview | Notre Coût | Différence |
|----------|-------------------|------------|------------|
| **HireVue** | ~$2.50 | $0.31 | -88% |
| **Pymetrics** | ~$1.80 | $0.31 | -83% |
| **Vervoe** | ~$1.20 | $0.31 | -74% |
| **TalentAI** | **$0.31** | - | **Meilleur** |

---

## 🎯 Conclusion

### Points Clés

1. **Coût compétitif**: $0.16 - $0.69 par interview selon le type
2. **ROI exceptionnel**: 161x - 323x vs recruteur humain
3. **Scalabilité**: Linéaire, prévisible
4. **Optimisations**: 25-40% réduction possible
5. **Marge**: 92% sur component AI

### Objectif Pricing

**Prix de vente recommandé:**
- Plan Starter ($199): 642x markup sur coût AI
- Plan Professional ($299): 965x markup
- Plan Enterprise ($499): 1,610x markup

**Rentabilité:**
- Break-even: <10 interviews/mois
- Target: 1000 interviews/mois
- Marge AI: >92%

---

## 📞 Support & Contact

Pour questions sur l'utilisation des tokens ou optimisations:
- **Email**: ai-optimization@talentai.bid
- **Documentation**: /docs/AI_TOKEN_USAGE_AND_PRICING_ANALYSIS.md
- **Dashboard Monitoring**: /dashboard/admin → AI Usage

---

**Dernière mise à jour**: Octobre 2025
**Version**: 1.0.0
**Auteur**: TalentAI Engineering Team
