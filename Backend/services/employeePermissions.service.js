const EmployeePermissions = require("../models/EmployeePermissions.model");

/**
 * Get permissions by userId
 */
exports.getPermissions = async (userId) => {
  try {
    const permissions = await EmployeePermissions.findOne({
      userId,
    })
      .populate("userId", "email firstName lastName")
      .populate("lastModifiedBy", "email firstName lastName");

    if (!permissions) {
      throw new Error("Permissions not found");
    }

    return permissions;
  } catch (error) {
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }
};

/**
 * Update permissions
 */
exports.updatePermissions = async (userId, updatesData, modifiedBy) => {
  try {
    const permissions = await EmployeePermissions.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...updatesData,
          lastModifiedBy: modifiedBy,
        },
      },
      { new: true }
    )
      .populate("userId", "email firstName lastName")
      .populate("lastModifiedBy", "email firstName lastName");

    if (!permissions) {
      throw new Error("Permissions not found");
    }

    return permissions;
  } catch (error) {
    throw new Error(`Failed to update permissions: ${error.message}`);
  }
};
