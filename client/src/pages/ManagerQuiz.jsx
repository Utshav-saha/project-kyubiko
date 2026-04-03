import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu"; 
import { API_URL, CLOUD_NAME, UPLOAD_PRESET } from "../config"; 

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    console.error("Image upload failed:", err);
    return null;
  }
};

export default function ManagerQuiz() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [hasQuiz, setHasQuiz] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Quiz State
  const [quizDetails, setQuizDetails] = useState({
    quiz_title: "Mysteries of the Antiquities",
    total_points: 100,
  });

  // Questions State
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question_text: "Which dynasty crafted this ceremonial vase?",
      description:
        "Pay close attention to the intricate cloud patterns on the rim.",
      image_url:
        "https://images.unsplash.com/photo-1605469237664-0cb3896b0293?w=500&q=80",
      options: ["Ming Dynasty", "Qing Dynasty", "Han Dynasty", "Tang Dynasty"],
      correct_answer: 0, // Index of the correct option
    },
  ]);

  // Modal States
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form States
  const [quizForm, setQuizForm] = useState({
    quiz_title: "",
    total_points: "",
  });
  const [questionForm, setQuestionForm] = useState({
    id: null,
    question_text: "",
    description: "",
    image_url: "",
    options: ["", "", "", ""],
    correct_answer: 0,
  });

  const fetchData = async () => {
    try {
      setPageError("");
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const [authRes, dataRes] = await Promise.all([
        fetch(`${API_URL}/manager-quiz/authorize`, { headers: { token } }),
        fetch(`${API_URL}/manager-quiz/data`, { headers: { token } }),
      ]);

      if (!authRes.ok) return navigate("/login");
      const authData = await authRes.json();
      setUser(authData.user || null);

      if (!dataRes.ok) {
        setHasQuiz(false);
        setQuizDetails({ quiz_title: "", total_points: 0 });
        setQuestions([]);
        return;
      }

      const data = await dataRes.json();
      if (!data.quiz) {
        setHasQuiz(false);
        setQuizDetails({ quiz_title: "", total_points: 0 });
        setQuestions([]);
      } else {
        setHasQuiz(true);
        setQuizDetails(data.quiz);
        setQuestions(data.questions || []);
      }
    } catch {
      setPageError("Failed to load quiz data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---

  const handleOpenQuizModal = (isEdit = false) => {
    if (isEdit) {
      setQuizForm({ ...quizDetails });
    } else {
      setQuizForm({ quiz_title: "", total_points: "" });
    }
    setShowQuizModal(true);
  };

  const handleOpenQuestionModal = (question = null) => {
    if (question) {
      setQuestionForm({ ...question });
    } else {
      setQuestionForm({
        id: null,
        question_text: "",
        description: "",
        image_url: "",
        options: ["", "", "", ""],
        correct_answer: 0,
      });
    }
    setShowQuestionModal(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

 const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    
    const url = await uploadImage(file);
    if (url) {
      setQuestionForm((prev) => ({
        ...prev,
        image_url: url,
      }));
    }
    
    setUploadingImage(false);
  };

  const handleSaveQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = hasQuiz && quizDetails?.quiz_id;
      const url = isEdit
        ? `${API_URL}/manager-quiz/edit-quiz`
        : `${API_URL}/manager-quiz/new`;
      const method = isEdit ? "PUT" : "POST";

      const payload = isEdit
        ? {
            quiz_id: quizDetails.quiz_id,
            quiz_title: quizForm.quiz_title,
            total_points: quizForm.total_points,
          }
        : {
            quiz_title: quizForm.quiz_title,
            total_points: quizForm.total_points,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save quiz");
      setShowQuizModal(false);
      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(questionForm.id);
      const url = isEdit
        ? `${API_URL}/manager-quiz/edit-question`
        : `${API_URL}/manager-quiz/add-question`;
      const method = isEdit ? "PUT" : "POST";

      const payload = isEdit
        ? {
            question_id: questionForm.id,
            question_text: questionForm.question_text,
            description: questionForm.description,
            image_url: questionForm.image_url,
            options: questionForm.options,
            correct_option: questionForm.correct_answer,
          }
        : {
            quiz_id: quizDetails.quiz_id,
            question_text: questionForm.question_text,
            description: questionForm.description,
            image_url: questionForm.image_url,
            options: questionForm.options,
            correct_option: questionForm.correct_answer,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save question");
      setShowQuestionModal(false);
      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/manager-quiz/delete-question/${questionId}`,
        { method: "DELETE", headers: { token } },
      );
      if (!response.ok) throw new Error("Failed to delete question");
      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-playfair text-2xl">
        {pageError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative pb-20">
      {/* Navbar (Kept consistent with Dashboard) */}
      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link
            to="/"
            className="btn btn-ghost text-xl text-white ml-2 font-playfair"
          >
            Kyubiko
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            <li>
              <Link
                to="/manager-dashboard"
                className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Museum
              </Link>
            </li>
            <li>
              <Link
                to="/explore"
                className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                to="/tours"
                className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Tours
              </Link>
            </li>
            <li>
              <Link
                to="/quiz"
                className="text-accent-yellow bg-white/10 rounded-lg"
              >
                Quiz
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">
              {user?.username}
            </span>
          </div>
          <UserAvatarMenu user={user} />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {!hasQuiz ? (
          /* --- EMPTY STATE --- */
          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-10 text-center flex flex-col items-center justify-center min-h-100">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-dark-chocolate/40" />
            </div>
            <h2 className="font-playfair text-4xl font-bold mb-4">
              No Quiz Created Yet
            </h2>
            <p className="text-dark-chocolate/70 mb-8 max-w-md">
              Engage your visitors by testing their knowledge. Create an
              interactive quiz tailored to your museum's artifacts.
            </p>
            <button
              onClick={() => handleOpenQuizModal(false)}
              className="btn bg-accent-orange text-white border-none hover:bg-orange-600 px-8"
            >
              <Plus size={18} className="mr-1" /> Create Museum Quiz
            </button>
          </div>
        ) : (
          /* --- ACTIVE QUIZ STATE --- */
          <>
            <section className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-7 relative mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                  Museum Quiz
                </p>
                <h1 className="font-playfair text-4xl font-bold text-dark-chocolate mb-2">
                  {quizDetails.quiz_title}
                </h1>
                <p className="text-dark-chocolate/70 font-medium">
                  Total Points Available:{" "}
                  <span className="text-accent-orange font-bold">
                    {quizDetails.total_points}
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleOpenQuizModal(true)}
                  className="btn btn-outline border-dark-chocolate text-dark-chocolate hover:bg-dark-chocolate hover:text-white"
                >
                  <Pencil size={16} /> Edit Quiz Info
                </button>
                <button
                  onClick={() => handleOpenQuestionModal(null)}
                  className="btn bg-dark-chocolate text-white border-none hover:bg-accent-orange"
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
            </section>

            <section className="space-y-6">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="group bg-white border border-dark-chocolate/10 rounded-2xl shadow-sm p-6 relative transition-all hover:shadow-md"
                >
                  {/* Question Action Buttons */}
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenQuestionModal(q)}
                      className="p-2 rounded-full bg-stone-100 text-dark-chocolate hover:bg-accent-yellow transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-full bg-stone-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Question Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-dark-chocolate text-accent-yellow font-playfair font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-playfair text-2xl font-bold text-dark-chocolate pr-16">
                          {q.question_text}
                        </h3>
                      </div>

                      {q.description && (
                        <p className="text-dark-chocolate/70 text-sm mb-6 pl-11">
                          {q.description}
                        </p>
                      )}

                      {q.image_url && (
                        <div className="ml-11 mb-6 rounded-xl overflow-hidden h-48 max-w-sm bg-stone-200 border border-stone-300">
                          <img
                            src={q.image_url}
                            alt="Question Context"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Options */}
                    <div className="flex-1 lg:max-w-sm">
                      <p className="text-xs font-bold text-stone-500 uppercase mb-3">
                        Options
                      </p>
                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correct_answer === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg border-2 flex items-center justify-between transition-colors ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-stone-200 bg-stone-50"
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${isCorrect ? "text-green-800" : "text-stone-700"}`}
                              >
                                {opt}
                              </span>
                              {isCorrect && (
                                <CheckCircle2
                                  size={18}
                                  className="text-green-500"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {q.description && (
                    <div className="mt-5 border-t border-stone-200 pt-4 text-sm text-dark-chocolate/80">
                      <span className="font-bold">Description:</span> {q.description}
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-10 text-dark-chocolate/60 bg-white rounded-2xl border border-dark-chocolate/10">
                  No questions added yet.
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* --- QUIZ DETAILS MODAL --- */}
      {showQuizModal && (
        <dialog className="modal modal-open z-50 bg-black/60 backdrop-blur-sm">
          <div className="modal-box bg-white p-8 rounded-2xl max-w-md relative">
            <button
              onClick={() => setShowQuizModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
            >
              <X size={16} />
            </button>
            <h3 className="font-playfair text-3xl font-bold mb-6 text-dark-chocolate">
              {hasQuiz && quizForm.quiz_title ? "Edit Quiz" : "Create Quiz"}
            </h3>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizForm.quiz_title}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, quiz_title: e.target.value })
                  }
                  placeholder="e.g. Ancient Artifacts Trivia"
                  className="input input-bordered w-full border-2 border-dark-chocolate/20 focus:border-accent-orange bg-stone-50 text-stone-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-1">
                  Total Points
                </label>
                <input
                  type="number"
                  value={quizForm.total_points}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, total_points: e.target.value })
                  }
                  placeholder="e.g. 100"
                  className="input input-bordered w-full border-2 border-dark-chocolate/20 focus:border-accent-orange bg-stone-50 text-stone-800"
                />
              </div>
              <button
                onClick={handleSaveQuiz}
                className="btn bg-accent-orange text-white hover:bg-orange-600 w-full mt-4 border-none"
              >
                Save Quiz Details
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* --- QUESTION MODAL --- */}
      {showQuestionModal && (
        <dialog className="modal modal-open z-50 bg-black/60 backdrop-blur-sm">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-stone-50 rounded-2xl flex flex-col md:flex-row relative">
            <button
              onClick={() => setShowQuestionModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 z-20 bg-white/80"
            >
              <X size={16} />
            </button>

            {/* Left Column: Image & Base Info */}
            <div className="md:w-5/12 bg-stone-200 flex flex-col relative min-h-62.5">
              {questionForm.image_url ? (
                <img
                  src={questionForm.image_url}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                  <ImageIcon size={48} className="mb-2" />
                  <p className="text-sm font-medium">No Image Uploaded</p>
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
              <label className="absolute bottom-6 left-1/2 -translate-x-1/2 btn btn-sm bg-white/90 text-dark-chocolate border-none cursor-pointer hover:bg-white shadow-lg">
                {uploadingImage ? "Uploading..." : "Upload Context Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Right Column: Form Fields */}
            <div className="p-8 md:w-7/12 space-y-6">
              <h3 className="font-playfair text-3xl font-bold text-dark-chocolate">
                {questionForm.id ? "Edit Question" : "Add Question"}
              </h3>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-1">
                  Question Text
                </label>
                <textarea
                  rows={2}
                  value={questionForm.question_text}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      question_text: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered w-full border-2 border-dark-chocolate/20 focus:border-accent-orange bg-white text-stone-800 text-lg font-medium"
                  placeholder="What is..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-1">
                  Additional Description / Hint
                </label>
                <input
                  type="text"
                  value={questionForm.description}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      description: e.target.value,
                    })
                  }
                  className="input input-bordered w-full border-2 border-dark-chocolate/20 bg-white text-stone-800"
                  placeholder="Optional context for the question..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-3">
                  Answers (Select Correct One)
                </label>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-colors ${questionForm.correct_answer === idx ? "border-accent-orange bg-orange-50" : "border-transparent bg-white shadow-sm"}`}
                    >
                      <button
                        onClick={() =>
                          setQuestionForm({
                            ...questionForm,
                            correct_answer: idx,
                          })
                        }
                        className={`p-1 rounded-full transition-colors ${questionForm.correct_answer === idx ? "text-accent-orange" : "text-stone-300 hover:text-stone-500"}`}
                      >
                        {questionForm.correct_answer === idx ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>
                      <input
                        type="text"
                        value={questionForm.options[idx]}
                        onChange={(e) =>
                          handleOptionChange(idx, e.target.value)
                        }
                        placeholder={`Option ${idx + 1}`}
                        className="input input-bordered input-sm w-full border-stone-300 bg-white text-stone-800 focus:border-accent-orange"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveQuestion}
                  disabled={uploadingImage}
                  className="btn bg-dark-chocolate text-white hover:bg-accent-orange w-full border-none shadow-md"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
