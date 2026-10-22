import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaSyncAlt, FaRegCommentDots } from "react-icons/fa";
import "../Css/Reviews.css";

const API = "https://servitrust-baxkend.onrender.com";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews(response.data.reviews || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    const customer =
      review.customer?.name || "Customer";

    const provider =
      review.provider?.name ||
      review.provider?.businessName ||
      "Provider";

    const service =
      review.service?.name || "Service";

    const text = `${customer} ${provider} ${service} ${
      review.comment || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <div>
          <span className="reviews-eyebrow">
            CUSTOMER FEEDBACK
          </span>
          <h1>Reviews</h1>
          <p>View customer feedback across ServiTrust.</p>
        </div>

        <button
          className="reviews-refresh"
          onClick={fetchReviews}
          disabled={loading}
        >
          <FaSyncAlt />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="reviews-error" role="alert">
          {error}
        </div>
      )}

      <section className="reviews-stats">
        <article className="reviews-stat-card">
          <span>Total Reviews</span>
          <strong>{reviews.length}</strong>
        </article>

        <article className="reviews-stat-card">
          <span>Average Rating</span>
          <strong>
            <FaStar className="reviews-stat-star" /> {averageRating}
          </strong>
        </article>
      </section>

      <section className="reviews-panel">
        <div className="reviews-panel-heading">
          <div>
            <h2>All Customer Reviews</h2>
            <p>Customer ratings and service feedback.</p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reviews..."
            aria-label="Search reviews"
          />
        </div>

        {loading ? (
          <p className="reviews-message">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
          <div className="reviews-empty">
            <FaRegCommentDots />
            <h3>No reviews found</h3>
            <p>Reviews will appear here after customers submit them.</p>
          </div>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="review-card-top">
                  <div>
                    <h3>
                      {review.customer?.name || "Customer"}
                    </h3>
                    <span>
                      {review.service?.name || "Service"}
                    </span>
                  </div>

                  <div
                    className="review-rating"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={
                          star <= review.rating
                            ? "review-star-filled"
                            : "review-star-empty"
                        }
                      />
                    ))}
                    <strong>{review.rating}/5</strong>
                  </div>
                </div>

                <p className="review-comment">
                  {review.comment}
                </p>

                <div className="review-card-footer">
                  <span>
                    Provider:{" "}
                    {review.provider?.name ||
                      review.provider?.businessName ||
                      "Provider"}
                  </span>

                  <time dateTime={review.createdAt}>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString(
                          "en-IN"
                        )
                      : "Date unavailable"}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}