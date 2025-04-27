import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const navbarRef = React.useRef(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Measure navbar height and apply it to the document body
  useEffect(() => {
    if (navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      setNavbarHeight(height);
      document.body.style.paddingTop = `${height}px`;
    }

    return () => {
      document.body.style.paddingTop = '0';
    };
  }, [scrolled]); // Re-measure when scrolled state changes as height might change

  const logout = () => {
    localStorage.removeItem("token");
    setToken(false);
    navigate("/login");
  };

  // Animation variants
  const navbarVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const navLinkVariants = {
    hover: { scale: 1.05, color: "#00A0C6", transition: { duration: 0.2 } },
  };

  const activeLink = ({ isActive }) =>
    isActive
      ? "text-primary font-bold relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
      : "";

  // Navigation items with icons
  const navItems = [
    { 
      path: "/", 
      label: "HOME", 
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
    },
    { 
      path: "/doctors", 
      label: "DOCTORS", 
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
    },
    { 
      path: "/about", 
      label: "ABOUT", 
      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    },
    { 
      path: "/location", 
      label: "FIND LOCATION", 
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
    },
    { 
      path: "/my-appointments", 
      label: "APPOINTMENT", 
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
    },
    { 
      path: "/pharmacy", 
      label: "PHARMACY", 
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
    },
    { 
      path: "/diagnosis", 
      label: "DIAGNOSIS", 
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
    },
    { 
      path: "/contact", 
      label: "CONTACT", 
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
    },
  ];

  return (
    <motion.div
      ref={navbarRef}
      initial="initial"
      animate="animate"
      variants={navbarVariants}
      className={`fixed top-0 left-0 right-0 z-50 py-2 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg py-1" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.img
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
            className="w-32 h-10 object-contain cursor-pointer"
            src={assets.logo}
            alt="Logo"
          />

          {/* Desktop Navigation */}
          <ul className="md:flex items-center gap-6 font-medium hidden">
            {navItems.map((item) => (
              <motion.li
                key={item.path}
                whileHover="hover"
                variants={navLinkVariants}
                className="relative py-2"
              >
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `flex items-center gap-1.5 ${isActive 
                      ? "text-primary font-bold" 
                      : "text-gray-700 hover:text-primary"}`
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </NavLink>
              </motion.li>
            ))}
          </ul>

          {/* Account Section */}
          <div className="flex items-center gap-4">
            {token && userData ? (
              <div className="flex items-center gap-2 cursor-pointer group relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 bg-gray-100 p-2 rounded-full"
                >
                  <img
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary"
                    src={userData.image}
                    alt=""
                  />
                  <span className="font-medium text-gray-700 hidden md:block">
                    {userData.name?.split(" ")[0]}
                  </span>
                  <img
                    className="w-2.5 transition-transform group-hover:rotate-180"
                    src={assets.dropdown_icon}
                    alt=""
                  />
                </motion.div>
                <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-w-48 bg-white shadow-xl rounded-lg flex flex-col gap-2 p-4 border border-gray-100"
                  >
                    <motion.p
                      whileHover={{ x: 5 }}
                      onClick={() => navigate("/my-profile")}
                      className="hover:text-primary cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      My Profile
                    </motion.p>
                    <motion.p
                      whileHover={{ x: 5 }}
                      onClick={() => navigate("/my-appointments")}
                      className="hover:text-primary cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      My Appointments
                    </motion.p>
                    <div className="border-t border-gray-100 my-1"></div>
                    <motion.p
                      whileHover={{ x: 5 }}
                      onClick={logout}
                      className="text-red-500 hover:text-red-600 cursor-pointer py-2 px-3 rounded-md hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Logout
                    </motion.p>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="bg-primary text-white px-6 py-2 rounded-full font-medium hidden md:flex items-center gap-2 shadow-lg shadow-primary/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Create account
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(true)}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center md:hidden cursor-pointer"
            >
              <img className="w-5" src={assets.menu_icon} alt="" />
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileMenuVariants}
                className="fixed inset-0 bg-white z-50 md:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between px-5 py-6 border-b">
                  <img src={assets.logo} className="w-28 h-8 object-contain" alt="" />
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMenu(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <img src={assets.cross_icon} className="w-5" alt="" />
                  </motion.div>
                </div>

                <div className="p-5">
                  {token && userData && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                      <img
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                        src={userData.image}
                        alt=""
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {userData.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <ul className="flex flex-col gap-2 text-lg font-medium">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        onClick={() => setShowMenu(false)}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg ${
                            isActive
                              ? "bg-primary text-white"
                              : "hover:bg-gray-50"
                          }`
                        }
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
                            strokeWidth={2}
                            d={item.icon}
                          />
                        </svg>
                        {item.label}
                      </NavLink>
                    ))}
                  </ul>

                  {token && userData ? (
                    <div className="mt-8 flex flex-col gap-3">
                      <NavLink
                        onClick={() => setShowMenu(false)}
                        to="/my-profile"
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-primary"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        My Profile
                      </NavLink>
                      <NavLink
                        onClick={() => setShowMenu(false)}
                        to="/my-appointments"
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-primary"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        My Appointments
                      </NavLink>
                      <button
                        onClick={() => {
                          logout();
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg mt-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        navigate("/login");
                        setShowMenu(false);
                      }}
                      className="w-full mt-8 bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;