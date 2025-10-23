# 🔍 Logique du Matching

## 🎯 Objectif
Le système de matching a pour but de mesurer la **correspondance entre les compétences requises d’un poste** et **les compétences confirmées d’un candidat**.

L’idée est de donner à chaque candidat un **score sur 100** reflétant à quel point son profil correspond techniquement au poste proposé.

---

## 🧩 Principe général

1. Chaque offre contient une liste de compétences avec un **niveau requis** (`level`).
2. Chaque candidat possède des compétences avec un **niveau confirmé** (`Levelconfirmed`).
3. Pour chaque compétence du poste, on cherche la compétence équivalente chez le candidat (même nom, après normalisation).
4. On compare les deux niveaux pour calculer un **score individuel**.
5. Le score global du candidat est la **moyenne de tous les scores individuels**.

---

## 🧮 Formule du score individuel

\[
\text{Score individuel} = \max(0, \frac{5 - |\text{niveau\_poste} - \text{niveau\_candidat}|}{5} \times 100)
\]

- Si la différence = 0 → 100% (parfait)
- Si la différence = 1 → 80%
- Si la différence = 2 → 60%
- Si la différence = 3 → 40%
- Si la différence = 4 → 20%
- Si la différence ≥ 5 → 0%

---

## 📊 Calcul du score final

Le **score final** d’un candidat est la **moyenne** des scores individuels obtenus pour chaque compétence du poste :

\[
\text{Score final} = \frac{\sum \text{scores individuels}}{\text{nombre de compétences du poste}}
\]

Ce score est exprimé sur **100 points**.

---

## 💡 Exemple

**Poste :**
- Node.js = 4  
- Express = 3  
- MongoDB = 3  

**Candidat :**
- Node.js = 4  
- Express = 2  
- MongoDB = 3  

**Calcul :**
- Node.js → diff = 0 → 100%  
- Express → diff = 1 → 80%  
- MongoDB → diff = 0 → 100%  

\[
\text{Score final} = (100 + 80 + 100) / 3 = 93.3\%
\]

Le candidat obtient donc **93.3% de correspondance** avec le poste.

---

## 📈 Interprétation des scores

| Score (%) | Interprétation |
|------------|----------------|
| 90 – 100 | Excellent match |
| 75 – 89 | Bon match |
| 50 – 74 | Match moyen |
| < 50 | Faible correspondance |

---

## 🧠 Points clés

- Le système est **symétrique et transparent** : chaque compétence contribue de manière égale.  
- Les niveaux sont comparés **de 1 à 5**, selon une échelle de compétence cohérente.  
- La **normalisation des noms** garantit que “Node.js” et “node” sont traités comme la même compétence.  
- Le score final est une **moyenne arithmétique** arrondie à une décimale.

---

## 📎 Résumé

| Étape | Description |
|--------|--------------|
| 1 | Identifier les compétences du poste |
| 2 | Trouver les compétences équivalentes du candidat |
| 3 | Calculer la différence de niveaux |
| 4 | Convertir cette différence en score individuel |
| 5 | Faire la moyenne pour obtenir le score final |

---

**Auteur :** Hatem Azaiez  
**Dernière mise à jour :** Octobre 2025  
