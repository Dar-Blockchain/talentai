async function parseAndValidateAIResponse(raw) {
  let jsonStr;
  let analysis;

  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    throw new Error("No valid JSON block found in the AI response.");
  }

  jsonStr = jsonStr
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "");

  try {
    analysis = JSON.parse(jsonStr);
  } catch (firstError) {
    console.error("First parse attempt failed:", firstError);
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/'/g, '"')
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");
    analysis = JSON.parse(jsonStr);
  }

  const requiredFields = [
    "overallScore",
    "technicalLevel",
    "generalAssassment",
    "recommendations",
    "nextSteps",
    "skillAnalysis",
  ];

  const missingFields = requiredFields.filter((field) => !(field in analysis));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!Array.isArray(analysis.skillAnalysis)) {
    throw new Error("Invalid or missing 'skillAnalysis' array");
  }

  return analysis;
}

module.exports = {parseAndValidateAIResponse}