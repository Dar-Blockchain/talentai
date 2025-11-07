# Documentation du Service Agenda

## Vue d'ensemble

Le service Agenda est un composant crucial de l'application qui gère l'automatisation des tâches périodiques, particulièrement le processus de matching entre les candidats et les offres d'emploi. Il utilise la bibliothèque `agenda` pour la planification des tâches.

## Fonctionnalités principales

### 1. Initialisation (`initializeAgenda`)

- Crée une instance unique d'Agenda connectée à MongoDB
- Configure la vérification des tâches toutes les secondes
- Met en place les gestionnaires d'événements pour le monitoring
- Planifie le heartbeat quotidien

### 2. Heartbeat (`agent:heartbeat`)

Tâche principale exécutée quotidiennement qui :
- Récupère tous les agents actifs
- Calcule les correspondances pour chaque poste
- Envoie des notifications pour les matches pertinents
- Met à jour les enchères (bids) si nécessaire

### 3. Calcul des correspondances (`computeMatches`)

- Normalise les noms de compétences
- Compare les compétences requises avec celles des candidats
- Calcule un score de correspondance
- Trie les résultats par score décroissant

## Configuration technique

### Base de données
- Collection : `agendaJobs` dans MongoDB
- URI : Défini via la variable d'environnement `MONGODB_URI`

### Planification
- Fréquence : Quotidienne (`0 0 * * *`)
- Timezone : Europe/Paris (configurable via `TZ`)
- Vérification : Toutes les secondes

## Système de monitoring

### Logs
- Démarrage des tâches : `▶️ [Agenda]`
- Succès : `✅ [Agenda]`
- Erreurs : `❌ [Agenda]`
- Avertissements : `⚠️ [Agenda]`

### Compteur décroissant
- Affiche le temps restant avant le prochain heartbeat
- Mise à jour toutes les 10 secondes
- Affichage détaillé dans les 10 dernières secondes

## Gestion des erreurs

### Mécanismes de sécurité
- Nettoyage des anciennes planifications au démarrage
- Détection et suppression des doublons
- Watchdog pour relance automatique si absence de heartbeat

### Seuils importants
- Score minimum pour matching : 70
- Durée de verrouillage des tâches : 30000ms
- Délai de watchdog : 62 secondes

## Flux de données

1. **Entrée**
   - Liste des agents actifs
   - Profils des candidats
   - Détails des offres d'emploi

2. **Traitement**
   - Normalisation des compétences
   - Calcul des scores de matching
   - Filtrage des résultats

3. **Sortie**
   - Messages d'évaluation
   - Mises à jour des enchères
   - Logs de monitoring

## Points d'attention

- Vérifier régulièrement les logs pour détecter les anomalies
- Surveiller la charge de la base de données lors des calculs de matching
- Maintenir les variables d'environnement à jour
- Vérifier périodiquement la synchronisation des timezone