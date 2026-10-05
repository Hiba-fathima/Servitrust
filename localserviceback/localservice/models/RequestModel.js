const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  providerName: {
    type: String,
    required: true
  },

  serviceName: {
    type: String,
    required: true
  },

  preferredDate: {
    type: String,
    required: true
  },

  preferredTime: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  notes: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ServiceRequest = mongoose.model(
  "serviceRequests",
  serviceRequestSchema
);

module.exports = ServiceRequest;