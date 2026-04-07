const bedrock = require("../helpers/bedrock.helpers");

const generateNewTodosForProfile = async (todo, profile) => {
  // Format skills into prompt
  const formattedSkills = profile.skills
    .map(
      (s) =>
        `${s.name} (Experience: ${s.experienceLevel}, Proficiency: ${s.proficiencyLevel}/5)`
    )
    .join(", ");

  let existingSkillTodoList = [];
  if (todo) {
    todo.todos.forEach((t) => {
      if (t.type == "Skill") {
        existingSkillTodoList.push(t);
      }
    });
  }

  // Prompt for generating skill-based recommendations
  const prompt = `
You are a career development AI assistant.
Given:
- A candidate with the following skills:
${formattedSkills}
- A condidate that has a list of todos for each skill:
${existingSkillTodoList}

Generate a JSON array where each item is an object with:
- title: the name of the skill
- type:"Skill"
- tasks (if type is "Skill"): array of up to 3 objects, each with:
  - "title": what to do (e.g., "Take XYZ course", "Get ABC certification")
  - "type": STRICTLY one of **"Course", "Certification", "Project", "Article"** (No other values allowed).
  - "description": a brief description of the task
  - "url" (optional)
  - "priority": **STRICTLY one of "low", "medium", or "high"**
  - "dueDate": A recommended completion deadline in **timestamp format**

STRICT REQUIREMENTS:
- **Ensure "priority" is exactly "low", "medium", or "high" (case-sensitive)**
- **For each skill, do NOT include tasks similar in purpose to existing ones, that are already accorded for that task** Ensure each recommendation **adds new skill-improvement value**
- Ensure each recommendation **adds new skill-improvement value**
- Offer a unique learning perspective

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
        "dueDate": 1748531525930
      },
      {
        "title": "Build a ToDo App using vanilla JavaScript",
        "type": "Project",
        "description": "Apply JS concepts to create a CRUD-based web application",
        "priority": "medium",
        "dueDate": 1748531525930
      }
    ]
  },
  ...
]
`.trim();

  const response = await bedrock.callLLM({
    systemPrompt: prompt,
    messages: [{ role: "user", content: "Generate the skill recommendations as specified." }],
    temperature: 0.7,
    maxTokens: 1000,
    timeout: 20000,
  });

  const raw = response.content;

  // Parse JSON output (handle thinking/reasoning text before JSON array)
  let newTodos = [];
  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');

  if (firstBracket !== -1 && lastBracket !== -1) {
    const jsonText = raw.substring(firstBracket, lastBracket + 1);
    try {
      newTodos = JSON.parse(jsonText);
    } catch (err) {
      console.warn("Parsing failed:", err);
      return [];
    }
  }

  return newTodos;
};

module.exports = { generateNewTodosForProfile };
