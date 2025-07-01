const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    Name: String,
    description: String,
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
      },
    ],
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projectAssessment",
      },
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
