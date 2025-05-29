const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Course", "Certification", "Project", "Article", "Video", "Exercise", "Book", "Other"],
      required: true,
    },
    description: { type: String },
    url: { type: String }, // Optional: for online resources
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    isCompleted: { type: Boolean, default: false },
    dueDate: {type: Number},
  },
  { _id: false }
);

// Updated Todos Schema (now includes skill-related tasks)
const todosSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Profile", "Skill"],
      required: true,
    },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    tasks: [taskSchema], // Skill-related tasks when type is "Skill"
  },
  { _id: false }
);


const todoSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true, // Only one ToDo list per profile
    },
     todos: {
      type: [todosSchema],
      default: [
        { type: "Profile", title: "Complete Your Profile", isCompleted: false },
        { type: "Profile", title: "Upload CV", isCompleted: false },
      ],
    },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model("ToDo", todoSchema);
