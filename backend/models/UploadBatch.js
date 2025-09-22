const mongoose = require('mongoose');

const uploadBatchSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  totalLeads: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  distributionSummary: [{
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedCount: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UploadBatch', uploadBatchSchema);
