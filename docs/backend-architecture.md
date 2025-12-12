# Architecture du Backend — TalentAI

Ce document présente une vue d'ensemble de l'architecture backend du projet TalentAI, ses composants principaux, flux de données, points d'intégration et recommandations opérationnelles.

## Vue d'ensemble

Le backend est une API RESTful construite sur Express.js et Node.js, complétée par des WebSockets (Socket.IO) pour les fonctionnalités temps réel. La base de données principale est MongoDB (connexion centralisée dans `config/database.js`). Des services complémentaires (agenda, cron jobs, microservices) gèrent la planification et l'intelligence métier.

## Composants principaux

- **Entrée HTTP / Serveur**: géré par `Backend/app.js`. Le serveur initialise la DB, les tâches planifiées (Agenda), Socket.IO et charge les routes.
- **Routes**: dossiers `Backend/routes` exposent les endpoints (auth, profiles, post, matching, payment, etc.).
- **Contrôleurs**: `Backend/controllers` contient la logique métier par ressource (ex: `intelligentInterviewController`).
- **Services**: `Backend/services` pour la logique réutilisable et intégrations externes (notification, hedra/hedera tools, agendaService, intelligentInterviewService).
- **Modèles / DB**: `Backend/models` (Mongoose) définit les schémas et interactions avec MongoDB.
- **Sockets**: `socket.js` + initialisation dans `Backend/app.js` exposent namespaces et handlers temps réel pour notifications et interviews.
- **Cron / Jobs**: le dossier `cron/` contient les tâches périodiques (ex: `resetQuota`, `DailyExchangeRateUpdate`).
- **Microservices**: `chatbot-microservice/` contient des composants ML/IA séparés exécutés indépendamment.
- **Docs API**: Swagger exposé via `/api/docs` (fichier `swagger.json`).

## Flux de données (typique)

1. Le client appelle un endpoint Express (ex: POST `/auth/login`).
2. Le routeur délègue au contrôleur correspondant, qui valide et utilise les services et modèles.
3. Les opérations DB passent par Mongoose (models) connecté via `config/database.js`.
4. Pour les actions temps réel, le contrôleur peut émettre des événements via Socket.IO aux rooms pertinentes.
5. Les tâches récurrentes sont exécutées par des CRON ou par Agenda (initialisé après connexion DB).

## Authentification & Sécurité

- Auth basée sur JWT (références dans `Backend/constants/jwtConstants.js` et routes `authenticationRouter`).
- CORS global activé (dans `app.js`) — vérifier la configuration en prod pour limiter les origines.
- Validation d'input à placer dans les routes/contrôleurs pour éviter les injections.
- Stockage des secrets via variables d'environnement (fichier `.env`), et ne pas committer ces valeurs.

## Déploiement et exécution

- Dockerfile présents (`Backend/Dockerfile`, racine) pour containerisation.
- Déploiement Kubernetes / manifest disponible (`Backend/Backend-deployment.yaml`, `frontend-deployment.yaml`).
- Process manager: `ecosystem.config.js` (PM2) utilisé en production possible.

## Observabilité

- Logging: dossiers `logs/` et usage de `morgan` dans `app.js`.
- Monitoring: ajouter métriques (Prometheus) et alerting pour la latence DB et erreurs 5xx.

## Scalabilité

- Stateless API: peut être scaled horizontalement derrière un load balancer si les sessions ne sont pas stockées en mémoire.
- WebSockets: besoin d'un broker (Redis) pour scaler Socket.IO entre instances (adapter `socket.io-redis` si multi-instance).
- Base de données: monitorer les connexions et mettre en place sharding/replicas selon charge.

## Points d'intégration externes

- Paiements: routes Stripe (`StripRouter` / `paymentRouter`).
- Hedera / HCS11: intégrations dans `controllers` et `services` (hederaTools, hcs11).
- Notifications: `services/notificationSystemService` utilisé par sockets et endpoints.

## Bonnes pratiques & recommandations

- Isoler la logique métier dans `services/` et garder `controllers/` légers.
- Ajouter des tests unitaires pour les services critiques (paiement, matching, évaluation).
- Externaliser la gestion des files et tâches longues (par ex. RabbitMQ ou Bull + Redis).
- Ajouter une suite d'intégration pour valider les contrats Swagger automatiquement.

## Fichiers clés (références)

- Serveur principal: [Backend/app.js](Backend/app.js)
- Configuration DB: [config/database.js](config/database.js)
- Sockets: [socket.js](socket.js)
- Routes: dossier [Backend/routes](Backend/routes)
- Controllers: dossier [Backend/controllers](Backend/controllers)
- Services: dossier [Backend/services](Backend/services)
- Cron jobs: dossier [cron](cron)
- Microservice IA: dossier [chatbot-microservice](chatbot-microservice)

## Prochaines étapes suggérées

1. Générer un diagramme d'architecture (ex: draw.io, mermaid) basé sur cette doc.
2. Ajouter une section « Runbook » pour erreurs fréquentes et procédures de récupération.
3. Mettre en place un système de scaling Socket.IO (Redis) et tests de charge.

---

Document rédigé automatiquement — vérifier et compléter selon besoins spécifiques de l'équipe.
