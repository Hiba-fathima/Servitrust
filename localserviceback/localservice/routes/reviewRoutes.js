const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Review = require("../models/ReviewModel");
const ServiceRequest = require("../models/RequestModel");
const Provider = require("../models/ProviderModel");
console.log("Registered Provider model:", Provider.modelName);
console.log("Registered models:", mongoose.modelNames());
console.log("Provider model name:", Provider.modelName);

// Register the models used by populate().
// This avoids "Schema hasn't been registered" errors.
require("../models/UserModel");
require("../models/ServiceModel");

// GET ALL REVIEWS
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("provider", "name category location")
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message,
    });
  }
});

// SUBMIT REVIEW
router.post("/", async (req, res) => {
  try {
    const {
      serviceRequestId,
      customer,
      provider,
      service,
      rating,
      comment,
    } = req.body;

    // Validate required fields
    if (
      !serviceRequestId ||
      !customer ||
      !provider ||
      rating === undefined ||
      rating === null ||
      !comment?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required review fields.",
      });
    }

    // Validate IDs
    if (
      !mongoose.isValidObjectId(serviceRequestId) ||
      !mongoose.isValidObjectId(customer) ||
      !mongoose.isValidObjectId(provider) ||
      (service && !mongoose.isValidObjectId(service))
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more review IDs are invalid.",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // Validate comment length
    const trimmedComment = comment.trim();

    if (trimmedComment.length < 5 || trimmedComment.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain between 5 and 2000 characters.",
      });
    }

    // Find the service request
    const request = await ServiceRequest.findById(serviceRequestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found.",
      });
    }

    // Verify the customer owns this request
    if (String(request.customerId) !== String(customer)) {
      return res.status(403).json({
        success: false,
        message: "This request does not belong to this customer.",
      });
    }

    // Verify the provider matches this request
    if (String(request.providerId) !== String(provider)) {
      return res.status(400).json({
        success: false,
        message: "Provider does not match the service request.",
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      serviceRequestId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this service.",
      });
    }

    // Create the review
    const review = await Review.create({
      serviceRequestId,
      customer,
      provider,
      ...(service ? { service } : {}),
      rating: numericRating,
      comment: trimmedComment,
    });

    // Update provider average rating
    const providerReviews = await Review.find({ provider });

    const averageRating =
      providerReviews.reduce((sum, item) => sum + item.rating, 0) /
      providerReviews.length;

    await Provider.findByIdAndUpdate(provider, {
      averageRating: Number(averageRating.toFixed(1)),
    });

    // Return the populated review
    const populatedReview = await Review.findById(review._id)
      .populate("customer", "name email")
      .populate("provider", "name category location")
      .populate("service", "name category");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("SUBMIT REVIEW ERROR:", error);

    // Handle duplicate-key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this service.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
      error: error.message,
    });
  }
});

// GET REVIEWS FOR ONE PROVIDER
router.get("/provider/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.isValidObjectId(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID.",
      });
    }

    const reviews = await Review.find({ provider: providerId })
      .populate("customer", "name")
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, item) => sum + item.rating, 0) /
          reviews.length
        : 0;

    return res.status(200).json({
      success: true,
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("GET PROVIDER REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider reviews.",
      error: error.message,
    });
  }
});

// GET REVIEWS SUBMITTED BY A SPECIFIC CUSTOMER
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const reviews = await Review.find({ customer: customerId })
      .populate("customer", "name")
      .populate("provider", "name category location")
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET CUSTOMER REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer reviews.",
      error: error.message,
    });
  }
});

module.exports = router;
