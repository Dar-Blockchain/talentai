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
          required: true,
          match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Validation d'email
        },
        validated: {
          type: Boolean,
          default: false, // Le champ `validated` pour chaque membre
        },
        activationToken: String, // Ajoute ce champ
        expiresAt: Date, // <--- AJOUTER ce champ si pas déjà présent
        userName : String ,
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
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectAssessment", // Ensure this matches the model name exactly
    },
  },
  { timestamps: true }
);

ProjectSchema.pre("save", function (next) {
  if (this.team.length > Team) {
    next(new Error("A team cannot have more than 5 members"));
  } else {
    next();
  }
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
