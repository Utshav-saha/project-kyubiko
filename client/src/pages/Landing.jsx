import React from 'react';

const Landing = () =>{
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

  return (
    <div className="relative min-h-screen bg-old-paper font-dmsans text-dark">
      {/* Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-15 bg-noise mix-blend-multiply"></div>

      {/* Content */}
      <div className="relative z-0 flex flex-col min-h-screen">
        <header className="bg-dark-chocolate min-h-[80vh] flex flex-col relative overflow-hidden">
          {/* --- Navbar (Your existing code) --- */}
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
                    <a>Home</a>
                  </li>
                  <li>
                    <a>Explore</a>
                  </li>
                  <li>
                    <a>Archive</a>
                  </li>
                </ul>
              </div>
              <a className="btn btn-ghost text-xl text-white ml-5">Logo</a>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 text-white">
                <li>
                  <a>Home</a>
                </li>
                <li>
                  <a>Explore</a>
                </li>
                <li>
                  <a>Archive</a>
                </li>
              </ul>
            </div>
            <div className="navbar-end">
              <a className="btn btn-dash border-white text-white mr-5">
                Login / Sign up
              </a>
            </div>
          </div>

          {/* --- HERO SECTION --- */}
          <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center grow gap-12 lg:gap-24">
            <div className="relative w-full lg:w-1/2 max-w-125 h-100 lg:h-125">
              <div className="absolute top-10 left-10 w-48 max-h-40 bg-[#FFE55C] flex items-end justify-center shadow-lg z-10">
                <img
                  src="src/assets/woman.png"
                  alt="Statue Woman"
                  className="w-[130%] max-w-none h-auto -mt-24 object-cover object-top grayscale contrast-125 drop-shadow-lg"
                />
              </div>

              <div className="absolute bottom-15 right-10 lg:right-20 w-44 h-32 bg-[#FF7043] flex items-end justify-center shadow-lg z-20">
                {" "}
                <img
                  src="src/assets/head.png"
                  alt="Statue Man"
                  className="w-full max-w-none h-auto -mt-20 object-cover object-top grayscale contrast-125 drop-shadow-lg"
                />
              </div>
            </div>

            <div className="w-full relative bottom-6 lg:w-1/2 text-white z-10">
              <h1 className="text-5xl lg:text-7xl font-playfair leading-tight mb-8">
                Meet different <br />
                <span className="italic font-light font-playfair opacity-90">
                  of
                </span>{" "}
                <span className="font-light italic font-playfair opacity-90">
                  culture
                </span>{" "}
                from our <br />
                archive.
              </h1>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                {/* CTA Button */}
                <button className="bg-[#FFE55C] text-black px-8 py-3 font-dmsans font-bold uppercase tracking-wider hover:bg-[#ffd633] transition-colors">
                  Get Started
                </button>

                {/* Description Text */}
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
          <section className="relative w-full bg-[#fcf8f3] py-20 font-dmsans text-[#3e2723] overflow-hidden">
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
                        className="w-full h-72 object-contain rotate-15  contrast-125"
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
                      <img
                        src="src/assets/horse.png"
                        className="w-full h-auto object-contain"
                        alt="Roman Horse"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Top Artefacts items */}

          <section className="w-full min-h-96 bg-dark-chocolate">
            <div className="grid grid-cols-1 lg:grid-cols-4  gap-4 p-5">
              <div className="col-span-1 lg:col-span-2 mt-10">
                <span className="font-playfair text-white text-4xl p-5 block sm:inline">
                  Artwork
                </span>
                <span className="font-imperial text-white text-6xl px-5 sm:px-0">
                  Collections
                </span>
              </div>

              <div className=" mt-10">
                <h2 className="font-dmsans text-white lg:text-left sm: ml-5">
                  <span>We gathered artwork from</span>
                  <br />
                  <span>all across the world</span>
                </h2>
              </div>

              <div className="mt-10 flex justify-start lg:justify-center items-start ">
                <a className="btn btn-dash border-white text-white sm: ml-5">
                  Book a Tour
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4  gap-4 p-5">
                    

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Landing;
