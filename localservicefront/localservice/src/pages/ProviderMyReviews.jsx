import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaSyncAlt } from "react-icons/fa";

import "../Css/ProviderMyReviews.css";

const API = "https://servitrust-baxkend.onrender.com";

function ProviderMyReviews() {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    const token = localStorage.getItem("token");

    let user = {};

    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      user = {};
    }

    // Use the provider's database ID if it is stored in the user object.
    const providerId =
      user?.providerId ||
      user?.provider?._id ||
      user?.provider?._id?.toString();

    if (!token || !providerId) {
      setError(
        "Provider ID not found. Please check your provider login data."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/reviews/provider/${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      setReviews(
        Array.isArray(data?.reviews) ? data.reviews : []
      );

      setTotalReviews(Number(data?.totalReviews || 0));
      setAverageRating(Number(data?.averageRating || 0));
    } catch (err) {
      console.error(
        "Error loading provider reviews:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load reviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="provider-my-reviews">
      <div className="provider-reviews-header">
        <div>
          <span className="provider-reviews-eyebrow">
            CUSTOMER FEEDBACK
          </span>

          <h2>My Reviews</h2>

          <p>See what customers say about your services.</p>
        </div>

        <button
          type="button"
          className="provider-reviews-refresh"
          onClick={loadReviews}
          disabled={loading}
        >
          <FaSyncAlt />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="provider-reviews-error" role="alert">
          {error}
        </div>
      )}

      {!error && !loading && (
        <div className="provider-reviews-summary">
          <div className="provider-review-summary-card">
            <span>Average Rating</span>

            <strong>
              {averageRating.toFixed(1)}
              <FaStar className="provider-summary-star" />
            </strong>

            <small>Out of 5 stars</small>
          </div>

          <div className="provider-review-summary-card">
            <span>Total Reviews</span>

            <strong>{totalReviews}</strong>

            <small>Customer feedback received</small>
          </div>
        </div>
      )}

      {loading ? (
        <div className="provider-reviews-state">
          <span className="provider-reviews-loader" />
          <p>Loading your reviews...</p>
        </div>
      ) : !error && reviews.length === 0 ? (
        <div className="provider-reviews-empty">
          <FaStar />

          <h3>No reviews yet</h3>

          <p>
            Customer reviews for your services will appear here.
          </p>
        </div>
      ) : (
        !error && (
          <div className="provider-reviews-list">
            {reviews.map((review) => (
              <article
                className="provider-review-card"
                key={review._id}
              >
                <div className="provider-review-card-header">
                  <div className="provider-customer-avatar">
                    {(review.customer?.name ||
                      review.customer?.fullName ||
                      "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="provider-customer-info">
                    <h3>
                      {review.customer?.name ||
                        review.customer?.fullName ||
                        "Customer"}
                    </h3>

                    <p>
                      {review.service?.name ||
                        review.service?.serviceName ||
                        review.serviceName ||
                        "Service"}
                    </p>
                  </div>

                  <span className="provider-review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <div className="provider-review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={
                        star <= Number(review.rating)
                          ? "provider-star-active"
                          : "provider-star-inactive"
                      }
                    />
                  ))}

                  <strong>
                    {Number(review.rating || 0)}/5
                  </strong>
                </div>

                <p className="provider-review-comment">
                  {review.comment ||
                    review.review ||
                    "No comment provided."}
                </p>
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}

export default ProviderMyReviews;