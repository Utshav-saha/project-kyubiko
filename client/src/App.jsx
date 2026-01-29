import React from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Search from "./pages/Search";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import MyMuseums from "./pages/MyMuseums";

gsap.registerPlugin(useGSAP);


function App() {
  return (
    <>
      <MyMuseums/>
      {/* <Search /> */}
      {/* <Login /> */}
      {/* <Landing /> */}
    </>
  );
}

export default App;
