import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import MyMuseums from "./pages/MyMuseums";
import ViewMuseum from "./pages/ViewMuseum";
import GoToMuseum from "./pages/GoToMuseum";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Trivia from "./pages/Trivia";
import ManagerDashboard from "./pages/ManagerDashboard";
import CreateTour from "./pages/CreateTour";
import Tour from "./pages/Tour";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Question from "./pages/Question";
import Result from "./pages/Result";
import ManagerQuiz from "./pages/ManagerQuiz";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


function App() {
  return (
    <>
      <div>
        <Routes>
            <Route path="/" element={<Landing />}/>
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/my-museums" element={<MyMuseums />} />
            <Route path="/view-museum/:id" element={<ViewMuseum />} />
            <Route path="/go-to-museum/:id" element={<GoToMuseum />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/tours" element={<CreateTour />} />
            <Route path="/tour/:id" element={<Tour />} />
            <Route path="/tour/:museumId/payment/:timeSlotId" element={<Payment />} />
            <Route path="/tour/:museumId/payment-success/:bookingId" element={<PaymentSuccess />} />
            <Route path="/trivia/:id" element={<Trivia />} />
            <Route path="/trivia/:id/question" element={<Question />} />
            <Route path="/trivia/:id/result" element={<Result />} />
            <Route path="/leaderboard/:id" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/manager-quiz/:id" element={<ManagerQuiz />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
