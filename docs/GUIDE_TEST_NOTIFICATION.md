# 🔔 Guide Complet de Test du Système Notification Socket.IO

## 📋 Table des matières
1. [Configuration initiale](#configuration)
2. [Test avec le fichier HTML](#test-html)
3. [Test avec Postman](#test-postman)
4. [Événements attendus](#événements)
5. [Dépannage](#dépannage)

---

## <a name="configuration"></a>1️⃣ Configuration initiale

### Démarrer le serveur Backend
```bash
cd Backend
node app.js
```

**Vérifier les logs console :**
```
✅ TalentAI Backend successfully started!
🚀 Server running on 0.0.0.0:5000
🌐 Accessible from Windows at: http://172.23.207.114:5000
🌐 Accessible from WSL at: http://localhost:5000
🔌 WebSocket endpoint: ws://172.23.207.114:5000/socket.io/
```

✅ Si vous voyez cela, le serveur est prêt.

---

## <a name="test-html"></a>2️⃣ Test avec le fichier HTML

### Ouvrir le fichier
📁 Aller à : `test-socket-client/notificationtest.html`

Ouvrir dans un navigateur (double-clic ou clic droit → Ouvrir avec → Navigateur)

### Utiliser l'interface
1. **Entrer un User ID** (ex: `USER_ID_DE_TEST` ou `641d1a2b3c4d5e6f7g8h9i0j`)
2. **Cliquer "Se connecter"** 
   - Vous devriez voir : `✅ Connecté au serveur (Socket ID: ...)`
   - Puis : `📍 Rejoint room: USER_ID_DE_TEST`

3. **Tester la création de notification**
   - Modifier le texte "Contenu notification" (optionnel)
   - Cliquer "Créer Notification"
   - Vous devriez voir : `📨 EVENT: notification → {...}`

4. **Observer la log** (boîte noire en bas)
   - Tous les événements Socket.IO s'affichent ici avec timestamp

### Événements à observer dans le HTML

| Événement | Description |
|-----------|-------------|
| `notification` | Une nouvelle notification a été créée |
| `notificationRead` | Une notification a été marquée comme lue |
| `notificationsMarkedRead` | Toutes les notifications ont été marquées lues (bulk) |
| `notificationDeleted` | Une notification a été supprimée |
| `unreadCountUpdated` | Le compte de non-lus a changé |

---

## <a name="test-postman"></a>3️⃣ Test avec Postman

### 🔑 Prérequis : Obtenir un Token JWT

**Option A : Via l'API d'authentification (si disponible)**
```
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "votre@email.com",
  "password": "votre_mot_de_passe"
}
```

Récupérer la réponse : vous aurez un `token` ou `accessToken`.

**Option B : Utiliser un token existant** (si vous en avez un de déjà connecté)

### 📝 Collection Postman

#### **1. Créer une notification via API**

```
POST http://localhost:5000/notification-system/AddNotification
Content-Type: application/json
Authorization: Bearer <VOTRE_TOKEN>

{
  "recipient": "641d1a2b3c4d5e6f7g8h9i0j",
  "content": "Bienvenue sur TalentAI!",
  "url": "/dashboard"
}
```

**Réponse attendue :**
```json
{
  "_id": "...",
  "recipient": "641d1a2b3c4d5e6f7g8h9i0j",
  "content": "Bienvenue sur TalentAI!",
  "url": "/dashboard",
  "read": false,
  "type": "system",
  "createdAt": "2025-12-19T10:30:00.000Z"
}
```

**Si le client HTML est connecté à la même room :** 
- Vous recevrez en temps réel : `notification` event

---

#### **2. Récupérer les notifications de l'utilisateur**

```
GET http://localhost:5000/notification-system/GetMyNotification
Authorization: Bearer <VOTRE_TOKEN>
```

**Paramètres optionnels (query string) :**
```
?unread=true&limit=10&offset=0
```

**Réponse attendue :**
```json
[
  {
    "_id": "...",
    "recipient": "...",
    "content": "Bienvenue sur TalentAI!",
    "read": false,
    "createdAt": "2025-12-19T10:30:00.000Z"
  },
  ...
]
```

---

#### **3. Marquer UNE notification comme lue**

```
PATCH http://localhost:5000/notification-system/markAsRead/<NOTIFICATION_ID>/read
Authorization: Bearer <VOTRE_TOKEN>
Content-Type: application/json
```

**Remplacer `<NOTIFICATION_ID>` par l'ID réel** (ex: `641d1a2b3c4d5e6f7g8h9i0j`)

**Réponse attendue :**
```json
{
  "message": "Marked as read.",
  "notification": {
    "_id": "...",
    "read": true,
    ...
  }
}
```

**Socket.IO event reçu (si connecté) :**
```
notificationRead → { id: "...", notification: {...} }
unreadCountUpdated → { unreadCount: 5 }
```

---

#### **4. Récupérer UNE notification par ID**

```
GET http://localhost:5000/notification-system/GetNotificationByID/<NOTIFICATION_ID>
Authorization: Bearer <VOTRE_TOKEN>
```

**Réponse attendue :**
```json
{
  "_id": "...",
  "recipient": "...",
  "content": "...",
  "read": false,
  "createdAt": "..."
}
```

---

#### **5. Supprimer une notification**

```
DELETE http://localhost:5000/notification-system/deleteNotification/<NOTIFICATION_ID>
Authorization: Bearer <VOTRE_TOKEN>
```

**Réponse attendue :**
```json
{
  "message": "Notification deleted.",
  "notification": {
    "_id": "...",
    ...
  }
}
```

**Socket.IO event reçu (si connecté) :**
```
notificationDeleted → { id: "..." }
unreadCountUpdated → { unreadCount: 4 }
```

---

### Configuration Postman (Étapes)

1. **Ouvrir Postman**
2. **Créer une nouvelle requête** (+ New → Request)
3. **Remplir les champs :**
   - **Method** : POST / GET / PATCH / DELETE (selon l'endpoint)
   - **URL** : coller l'URL complète ci-dessus
   - **Headers tab** : 
     - Key: `Content-Type`, Value: `application/json`
     - Key: `Authorization`, Value: `Bearer <VOTRE_TOKEN>`
4. **Body tab** (pour POST/PATCH) : coller le JSON
5. **Send** → voir la réponse

---

## <a name="événements"></a>4️⃣ Événements Socket.IO attendus

### Événement : `notification`
**Quand :** Une notification est créée
```javascript
socket.on('notification', (data) => {
  console.log('Nouvelle notif:', data);
  // { _id: "...", recipient: "...", content: "...", read: false, ... }
});
```

### Événement : `notificationRead`
**Quand :** Une notification est marquée lue
```javascript
socket.on('notificationRead', (data) => {
  console.log('Notif lue:', data);
  // { id: "...", notification: {...} }
});
```

### Événement : `notificationsMarkedRead`
**Quand :** Toutes les notifications sont marquées lues (bulk)
```javascript
socket.on('notificationsMarkedRead', (data) => {
  console.log('Toutes marquées lues:', data);
  // { modifiedCount: 5 }
});
```

### Événement : `notificationDeleted`
**Quand :** Une notification est supprimée
```javascript
socket.on('notificationDeleted', (data) => {
  console.log('Notif supprimée:', data);
  // { id: "..." }
});
```

### Événement : `unreadCountUpdated`
**Quand :** Le nombre de notifications non-lues change
```javascript
socket.on('unreadCountUpdated', (data) => {
  console.log('Unread count:', data.unreadCount);
  // { unreadCount: 3 }
});
```

---

## <a name="dépannage"></a>5️⃣ Dépannage

### ❌ "Connection failed" dans le HTML

**Vérifier :**
- ✅ Le serveur est bien démarré (`node app.js`)
- ✅ Le port est 5000 (vérifier avec `netstat -ano | findstr 5000` sur Windows)
- ✅ Le pare-feu n'est pas bloquant
- ✅ L'URL du Socket.IO est correcte : `http://localhost:5000`

**Solution :** Relancer le serveur
```bash
cd Backend
node app.js
```

---

### ❌ "Access denied" dans Postman

**Vérifier :**
- ✅ Le token JWT est valide
- ✅ L'en-tête `Authorization: Bearer <TOKEN>` est présent
- ✅ L'utilisateur existe dans la base de données
- ✅ Le rôle de l'utilisateur a les permissions

**Solution :** 
- Générer un nouveau token via `/auth/login`
- Vérifier les logs du serveur pour les erreurs

---

### ❌ Aucun événement Socket.IO reçu

**Vérifier :**
- ✅ Le client HTML a exécuté `socket.emit('join', userId)`
- ✅ Le `userId` utilisé dans le HTML correspond au `recipient` de la notification
- ✅ Pas d'erreur dans la console du navigateur (F12)
- ✅ Pas d'erreur dans les logs du serveur

**Solution :** 
- Vérifier les logs du serveur : `socket emit failed...`
- Redémarrer le serveur et le client

---

### ❌ Notification créée mais pas dans la DB

**Vérifier :**
- ✅ MongoDB est en cours d'exécution
- ✅ La variable d'environnement `MONGO_URI` est correcte

**Commande pour vérifier MongoDB :**
```bash
mongosh  # ou mongo (ancienne version)
use talentai_db
db.notifications.find()
```

---

## 📊 Cas de test recommandés

### Test 1 : Création simple
1. Ouvrir HTML, se connecter
2. Créer une notification
3. Observer l'événement `notification`
4. Vérifier dans Postman via GET

### Test 2 : Lire une notification
1. HTML : créer une notif
2. Postman : PATCH `markAsRead/:id`
3. HTML : recevoir `notificationRead` + `unreadCountUpdated`

### Test 3 : Supprimer une notification
1. Postman : DELETE notification
2. HTML : recevoir `notificationDeleted` + `unreadCountUpdated`
3. Postman GET : vérifier qu'elle n'existe plus

### Test 4 : Notifications sans Socket.IO (API only)
1. Postman : créer, récupérer, marquer lue, supprimer
2. Vérifier les réponses HTTP
3. Consulter la DB directement

---

## 💡 Conseils finaux

- **Toujours avoir les logs du serveur visibles** pendant les tests
- **Utiliser des User IDs réels** de votre base de données
- **Tester d'abord sans Socket.IO** (API only) pour isoler les problèmes
- **Puis ajouter Socket.IO** pour vérifier la synchronisation
- **Documenter les erreurs** rencontrées pour améliorations futures

Bon test ! 🚀
