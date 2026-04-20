const departmentService = require("../services/department.service");

/**
 * POST /departments
 */
exports.createDepartment = async (req, res) => {
  try {
    const companyId = req.user._id;
    const createdBy = req.actualUser?._id || req.user._id;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Name is required" });
    }

    const dept = await departmentService.createDepartment({
      name,
      description: description || "",
      companyId,
      createdBy,
    });

    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

/**
 * GET /departments
 */
exports.getCompanyDepartments = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { page = 1, limit = 20, search = "" } = req.query;

    const result = await departmentService.getDepartmentsByCompany(
      companyId,
      page,
      limit,
      search,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /departments/:id
 */
exports.getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await departmentService.getDepartmentById(id);
    if (!dept) {
      return res.status(404).json({ success: false, error: "Department not found" });
    }
    res.status(200).json({ success: true, data: dept });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /departments/:id
 */
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.actualUser?._id || req.user._id;
    const updateData = {
      ...req.body,
      updatedBy,
    };
    const updated = await departmentService.updateDepartment(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Department not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

/**
 * GET /departments/stats
 */
exports.getDepartmentStats = async (req, res) => {
  try {
    const companyId = req.user._id;
    const stats = await departmentService.getDepartmentStats(companyId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /departments/:id
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await departmentService.deleteDepartment(id);
    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};
