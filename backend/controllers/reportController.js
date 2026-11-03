const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');

const getReports = asyncHandler(async (req, res) => {
  const reports = await reportService.getAllReports();

  res.status(200).json({
    success: true,
    data: reports
  });
});

module.exports = {
  getReports
};