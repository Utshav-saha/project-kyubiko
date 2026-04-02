import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { ArrowRight, Check, X } from "lucide-react";

const QUESTION_IMAGE_FALLBACK = "https://placehold.co/1000x700?text=Museum";

const resolveImageUrl = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("www.")) return `https://${value}`;
  if (value.startsWith("/")) {
    try {
      return `${new URL(API_URL).origin}${value}`;
    } catch {
      return "";
    }
  }
  return "";
};

export default function Question() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [museumName, setMuseumName] = useState("Museum");
  const [museumImage, setMuseumImage] = useState("https://placehold.co/1000x700?text=Museum");
  const [quizId, setQuizId] = useState(location.state?.quizId || null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentQuestion = questions[currentIndex] || null;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const metaRes = await fetch(`${API_URL}/quiz/museum/${id}/meta`, {
          method: "GET",
          headers: { token },
        });

        if (!metaRes.ok) {
          throw new Error("Failed to load quiz info");
        }

        const meta = await metaRes.json();
        // Always prefer live museum meta to avoid stale quiz ids in navigation state.
        const resolvedQuizId = Number(meta.quiz_id || quizId || 0);

        if (!resolvedQuizId) {
          throw new Error("Quiz id could not be resolved");
        }

        setQuizId(resolvedQuizId);
        setMuseumName(meta.quiz_title || meta.museum_name || "Museum");
        setMuseumImage(resolveImageUrl(meta.museum_image) || QUESTION_IMAGE_FALLBACK);

        const qRes = await fetch(`${API_URL}/quiz/${resolvedQuizId}/questions`, {
          method: "GET",
          headers: { token },
        });

        if (!qRes.ok) {
          throw new Error("Failed to load quiz questions");
        }

        const qData = await qRes.json();
        if (qData.quiz_id) {
          setQuizId(Number(qData.quiz_id));
        }
        setQuestions(qData.questions || []);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  const handleOptionClick = (optionIndex) => {
    if (selectedOption !== null || !currentQuestion) return;

    const correct = Boolean(currentQuestion.options?.[optionIndex]?.is_correct);
    setSelectedOption(optionIndex);
    setIsCorrect(correct);
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    const earnedPoint = selectedOption !== null && isCorrect ? 1 : 0;
    const nextScore = score + earnedPoint;

    if (earnedPoint) {
      setScore(nextScore);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      const token = localStorage.getItem("token");
      if (token && quizId) {
        fetch(`${API_URL}/quiz/${quizId}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify({
            score: nextScore,
            elapsedSeconds,
          }),
        }).catch((err) => console.error(err.message));
      }

      navigate(`/trivia/${id}/result`, {
        state: {
          score: nextScore,
          total: questions.length,
          museumName,
          elapsedSeconds,
        },
      });
      return;
    }

    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setIsCorrect(false);
  };

  const resultText = isCorrect ? "Absolutely right!" : "Not quite...";

  const imageSource =
    resolveImageUrl(currentQuestion?.display_image_url) ||
    resolveImageUrl(currentQuestion?.artifact_image_url) ||
    resolveImageUrl(currentQuestion?.image_url) ||
    museumImage ||
    QUESTION_IMAGE_FALLBACK;

  const imageLabel = museumName;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative">
        <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="font-playfair text-4xl font-bold mb-3">No Questions Found</h2>
          <p className="text-dark-chocolate/70">Please seed quiz questions for this museum quiz first.</p>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-5">
          <Link
            to={`/trivia/${id}`}
            className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
          >
            Exit Trivia
          </Link>
          <div></div>
        </div>

        <div className="text-center mb-6">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">{museumName}</h1>
          <p className="mt-2 text-dark-chocolate/80 font-bold">{minutes}m {seconds}s passed</p>
          <p className="text-sm text-dark-chocolate/60 mt-1">{currentIndex + 1}/{questions.length}</p>

          <div className="max-w-sm mx-auto mt-3">
            <div className="h-2.5 w-full rounded-full bg-white/35 backdrop-blur-sm border border-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-dark-chocolate rounded-2xl shadow-xl p-5 md:p-7 text-white relative transition-all duration-300">
          <p className="text-sm uppercase tracking-widest font-bold">Question</p>
          <p className="text-xs uppercase tracking-wider text-white/80 mt-1">
            {currentQuestion.subject_label || "Museum"}
          </p>

          {selectedOption !== null && (
            <div
              className={`absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center ${
                isCorrect ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {isCorrect ? <Check size={18} /> : <X size={18} />}
            </div>
          )}

          <div className="max-w-md mx-auto mt-4 rounded-xl overflow-hidden border border-white/30 bg-white">
            <img
              src={imageSource}
              alt={imageLabel}
              className="w-full h-56 md:h-64 object-cover"
              onError={(event) => {
                const museumFallback = resolveImageUrl(museumImage) || QUESTION_IMAGE_FALLBACK;
                if (event.currentTarget.src !== museumFallback) {
                  event.currentTarget.src = museumFallback;
                  return;
                }
                event.currentTarget.onerror = null;
                event.currentTarget.src = QUESTION_IMAGE_FALLBACK;
              }}
            />
          </div>

          <p className="mt-5 text-center text-lg md:text-xl font-bold">Q. {currentQuestion.question_text}</p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isChosen = selectedOption === optionIndex;
              const isRight = Boolean(option.is_correct);
              const optionLetter = ["A", "B", "C", "D"][optionIndex] || "?";

              let buttonClass = "bg-white text-dark-chocolate";
              if (selectedOption !== null && isChosen) {
                buttonClass = isRight ? "bg-emerald-500 text-white" : "bg-red-500 text-white";
              }

              return (
                <button
                  key={option.option_id || `${option.option_text}-${optionIndex}`}
                  onClick={() => handleOptionClick(optionIndex)}
                  className={`w-full text-left px-4 py-3 rounded-lg border border-white/20 font-medium flex items-center justify-between ${buttonClass}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="font-black">{optionLetter}.</span>
                    <span>{option.option_text}</span>
                  </span>
                  {selectedOption !== null && isChosen && isRight && <Check size={16} />}
                  {selectedOption !== null && isChosen && !isRight && (
                    <span className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                      <X size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="mt-5 bg-white/95 text-dark-chocolate rounded-xl p-4">
              <p className="font-bold mb-1">{resultText}</p>
              <p className="text-sm leading-relaxed">
                {currentQuestion.question_description || "This question is linked to museum and artifact context for learning."}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className={`btn border-none ${
                selectedOption === null
                  ? "bg-white text-dark-chocolate hover:bg-white/90"
                  : "bg-accent-yellow text-dark-chocolate hover:bg-accent-orange"
              }`}
            >
              {selectedOption === null ? (
                "Skip Question"
              ) : (
                <span className="inline-flex items-center gap-1">
                  Next Question
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
