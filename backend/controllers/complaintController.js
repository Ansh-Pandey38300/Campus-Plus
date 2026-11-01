const asyncHandler = require('../utils/asyncHandler');
const complaintService = require('../services/complaintService');

const createComplaint = asyncHandler(async (req, res) => {
  const { deal_id, reason } = req.body;

  const complaint = await complaintService.createComplaint(
    { deal_id },
    req.user.id,
    reason
  );

  res.status(201).json({
    status: 'success',
    message: 'Complaint submitted successfully.',
    data: complaint
  });
});

const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await complaintService.getAllComplaints();

  res.status(200).json({
    status: 'success',
    count: complaints.length,
    data: complaints
  });
});

module.exports = {
  createComplaint,
  getAllComplaints
};