HEDERA_HACKATHON_CRITERIA = {
  hackathonName: "HederaHacks",
  startDate: "2025-07-01",
  deadline: "2025-07-07",
  maxTeamSize: 4,
  mustBeOriginal: true,
  demoRequired: false,
};

OTHER_HACKATHON_CRITERIA = {
  hackathonName: "otherHacks",
  startDate: "2025-07-01",
  deadline: "2025-07-07",
  maxTeamSize: 3,
  mustBeOriginal: true,
  demoRequired: false,
};

const CRITERIA_WEIGHTS = {
  codeQuality: 30,
  innovation: 25,
  functionality: 20,
  documentation: 15,
  userExperience: 10,
};

module.exports = {
  HEDERA_HACKATHON_CRITERIA,
  OTHER_HACKATHON_CRITERIA,
  CRITERIA_WEIGHTS,
};
