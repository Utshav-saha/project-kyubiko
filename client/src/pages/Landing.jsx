import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

import Card from "../components/common/Card.jsx";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Landing = () => {
  const container = useRef();
  const slides = [
    {
      id: 1,
      image: "src/assets/colosseum.svg",
      title: "Colosseum, Rome, Italy",
      text: "Uncover the secrets of the gladiators at the Roman Colosseum.",
      bgColor: "bg-[#FFE55C]",
    },
    {
      id: 2,
      image: "src/assets/pyramid.svg",
      title: "Pyramids, Egypt",
      text: "Explore the City of Pharaohs and the ancient pyramids of Giza.",
      bgColor: "bg-[#FF7043]",
    },
    {
      id: 3,
      image: "src/assets/taj.svg",
      title: "Taj Mahal, India",
      text: "An immense mausoleum of white marble, built in Agra between 1631 and 1648.",
      bgColor: "bg-[#4DB6AC]",
    },
  ];

  const [artefacts, setArtefacts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/landing/top-artifacts`)
      .then((response) => response.json())
      .then((data) => setArtefacts(data))
      .catch((error) => console.error("Error fetching artefacts:", error));
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".hero-text-anim", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      })
        .from(
          ".hero-img-left",
          { x: -100, opacity: 0, duration: 1.2, ease: "power2.out" },
          "-=0.8",
        )
        .from(
          ".hero-img-right",
          { x: 100, opacity: 0, duration: 1.2, ease: "power2.out" },
          "-=1.2",
        );

      gsap.to(".axe-anim", {
        y: -50,
        rotation: 25,
        scrollTrigger: {
          trigger: ".axe-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".horse-anim", {
        y: -80,
        scrollTrigger: {
          trigger: ".axe-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.from(".misc-grid-item", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".misc-grid-container",
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: container },
  );

  useGSAP(
    () => {
      if (artefacts.length === 0) return;

      gsap.fromTo(
        ".artefact-card",
        {
          opacity: 0,
          y: 100,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".artefact-section",
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: container, dependencies: [artefacts] },
  );

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-old-paper font-dmsans text-dark"
    >
      {/* Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-15 bg-noise mix-blend-multiply"></div>

      {/* Content */}
      <div className="relative z-0 flex flex-col min-h-screen">
        <header className="bg-dark-chocolate min-h-[80vh] flex flex-col relative overflow-hidden">
          {/* --- Navbar --- */}
          <div className="navbar shadow-sm bg-transparent z-20">
            <div className="navbar-start">
              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-dash lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex="-1"
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-white"
                >
                  <li>
                    <Link to="/login">Login/Signup</Link>
                  </li>
                  
                </ul>
              </div>
              <a className="btn btn-ghost text-xl text-white ml-5">Kyubiku</a>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 text-white">
                {/* <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/login">Explore</Link>
                </li>
                <li>
                  <Link to="/login">Archive</Link>
                </li> */}
              </ul>
            </div>
            <div className="navbar-end">
              <Link
                to="/login"
                className="btn btn-dash border-white text-white mr-5"
              >
                Login / Sign up
              </Link>
            </div>
          </div>

          {/* --- HERO SECTION --- */}
          <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center grow gap-12 lg:gap-24">
            <div className="relative w-full lg:w-1/2 max-w-125 h-100 lg:h-125">
              <div className="hero-img-left absolute top-10 left-10 w-48 max-h-40 bg-[#FFE55C] flex items-end justify-center shadow-lg z-10">
                <img
                  src="src/assets/woman.png"
                  alt="Statue Woman"
                  className="w-[130%] max-w-none h-auto -mt-24 object-cover object-top grayscale contrast-125 drop-shadow-lg"
                />
              </div>

              <div className="hero-img-right absolute bottom-15 right-10 lg:right-20 w-44 h-32 bg-[#FF7043] flex items-end justify-center shadow-lg z-20">
                <img
                  src="src/assets/head.png"
                  alt="Statue Man"
                  className="w-full max-w-none h-auto -mt-20 object-cover object-top grayscale contrast-125 drop-shadow-lg"
                />
              </div>
            </div>

            <div className="w-full relative bottom-6 lg:w-1/2 text-white z-10">
              <h1 className="hero-text-anim text-5xl lg:text-7xl font-playfair leading-tight mb-8">
                Meet different <br />{" "}
                <span className="font-light italic font-playfair opacity-90">
                  cultures
                </span>{" "}
                from our <br />
                archive.
              </h1>

              <div className="hero-text-anim flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <Link to="/login">
                  <button className="bg-[#FFE55C] text-black px-8 py-3 font-dmsans font-bold uppercase tracking-wider hover:bg-[#ffd633] transition-colors rounded-md">
                    Get Started
                  </button>
                </Link>

                <p className="max-w-xs text-sm text-gray-300 border-l border-gray-500 pl-4 leading-relaxed font-dmsans">
                  History is an umbrella of past events as the memory,
                  discovery, collection, and interpretation of events.
                </p>
              </div>
            </div>
          </div>

          {/* Moving Texts */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden z-0">
            <div className="flex animate-scroll-text whitespace-nowrap py-4">
              <span className="text-2xl font-bold text-white/20 uppercase tracking-widest mx-4 [word-spacing:2rem]">
                Explore • Culture • History • Archive • Discover •
              </span>
            </div>
          </div>
        </header>

        <main className="grow">
          <section className="axe-section relative w-full bg-[#fcf8f3] py-20 font-dmsans text-[#3e2723] overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col lg:flex-row gap-12 items-start mb-12">
                {/* --- HEADING --- */}
                <div className="w-full lg:w-5/12 pt-10">
                  <h2 className="text-5xl lg:text-7xl font-playfair leading-none">
                    Discover — <br />
                    treasure{" "}
                    <span className="font-light italic font-playfair">
                      with
                    </span>{" "}
                    <br />
                    <span className="font-light italic font-playfair opacity-80">
                      historical
                    </span>
                    <span className="font-bold ml-3">value</span>
                  </h2>
                </div>

                {/* --- CAROUSEL --- */}
                <div className="w-full lg:w-7/12">
                  <div className="carousel w-full">
                    {slides.map((slide, index) => {
                      const prevSlide = index === 0 ? slides.length : index;
                      const nextSlide =
                        index === slides.length - 1 ? 1 : index + 2;

                      return (
                        <div
                          key={slide.id}
                          id={`slide${slide.id}`}
                          className="carousel-item relative w-full items-center justify-center transition-all duration-300"
                        >
                          <div className="w-full max-w-md relative px-6 sm:px-10">
                            <img
                              src={slide.image}
                              className="w-full h-48 object-cover object-center mb-6 "
                              alt={slide.title}
                            />
                            <div className="pt-2">
                              <h3 className="text-2xl font-playfair font-bold mb-2">
                                {slide.title}
                              </h3>
                              <p className="text-gray-600 max-w-xs text-sm leading-relaxed font-dmsans">
                                {slide.text}
                              </p>
                            </div>
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-20">
                              <a
                                href={`#slide${prevSlide}`}
                                className="btn btn-circle btn-sm btn-ghost text-xl hover:bg-white/50"
                              >
                                ❮
                              </a>
                            </div>
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20">
                              <a
                                href={`#slide${nextSlide}`}
                                className="btn btn-circle btn-sm btn-ghost text-xl hover:bg-white/50"
                              >
                                ❯
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Axe Card */}
              <div className="flex justify-center items-center flex-col lg:flex-row gap-12 lg:items-end lg:ml-10">
                <div className="w-full lg:w-5/12 relative">
                  <div className="relative w-full max-w-sm mt-24">
                    <div className="bg-white p-8 pt-24 shadow-xl border-l-4 border-[#FFE55C] relative z-10 h-72 flex flex-col justify-end">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-orange-100/50 to-transparent rounded-bl-full"></div>
                      <h3 className="text-2xl font-playfair font-bold mb-2">
                        Viking Axe
                      </h3>
                      <p className="text-sm text-gray-500 max-w-50 font-dmsans">
                        Served in the hunting and the fighting during the Viking
                        Age.
                      </p>
                    </div>

                    <div className="absolute -top-20 -right-6 w-56 z-20 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
                      <img
                        src="src/assets/axe.png"
                        alt="Viking Axe"
                        className="axe-anim w-full h-72 object-contain rotate-15 contrast-125"
                      />
                    </div>
                  </div>
                </div>

                {/* --- HORSE CARD --- */}
                <div className="w-full lg:w-7/12 flex justify-center lg:justify-end mr-10">
                  <div className="relative w-full max-w-sm mt-24">
                    <div className="bg-white p-8 pt-24 shadow-xl border-l-4 border-[#4DB6AC] relative z-10 h-72 flex flex-col justify-end">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-orange-100/50 to-transparent rounded-bl-full"></div>
                      <h3 className="text-2xl font-playfair font-bold mb-2">
                        Roman Horse
                      </h3>
                      <p className="font-dmsans text-sm text-gray-500 max-w-50">
                        A bronze masterpiece capturing the spirit of the Roman
                        cavalry.
                      </p>
                    </div>

                    <div className="absolute -top-24 -right-8 w-72 z-20 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
                      {/* Added class: horse-anim */}
                      <img
                        src="src/assets/horse.png"
                        className="horse-anim w-full h-auto object-contain"
                        alt="Roman Horse"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Top Artefacts items */}
          <section className="artefact-section w-full min-h-170 bg-dark-chocolate">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-5">
              <div className="col-span-1 lg:col-span-2 mt-10">
                <span className="font-playfair text-white text-4xl p-5 block sm:inline">
                  Artwork
                </span>
                <span className="font-imperial text-white text-6xl px-5 sm:px-0">
                  Collections
                </span>
              </div>
              <div className="mt-10">
                <h2 className="font-dmsans text-white lg:text-left sm:ml-5">
                  <span>We gathered artwork from</span>
                  <br />
                  <span>all across the world</span>
                </h2>
              </div>
              <div className="mt-10 flex justify-start lg:justify-center items-start">
                <a className="btn btn-dash border-white text-white sm:ml-5" href="/login">
                  Book a Tour
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-5 justify-items-center">
              {artefacts.map((artefact, index) => (
                <div
                  key={index}
                  className="artefact-card w-full flex justify-center"
                >
                  <Card
                    name={artefact.artifact_name}
                    image={artefact.picture_url}
                    description={artefact.description}
                    creator={artefact.creator}
                    time_period={artefact.time_period}
                    acquisition_date={artefact.acquisition_date}
                    museum_name={artefact.museum_name}
                    category={artefact.category_name}
                    origin={artefact.origin}
                    artifactId={artefact.artifact_id}
                    userRole="guest"
                    wishlist={[]}
                    setWishlist={() => {}}
                    setPopMsg={() => {}}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Misc things */}
          <section className="misc-grid-container content-start mt-15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 auto-rows-[180px] gap-4 mx-4 lg:mx-15">
            <div className="misc-grid-item border border-dashed border-brown rounded-2xl overflow-hidden ">
              <h4 className="text-dark font-dmsans font-semibold p-5">
                SAT-THU | 1PM - 6PM
              </h4>
              <h4 className="text-dark font-dmsans font-semibold px-5 pb-5">
                Visit the basic of
                <br />
                sculpture art
              </h4>
            </div>

            <div className="misc-grid-item border border-dashed border-brown rounded-2xl hidden md:block "></div>

            <div className="misc-grid-item border border-dashed border-brown rounded-2xl p-4 flex justify-center items-center overflow-hidden ">
              <img
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                src="src/assets/boy2.png"
                alt="Boy"
              />
            </div>

            <div className="misc-grid-item col-span-1 lg:col-span-2 border border-dashed border-brown rounded-2xl p-4 flex justify-between items-center ">
              <div className="flex flex-col justify-center z-10">
                <span className="text-3xl lg:text-4xl text-dark font-playfair font-semibold">
                  Awards
                </span>
                <span className="text-4xl lg:text-5xl text-dark font-semibold font-imperial">
                  Masterpiece
                </span>
              </div>
              <div className="h-full flex justify-center items-center overflow-hidden">
                <img
                  className="max-h-30 w-auto object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                  src="src/assets/scar.png"
                  alt="Scar"
                />
              </div>
            </div>

            <div className="misc-grid-item col-span-1 lg:col-span-2 row-span-1 lg:row-span-2 border border-dashed border-brown rounded-2xl p-4 flex justify-center items-center overflow-hidden ">
              <img
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                src="src/assets/dinosaur.png"
                alt="Dinosaur"
              />
            </div>

            <div className="misc-grid-item border border-dashed border-brown rounded-2xl p-4 flex justify-center items-center overflow-hidden ">
              <img
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                src="src/assets/standing.png"
                alt="Standing"
              />
            </div>

            <div className="misc-grid-item col-span-1 lg:col-span-2 border border-dashed border-brown rounded-2xl p-4 flex items-center">
              <h4 className="text-dark font-dmsans font-semibold">
                Art museum or art gallery is a place for the display of art,
                usually from the museum's own collection.
              </h4>
            </div>

            <div className="misc-grid-item border border-dashed border-brown rounded-2xl p-4 flex items-center">
              <h4 className="text-dark font-dmsans font-semibold">
                Public inspired & educated by art work
              </h4>
            </div>

            <div className="misc-grid-item relative col-span-1 lg:col-span-2 border border-dashed border-brown rounded-2xl p-4 flex justify-center items-center overflow-visible ">
              <div className="absolute z-0 w-2/3 h-3/5 bg-[#4DB6AC] rounded-xl transform translate-y-3 shadow-sm"></div>
              <img
                className="relative z-10 h-full w-auto object-contain transition-transform duration-300 hover:scale-110 cursor-pointer drop-shadow-md"
                src="src/assets/angel.png"
                alt="Angel"
              />
            </div>
          </section>

          {/* Footer*/}
          <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10 mt-15">
            <nav>
              <h6 className="footer-title">Services</h6>
              <a className="link link-hover">Branding</a>
              <a className="link link-hover">Design</a>
              <a className="link link-hover">Marketing</a>
              <a className="link link-hover">Advertisement</a>
            </nav>
            <nav>
              <h6 className="footer-title">Company</h6>
              <a className="link link-hover">About us</a>
              <a className="link link-hover">Contact</a>
            </nav>
            <nav>
              <h6 className="footer-title">Legal</h6>
              <a className="link link-hover">Terms of use</a>
              <a className="link link-hover">Privacy policy</a>
              <a className="link link-hover">Cookie policy</a>
            </nav>
          </footer>
          <footer className="footer bg-base-200 text-base-content border-base-300 border-t px-10 py-4">
            <aside className="grid-flow-col items-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
                className="fill-current"
              >
                <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
              </svg>
              <p>
                Ussop-Ahnaf Industries Ltd.
                <br />
                Providing reliable tech since 2025
              </p>
            </aside>
            <nav className="md:place-self-center md:justify-self-end">
              <div className="grid grid-flow-col gap-4">
                <a>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                  </svg>
                </a>
                <a>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                  </svg>
                </a>
              </div>
            </nav>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Landing;
