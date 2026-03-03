const Department = require("../models/department.model");

/**
 * Create a new department
 */
exports.createDepartment = async (departmentData) => {
  try {
    const dept = new Department(departmentData);
    await dept.save();
    return dept;
  } catch (error) {
    const err = new Error(`Error creating department: ${error.message}`);
    err.status = 400;
    throw err;
  }
};

/**
 * Fetch a department by its ID
 */
exports.getDepartmentById = async (id) => {
  try {
    return await Department.findById(id);
  } catch (error) {
    throw new Error(`Error fetching department: ${error.message}`);
  }
};

/**
 * List departments for a given company
 */
exports.getDepartmentsByCompany = async (companyId, page = 1, limit = 20, search = "", filters = {}) => {
  try {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { companyId, ...filters };
    if (search && typeof search === "string" && search.trim().length > 0) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const data = await Department.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Department.countDocuments(query);

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching departments: ${error.message}`);
  }
};

/**
 * Update department by ID
 */
exports.updateDepartment = async (id, updateData) => {
  try {
    if (updateData.companyId) delete updateData.companyId; // cannot change owner
    const dept = await Department.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return dept;
  } catch (error) {
    throw new Error(`Error updating department: ${error.message}`);
  }
};

/**
 * Delete department
 */
exports.deleteDepartment = async (id) => {
  try {
    return await Department.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting department: ${error.message}`);
  }
};
