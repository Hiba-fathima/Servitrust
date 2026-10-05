const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

 category: {
  type: [String],
  required: true
},

  services: {
    type: [String],
    required: true
  },

  location: {
    type: String,
    required: true
  },

  experience: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  availability: {
    type: String,
    default: "Available"
  },

  verificationStatus: {
    type: String,
    default: "Pending"
  },

  reliabilityScore: {
    type: Number,
    default: 0
  },

  completedServices: {
    type: Number,
    default: 0
  },

  cancelledServices: {
    type: Number,
    default: 0
  },

  complaints: {
    type: Number,
    default: 0
  },

  averageRating: {
    type: Number,
    default: 0
  }

});

const Provider = mongoose.model(
  "providers",
  providerSchema
);

module.exports = Provider;