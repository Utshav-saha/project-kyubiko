import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import MyMuseums from "./pages/MyMuseums";
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
        </Routes>
      </div>
    </>
  );
}

export default App;
