const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;