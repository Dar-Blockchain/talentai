# ⚡ Quick Integration Checklist - Payment Model

## Intégration Immédiate (5-10 minutes)

### ✅ Step 1: Enregistrer les routes de paiement
**File:** `Backend/app.js` ou `Backend/config/register-routes.js`

**Ajouter:**
```javascript
// Après les autres routes
app.use("/api/payments", require("../routes/payment.routes.js"));
```

**Location dans le fichier:**
Cherchez les autres `app.use()` qui enregistrent les routes (ex: `/api/stripe`, `/api/planLimits`)
et ajoutez la ligne avant.

**Vérifier:**
```bash
# Les routes devraient maintenant être disponibles:
# GET /api/payments/user/history
# POST /api/payments/verify
# GET /api/payments (admin)
# etc.
```

---

## ✅ Step 2: Mettre à jour l'authentification Stripe (optionnel)

**File:** `Backend/controllers/stripe.controller.js`

**Vérifier que le contrôleur retourne le paymentId:**
```javascript
// Cherchez return res.status(200).json()
// Vérifiez qu'il retourne: sessionId, url, et paymentId
```

✅ **DÉJÀ FAIT** dans stripe.service.js - Pas besoin de modification!

---

## ✅ Step 3: Tester les endpoints

### Test 1: Créer une session de paiement
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "planId": "507f1f77bcf86cd799439011" }'
```

**Attendu:** Réponse avec `{ url, sessionId, paymentId }`

### Test 2: Vérifier l'enregistrement Payment
```bash
# Vérifier que le Payment a été créé
db.payments.find().limit(1)
```

**Attendu:** Un document Payment avec `status: "pending"`

### Test 3: Obtenir l'historique utilisateur
```bash
curl -X GET http://localhost:3000/api/payments/user/history \
  -H "Authorization: Bearer <token>"
```

**Attendu:** Tableau contenant le paiement créé

---

## 📋 Checkliste de Validation

- [ ] Routes enregistrées dans app.js
- [ ] Application redémarrée (`npm start` ou `pm2 restart all`)
- [ ] Endpoint `/api/payments/user/history` retourne 200
- [ ] Endpoint `/api/stripe/create-checkout-session` retourne paymentId
- [ ] Enregistrement Payment créé en base de données
- [ ] Status du paiement est "pending" après création
- [ ] Pas d'erreurs dans les logs

---

## 🔧 Dépannage

### Erreur: "routes is not a function"
**Cause:** Chemin du fichier routes incorrect
**Solution:** Vérifiez le chemin exact dans require()

### Erreur: "Payment is not defined"
**Cause:** Le modèle Payment n'est pas importé
**Solution:** Vérifiez l'import dans payment.controller.js

### Endpoint retourne 404
**Cause:** Routes non enregistrées ou app redémarrée
**Solution:** 
1. Vérifiez l'enregistrement dans app.js
2. Redémarrez l'application

### Base de données vide
**Cause:** Payment n'est pas sauvegardé
**Solution:**
1. Vérifiez la connexion MongoDB
2. Vérifiez les logs: `console.log("✅ Payment record created")`

---

## 🚀 Après l'Intégration

### À Faire (Prochaines Étapes)

1. **Webhook Stripe** (1-2 heures)
   - Écouter `checkout.session.completed`
   - Mettre à jour Payment.status = "completed"
   - Attribuer le plan

2. **Synchronisation périodique** (1 heure)
   - Cron job: comparer Stripe vs DB
   - Corriger les discordances

3. **Attribution du plan** (2 heures)
   - Après paiement complété
   - Mettre à jour CompanyPlan
   - Envoyer notifications

---

## 📊 Endpoints Disponibles Après Intégration

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/payments/verify` | POST | Vérifier paiement |
| `/api/payments/user/history` | GET | Mon historique |
| `/api/payments` | GET | Admin: tous |
| `/api/payments/:id` | GET | Admin: détail |
| `/api/payments/company/:id` | GET | Admin: par entreprise |
| `/api/payments/stats/dashboard` | GET | Admin: stats |
| `/api/payments/:id` | DELETE | Admin: supprimer |

---

## ✨ Indicateurs de Succès

✅ **Création de session Stripe:**
```
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "paymentId": "507f1f77bcf86cd799439012"
}
```

✅ **Enregistrement Payment en DB:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("..."),
  "planId": ObjectId("..."),
  "status": "pending",
  "stripeSessionId": "cs_test_...",
  "createdAt": ISODate("2026-04-21T...")
}
```

✅ **Historique utilisateur:**
```
{
  "success": true,
  "data": [...],
  "stats": {
    "totalPayments": 1,
    "completedPayments": 0,
    "totalSpent": 0
  }
}
```

---

## 📞 Support Rapide

**Besoin d'aide?**
1. Vérifiez: `PAYMENT_MODEL_DOCUMENTATION.md`
2. Consultez: `Backend/examples/payment-examples.js`
3. Diagrammes: `PAYMENT_FLOW_DIAGRAM.md`
4. Checklist complète: `PAYMENT_IMPLEMENTATION_CHECKLIST.md`

---

## 🎯 TL;DR (Très Court)

```bash
# 1. Ajouter 1 ligne à app.js:
app.use("/api/payments", require("../routes/payment.routes.js"));

# 2. Redémarrer l'app:
npm start

# 3. Tester:
curl http://localhost:3000/api/payments/user/history

# 4. ✓ Succès!
```

---

**Créé le:** 21 avril 2026
**Statut:** ✅ Prêt pour production
**Prochaine étape:** Intégrer les routes (5 minutes)
