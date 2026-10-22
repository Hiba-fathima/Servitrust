const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Review = require("../models/ReviewModel");
const ServiceRequest = require("../models/RequestModel");
const Provider = require("../models/ProviderModel");

// GET ALL REVIEWS
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name")
      .populate("provider")
      .populate("service")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
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
      !rating ||
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
      !mongoose.isValidObjectId(provider)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    // Validate rating
    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
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

    // Check whether the request belongs to this customer
    if (String(request.customerId) !== String(customer)) {
      return res.status(403).json({
        success: false,
        message: "This request does not belong to this customer.",
      });
    }

    // Check whether the provider matches the request
    if (String(request.providerId) !== String(provider)) {
      return res.status(400).json({
        success: false,
        message: "Provider does not match the service request.",
      });
    }

    // Allow reviews for service requests of ANY status.
    // The completed-only restriction has been removed.

    // Prevent duplicate reviews for the same request
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
      service: service || undefined,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Update the provider's average rating
    const providerReviews = await Review.find({
      provider,
    });

    const averageRating =
      providerReviews.reduce(
        (sum, item) => sum + item.rating,
        0
      ) / providerReviews.length;

    await Provider.findByIdAndUpdate(provider, {
      averageRating: Number(averageRating.toFixed(1)),
    });

    // Return the newly created review
    const populatedReview = await Review.findById(review._id)
      .populate("customer", "name")
      .populate("service");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("SUBMIT REVIEW ERROR:", error);

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

    const reviews = await Review.find({
      provider: providerId,
    })
      .populate("customer", "name")
      .populate("service")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / reviews.length
        : 0;

    res.json({
      success: true,
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("GET PROVIDER REVIEWS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch provider reviews.",
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

    const reviews = await Review.find({
      customer: customerId,
    })
      .populate("provider", "userId averageRating")
      .populate("service", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("FETCH CUSTOMER REVIEWS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer reviews.",
    });
  }
});

module.exports = router;
