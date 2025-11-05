// ============================================================================
// Parser pour les réponses des modèles IA (LLM)
// ----------------------------------------------------------------------------
// Ce module contient des fonctions pour extraire et valider les réponses JSON
// des modèles IA (Together AI, OpenAI, etc.). Il gère les cas où les LLM
// retournent du JSON entouré de markdown (```json ... ```) ou avec des
// caractères invisibles/formatage incorrect.
//
// Fonctionnalités principales:
// - Extraction du JSON depuis les blocs markdown
// - Nettoyage des caractères invisibles et formatage
// - Tentatives de parsing avec corrections automatiques
// - Validation de la structure des données
// ============================================================================

// Version commentée de l'ancienne implémentation (conservée pour référence)
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

// ----------------------------------------------------------------------------
// parseAndValidateAIResponse
// ----------------------------------------------------------------------------
// But: parser et valider une réponse IA en extrayant le JSON et en vérifiant
// la présence de tous les champs requis pour l'évaluation des candidats.
//
// Paramètres:
// - raw: string - réponse brute du modèle IA (peut contenir du markdown)
//
// Retour: objet JSON validé avec la structure attendue pour l'évaluation
//
// Gestion d'erreurs: lance une exception si le parsing ou la validation échoue
async function parseAndValidateAIResponse(raw) {
  let jsonStr;
  let analysis;

  try {
    // Extraction du JSON depuis les blocs markdown (```json ... ```)
    // Si aucun bloc markdown n'est trouvé, on utilise la réponse brute
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    jsonStr = jsonMatch ? jsonMatch[1] : raw;

    // Nettoyage des caractères invisibles et du texte parasite
    jsonStr = jsonStr
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Supprime les caractères de largeur zéro
      .replace(/^[^{\[]*/, "") // Supprime tout texte avant { ou [
      .replace(/[^}\]]*$/, ""); // Supprime tout texte après } ou ]

    try {
      // Première tentative de parsing JSON
      analysis = JSON.parse(jsonStr);
    } catch (firstError) {
      console.warn("First parse failed, retrying with cleanup:", firstError);

      // Nettoyage supplémentaire pour corriger les erreurs JSON courantes
      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, "$1") // Supprime les virgules trailing
        .replace(/'/g, '"')            // Remplace les guillemets simples par des doubles
        .replace(/\n/g, " ")           // Remplace les retours à la ligne par des espaces
        .replace(/\s+/g, " ");         // Condense les espaces multiples

      // Deuxième tentative de parsing après nettoyage
      analysis = JSON.parse(jsonStr);
    }

    // Validation de la structure: vérification des champs obligatoires
    const requiredFields = [
      "overallScore",        // Score global (0-100)
      "technicalLevel",      // Niveau technique (string)
      "generalAssassment",   // Évaluation générale (string)
      "recommendations",     // Recommandations (array)
      "nextSteps",          // Prochaines étapes (array)
      "skillAnalysis",      // Analyse des compétences (array)
    ];

    // Vérification de la présence de tous les champs requis
    const missingFields = requiredFields.filter((field) => !(field in analysis));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validation spécifique: skillAnalysis doit être un tableau
    if (!Array.isArray(analysis.skillAnalysis)) {
      throw new Error("Invalid or missing 'skillAnalysis' array");
    }

    return analysis;
  } catch (err) {
    console.error("Failed to parse or validate AI response:", err);
    throw new Error("AI response could not be parsed or is missing required structure.");
  }
}

// ----------------------------------------------------------------------------
// parseAIResponse
// ----------------------------------------------------------------------------
// But: parser une réponse IA sans validation de structure (version simplifiée)
// Utilisé quand on veut juste extraire le JSON sans vérifier les champs.
//
// Paramètres:
// - raw: string - réponse brute du modèle IA
//
// Retour: objet JSON parsé (sans validation de structure)
//
// Différences avec parseAndValidateAIResponse:
// - Pas de vérification des champs requis
// - Pas de validation de skillAnalysis
// - Retourne directement le JSON parsé
async function parseAIResponse(raw) {
  let jsonStr;
  let result;

  try {
    // Extraction du JSON depuis les blocs markdown (même logique que parseAndValidateAIResponse)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    jsonStr = jsonMatch ? jsonMatch[1] : raw;

    // Nettoyage identique à parseAndValidateAIResponse
    jsonStr = jsonStr
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Supprime les caractères de largeur zéro
      .replace(/^[^{\[]*/, "") // Supprime tout texte avant { ou [
      .replace(/[^}\]]*$/, ""); // Supprime tout texte après } ou ]

    try {
      // Première tentative de parsing JSON
      result = JSON.parse(jsonStr);
    } catch (firstError) {
      console.warn("First parse failed, retrying with cleanup:", firstError);

      // Nettoyage supplémentaire (même logique que parseAndValidateAIResponse)
      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, "$1") // Supprime les virgules trailing
        .replace(/'/g, '"')            // Remplace les guillemets simples par des doubles
        .replace(/\n/g, " ")           // Remplace les retours à la ligne par des espaces
        .replace(/\s+/g, " ");         // Condense les espaces multiples

      // Deuxième tentative de parsing après nettoyage
      result = JSON.parse(jsonStr);
    }

    return result;
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    console.error("Raw response that failed to parse:", raw);
    console.error("Cleaned JSON string that failed:", jsonStr);
    throw new Error(`AI response could not be parsed: ${err.message}. Raw response: ${raw.substring(0, 200)}...`);
  }
}

// Export des fonctions pour usage dans les contrôleurs d'évaluation
module.exports = {parseAndValidateAIResponse, parseAIResponse}