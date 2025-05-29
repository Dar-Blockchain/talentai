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

    const profile = await Profile.findOne({userId: user._id, type: "Candidate"});

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

    // Prompt for generating skill-based recommendations
    const prompt = `
You are a career development AI assistant.
Given a candidate with the following skills:

${formattedSkills}

Generate a JSON array where each item is an object with:
- skillTitle: the name of the skill
- type: either "Hard Skill" or "Soft Skill"
- priority: "Low", "Medium", or "High"
- recommendations: array of up to 3 objects, each with:
  - title: what to do (e.g., "Take XYZ course", "Get ABC certification")
  - type: strictly one of the following (case-sensitive):
    "Course", "Certification", "Project", "Article", "Video", "Exercise", "Book", or "Other"
  - description: a brief description of the task
  - url (optional)

Return a STRICT JSON array in this format ONLY (no markdown, no explanation):

[
  {
    "skillTitle": "JavaScript",
    "type": "Hard Skill",
    "priority": "High",
    "recommendations": [
      {
        "title": "Take the JavaScript Algorithms course on freeCodeCamp",
        "type": "Course",
        "description": "Covers fundamental JS algorithms with interactive coding exercises",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures"
      },
      {
        "title": "Build a ToDo App using vanilla JavaScript",
        "type": "Project",
        "description": "Apply JS concepts to create a CRUD-based web application"
      }
    ]
  },
  ...
]
`.trim();

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
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
    let tasks = [];

    if (jsonMatch) {
      const jsonText = "[" + jsonMatch[1] + "]";
      try {
        tasks = JSON.parse(jsonText);
      } catch (err) {
        console.warn("Parsing failed:", err);
        return res.status(500).json({ error: "Failed to parse AI output." });
      }
    }

    // Transform tasks into schema format
    const skillTasks = tasks.map((t) => ({
      skillTitle: t.skillTitle,
      type: t.type,
      priority: t.priority || "Medium",
      isCompleted: false,
      tasks: (t.recommendations || []).map((r) => ({
        title: r.title,
        type: r.type,
        url: r.url,
        isCompleted: false,
      })),
    }));

    // Upsert ToDo
     let todo = await ToDo.findOne({ profile: profile._id });

    if (!todo) {
      todo = await ToDo.create({
        profile: profile._id,
        skillTasks,
      });
      profile.todoList = todo._id;
      await profile.save();
    } else {
      todo.skillTasks = skillTasks;
      await todo.save();
    }

    res.status(201).json({
      message: "ToDo list generated",
      result: { todoListId: todo._id, profileId: profile._id, todo },
    });
    // res.status(201).json({ message: "ToDo list generated", result: {todoListId: null, profileId: null, todo} });
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

    return todoList;
  } catch (error) {
    console.error("Error generating ToDo list:", error);
    res.status(500).json({ error: "Failed to generate ToDo list" });
  }
};
