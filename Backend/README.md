# Backend TalentAI

Ce projet est le backend de l'application TalentAI, une plateforme de gestion des talents et des compétences.

## 🚀 Fonctionnalités

- Gestion des profils utilisateurs
- Gestion des profils entreprises
- Gestion des compétences techniques (hard skills)
- Gestion des compétences comportementales (soft skills)
- Système de recherche et de matching

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB
- npm ou yarn

## 🔧 Installation

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
cd Backend
```

2. Installer les dépendances
```bash
npm install
```

3. Créer un fichier .env à la racine du projet avec les variables suivantes :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/talentai
JWT_SECRET=votre_secret_jwt
```

4. Démarrer le serveur
```bash
npm start
```

## 📚 Structure du Projet

```
Backend/
├── controllers/     # Contrôleurs pour gérer les requêtes HTTP
├── models/          # Modèles Mongoose
├── routes/          # Routes API
├── services/        # Logique métier
├── middleware/      # Middleware personnalisés
├── config/          # Configuration
└── utils/           # Utilitaires
```

## 🔌 API Endpoints

### Profils

#### Profils Utilisateurs
- `POST /api/profiles` - Créer ou mettre à jour un profil utilisateur
- `GET /api/profiles/me` - Récupérer son propre profil
- `GET /api/profiles/:userId` - Récupérer un profil par ID
- `GET /api/profiles` - Récupérer tous les profils
- `DELETE /api/profiles` - Supprimer son profil

#### Profils Entreprises
- `POST /api/profiles/company` - Créer ou mettre à jour un profil entreprise
- `GET /api/profiles/company/:companyId` - Récupérer un profil entreprise

### Compétences

#### Soft Skills
- `POST /api/profiles/soft-skills` - Ajouter des soft skills
- `GET /api/profiles/soft-skills` - Récupérer ses soft skills
- `PUT /api/profiles/soft-skills` - Mettre à jour ses soft skills
- `DELETE /api/profiles/soft-skills` - Supprimer des soft skills

#### Hard Skills
- `POST /api/profiles/skills` - Ajouter des compétences techniques
- `GET /api/profiles/skills` - Récupérer ses compétences techniques
- `PUT /api/profiles/skills` - Mettre à jour ses compétences techniques
- `DELETE /api/profiles/skills` - Supprimer des compétences techniques

### Recherche
- `GET /api/profiles/search?skills=skill1,skill2` - Rechercher des profils par compétences

## 🔒 Sécurité

- Authentification JWT
- Validation des données
- Gestion des erreurs
- Protection des routes

## 🛠 Technologies Utilisées

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 