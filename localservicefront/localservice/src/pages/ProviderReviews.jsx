import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaStar,
  FaRegCommentDots,
  FaSyncAlt,
} from "react-icons/fa";
import "../Css/ProviderReviews.css";

const API = "https://servitrust-baxkend.onrender.com";

export default function ProviderReviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    const token = localStorage.getItem("token");
    const providerId = localStorage.getItem("userId");

    if (!token || !providerId) {
      setError("Please log in again to view your reviews.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/reviews/provider/${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <main className="provider-reviews-page">
      <header className="provider-reviews-header">
        <div>
          <span className="provider-reviews-eyebrow">
            CUSTOMER FEEDBACK
          </span>
          <h1>My Reviews</h1>
          <p>See what customers say about your services.</p>
        </div>

        <button
          type="button"
          className="provider-reviews-refresh"
          onClick={fetchReviews}
          disabled={loading}
        >
          <FaSyncAlt />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="provider-reviews-error" role="alert">
          {error}
        </div>
      )}

      <section className="provider-reviews-summary">
        <article className="provider-reviews-summary-card">
          <span>Average Rating</span>
          <strong>
            <FaStar />
            {Number(averageRating).toFixed(1)}
            <small>/ 5</small>
          </strong>
        </article>

        <article className="provider-reviews-summary-card">
          <span>Total Reviews</span>
          <strong>{totalReviews}</strong>
        </article>
      </section>

      <section className="provider-reviews-panel">
        <div className="provider-reviews-panel-heading">
          <div>
            <h2>Customer Feedback</h2>
            <p>Your customer ratings and comments.</p>
          </div>
        </div>

        {loading ? (
          <p className="provider-reviews-message">
            Loading your reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div className="provider-reviews-empty">
            <FaRegCommentDots />
            <h3>No reviews yet</h3>
            <p>Customer reviews will appear here when available.</p>
          </div>
        ) : (
          <div className="provider-reviews-list">
            {reviews.map((review) => (
              <article
                className="provider-review-card"
                key={review._id}
              >
                <div className="provider-review-top">
                  <div>
                    <h3>
                      {review.customer?.name || "Customer"}
                    </h3>
                    <span>
                      {review.service?.name || "Service"}
                    </span>
                  </div>

                  <div
                    className="provider-review-stars"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={
                          star <= review.rating
                            ? "provider-star-filled"
                            : "provider-star-empty"
                        }
                      />
                    ))}
                    <strong>{review.rating}/5</strong>
                  </div>
                </div>

                <p className="provider-review-comment">
                  {review.comment}
                </p>

                <div className="provider-review-footer">
                  <time dateTime={review.createdAt}>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Date unavailable"}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}