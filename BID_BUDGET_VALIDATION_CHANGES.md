# 📋 Changements : Validation du Budget de Bidding (bidBudgetMax)

## 🎯 Objectif
Ajouter une vérification du plafond de dépense (`bidBudgetMax`) lors de la mise à jour des bids pour éviter que les agents dépassent leur budget alloué.

---

## 📝 Fichiers Modifiés

### 1. **Backend/services/profileService.js** - Fonction `updateFinalBid`
**Changements :**
- ✅ Import de `AgentConfigModel` pour récupérer la configuration de l'agent
- ✅ Validation et normalisation des valeurs de bid en nombres
- ✅ Calcul de la dépense actuelle (somme des `companyBid.finalBid`) par l'agent/compagnie
- ✅ **Nouvelle vérification** : Si `currentSpent + newBid > bidBudgetMax`, lance une erreur explicite
- ✅ Message d'erreur clair en français : 
  ```
  "Budget maximum atteint ou dépassé : plafond=X, dépensé=Y. Le nouveau bid de Z le dépasserait."
  ```

**Détails du flux :**
1. Récupère `AgentConfig` lié à `companyId`
2. Extrait `bidBudgetMax` (sinon null)
3. Somme tous les bids actuels de l'agent (WHERE `companyBid.company === companyId`)
4. Teste : `currentSpent + parsedNewBid > bidBudgetMax` → erreur si vrai
5. Message remontée au contrôleur → réponse HTTP 500 avec détails

---

### 2. **Backend/services/agendaService.js** - Job `agent:heartbeat`
**Changements :**
- ✅ Calcul du bid amélioré : au lieu de reprendre `topMatch.finalBid`, on **incrémente de `bidStep`**
  ```javascript
  const currentFinalBid = topMatch.finalBid ? Number(topMatch.finalBid) : 0;
  const nextBid = currentFinalBid > 0 ? currentFinalBid + bidStep : bidBudgetMin;
  const bidAmount = Math.max(bidBudgetMin, Math.min(bidBudgetMax, nextBid));
  ```
- ✅ **Nouvelle vérification** : Si le bid calculé dépasse `bidBudgetMax`, skip le candidat
  ```javascript
  if (bidAmount >= bidBudgetMax && nextBid > bidBudgetMax) {
    console.warn(`⚠️ [Agenda] Plafond atteint... Candidat ${name} ne peut pas être enchéri.`);
    continue; // Passer au candidat suivant
  }
  ```
- ✅ Log explicite quand le budget est atteint

---

## 🔧 Flux de Validation

### Scénario 1 : Bid Normal (réussi)
```
Agent A : bidBudgetMax = 500, dépense actuelle = 100
Nouveau bid pour candidat = 50
Total = 150 → 150 ≤ 500 ✅ Bid accepté
```

### Scénario 2 : Bid Bloqué (budget dépassé)
```
Agent A : bidBudgetMax = 500, dépense actuelle = 480
Nouveau bid pour candidat = 50
Total = 530 → 530 > 500 ❌ 
Error: "Budget maximum atteint ou dépassé : plafond=500, dépensé=480. Le nouveau bid de 50 le dépasserait."
```

### Scénario 3 : Agenda skip candidat (budget plafond)
```
[Agenda] topMatch.finalBid = 20, bidBudgetMax = 20, bidStep = 5
nextBid = 20 + 5 = 25 → 25 > 20 (plafond)
⚠️ [Agenda] Plafond de dépense atteint... Candidat X ne peut pas être enchéri.
Skip → passer au candidat suivant
```

---

## ✅ Contrôles Effectués

1. **Syntaxe Node.js** : ✅ Modules se chargent correctement (`profileService` + `agendaService`)
2. **Normalisation** : ✅ Conversion Number() des bids (évite comparaisons surprenantes)
3. **Gestion d'erreur** : ✅ Messages explicites en français avec détails (plafond, dépensé, nouveau)
4. **Skip gracieux** : ✅ Agenda continue la boucle (candidats suivants) si budget atteint

---

## 📡 Exemple Requête HTTP

### Demande (PUT `/profiles/updateFinalBid`)
```json
{
  "userId": "609a7c4d1f2e3a5c7b8d9e0f",
  "newBid": 50,
  "companyId": "609a7c4d1f2e3a5c7b8d9e1g",
  "postId": "609a7c4d1f2e3a5c7b8d9e2h"
}
```

### Réponse (Budget OK, 200)
```json
{
  "message": "Bid updated successfully",
  "profile": {
    "companyBid": {
      "finalBid": 50,
      "company": "609a7c4d1f2e3a5c7b8d9e1g",
      "dateBid": "2025-11-13T10:30:00.000Z"
    }
  }
}
```

### Réponse (Budget Dépassé, 500)
```json
{
  "message": "Budget maximum atteint ou dépassé : plafond=500, dépensé=480. Le nouveau bid de 50 le dépasserait."
}
```

---

## 🚀 Recommandations Futures

1. **HTTP Status Code** : Adapter la réponse à 400 (Bad Request) ou 409 (Conflict) au lieu de 500 si budget dépassé
2. **Tracking de dépenses** : Ajouter un champ `totalSpent` dans `AgentConfig` pour éviter de recalculer à chaque fois
3. **Alertes** : Notifier l'agent/compagnie quand le budget approche (ex. 80-90%)
4. **Tests unitaires** : Ajouter des tests pour la logique de budget (happy path + edge cases)

---

## 📌 Notes d'Implémentation

- ⚠️ La vérification du budget se fait **après** la normalisation des bids
- ⚠️ Si AgentConfig n'existe pas, la validation est **ignorée** (graceful degradation)
- ⚠️ Le message du budget est **bloquant** (erreur remontée au contrôleur)
- ✅ L'incrémentation `bidStep` dans Agenda **prévient** les tentatives d'ajout de bid égal au bid actuel

---

**Date de modification** : 13 novembre 2025  
**Branche** : `transcription-v2`
