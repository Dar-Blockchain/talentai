/**
 * Validation Helpers for Profile Management
 * Centralized validation utilities for profile and user data
 */

// Validation constants & regexes
const VALIDATION = {
  nameRegex: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
  genders: ["Male", "Female", "Other", "Prefer not to say"],
};

/**
 * Build update data object conditionally
 * Filters out undefined, null, or empty string values
 * @param {Object} fields - Object containing potential fields to update
 * @returns {Object} - Filtered object with only valid values
 */
const buildUpdateData = (fields) => {
  const result = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  });
  return result;
};

/**
 * Validate profile update fields
 * Checks firstName, lastName format and gender validity
 * @param {Object} data - Data object to validate
 * @returns {string|null} - Error message if validation fails, null if valid
 */
const validateUpdateFields = (data) => {
  if (data.firstName && !VALIDATION.nameRegex.test(data.firstName)) {
    return "Le prénom ne doit pas contenir de caractères spéciaux";
  }
  if (data.lastName && !VALIDATION.nameRegex.test(data.lastName)) {
    return "Le nom ne doit pas contenir de caractères spéciaux";
  }
  if (data.gender && !VALIDATION.genders.includes(data.gender)) {
    return "Valeur de gender invalide";
  }
  return null;
};

/**
 * Validate profile creation fields
 * Checks FirstName and LastName format (legacy field names)
 * @param {Object} data - Data object to validate
 * @returns {string|null} - Error message if validation fails, null if valid
 */
const validateProfileCreationFields = (data) => {
  if (data.FirstName && !VALIDATION.nameRegex.test(data.FirstName)) {
    return "Le prénom ne doit pas contenir de caractères spéciaux";
  }
  if (data.LastName && !VALIDATION.nameRegex.test(data.LastName)) {
    return "Le nom ne doit pas contenir de caractères spéciaux";
  }
  return null;
};

module.exports = {
  VALIDATION,
  buildUpdateData,
  validateUpdateFields,
  validateProfileCreationFields,
};
