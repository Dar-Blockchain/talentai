const { Together } = require("together-ai");
require("dotenv").config();

const { generateJobQuestionsPrompts } = require("../prompts/evaluationPrompts");
const { HttpError } = require("../utils/httpUtils");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

module.exports.generateTechniqueQuestionsForJob = async (
  jobRequiredSkillList,
  user
) => {
  try {
    const userSkills = user.profile.skills;

    // Filter out skills the user already has (at or above the required proficiency level).
    // Only generate questiosn for skills, that the job requires that the user lacks or hasn't mastered yet.
    let skillListToTest = jobRequiredSkillList.filter((reqSkill) => {
      return !userSkills.some(
        (userSkill) =>
          userSkill.name.toLowerCase() === reqSkill.name.toLowerCase() &&
          userSkill.proficiencyLevel >= parseInt(reqSkill.level)
      );
    });

    // 3️⃣ generate skillList details , to include in the prompt
    const skillsListDetails = skillListToTest
      .map((skill) => `- ${skill.name} (ProficiencyLevel: ${skill.level})`)
      .join("\n");
    let questionsCount = 10; 

    const systemPrompt =
      generateJobQuestionsPrompts.getSystemPrompt(questionsCount);

    const userPrompt = generateJobQuestionsPrompts.getUserPrompt(
      questionsCount,
      skillsListDetails
    );

    // 5️⃣ Call TogetherAI API
    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1000,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    raw = raw
      .replace(/^```json\n/, "")
      .replace(/\n```$/, "")
      .trim();

    // 6️⃣ Extract questions as JSON array
    let questions;
    try {
      questions = JSON.parse(raw);
    } catch (e) {
      console.warn("JSON parse failed on cleaned text, falling back:", e);
      questions = [];
    }

    return {
      requiredSkills: jobRequiredSkillList,
      testedSkills: skillListToTest,
      questions,
      totalQuestions: questions.length,
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
        
    throw new HttpError(500, "Internal server error");
  }
};
