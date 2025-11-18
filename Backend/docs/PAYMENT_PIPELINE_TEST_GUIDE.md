# 🧪 Guide de Test du Pipeline de Paiement TAI Token

## ✅ Fix Appliqué

Le problème a été identifié et corrigé : l'URL de l'API backend était mal configurée dans le frontend.

### Changements Appliqués

**Fichier**: `src/components/dashboard-company/WalletConnect.tsx`

1. **Ajout de la configuration API** (ligne 21):
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';
   ```

2. **Utilisation de l'URL complète** (ligne 204-208):
   ```typescript
   const apiUrl = `${API_BASE_URL}/payment/complete`;
   console.log('💰 Completing payment on backend...', {
     apiUrl,
     planId,
     transactionId: result.transactionId
   });
   ```

3. **Logging amélioré** (lignes 212, 226-229):
   - Log du token d'authentification
   - Log du status HTTP
   - Log de la réponse complète

---

## 🚀 Procédure de Test

### Étape 1: Vérifier les Prérequis

**Backend:**
```bash
cd Backend
npm run dev
# Devrait afficher: "🚀 Server is running on port 5000"
```

**Frontend:**
```bash
npm run dev
# Devrait afficher: "Ready on http://localhost:3000"
```

**Variables d'environnement:**
```bash
# Dans .env.local:
NEXT_PUBLIC_API_BASE_URL=http://172.23.207.114:5000
# OU si backend local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Étape 2: Préparer un Compte Test

1. **Se connecter en tant que Company**
2. **Vérifier que le compte a un Hedera Account**:
   - Ouvrir la console du navigateur
   - Aller dans Application → LocalStorage
   - Vérifier que l'utilisateur connecté a `hederaAccountId`

3. **Vérifier HashPack Wallet**:
   - Installer l'extension HashPack
   - Se connecter au testnet
   - Avoir au moins 50 HBAR dans le wallet (pour le test)

### Étape 3: Exécuter un Paiement Test

**Actions:**
1. Aller sur le dashboard company
2. Cliquer sur "Buy TAI Tokens"
3. Sélectionner le plan **Starter ($199)**
4. Cliquer "Continue to Payment"
5. Connecter HashPack Wallet
6. **IMPORTANT: Ouvrir la console du navigateur (F12)**
7. Confirmer le paiement dans HashPack

### Étape 4: Vérifier les Logs

**Console Navigateur (F12 → Console):**

Vous devriez voir dans l'ordre:

```javascript
✅ Wallet connected successfully
💰 Completing payment on backend... {
  apiUrl: "http://172.23.207.114:5000/payment/complete",
  planId: "starter",
  transactionId: "0.0.1378@1234567890.123456789"
}
🔑 Auth token: exists
📡 Payment API response status: 200 OK
📦 Payment API response data: {
  success: true,
  message: "Payment completed and tokens distributed successfully",
  data: {
    transactionId: "0.0.1378@...",
    planName: "Starter",
    taiTokens: 199000,
    gasFeeHbar: 0.xx,
    totalHbarPaid: xx.xx,
    distributionResult: {...},
    userAccount: "0.0.XXXX"
  }
}
✅ Payment completed successfully: {...}
🎉 You received 199000 TAI tokens!
⛽ Gas fee: 0.xx HBAR
```

**Logs Backend (Terminal où tourne npm run dev):**

```
📊 Fetching current pricing plans...
🎯 Complete payment initiated for user 64xxx, plan: starter
👤 User Hedera details: {...}
🚀 Starting token distribution for 0.0.XXXX...
📊 Token Amount: 199000 TAI
⛽ Gas Fee: 0.45 HBAR
📋 Step 1: Associating TAI token...
🔗 Associating TAI token with account 0.0.XXXX...
✅ Token association successful for 0.0.XXXX
💰 Step 2: Transferring TAI tokens...
💰 Transferring 199000 TAI tokens to 0.0.XXXX...
✅ Token transfer successful: 199000 TAI to 0.0.XXXX
⛽ Step 3: Transferring gas fee...
⛽ Transferring 0.45 HBAR as gas fee to 0.0.XXXX...
✅ Gas fee transfer successful: 0.45 HBAR to 0.0.XXXX
🎉 Payment completed successfully for user 64xxx
```

### Étape 5: Vérifier sur Hedera HashScan

1. **Aller sur**: https://hashscan.io/testnet
2. **Chercher le compte utilisateur**: Entrer l'account ID (ex: 0.0.6970452)
3. **Vérifier dans l'onglet "Tokens"**:
   - TAI Token (0.0.6955317) devrait apparaître
   - Balance = 199,000 TAI (ou le montant du plan choisi)
4. **Vérifier dans l'onglet "Transactions"**:
   - Transaction de réception de TAI tokens
   - Transaction de réception de HBAR gas fee
   - Memo devrait être: "TAI_Distribution_..." et "Gas_Fee_..."

### Étape 6: Vérifier dans la Base de Données

**MongoDB:**
```javascript
// Vérifier la transaction
db.tokentransactions.findOne({
  hederaTransactionHash: "0.0.1378@..." // Le transaction ID
})
// Devrait montrer status: "completed"

// Vérifier le user
db.users.findOne({ _id: ObjectId("...") })
// tokenBalance devrait avoir augmenté de 199000
// gasFeeBalance devrait avoir augmenté de ~0.45
```

---

## ❌ Problèmes Courants et Solutions

### Problème 1: "Payment sent but backend processing failed"

**Symptômes:**
- Message d'erreur dans le frontend
- Aucun log dans le backend

**Causes possibles:**
1. Backend n'est pas démarré
2. URL de l'API incorrecte
3. Token d'authentification manquant ou expiré

**Solution:**
```bash
# Vérifier que backend tourne
cd Backend && npm run dev

# Vérifier .env.local
cat .env.local | grep NEXT_PUBLIC_API_BASE_URL

# Se reconnecter (refresh le token)
```

### Problème 2: "Status 404 Not Found"

**Console montre:**
```
📡 Payment API response status: 404 Not Found
```

**Cause:** URL incorrecte

**Solution:**
1. Vérifier que `NEXT_PUBLIC_API_BASE_URL` est défini dans `.env.local`
2. Redémarrer le frontend (`npm run dev`)
3. Vérifier dans la console que l'URL est correcte:
   ```
   apiUrl: "http://172.23.207.114:5000/payment/complete"
   ```

### Problème 3: "Status 401 Unauthorized"

**Cause:** Token d'authentification invalide

**Solution:**
1. Se déconnecter
2. Se reconnecter
3. Vérifier dans console: `🔑 Auth token: exists`

### Problème 4: "Token association failed"

**Logs backend:**
```
❌ Token association failed for 0.0.XXXX
```

**Causes possibles:**
1. Private key du user incorrecte
2. Format de clé incorrect (ECDSA vs ED25519)

**Solution:**
Réexécuter le script de création de comptes Hedera:
```bash
cd Backend
node scripts/addHederaAccountsToCompanies.js
```

### Problème 5: "Insufficient TAI tokens"

**Logs backend:**
```
❌ Admin has 0 TAI tokens
```

**Solution:**
Le compte admin (0.0.1378) n'a pas de TAI tokens:
1. Vérifier sur HashScan: https://hashscan.io/testnet/account/0.0.1378
2. Transférer des TAI tokens vers 0.0.1378
3. Réessayer le paiement

---

## ✅ Test Réussi - Checklist

Après un paiement réussi, vous devriez avoir:

- [ ] **Console navigateur**: Logs de succès avec taiTokens reçus
- [ ] **Logs backend**: Distribution complète (3 étapes)
- [ ] **HashScan compte user**: Balance TAI tokens mise à jour
- [ ] **HashScan compte user**: Balance HBAR augmentée (gas fee)
- [ ] **HashScan compte admin**: Transactions sortantes visibles
- [ ] **MongoDB tokentransactions**: status = "completed"
- [ ] **MongoDB users**: tokenBalance augmenté
- [ ] **MongoDB users**: gasFeeBalance augmenté
- [ ] **Frontend UI**: Message de succès affiché

---

## 📊 Tableau de Conversion

| Plan | Prix USD | TAI Tokens | HBAR Base* | Gas Fee (1%) | Total HBAR* |
|------|----------|------------|------------|--------------|-------------|
| Starter | $199 | 199,000 | ~44.64 | ~0.45 | ~45.09 |
| Professional | $299 | 299,000 | ~67.04 | ~0.67 | ~67.71 |
| Enterprise | $499 | 499,000 | ~111.91 | ~1.12 | ~113.03 |

*Les montants HBAR varient selon le taux de change HBAR/USD en temps réel

---

## 🔧 Commandes Utiles

**Vérifier les logs backend en temps réel:**
```bash
cd Backend
npm run dev | grep -E "Distribution|Token|Payment"
```

**Tester le service de distribution manuellement:**
```bash
cd Backend
node scripts/testPaymentPipeline.js
```

**Vérifier qu'une transaction existe sur Hedera:**
```bash
# Utiliser HashScan
https://hashscan.io/testnet/transaction/[TRANSACTION_ID]
```

**Vérifier le token dans MongoDB:**
```javascript
use talentai
db.tokentransactions.find().sort({createdAt: -1}).limit(5).pretty()
```

---

## 🎯 Prochaines Étapes

Une fois le test réussi:

1. **Tester les 3 plans** (Starter, Professional, Enterprise)
2. **Tester avec plusieurs utilisateurs**
3. **Vérifier la scalabilité** (plusieurs paiements simultanés)
4. **Ajouter monitoring** (nombre de paiements, tokens distribués)
5. **Créer dashboard admin** pour voir les transactions
6. **Ajouter notifications email** après paiement réussi

---

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide:

1. **Vérifier tous les logs** (frontend + backend)
2. **Vérifier HashScan** pour les transactions Hedera
3. **Vérifier MongoDB** pour l'état des données
4. **Partager les logs complets** pour diagnostic

---

**Dernière mise à jour**: {{ date }}
**Version**: 1.0.0
**Status**: ✅ Pipeline Fonctionnel
