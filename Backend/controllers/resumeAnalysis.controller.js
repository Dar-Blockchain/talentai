/**
 * CV Analysis Controller
 * Handles HTTP requests for CV analysis operations
 */

const CVAnalysisService = require("../services/cvAnalysis.service");

class CVAnalysisController {
  /**
   * Create a new CV analysis record
   * POST /cv-analysis
   *
   * Body: CV analysis data following CVAnalysis schema
   *
   * Response:
   * {
   *   success: boolean,
   *   data: object,
   *   message?: string
   * }
   */
  static async createCVAnalysis(req, res) {
    try {
      const cvData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      };

      // Add user reference if authenticated
      if (req.user) {
        cvData.User = req.user._id;
      }

      const result = await CVAnalysisService.createCVAnalysis(cvData);

      return res.status(201).json({
        success: result.success,
        data: result.data,
        message: "CV analysis created successfully.",
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while creating CV analysis.";

      console.error("❌ CV analysis creation failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Get CV analysis by ID
   * GET /cv-analysis/:id
   *
   * Response:
   * {
   *   success: boolean,
   *   data: object,
   *   message?: string
   * }
   */
  static async getCVAnalysisById(req, res) {
    try {
      const { id } = req.params;

      const result = await CVAnalysisService.getCVAnalysisById(id);

      return res.json({
        success: result.success,
        data: result.data,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while fetching CV analysis.";

      console.error("❌ Fetch CV analysis failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Get all CV analyses with pagination and filtering
   * GET /cv-analysis
   *
   * Query params:
   * - page: number (default: 0)
   * - limit: number (default: 10, max: 100)
   * - seniority: string (filter by seniority)
   * - search: string (search by name, email, title)
   * - minScore: number (filter by minimum analysis score)
   *
   * Response:
   * {
   *   success: boolean,
   *   data: array,
   *   pagination: object
   * }
   */
  static async getAllCVAnalyses(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
        seniority: req.query.seniority,
        search: req.query.search,
        minScore: req.query.minScore,
      };

      const result = await CVAnalysisService.getAllCVAnalyses(options);

      return res.json({
        success: result.success,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while fetching CV analyses.";

      console.error("❌ Fetch CV analyses failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Update CV analysis by ID
   * PUT /cv-analysis/:id
   *
   * Body: Partial or complete CV analysis data to update
   *
   * Response:
   * {
   *   success: boolean,
   *   data: object,
   *   message?: string
   * }
   */
  static async updateCVAnalysis(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await CVAnalysisService.updateCVAnalysis(id, updateData);

      return res.json({
        success: result.success,
        data: result.data,
        message: "CV analysis updated successfully.",
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while updating CV analysis.";

      console.error("❌ Update CV analysis failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Delete CV analysis by ID
   * DELETE /cv-analysis/:id
   *
   * Response:
   * {
   *   success: boolean,
   *   message: string,
   *   data?: object
   * }
   */
  static async deleteCVAnalysis(req, res) {
    try {
      const { id } = req.params;

      const result = await CVAnalysisService.deleteCVAnalysis(id);

      return res.json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while deleting CV analysis.";

      console.error("❌ Delete CV analysis failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Get CV analyses by User ID
   * GET /cv-analysis/user/:userId
   *
   * Query params:
   * - page: number (default: 0)
   * - limit: number (default: 10, max: 100)
   *
   * Response:
   * {
   *   success: boolean,
   *   data: array,
   *   pagination: object
   * }
   */
  static async getCVAnalysesByUserId(req, res) {
    try {
      const { userId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await CVAnalysisService.getCVAnalysesByUserId(
        userId,
        options
      );

      return res.json({
        success: result.success,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while fetching user CV analyses.";

      console.error("❌ Fetch user CV analyses failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Get CV analyses by Company ID
   * GET /cv-analysis/company/:companyId
   *
   * Query params:
   * - page: number (default: 0)
   * - limit: number (default: 10, max: 100)
   *
   * Response:
   * {
   *   success: boolean,
   *   data: array,
   *   pagination: object
   * }
   */
  static async getCVAnalysesByCompanyId(req, res) {
    try {
      const { companyId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await CVAnalysisService.getCVAnalysesByCompanyId(
        companyId,
        options
      );

      return res.json({
        success: result.success,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while fetching company CV analyses.";

      console.error("❌ Fetch company CV analyses failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Search CV analyses
   * GET /cv-analysis/search/query
   *
   * Query params:
   * - q: string (search query - required)
   * - page: number (default: 0)
   * - limit: number (default: 10, max: 100)
   *
   * Response:
   * {
   *   success: boolean,
   *   data: array,
   *   pagination: object
   * }
   */
  static async searchCVAnalyses(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search query is required.",
        });
      }

      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await CVAnalysisService.searchCVAnalyses(q, options);

      return res.json({
        success: result.success,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while searching CV analyses.";

      console.error("❌ Search CV analyses failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Get CV analyses by seniority level
   * GET /cv-analysis/seniority/:seniority
   *
   * Query params:
   * - page: number (default: 0)
   * - limit: number (default: 10, max: 100)
   *
   * Response:
   * {
   *   success: boolean,
   *   data: array,
   *   pagination: object
   * }
   */
  static async getCVAnalysesBySeniority(req, res) {
    try {
      const { seniority } = req.params;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await CVAnalysisService.getCVAnalysesBySeniority(
        seniority,
        options
      );

      return res.json({
        success: result.success,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while fetching CV analyses by seniority.";

      console.error("❌ Fetch CV analyses by seniority failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Get CV analysis statistics
   * GET /cv-analysis/stats
   *
   * Response:
   * {
   *   success: boolean,
   *   data: {
   *     totalRecords: number,
   *     avgAnalysisScore: number,
   *     seniorityDistribution: array,
   *     topSkills: array
   *   }
   * }
   */
  static async getCVAnalysisStats(req, res) {
    try {
      const result = await CVAnalysisService.getCVAnalysisStats();

      return res.json({
        success: result.success,
        data: result.data,
      });
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while fetching CV analysis statistics.";

      console.error("❌ Fetch CV analysis stats failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}

module.exports = CVAnalysisController;
