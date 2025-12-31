import React from "react";
import Card from "../components/common/Card";

export default function Search() {

    
  return (
    <>
      <div className="relative min-h-screen bg-old-paper font-dmsans text-dark flex flex-col">
        {/* Noise Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-15 bg-noise mix-blend-multiply"></div>

        {/* --- Navbar --- */}
        <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-black"
              >
                <li>
                  <a>My Museums</a>
                </li>
                <li>
                  <a>Explore</a>
                </li>
                <li>
                  <a>Book a Tour</a>
                </li>
              </ul>
            </div>
            <a className="btn btn-ghost text-xl text-white ml-2">Kyubiku</a>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-5 text-white">
              <li>
                <a>My Museums</a>
              </li>
              <li>
                <a>Explore</a>
              </li>
              <li>
                <a>Book a Tour</a>
              </li>
            </ul>
          </div>
          <div className="navbar-end">
            <div className="avatar avatar-online avatar-placeholder mr-5">
              <div className="bg-white text-neutral-content w-10 rounded-full ring ring-offset-2 ring-offset-dark-chocolate ring-white">
                <span className="text-black">U</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Section with Image & Search --- */}
        <div className="relative h-100 w-full">
          <img
            src="https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=2070&auto=format&fit=crop"
            alt="bg-pic"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide">
              Step Into the Unknown
            </h1>
            <p className="text-gray-200 mb-8 max-w-lg">
              Explore thousands of years of history through our digital
              archives.
            </p>

            <div className="join w-full max-w-2xl shadow-xl">
              <input
                type="text"
                placeholder="Search for sculptures, authors, artifacts..."
                className="input input-bordered join-item w-full bg-white h-14 text-lg focus:outline-none border-none pl-6"
              />
              <button className="btn btn-primary join-item h-14 px-8 text-lg bg-amber-400 hover:bg-amber-500 border-none text-white">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="grow container mx-auto px-4 py-12 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="col-span-1">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-stone-200 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-stone-800">Filters</h3>
                  <button className="text-xs text-orange-700 hover:underline">
                    Reset
                  </button>
                </div>

                {/* Filter Group 1: Region/Country */}
                <div className="mb-6">
                  <select
                    defaultValue="Pick a color"
                    className="select bg-white border border-black"
                  >
                    <option disabled={true}>Pick a region</option>
                    <option>Italy</option>
                    <option>Bangladesh</option>
                    <option>Egypt</option>
                  </select>
                </div>

                {/* Filter Group 2: Material */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    Category
                  </h4>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3 py-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <span className="label-text">Sculpture</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3 px-3 py-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <span className="label-text">Art</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3 py-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <span className="label-text">Artefact</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Search Results */}
            <div className="col-span-1 md:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800">
                  99 items found
                </h2>
                <select className="select select-sm select-bordered w-full max-w-xs bg-white">
                  <option disabled selected>
                    Sort by
                  </option>
                  <option>Newest Added</option>
                  <option>Oldest Artefact</option>
                  <option>Most Popular</option>
                </select>
              </div>

              {/* Artefact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  key={1}
                  name={`Ancient Vase #1`}
                  image={`https://images.unsplash.com/photo-1758854487462-20be3e37eb78?q=80&w=1750&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                  description="Recovered from the lower Nile region, circa 1200 BC."
                />
              </div>

              {/* Pagination */}
              <div className="join flex justify-center mt-12">
                <div className="join gap-3">
                    <button className="join-item btn bg-white text-black">«</button>
                    <button className="join-item btn bg-white text-black">Page 1</button>
                  <button className="join-item btn bg-white text-black">»</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
