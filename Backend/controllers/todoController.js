const { Together } = require("together-ai");
require("dotenv").config();

const ToDo = require("../models/TodoModel");
const Profile = require("../models/ProfileModel");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

exports.generateTodoListForProfile = async (req, res) => {
  try {
    const user = req.user;

    // Validate the profile
    if (!user.profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const profile = await Profile.findOne({
      userId: user._id,
      type: "Candidate",
    });

    if (!profile.skills || profile.skills.length === 0) {
      return res
        .status(400)
        .json({ error: "No skills found in the user profile." });
    }

    // Format skills into prompt
    const formattedSkills = profile.skills
      .map(
        (s) =>
          `${s.name} (Experience: ${s.experienceLevel}, Proficiency: ${s.proficiencyLevel}/5)`
      )
      .join(", ");

    let todo = await ToDo.findOne({ profile: profile._id });
    if (todo) {
    }

    // Prompt for generating skill-based recommendations
    const prompt = `
You are a career development AI assistant.
Given a candidate with the following skills:

${formattedSkills}

Generate a JSON array where each item is an object with:
- title: the name of the skill
- type:"Skill"
- tasks (if type is "Skill"): array of up to 3 objects, each with:
  - title: what to do (e.g., "Take XYZ course", "Get ABC certification")
  - type: STRICTLY one of **"Course", "Certification","Project","Article","Video", or "Book"** (No other values allowed).
  - description: a brief description of the task
  - url (optional)
  - priority: STRICTLY one of **"Low", "Medium", or "High"** (No other values allowed).
  - dueDate: A recommended completion deadline in timestamp format.

Return a STRICT JSON array in this format ONLY (no markdown, no explanation):

[
  {
    "title": "JavaScript",
    "tasks": [
      {
        "title": "Take the JavaScript Algorithms course on freeCodeCamp",
        "type": "Course",
        "description": "Covers fundamental JS algorithms with interactive coding exercises",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures", 
        "priority": "medium",
        "dueDate": 1717004400
      },
      {
        "title": "Build a ToDo App using vanilla JavaScript",
        "type": "Project",
        "description": "Apply JS concepts to create a CRUD-based web application",
        "priority": "medium",
        "dueDate": 1717004400
      }
    ]
  },
  ...
]
`.trim();

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    // Parse JSON output
    const jsonMatch = raw.match(/\[([\s\S]*)\]/);
    let newTodos = [];

    if (jsonMatch) {
      const jsonText = "[" + jsonMatch[1] + "]";
      try {
        newTodos = JSON.parse(jsonText);
      } catch (err) {
        console.warn("Parsing failed:", err);
        return res.status(500).json({ error: "Failed to parse AI output." });
      }
    }
    // Upsert ToDo

    const defaultProfileTodos = [
      { type: "Profile", title: "Complete Your Profile", isCompleted: false },
      { type: "Profile", title: "Upload CV", isCompleted: false },
    ];

    let skillTodos = newTodos;
    if (!todo) {
      todo = await ToDo.create({
        profile: profile._id,
        todos: [...defaultProfileTodos, ...newTodos],
      });
      profile.todoList = todo._id;
      await profile.save();
    } else {
      skillTodos.forEach((skillTodo) => {
        const existingSkillTodo = todo.todos.find(
          (t) => t.title === skillTodo.title && t.type === "Skill"
        );

        if (existingSkillTodo) {
          existingSkillTodo.tasks.push(...skillTodo.tasks);
        } else {
          todo.todos.push(skillTodo);
        }
      });

      await todo.save();
    }

    res.status(201).json({
      message: "ToDo list generated/updated",
      todos: todo.todos,
    });
  } catch (error) {
    console.error("Error generating ToDo list:", error);
    res.status(500).json({ error: "Failed to generate ToDo list" });
  }
};

exports.getTodoListOfProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user.profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const profile = await Profile.findById(user.profile);
    if (!profile) {
      return res.status(500).json({
        error: `profile of the user with userId ${user._id} not found in the db `,
      });
    }
    const todoList = await ToDo.findById(profile.todoList);
    if (!todoList) {
      return res.status(200).json({
        error: `profile of the user with userId ${user._id} does not have a todoList yet`,
      });
    }

    return res.status(200).json({ todos: todoList.todos });
  } catch (error) {
    console.error("Error generating ToDo list:", error);
    res.status(500).json({ error: "Failed to generate ToDo list" });
  }
};
