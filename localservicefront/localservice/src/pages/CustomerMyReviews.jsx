import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaSyncAlt } from "react-icons/fa";

import "../Css/CustomerMyReviews.css";

const API = "https://servitrust-baxkend.onrender.com";

function CustomerMyReviews() {
  const [reviews, setReviews] = useState([]);
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

    const customerId =
      user?._id ||
      user?.id ||
      localStorage.getItem("userId");

    if (!token || !customerId) {
      setError("Please log in to view your reviews.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/reviews/customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(
        Array.isArray(response.data?.reviews)
          ? response.data.reviews
          : []
      );
    } catch (err) {
      console.error(
        "Error loading customer reviews:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your reviews. Please try again."
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

  const getServiceName = (review) =>
    review.service?.name ||
    review.service?.serviceName ||
    review.serviceName ||
    "Service";

  const getProviderName = (review) =>
    review.provider?.businessName ||
    review.provider?.name ||
    review.providerName ||
    "Service Provider";

  return (
    <section className="customer-my-reviews">
      <div className="my-reviews-header">
        <div>
          <span className="my-reviews-eyebrow">
            CUSTOMER FEEDBACK
          </span>

          <h2>My Reviews</h2>

          <p>View the feedback you have shared on ServiTrust.</p>
        </div>

        <button
          type="button"
          className="my-reviews-refresh"
          onClick={loadReviews}
          disabled={loading}
        >
          <FaSyncAlt />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="my-reviews-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="my-reviews-state">
          <span className="my-reviews-loader" />
          <p>Loading your reviews...</p>
        </div>
      ) : !error && reviews.length === 0 ? (
        <div className="my-reviews-empty">
          <div className="my-reviews-empty-icon">
            <FaStar />
          </div>

          <h3>No reviews yet</h3>

          <p>
            Reviews you submit for your service requests will appear here.
          </p>
        </div>
      ) : (
        <div className="my-reviews-list">
          {reviews.map((review) => (
            <article
              className="my-review-card"
              key={review._id}
            >
              <div className="my-review-top">
                <div className="my-review-service-icon">
                  <FaStar />
                </div>

                <div className="my-review-heading">
                  <h3>{getServiceName(review)}</h3>

                  <p>
                    Provider: {getProviderName(review)}
                  </p>
                </div>

                <span className="my-review-date">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <div
                className="my-review-stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={
                      star <= Number(review.rating)
                        ? "my-review-star-active"
                        : "my-review-star-inactive"
                    }
                  />
                ))}

                <span>{review.rating}/5</span>
              </div>

              <p className="my-review-comment">
                {review.comment || review.review || "No comment provided."}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CustomerMyReviews;