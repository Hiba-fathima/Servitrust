const express = require("express");
const router = express.Router();
const Review = require("../models/ReviewModel");


// Get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
});


// Get reviews for one provider
router.get("/provider/:providerId", async (req, res) => {
  try {
    const reviews = await Review.find({
      provider: req.params.providerId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider reviews"
    });
  }
});

module.exports = router;