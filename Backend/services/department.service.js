const Department = require("../models/department.model");
const mongoose = require("mongoose");

/**
 * Validate if a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
    if (!isValidObjectId(id)) {
      const err = new Error(`Invalid department ID format`);
      err.status = 400;
      throw err;
    }
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
    if (!isValidObjectId(id)) {
      const err = new Error(`Invalid department ID format`);
      err.status = 400;
      throw err;
    }
    if (updateData.companyId) delete updateData.companyId; // cannot change owner
    if (updateData.createdBy) delete updateData.createdBy; // cannot modify createdBy
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
 * Department stats with 30-day trend
 */
exports.getDepartmentStats = async (companyId) => {
  const CompanyMembership = require("../models/companyMembership.model");

  const total = await Department.countDocuments({ companyId });

  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const trendRaw = await Department.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
  ]);
  const trendMap = {};
  trendRaw.forEach(({ _id, count }) => { trendMap[_id] = count; });
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    trend.push({ date: d, count: trendMap[d] || 0 });
  }

  // Members per department (top 8)
  const depts = await Department.find({ companyId }).select("_id name").lean();
  const memberCounts = await CompanyMembership.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId), department: { $ne: null } } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  memberCounts.forEach(({ _id, count }) => { countMap[_id.toString()] = count; });
  const byDepartment = depts
    .map((d) => ({ name: d.name.length > 16 ? d.name.slice(0, 16) + "…" : d.name, members: countMap[d._id.toString()] || 0 }))
    .sort((a, b) => b.members - a.members)
    .slice(0, 8);

  return { total, trend, byDepartment };
};

/**
 * Delete department
 */
exports.deleteDepartment = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      const err = new Error(`Invalid department ID format`);
      err.status = 400;
      throw err;
    }
    return await Department.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting department: ${error.message}`);
  }
};
