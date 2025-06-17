function getExperienceLevelLabel(level) {
  switch (parseInt(level)) {
    case 1: return "Entry Level";
    case 2: return "Junior";
    case 3: return "Mid Level";
    case 4: return "Senior";
    case 5: return "Expert";
    default: return "Unknown";
  }
}

module.exports = {getExperienceLevelLabel}