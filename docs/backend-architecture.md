# Architecture du Backend — TalentAI (détaillée)

Ce document décrit en détail l'architecture backend, les composants, les flux critiques, les variables d'environnement nécessaires, les endpoints clés, la configuration de Socket.IO et des recommandations opérationnelles.

--------------------------------------------------------------------------------

## 1. Vue d'ensemble

Le backend est une API Node.js/Express accompagnée de WebSockets via Socket.IO pour les fonctionnalités temps réel (notifications, interviews). MongoDB est la base de données principale, gérée via Mongoose. Des services et microservices complémentaires (ex: `chatbot-microservice`) fournissent la logique ML/IA.

Architecture logicale:

- Entrée HTTP: `Backend/app.js` initialise l'application, les middlewares, Swagger et les routes.
- Services métier: `Backend/services` (notification, agenda, intelligentInterviewService, etc.).
- Contrôleurs: `Backend/controllers` orchestrent les opérations et appellent les services/modèles.
- Persistance: `Backend/models` (Mongoose schemas).
- Temps réel: `socket.js` (initialisation) + handlers socket dans `app.js` et controllers.
- Tâches planifiées: dossier `cron/` et `services/Agent&AgendaServices`.

--------------------------------------------------------------------------------

## 2. Variables d'environnement importantes

- `MONGODB_URI` : URI de connexion MongoDB (obligatoire). (voir `config/database.js`)
- `PORT` : port HTTP du serveur (ex: 3000)
- `HOST` : host d'écoute (ex: 0.0.0.0)
- `NODE_ENV` : environment (development|production)
- `JWT_SECRET` : secret JWT pour authentification
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` : clés Stripe
- `HEDERA_*` : clés d'API Hedera si utilisées
- `REDIS_URL` : URL Redis (recommandé si on scale Socket.IO)
- Autres clés spécifiques aux services (ex: API keys pour intégrations externes)

Ajouter un fichier `.env.example` avec ces variables est recommandé.

--------------------------------------------------------------------------------

## 3. Configuration base de données

- Le connecteur est dans `Backend/config/database.js`.
- Options importantes détectées:
	- `maxPoolSize`, `minPoolSize`, `serverSelectionTimeoutMS`, `socketTimeoutMS`, `connectTimeoutMS`.
	- Monitoring via `utils/dbMonitor` (logs périodiques et capture d'événements `error`, `disconnected`, `reconnected`).

Exemple de comportement à documenter pour l'exploitation:
- Vérifier `MONGODB_URI` au démarrage (l'app exit si manquant).
- En cas d'erreur de connexion, appliquer retry/backoff dans un futur refactor.

--------------------------------------------------------------------------------

## 4. Socket.IO (temps réel)

- Initialisation centralisée: `socket.js`.
- Paramètres observés:
	- `cors.origin: '*'` (à restreindre en prod)
	- `transports: ['websocket', 'polling']`
	- `pingTimeout: 60000`, `pingInterval: 25000`
	- `path: '/socket.io/'`
	- `allowEIO3: true` (compatibilité avec Engine.IO v3)

- Recommandation pour scale:
	- Utiliser Redis adapter (`socket.io-redis`) et fournir `REDIS_URL`.
	- Désactiver `serveClient` en production (déjà false).

Handlers importants:
- Namespace default: join rooms par `userId`, broadcast et création de notifications via `services/notificationSystemService`.

--------------------------------------------------------------------------------

## 5. Endpoints et routes clés

Les routeurs sont exposés dans `Backend/app.js`. Endpoints représentatifs:

- `POST /auth/login`, `POST /auth/register` (authentification)
- `GET /profiles/:id`, `PUT /profiles/:id` (profils)
- `POST /post`, `GET /post/:id` (offres)
- `POST /matching`, `GET /matching/config` (matching)
- `POST /payment/stripe` (paiements via Stripe)
- `GET /api/docs` (Swagger UI)

Pour une liste complète, générer automatiquement à partir du dossier `Backend/routes` (commande script suggérée).

--------------------------------------------------------------------------------

## 6. Tâches planifiées (cron / agenda)

- Fichiers: `cron/resetQuota`, `cron/DailyExchangeRateUpdate`.
- Agenda initialisé via `services/Agent&AgendaServices/agendaService` après connexion DB.
- Recommandations:
	- Confirmer que cron jobs tournent sur une seule instance (leader election) ou utiliser un orchestrateur externe.

--------------------------------------------------------------------------------

## 7. Observabilité & runbook rapide

- Logs: `morgan` pour requêtes, dossier `logs/` pour persistantes.
- Erreurs fréquentes & procédures:
	- MongoDB missing URI: l'app exit; vérifier `.env` et redémarrer.
	- Socket.IO Engine connection error: vérifier l'URL client, headers et CORS.
	- Stripe webhook failures: vérifier `STRIPE_WEBHOOK_SECRET` et logs d'événements.

Runbook bref (exemples):
- Problème: `MongoDB connection failed`
	- Vérifier `MONGODB_URI` et accessibilité réseau.
	- Vérifier quotas/replicasets côté MongoDB.
	- Redémarrer service après correction.
- Problème: WebSockets ne se connectent pas
	- Tester endpoint `ws://HOST:PORT/socket.io/`.
	- Vérifier `pingInterval/pingTimeout` côté client.

--------------------------------------------------------------------------------

## 8. Sécurité

- Restreindre `CORS` en production.
- Stocker secrets dans un vault (Hashicorp, Azure Key Vault) plutôt que `.env` pour production.
- Limiter les permissions de la base de données (utilisateur avec droits minimum requis).

--------------------------------------------------------------------------------

## 9. Déploiement & CI/CD

- Docker: `Backend/Dockerfile` présent. Image building + push vers registry.
- Kubernetes: manifests (`Backend/Backend-deployment.yaml`) pour déploiement.
- Process manager: `ecosystem.config.js` (PM2) disponible pour déploiement hors k8s.

Pipeline recommandé (succinct):
1. Lint + Tests unitaires
2. Build Docker image
3. Push vers registry
4. Déployer via Helm/K8s manifests

Commands utiles locales:
```bash
# Build backend
docker build -t myregistry/talentai-backend:latest -f Backend/Dockerfile .

# Run locally (avec .env)
cd Backend
npm install
npm start
```

--------------------------------------------------------------------------------

## 10. Diagramme mermaid (architecture simplifiée)

```mermaid
graph LR
	Client -->|HTTP| API[Express API]
	Client -->|WS| Socket[Socket.IO]
	API -->|Mongoose| MongoDB[(MongoDB)]
	API --> Services[Services (notifications, agenda, ml)]
	Services --> Chatbot[chatbot-microservice]
	Socket -->|publish| Services
	API -->|Stripe| Stripe((Stripe))
```

--------------------------------------------------------------------------------

## 11. Fichiers clés (références)

- Serveur principal: [Backend/app.js](Backend/app.js)
- Configuration DB: [Backend/config/database.js](Backend/config/database.js)
- Sockets: [Backend/socket.js](Backend/socket.js)
- Routes: dossier [Backend/routes](Backend/routes)
- Controllers: dossier [Backend/controllers](Backend/controllers)
- Services: dossier [Backend/services](Backend/services)
- Cron jobs: dossier [Backend/cron](Backend/cron)
- Microservice IA: dossier [chatbot-microservice](chatbot-microservice)

--------------------------------------------------------------------------------

## 12. Prochaines étapes suggérées (priorisées)

1. Générer automatiquement la liste complète des endpoints à partir de `Backend/routes`.
2. Produire un diagramme détaillé (draw.io ou Mermaid) couvrant namespaces Socket.IO et flows critiques.
3. Ajouter un `README_RUNBOOK.md` dans `Backend/docs/` contenant procédures pas-à-pas pour incidents courants.
4. Mettre en place Redis adapter pour Socket.IO et documenter `REDIS_URL` dans `.env.example`.

---

Document mis à jour — dites-moi quelle section vous voulez encore approfondir (diagramme détaillé, runbook pas-à-pas, ou extraction automatique des endpoints). 

---

Document rédigé automatiquement — vérifier et compléter selon besoins spécifiques de l'équipe.
