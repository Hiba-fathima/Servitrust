const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  subServices: {
    type: [String],
    default: []
  },

  price: {
    type: Number,
    required: true
  },

  pricingType: {
    type: String,
    required: true
  },

  duration: {
    type: String,
    required: true
  },

  serviceArea: {
    type: String,
    required: true
  },

  availability: {
    type: String,
    default: "Available"
  },

  emergencyService: {
    type: String,
    default: "No"
  },

  serviceGuarantee: {
    type: String,
    default: "No Warranty"
  },

  status: {
    type: String,
    default: "Active"
  },
  image: {
  type: String,
  default: ""
}

});

const Service = mongoose.model("services", serviceSchema);

module.exports = Service;