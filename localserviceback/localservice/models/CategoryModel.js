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
    },

    // Optional category image
    image: {
      type: String,
      default: ""
    },

    // Used to replace or delete the Cloudinary image
    imagePublicId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;