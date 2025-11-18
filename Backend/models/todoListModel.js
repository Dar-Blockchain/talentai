const mongoose = require("mongoose");
const { TODO_TYPES, TASK_TYPES, TASK_PRIORITIES } = require("../constants/todoConstants");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(TASK_TYPES),
      required: true,
    },
    description: { type: String },
    url: { type: String }, // Optional: for online resources
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
    },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: Number },
  },
  { _id: false }
);

// Updated Todos Schema (now includes skill-related tasks)
const todosSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(TODO_TYPES),
      required: true,
    },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    tasks: [taskSchema], // Skill-related tasks when type is "Skill"
  },
  { _id: false }
);

const todoListSchema = new mongoose.Schema(
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
        { type: TODO_TYPES.PROFILE, title: "Upload CV", isCompleted: false },
        { type: TODO_TYPES.PROFILE, title: "Pass HR Test", isCompleted: false },
        { type: TODO_TYPES.SKILL, title: "Add Skill", isCompleted: false },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TodoList", todoListSchema);
