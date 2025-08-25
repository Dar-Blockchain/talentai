const mongoose = require("mongoose");
const { Team } = require("../constants/projectConstants");

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    track: String,
    team: [
      {
        email: {
          type: String,
          match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Validation d'email
        },
        validated: {
          type: Boolean,
          default: false, // Le champ `validated` pour chaque membre
        },
        activationToken: String, // Ajoute ce champ
        expiresAt: Date, // <--- AJOUTER ce champ si pas déjà présent
        name : String ,
        role: String,
      },
    ],
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leaderProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },
    // assessment removed (ProjectAssessment feature deprecated)
  },
  { timestamps: true }
);

ProjectSchema.pre("save", function (next) {
  // Vérifie la taille max de la team
  if (this.team.length > Team) {
    return next(new Error("A team cannot have more than 5 members"));
  }

  // Vérifie l'unicité des emails dans la team
  const emails = this.team.map(m => m.email.toLowerCase());
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    return next(new Error("Each team member must have a unique email address."));
  }

  next();
});


const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
