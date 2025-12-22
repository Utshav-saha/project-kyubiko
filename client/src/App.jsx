import React from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);


function App() {
  return (
    <>
      <Login />
    </>
  );
}

export default App;
