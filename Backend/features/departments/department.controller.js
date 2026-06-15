const departmentService = require("./department.service");

exports.createDepartment = async (req, res) => {
  try {
    const companyId = req.user._id;
    const createdBy = req.actualUser?._id || req.user._id;
    const { name, description } = req.body;

    const dept = await departmentService.createDepartment({ name, description, companyId, createdBy });
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

exports.getCompanyDepartments = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { page = 1, limit = 20, search = "" } = req.query;

    const result = await departmentService.getDepartmentsByCompany(companyId, page, limit, search);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const dept = await departmentService.getDepartmentById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, error: "Department not found" });
    res.status(200).json({ success: true, data: dept });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const updatedBy = req.actualUser?._id || req.user._id;
    const updated = await departmentService.updateDepartment(req.params.id, { ...req.body, updatedBy });
    if (!updated) return res.status(404).json({ success: false, error: "Department not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

exports.getDepartmentStats = async (req, res) => {
  try {
    const stats = await departmentService.getDepartmentStats(req.user._id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};
