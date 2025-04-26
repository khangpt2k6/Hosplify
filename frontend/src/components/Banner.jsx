import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl px-6 sm:px-10 md:px-14 lg:px-16 my-20 md:mx-10 transform transition-all duration-300 hover:shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute bottom-10 left-1/4 w-60 h-60 rounded-full bg-blue-300"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-blue-200"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start">
        {/* ------- Left Side ------- */}
        <div className="flex-1 py-12 sm:py-14 md:py-20 lg:py-24 z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Find and Book the Care <br className="hidden sm:block" />
            <span className="text-blue-200">You Deserve</span>
          </h1>

          <p className="mt-6 text-blue-100 text-sm sm:text-base md:text-lg max-w-lg">
            Connect with top healthcare professionals and schedule appointments
            with just a few clicks. Your health journey starts here.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => {
                navigate("/login");
                scrollTo(0, 0);
              }}
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-medium hover:bg-blue-50 transform transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              Create Account
            </button>

            <button
              onClick={() => {
                navigate("/doctors");
                scrollTo(0, 0);
              }}
              className="border-2 border-blue-200 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transform transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Find Doctors
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center space-x-8">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="ml-2 text-blue-100">Verified Doctors</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-2 text-blue-100">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* ------- Right Side ------- */}
        <div className="hidden md:block md:w-1/2 lg:w-2/5 relative">
          {/* Background Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full opacity-20"></div>
          
          {/* Floating elements */}
          <div className="absolute top-1/4 left-0 bg-white p-3 rounded-lg shadow-lg transform -translate-x-1/2 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="absolute bottom-1/4 right-0 bg-white p-3 rounded-lg shadow-lg transform translate-x-1/2 animate-pulse delay-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          
          {/* Nurse image with extra padding to push it down */}
          <div className="pt-40">
            <img
              className="relative z-10 transform transition-all duration-500 hover:translate-y-2 max-w-md"
              src={assets.appointment_img}
              alt="Doctor with patient"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;