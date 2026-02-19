/**
 * Guide d'intégration Swagger - Campagnes Internes et Participants
 * 
 * La documentation Swagger complète pour les campagnes internes est disponible à:
 * /api/docs/campaigns
 * 
 * OPTION 1: Servir la documentation Swagger séparée (RECOMMANDÉ - Simple et flexible)
 * ================================================
 * 
 * Ajouter ceci dans Backend/config/register-routes.js après les imports:
 * 
 * const swaggerUi = require("swagger-ui-express");
 * const campaignSwagger = require("../docs/swagger-campaigns.json");
 * 
 * Puis dans la fonction registerRoutes():
 * 
 * // Documentation Swagger pour les Campagnes
 * app.use("/api/docs/campaigns", swaggerUi.serve, swaggerUi.setup(campaignSwagger));
 * 
 * ================================================
 * 
 * OPTION 2: Fusionner avec le Swagger global (Plus complet)
 * ================================================
 * 
 * Modifier Backend/config/register-routes.js:
 * 
 * const swaggerUi = require("swagger-ui-express");
 * const swaggerDocument = require("../swagger.json");
 * const campaignSwagger = require("../docs/swagger-campaigns.json");
 * 
 * // Fusionner les documentations
 * const mergedSwagger = {
 *   ...swaggerDocument,
 *   paths: {
 *     ...swaggerDocument.paths,
 *     ...campaignSwagger.paths
 *   },
 *   components: {
 *     ...swaggerDocument.components,
 *     schemas: {
 *       ...swaggerDocument.components?.schemas,
 *       ...campaignSwagger.components?.schemas
 *     }
 *   }
 * };
 * 
 * app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(mergedSwagger));
 * 
 * ================================================
 * 
 * ENDPOINTS DISPONIBLES:
 * 
 * CAMPAGNES INTERNES (/internal-campaigns):
 * ├── POST   /                        - Créer une campagne
 * ├── GET    /                        - Lister les campagnes
 * ├── GET    /:campaignId             - Détails d'une campagne
 * ├── GET    /:campaignId/stats       - Statistiques
 * ├── PATCH  /:campaignId/status      - Changer le statut
 * ├── PUT    /:campaignId             - Mettre à jour
 * └── DELETE /:campaignId             - Supprimer
 * 
 * PARTICIPANTS (/campaign-participants):
 * ├── POST   /:campaignId/participants                - Ajouter un participant
 * ├── POST   /:campaignId/participants/bulk          - Ajouter en masse
 * ├── GET    /:campaignId/participants                - Lister les participants
 * ├── GET    /:participantId                          - Détails d'un participant
 * ├── GET    /token/:token                            - Par token anonyme
 * ├── PUT    /:participantId                          - Mettre à jour
 * ├── PUT    /:participantId/module-progress         - Progression d'un module
 * ├── PATCH  /:participantId/drop                    - Marquer comme abandonné
 * └── DELETE /:participantId                          - Supprimer
 * 
 * ================================================
 * 
 * EXEMPLES DE REQUÊTES:
 * 
 * 1. Créer une campagne:
 * 
 * POST /api/internal-campaigns
 * Authorization: Bearer <token>
 * 
 * {
 *   "title": "Employee Skills Assessment 2026",
 *   "type": "SKILLS_MAPPING",
 *   "description": "Évaluer les compétences actuelles",
 *   "anonymityMode": "NOMINATIVE",
 *   "modules": [
 *     {
 *       "type": "QUESTIONNAIRE",
 *       "order": 1,
 *       "config": {}
 *     },
 *     {
 *       "type": "SKILL_TEST",
 *       "order": 2,
 *       "config": {}
 *     }
 *   ],
 *   "accessMethod": "BOTH",
 *   "targetDepartment": "Engineering",
 *   "targetEmployeeCount": 50,
 *   "deadline": "2026-03-31T23:59:59Z"
 * }
 * 
 * ================================================
 * 
 * 2. Ajouter un participant:
 * 
 * POST /api/campaign-participants/:campaignId/participants
 * Authorization: Bearer <token>
 * 
 * {
 *   "email": "john@example.com"
 * }
 * 
 * ================================================
 * 
 * 3. Ajouter plusieurs participants en masse:
 * 
 * POST /api/campaign-participants/:campaignId/participants/bulk
 * Authorization: Bearer <token>
 * 
 * {
 *   "participants": [
 *     { "email": "john@example.com" },
 *     { "email": "jane@example.com" },
 *     { "employeeId": "emp123" }
 *   ]
 * }
 * 
 * ================================================
 * 
 * 4. Mettre à jour la progression d'un module:
 * 
 * PUT /api/campaign-participants/:participantId/module-progress
 * Authorization: Bearer <token>
 * 
 * {
 *   "moduleType": "QUESTIONNAIRE",
 *   "status": "COMPLETED",
 *   "completedAt": "2026-02-20T10:30:00Z"
 * }
 * 
 * ================================================
 * 
 * AUTHENTIFICATION:
 * - Tous les endpoints (sauf /token/:token) nécessitent un JWT Bearer token
 * - Ajouter le header: Authorization: Bearer <votre_token>
 * 
 * AUTORISATION:
 * - Campagnes: Réservées aux profils Company
 * - Participants: Réservées aux profils Company (sauf /token/:token)
 * 
 * ================================================
 */

module.exports = {
  setupCampaignSwagger: function(app) {
    const swaggerUi = require("swagger-ui-express");
    const campaignSwagger = require("../docs/swagger-campaigns.json");
    
    // Servir la documentation Swagger séparée
    app.use("/api/docs/campaigns", swaggerUi.serve, swaggerUi.setup(campaignSwagger));
    
    console.log("✅ Campaign Swagger documentation available at /api/docs/campaigns");
  }
};
