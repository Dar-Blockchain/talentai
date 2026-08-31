/**
 * Small, stateless helpers shared across the campaign interview modules:
 * lenient JSON parsing of LLM output, default coverage-area maps, and
 * coverage-percentage bookkeeping.
 */

function parseJSON(raw, fallback) {
  try {
    let s = raw.trim();
    if (s.startsWith("```")) {
      const m = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) s = m[1];
    }
    return JSON.parse(s);
  } catch (_) {
    const a = raw.indexOf("{"),
      b = raw.lastIndexOf("}");
    if (a !== -1 && b > a) {
      try {
        return JSON.parse(raw.slice(a, b + 1));
      } catch (_2) {}
    }
    return fallback;
  }
}

const SKILL_TEST_AREAS = (skill) => ({
  fundamentals: {
    label: `${skill} Fundamentals & Definitions`,
    percentage: 0,
    questionsAsked: 0,
    weight: 30,
  },
  mechanics: {
    label: `How ${skill} Works Internally`,
    percentage: 0,
    questionsAsked: 0,
    weight: 25,
  },
  advanced_topics: {
    label: `Advanced ${skill} Concepts & Edge Cases`,
    percentage: 0,
    questionsAsked: 0,
    weight: 25,
  },
  best_practices: {
    label: "Best Practices & Patterns",
    percentage: 0,
    questionsAsked: 0,
    weight: 20,
  },
});

const AI_INTERVIEW_DEFAULT_AREAS = () => ({
  experience: {
    label: "Experience & Background",
    percentage: 0,
    questionsAsked: 0,
    weight: 30,
  },
  competencies: {
    label: "Core Competencies",
    percentage: 0,
    questionsAsked: 0,
    weight: 30,
  },
  motivation: {
    label: "Motivation & Culture Fit",
    percentage: 0,
    questionsAsked: 0,
    weight: 20,
  },
  situational: {
    label: "Situational Judgment",
    percentage: 0,
    questionsAsked: 0,
    weight: 20,
  },
});

function applyCoverageUpdates(coverage, updates = []) {
  const areas = { ...coverage.areas };
  for (const u of updates) {
    if (areas[u.area] && typeof u.increase === "number") {
      areas[u.area] = {
        ...areas[u.area],
        percentage: Math.min(
          100,
          (areas[u.area].percentage || 0) + u.increase,
        ),
        questionsAsked: (areas[u.area].questionsAsked || 0) + 1,
        lastUpdated: new Date().toISOString(),
      };
    }
  }
  const totalWeight = Object.values(areas).reduce(
    (s, a) => s + (a.weight || 25),
    0,
  );
  const overall = Math.round(
    Object.values(areas).reduce(
      (s, a) => s + (a.percentage || 0) * (a.weight || 25),
      0,
    ) / totalWeight,
  );
  return { ...coverage, areas, overall };
}

module.exports = { parseJSON, SKILL_TEST_AREAS, AI_INTERVIEW_DEFAULT_AREAS, applyCoverageUpdates };
