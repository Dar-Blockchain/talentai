# Payment Model for Plan Limits - Documentation

## Overview
Un nouveau système de paiement a été intégré pour tracker et gérer les paiements associés aux limites de plan. Ce système enregistre chaque transaction Stripe dans la base de données pour un audit, un suivi et une gestion complets.

## Architecture

### 1. **Payment Model** (`Backend/models/Payment.model.js`)
Le modèle stocke toutes les informations de paiement pertinentes:

#### Champs Principaux:
- **userId**: Référence à l'utilisateur ayant effectué le paiement
- **companyProfileId**: Référence au profil de l'entreprise
- **planId**: Référence au plan acheté
- **planName / planPrice**: Snapshot du plan au moment du paiement
- **stripeSessionId**: ID unique de la session Stripe
- **stripePaymentIntentId**: ID d'intention de paiement Stripe
- **status**: État du paiement (pending, completed, failed, cancelled)
- **amountCents**: Montant en cents (pour la précision)
- **currency**: Devise (USD par défaut)
- **completedAt**: Date de complétion
- **metadata**: Données supplémentaires (limites du plan, description, etc.)

#### Indices pour Performance:
```
- userId + status (requêtes rapides par utilisateur et statut)
- companyProfileId (historique par entreprise)
- planId (analyse par plan)
- stripeSessionId (synchronisation Stripe)
- createdAt (tri chronologique)
```

---

## Services

### 2. **Payment Service** (`Backend/services/payment.service.js`)

Fonctionnalités principales:

#### Récupération des Paiements:
```javascript
// Tous les paiements avec filtres
getPayments({ userId, companyProfileId, status, planId })

// Par ID
getPaymentById(paymentId)

// Par ID de session Stripe
getPaymentByStripeSessionId(stripeSessionId)
```

#### Gestion du Statut:
```javascript
// Mettre à jour le statut du paiement
updatePaymentStatus(paymentId, status, additionalData)
```

#### Historique:
```javascript
// Historique utilisateur avec statistiques
getUserPaymentHistory(userId)

// Historique entreprise avec statistiques
getCompanyPaymentHistory(companyProfileId)
```

#### Suppression:
```javascript
// Supprimer les paiements en attente uniquement
deletePayment(paymentId)
```

---

## Contrôleurs

### 3. **Payment Controller** (`Backend/controllers/payment.controller.js`)

#### Endpoints:

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/payments/verify` | Public | Vérifier et mettre à jour le statut après paiement |
| GET | `/payments/user/history` | User | Historique de paiement de l'utilisateur |
| GET | `/payments` | Admin | Tous les paiements |
| GET | `/payments/:paymentId` | Admin | Détails d'un paiement |
| GET | `/payments/company/:companyProfileId` | Admin | Historique de l'entreprise |
| GET | `/payments/stats/dashboard` | Admin | Statistiques des paiements |
| DELETE | `/payments/:paymentId` | Admin | Supprimer un paiement (en attente uniquement) |

---

## Intégration avec Stripe

### 4. **Updated Stripe Service** (`Backend/services/stripe.service.js`)

Lors de la création d'une session de paiement Checkout:

```javascript
// AVANT: Retournait uniquement les détails Stripe
// MAINTENANT:
// 1. Crée une session Stripe
// 2. Enregistre un document Payment avec status "pending"
// 3. Retourne paymentId en plus de sessionId
```

**Flux:**
```
createCheckoutSession()
  ↓
1. Valide le plan
2. Crée la session Stripe
3. Crée un enregistrement Payment (status: "pending")
4. Retourne { sessionId, session, paymentId }
```

---

## Cas d'Utilisation

### Case 1: Créer une Session de Paiement
```javascript
// Dans le contrôleur Stripe
const { planId } = req.body;
const result = await stripeService.createCheckoutSession({
  planId,
  baseUrl: process.env.BASE_URL,
  userId: req.user._id,
  companyProfileId: userProfile._id
});

// Retourne:
// {
//   success: true,
//   sessionId: "cs_...",
//   session: {...},
//   paymentId: "ObjectId"
// }
```

### Case 2: Après un Paiement Réussi (Webhook)
```javascript
const sessionId = event.data.object.id;

// Vérifier le statut auprès de Stripe
const session = await stripe.checkout.sessions.retrieve(sessionId);

// Mettre à jour le paiement dans la DB
if (session.payment_status === "paid") {
  await paymentService.updatePaymentStatus(paymentId, "completed", {
    stripePaymentIntentId: session.payment_intent,
    paymentMethod: session.payment_method_types?.[0]
  });
}
```

### Case 3: Obtenir l'Historique de Paiement d'un Utilisateur
```javascript
GET /payments/user/history

Response:
{
  success: true,
  data: [
    {
      _id: "...",
      planName: "Premium",
      planPrice: 99,
      status: "completed",
      completedAt: "2026-04-21T...",
      ...
    }
  ],
  stats: {
    totalPayments: 5,
    completedPayments: 4,
    totalSpent: 396,
    lastPayment: {...}
  }
}
```

### Case 4: Obtenir les Statistiques de Paiement (Admin)
```javascript
GET /payments/stats/dashboard?startDate=2026-01-01&endDate=2026-04-30

Response:
{
  success: true,
  data: {
    totalPayments: 150,
    completedPayments: 145,
    failedPayments: 3,
    pendingPayments: 2,
    totalRevenue: 14500.50,
    averagePaymentValue: "96.67"
  },
  dateRange: {...}
}
```

---

## Migration Notes

### Si vous aviez un système précédent:
1. Les anciens paiements Stripe n'ont pas d'enregistrement Payment
2. Pour migrer, créer des documents Payment rétroactifs en lisant les sessions Stripe archivées
3. Exemple de script de migration (voir `scripts/migrate-payments.js`)

---

## Security

✅ **Routes Protégées:**
- Les endpoints de lecture d'historique nécessitent d'être l'utilisateur propriétaire
- Les endpoints d'administration nécessitent le rôle "Admin"
- Les suppressions sont limitées aux paiements en attente uniquement

✅ **Validation des Données:**
- Vérification de l'authentification sur tous les endpoints sensibles
- Validation du statut avec enumération stricte
- Logs d'audit pour les opérations sensibles

---

## Monitoring

### Champs Importants à Surveiller:
- **Paiements en attente depuis longtemps** (> 24h):
  ```javascript
  { status: "pending", createdAt: { $lt: new Date(Date.now() - 24*3600*1000) } }
  ```

- **Paiements échoués**:
  ```javascript
  { status: "failed" }
  ```

- **Discordances Stripe vs DB**:
  Comparer les statuts Stripe avec les enregistrements Payment

---

## Next Steps

1. ✅ Implémenter un Webhook Stripe pour mettre à jour les statuts de paiement
2. ✅ Ajouter un endpoint de synchronisation périodique Stripe → DB
3. ✅ Créer des alertes pour les paiements échoués
4. ✅ Implémenter un système de remboursement avec tracking
5. ✅ Générer des factures et les associer aux paiements
