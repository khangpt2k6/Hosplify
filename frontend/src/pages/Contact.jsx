import React from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";

const Contact = () => {
  // Animation configurations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const imageAnimation = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const contentAnimation = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  };

  return (
    <div className="py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center text-3xl lg:text-4xl pt-10 mb-16"
      >
        <p className="relative inline-block font-bold">
          CONTACT{" "}
          <span className="text-gray-800 font-extrabold relative">
            US
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></span>
          </span>
          <motion.span
            animate={pulseAnimation}
            className="absolute -top-6 -right-6 h-12 w-12 bg-blue-500/20 rounded-full blur-lg"
          ></motion.span>
        </p>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6"></div>
      </motion.div>

      <div className="container mx-auto px-4">
        <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageAnimation}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600/20 rounded-lg transform rotate-6 z-0"></div>
            <img
              className="w-full md:max-w-[400px] rounded-lg shadow-2xl relative z-10 hover:shadow-blue-500/20 transition-all duration-500"
              src={assets.contact_image}
              alt="Contact"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-600/20 rounded-lg transform -rotate-6 z-0"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={contentAnimation}
            className="flex flex-col justify-center items-start gap-6 bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/50"
          >
            <div className="w-full h-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-full mb-2"></div>

            <p className="font-bold text-xl text-gray-800 relative inline-block">
              OUR OFFICE
              <span className="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></span>
            </p>
            <p className="text-gray-600 flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mt-1 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                4202 East Fowler Avenue
                <br />
                Tampa, FL 33620
              </span>
            </p>

            <p className="text-gray-600 flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mt-1 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>
                Tel: (813)-570-4370 <br /> Email: hospifydev@gmail.com
              </span>
            </p>

            <p className="font-bold text-xl text-gray-800 relative inline-block mt-4">
              CAREERS AT HOSPIFY
              <span className="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></span>
            </p>

            <p className="text-gray-600 flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mt-1 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Learn more about our teams and job openings.</span>
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-blue-600 bg-gradient-to-r from-transparent to-transparent hover:from-blue-600 hover:to-purple-600 group px-8 py-4 text-sm font-bold rounded-lg hover:text-white transition-all duration-500 mt-4 relative overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-gray-800 transition-colors duration-300">
                Explore Jobs
              </span>
              <span className="absolute top-0 left-0 w-full h-full bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
            </motion.button>

            <div className="w-full h-1 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-full mt-4"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
