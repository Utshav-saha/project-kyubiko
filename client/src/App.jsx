import React from "react";
import Landing from "./pages/Landing";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);


function App() {
  return (
    <>
      <Landing />
    </>
  );
}

export default App;
