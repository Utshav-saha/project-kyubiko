import React from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Search from "./pages/Search";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);


function App() {
  return (
    <>
      <Search />
    </>
  );
}

export default App;
