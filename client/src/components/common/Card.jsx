import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../config";

export default function Card({
  name,
  image,
  description,
  creator = "Unknown",
  time_period = "Unknown",
  acquisition_date = "Unknown",
  museum_name = "Unknown",
  category = "Unknown",
  origin = "Unknown",
  color = false,
  artifactId = 1,
  wishlist,
  setWishlist,
  setPopMsg,
  userRole,
  size = "md",
}) {
  const [isFav, setIsFav] = useState(color);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState("");

  const [reviews, setReviews] = useState([]);

  const cardSizeClass = size === "sm" ? "w-64 h-100" : "w-72 h-112.5";

  const formattedAcquisitionDate = (() => {
    if (!acquisition_date) return "Unknown";
    const date = new Date(acquisition_date);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  })();

  const get_reviews = async () => {
    try {
      const response = await fetch(
        `${API_URL}/card/reviews?artifact_id=${artifactId}`,
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        },
      );

      const res = await response.json();
      if (response.ok) {
        setReviews(res);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    setIsFav(color);
  }, [color]);

  useEffect(() => {
    if (isModalOpen) {
      get_reviews();
    }
  }, [isModalOpen, artifactId]);

  const handleAddView = async () => {
    try {
      const response = await fetch(`${API_URL}/card/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify({ artifact_id: artifactId }),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.msg);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/card/add_review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          artifact_id: artifactId,
          stars: newRating,
          review_body: newReview,
        }),
      });

      if (response.ok) {
        // reset form and refresh reviews
        setNewReview("");
        setNewRating(0);
        get_reviews();
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleReplySubmit = async (e, parent_id) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/card/add_review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          artifact_id: artifactId,
          stars: 5,
          review_body: reply,
          reply_id: parent_id,
        }),
      });

      if (response.ok) {
        setReply("");
        setReplyTo(null);
        get_reviews();
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAddFav = async (artifactId, wishlist, setWishlist, setPopMsg) => {
    // for manager part
    if (userRole !== "curator") {
      return;
    }

    const isAlreadyFav = wishlist.some(
      (item) => item.artifact_id === artifactId,
    );

    if (isAlreadyFav) {
      setPopMsg("Artifact is already in wishlist!");
      setTimeout(() => setPopMsg(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/card/fav`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ artifact_id: artifactId }),
      });

      const res = await response.json();

      setPopMsg(res.msg || res.error);

      if (response.ok) {
        const newItem = {
          artifact_id: artifactId,
          artifact_name: name,
          creator: creator,
          picture_url: image,
        };
        setWishlist([...wishlist, newItem]);
      }
    } catch (error) {
      setPopMsg("An error occurred. Please try again.");
    } finally {
      setTimeout(() => setPopMsg(null), 3000);
    }
  };

  return (
    <>
      {/* Card  */}
      <div
        className={`card group ${cardSizeClass} shadow-sm relative overflow-hidden rounded-xl flex flex-col bg-stone-100`}
      >
        <button
          onClick={() => {
            if (isFav) {
              handleAddFav(artifactId, wishlist, setWishlist, setPopMsg);
            } else {
              setIsFav(true);
              handleAddFav(artifactId, wishlist, setWishlist, setPopMsg);
            }
          }}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-sm rounded-full transition-colors hover:bg-black/60"
          aria-label="Add to favorites"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFav ? "#f43f5e" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={isFav ? "#f43f5e" : "white"}
            className="w-5 h-5 transition-transform active:scale-90"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>

        <figure className="flex-1 overflow-hidden w-full relative bg-transparent">
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={image}
            alt={name}
          />
        </figure>

        <div className="card-body bg-stone-900 w-full grow-0 p-4 min-h-15 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
          <h2 className="card-title text-white font-dmsans text-lg text-center">
            {name}
          </h2>
        </div>

        <div className="absolute bottom-0 left-0 z-10 flex h-0 w-full flex-col items-center justify-center overflow-hidden bg-[linear-gradient(transparent,#1c1c1c_58%)] px-6 text-center transition-[height] duration-500 ease-in-out group-hover:h-full">
          <h3 className="font-dmsans mb-3 text-2xl font-bold text-white translate-y-10 opacity-0 transition-all duration-500 delay-100 group-hover:translate-y-0 group-hover:opacity-100">
            {name}
          </h3>
          <p className="text-white text-sm line-clamp-1 translate-y-10 opacity-0 transition-all duration-500 delay-200 group-hover:translate-y-0 group-hover:opacity-100">
            {description}
          </p>
          <button
            onClick={() => {
              setIsModalOpen(true);
              handleAddView();
            }}
            className="btn btn-primary mt-4 bg-accent-yellow text-black border-transparent hover:bg-amber-500"
          >
            Read More
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen &&
        createPortal(
          <dialog className="modal modal-open z-999 bg-black/60 backdrop-blur-sm ">
            <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-stone-100 text-stone-800 rounded-xl font-dmsans flex flex-col">
            {/* Modal Top: Artifact Details */}
            <div className="flex flex-col md:flex-row relative bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 z-10 bg-white/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none hover:text-black"
              >
                X
              </button>

              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-4 pr-8">
                    {name}
                  </h2>
                  <p className="text-stone-600 mb-6 leading-relaxed">
                    {description}
                  </p>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-xs">
                        Origin
                      </span>
                      <span className="font-medium text-stone-800">
                        {origin}
                      </span>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-xs">
                        Time Period
                      </span>
                      <span className="font-medium text-stone-800">
                        {time_period}
                      </span>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-xs">
                        Creator
                      </span>
                      <span className="font-medium text-stone-800">
                        {creator}
                      </span>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-xs">
                        Category
                      </span>
                      <span className="font-medium text-stone-800">
                        {category}
                      </span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-stone-200 mt-2">
                      <span className="block text-stone-400 font-semibold uppercase tracking-wider text-xs mb-1">
                        Museum & Acquisition
                      </span>
                      <span className="font-medium text-stone-800">
                        {museum_name} • Acquired: {formattedAcquisitionDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => {
                      if (isFav) {
                        handleAddFav(
                          artifactId,
                          wishlist,
                          setWishlist,
                          setPopMsg,
                        );
                      } else {
                        setIsFav(true);
                        handleAddFav(
                          artifactId,
                          wishlist,
                          setWishlist,
                          setPopMsg,
                        );
                      }
                    }}
                    className={`btn flex-1 ${
                      isFav
                        ? "btn-outline border-amber-500 text-amber-600 hover:bg-amber-50 hover:border-amber-600"
                        : "btn-primary bg-amber-400 text-black border-transparent hover:bg-amber-500"
                    }`}
                  >
                    {isFav ? "Saved to Favorites" : "Add to Favorites"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-stone-300 bg-stone-50">
              <h3 className="text-2xl font-bold text-stone-900 mb-6">
                Visitor Reviews
              </h3>

              {/* Add New Review  */}
              <form onSubmit={handleReviewSubmit} className="mb-8">
                <div className="form-control w-full">
                  <label className="label px-0">
                    <span className="label-text font-semibold text-stone-800 text-base">
                      Leave a Review
                    </span>
                  </label>

                  {/* rating */}
                  <div className="rating rating-md mb-3">
                    <input
                      type="radio"
                      name="new-rating"
                      className="rating-hidden"
                      checked={newRating === 0}
                      readOnly
                    />
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="new-rating"
                        className="mask mask-star-2 bg-amber-500"
                        checked={newRating === star}
                        onChange={() => setNewRating(star)}
                      />
                    ))}
                  </div>

                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="textarea textarea-bordered w-full bg-white text-stone-800 border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Share your thoughts about this artifact..."
                    rows="3"
                    required
                  ></textarea>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-sm bg-stone-800 text-white hover:bg-stone-900 border-none"
                    >
                      Post Review
                    </button>
                  </div>
                </div>
              </form>

              <div className="divider text-stone-400 before:bg-stone-300 after:bg-stone-300">
                Recent Reviews
              </div>

              {/* Reviews List */}
              <div className="space-y-8 mt-8">
                {reviews.map((review) => (
                  <div key={review.review_id} className="flex gap-4">
                    <div className="avatar placeholder self-start">
                      <div className="bg-stone-200 text-stone-700 rounded-full w-12 h-12">
                        {review.avatar_url ? (
                          <img
                            src={review.avatar_url}
                            alt={review.username}
                            className="rounded-full w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {review.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                        <div>
                          <span className="font-bold text-stone-900 mr-2">
                            {review.username}
                          </span>
                          <span className="text-xs text-stone-400">
                            {new Date(review.review_time).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="rating rating-sm">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <input
                              key={star}
                              type="radio"
                              name={`rating-${review.review_id}`}
                              className={`mask mask-star-2 cursor-default ${star <= review.stars ? "bg-amber-500" : "bg-stone-300"}`}
                              disabled
                              checked={star === review.stars}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-stone-700 mt-2 text-sm leading-relaxed">
                        {review.review_body}
                      </p>

                      <div className="mt-3">
                        <button
                          onClick={() =>
                            setReplyTo(
                              replyTo === review.review_id
                                ? null
                                : review.review_id,
                            )
                          }
                          className="text-xs font-bold text-stone-500 hover:text-amber-600 transition-colors uppercase tracking-wider"
                        >
                          {replyTo === review.review_id
                            ? "Cancel Reply"
                            : "Reply"}
                        </button>
                      </div>

                      {/* Reply Form */}
                      {replyTo === review.review_id && (
                        <form
                          onSubmit={(e) =>
                            handleReplySubmit(e, review.review_id)
                          }
                          className="mt-4 flex flex-col sm:flex-row gap-2"
                        >
                          <input
                            type="text"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder={`Replying to ${review.username}...`}
                            className="input input-sm input-bordered w-full bg-white border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            required
                          />
                          <button
                            type="submit"
                            className="btn btn-sm bg-stone-800 text-white hover:bg-stone-900 border-none shrink-0"
                          >
                            Post Reply
                          </button>
                        </form>
                      )}

                      {/* Replies */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="mt-5 space-y-4">
                          {review.replies.map((reply) => (
                            <div key={reply.review_id} className="flex gap-3">
                              <div className="avatar placeholder self-start">
                                <div className="bg-stone-200 text-stone-700 rounded-full w-12 h-12">
                                  {review.avatar_url ? (
                                    <img
                                      src={review.avatar_url}
                                      alt={review.username}
                                      className="rounded-full w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-lg font-bold">
                                      {review.username?.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                                <div className="mb-1 flex items-baseline">
                                  <span className="font-bold text-stone-900 text-sm mr-2">
                                    {reply.username}
                                  </span>
                                  <span className="text-xs text-stone-400">
                                    {new Date(
                                      reply.review_time,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-stone-700 text-sm leading-relaxed">
                                  {reply.review_body}
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  setReplyTo(review.review_id);
                                  setReply(``);
                                }}
                                className="text-xs font-bold text-stone-500 hover:text-amber-600"
                              >
                                Reply
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-stone-500 italic text-center py-8">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          </div>

            <form
              method="dialog"
              className="modal-backdrop"
              onClick={() => setIsModalOpen(false)}
            >
              <button className="cursor-default">close</button>
            </form>
          </dialog>,
          document.body,
        )}
    </>
  );
}
