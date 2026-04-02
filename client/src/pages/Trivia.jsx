import React from "react";
import { Link, useParams } from "react-router-dom";

export default function Trivia() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative">
      <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>

      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/go-to-museum/${id}`}
            className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
          >
            Back to Museum
          </Link>
        </div>

        <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-xl p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Coming Soon</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Take Trivia</h1>
          <p className="text-dark-chocolate/70 max-w-xl mx-auto mb-8">
            This museum quiz section is not implemented yet. You can return to the museum page and keep exploring artifacts.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to={`/go-to-museum/${id}`}
              className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
            >
              Back to Museum
            </Link>
            <Link
              to={`/leaderboard/${id}`}
              className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
            >
              Go To Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
