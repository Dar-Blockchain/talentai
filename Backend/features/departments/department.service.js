const mongoose  = require("mongoose");
const Department = require("./department.model");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

exports.getDepartmentById = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      const err = new Error("Invalid department ID format");
      err.status = 400;
      throw err;
    }
    return await Department.findById(id);
  } catch (error) {
    throw new Error(`Error fetching department: ${error.message}`);
  }
};

exports.getDepartmentsByCompany = async (companyId, page = 1, limit = 20, search = "", filters = {}) => {
  try {
    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const query = { companyId, ...filters };
    if (search && typeof search === "string" && search.trim().length > 0) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const [data, total] = await Promise.all([
      Department.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
      Department.countDocuments(query),
    ]);

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

exports.updateDepartment = async (id, updateData) => {
  try {
    if (!isValidObjectId(id)) {
      const err = new Error("Invalid department ID format");
      err.status = 400;
      throw err;
    }
    delete updateData.companyId; // cannot change owner
    delete updateData.createdBy; // immutable
    return await Department.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Error updating department: ${error.message}`);
  }
};

exports.getDepartmentStats = async (companyId) => {
  const CompanyMembership = require("../../models/CompanyMembership.model");

  const total = await Department.countDocuments({ companyId });

  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const trendRaw = await Department.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
  ]);
  const trendMap = Object.fromEntries(trendRaw.map(({ _id, count }) => [_id, count]));
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { date: d, count: trendMap[d] || 0 };
  });

  const depts = await Department.find({ companyId }).select("_id name").lean();
  const memberCounts = await CompanyMembership.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId), department: { $ne: null } } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(memberCounts.map(({ _id, count }) => [_id.toString(), count]));
  const byDepartment = depts
    .map((d) => ({ name: d.name.length > 16 ? d.name.slice(0, 16) + "…" : d.name, members: countMap[d._id.toString()] || 0 }))
    .sort((a, b) => b.members - a.members)
    .slice(0, 8);

  return { total, trend, byDepartment };
};

exports.deleteDepartment = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      const err = new Error("Invalid department ID format");
      err.status = 400;
      throw err;
    }
    return await Department.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting department: ${error.message}`);
  }
};
