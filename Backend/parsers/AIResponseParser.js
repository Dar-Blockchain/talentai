// async function parseAndValidateAIResponse(raw) {
//   let jsonStr;
//   let analysis;

//   const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//   if (jsonMatch) {
//     jsonStr = jsonMatch[1];
//   } else {
//     throw new Error("No valid JSON block found in the AI response.");
//   }

//   jsonStr = jsonStr
//     .trim()
//     .replace(/[\u200B-\u200D\uFEFF]/g, "")
//     .replace(/^[^{]*/, "")
//     .replace(/[^}]*$/, "");

//   try {
//     analysis = JSON.parse(jsonStr);
//   } catch (firstError) {
//     console.error("First parse attempt failed:", firstError);
//     jsonStr = jsonStr
//       .replace(/,(\s*[}\]])/g, "$1")
//       .replace(/'/g, '"')
//       .replace(/\n/g, " ")
//       .replace(/\s+/g, " ");
//     analysis = JSON.parse(jsonStr);
//   }

//   const requiredFields = [
//     "overallScore",
//     "technicalLevel",
//     "generalAssassment",
//     "recommendations",
//     "nextSteps",
//     "skillAnalysis",
//   ];

//   const missingFields = requiredFields.filter((field) => !(field in analysis));
//   if (missingFields.length > 0) {
//     throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
//   }

//   if (!Array.isArray(analysis.skillAnalysis)) {
//     throw new Error("Invalid or missing 'skillAnalysis' array");
//   }

//   return analysis;
// }


async function parseAndValidateAIResponse(raw) {
  let jsonStr;
  let analysis;

  try {
    // Try to extract JSON inside triple backticks (```json ... ```)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    jsonStr = jsonMatch ? jsonMatch[1] : raw;

    // Clean invisible characters and leading/trailing junk
    jsonStr = jsonStr
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width chars
      .replace(/^[^{\[]*/, "") // Remove any non-JSON preamble
      .replace(/[^}\]]*$/, ""); // Remove any non-JSON suffix

    try {
      // First parse attempt
      analysis = JSON.parse(jsonStr);
    } catch (firstError) {
      console.warn("First parse failed, retrying with cleanup:", firstError);

      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .replace(/'/g, '"')            // Replace single quotes
        .replace(/\n/g, " ")           // Remove newlines
        .replace(/\s+/g, " ");         // Collapse multiple spaces

      analysis = JSON.parse(jsonStr);
    }

    // Validation
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
  } catch (err) {
    console.error("Failed to parse or validate AI response:", err);
    throw new Error("AI response could not be parsed or is missing required structure.");
  }
}

module.exports = {parseAndValidateAIResponse}