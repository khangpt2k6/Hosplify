import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const [isLoaded, setIsLoaded] = useState(false);
  
  // Add scroll-based animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.2, 1]);
  
  useEffect(() => {
    // Simulate content loading
    setTimeout(() => setIsLoaded(true), 300);
  }, []);

  // Enhanced animation configurations
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  const fadeInLeft = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  // Floating animation for decorative elements
  const floating = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: { 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      comment: "Hospify transformed how I manage my healthcare appointments. The interface is intuitive and the reminders are lifesavers!",
    },
    {
      name: "Dr. Michael Chen",
      role: "Healthcare Provider",
      comment: "As a physician, I appreciate how Hospify streamlines the appointment process and keeps my schedule organized.",
    },
    {
      name: "Emma Rodriguez",
      role: "Clinic Administrator",
      comment: "The platform has significantly reduced our no-show rates and improved patient satisfaction scores.",
    }
  ];

  const stats = [
    { value: "98%", label: "Patient Satisfaction" },
    { value: "24/7", label: "Support Available" },
    { value: "500+", label: "Healthcare Partners" }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50">
      {/* Decorative Elements */}
      <motion.div 
        className="absolute top-20 right-10 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl" 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-96 left-0 w-96 h-96 bg-teal-100 rounded-full opacity-30 blur-3xl" 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        {/* Hero Section with Animation */}
        <motion.div 
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={staggerContainer}
          className="mb-32 pt-10"
        >
          <motion.div 
            variants={fadeIn} 
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
              ABOUT <span className="font-black">US</span>
            </h1>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-blue-600 rounded-full mx-auto mt-6"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
              Transforming healthcare experiences through innovation and technology
            </p>
          </motion.div>

          {/* Hero Animation - Pulse Effect around image */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative w-full max-w-4xl mx-auto h-40 sm:h-64 md:h-80 lg:h-96 mb-10"
          >
            <motion.div 
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-primary flex items-center justify-center overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="relative z-10 text-white text-center px-8"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Healthcare Reimagined</h2>
                  <p className="text-lg md:text-xl">Making your health journey simpler, safer, and smarter</p>
                </motion.div>

                {/* Animated circles */}
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    className="absolute inset-0 border-4 border-white/20 rounded-full"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ 
                      scale: [0.4, 2.5, 2.5], 
                      opacity: [0, 0.5, 0] 
                    }}
                    transition={{ 
                      duration: 4, 
                      delay: i * 1.5, 
                      repeat: Infinity,
                      repeatDelay: 1 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mb-32"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl shadow-xl overflow-hidden text-center py-10 px-6 border-b-4 border-primary"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="mb-4"
                >
                  <span className="text-5xl font-black text-primary">{stat.value}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-700">{stat.label}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About Content Section with parallax effect */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="flex flex-col lg:flex-row gap-16 mb-32 items-center"
          style={{ opacity }}
        >
          <motion.div variants={fadeInRight} className="lg:w-1/2">
            <div className="relative">
              <motion.div 
                className="absolute -top-6 -left-6 w-32 h-32 bg-blue-100 rounded-lg z-0"
                variants={floating}
                initial="initial"
                animate="animate" 
              />
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <img 
                  className="w-full max-w-lg rounded-2xl shadow-2xl relative z-10 border-4 border-white" 
                  src={assets.about_image} 
                  alt="Healthcare professionals" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl z-20" />
              </motion.div>
              <motion.div 
                className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/10 rounded-lg z-0"
                variants={floating}
                initial="initial"
                animate="animate"
                custom={1}
              />
            </div>
          </motion.div>

          <motion.div variants={fadeInLeft} className="lg:w-1/2">
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -top-10 -left-10 text-8xl font-black text-primary/10"
              >
                01
              </motion.div>
              <h2 className="text-4xl font-bold mb-8 text-gray-800 relative z-10">Our Story</h2>
            </div>
            <div className="space-y-6 text-gray-600">
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="leading-relaxed text-lg"
              >
                Welcome to <span className="font-bold text-primary">Hospify</span>, your trusted partner in managing your healthcare needs conveniently and efficiently. At Hospify, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="leading-relaxed text-lg"
              >
                Hospify is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Hospify is here to support you every step of the way.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="pt-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-primary mr-3"></span>
                  Our Vision
                </h3>
                <p className="leading-relaxed text-lg pl-9">
                  Our vision at Hospify is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="mb-32"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-black text-primary/5 -z-10 w-full text-center"
              >
                EXCELLENCE
              </motion.div>
              <h2 className="text-4xl font-bold relative z-10">
                WHY <span className="text-primary">CHOOSE US</span>
              </h2>
            </div>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-blue-600 rounded-full mx-auto mt-6"></div>
          </motion.div>

          {/* Features cards with enhanced visual effects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "EFFICIENCY",
                description: "Streamlined appointment scheduling that fits into your busy lifestyle with smart calendar integration and instant confirmations.",
                icon: "⚡",
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "CONVENIENCE",
                description: "Access to a network of trusted healthcare professionals in your area with virtual consultations and flexible scheduling options.",
                icon: "🔄",
                color: "from-primary to-teal-500"
              },
              {
                title: "PERSONALIZATION",
                description: "Tailored recommendations and reminders to help you stay on top of your health with AI-powered insights and custom care plans.",
                icon: "👤",
                color: "from-purple-500 to-primary"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                custom={index}
                whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer relative"
              >
                <div className="h-2 bg-gradient-to-r bg-primary"></div>
                <div className="p-8">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-8 text-3xl text-white shadow-lg"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                    className="h-0.5 bg-gradient-to-r from-primary/50 to-transparent mt-6"
                  />
                  
                  <div className="mt-8 flex justify-end">
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="flex items-center text-primary font-semibold"
                    >
                      Learn more 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
                
                {/* Background gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section with card slider effect */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="mb-32"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold">
              WHAT OUR <span className="text-primary">USERS SAY</span>
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-blue-600 rounded-full mx-auto mt-6"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-xl relative"
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-primary/10 text-6xl font-serif">"</div>
                
                <div className="flex items-center mb-6">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{testimonial.name}</h4>
                    <p className="text-primary">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 italic relative z-10">{testimonial.comment}</p>
                
                {/* Rating stars */}
                <div className="flex mt-6 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action with enhanced design */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 rounded-3xl"></div>
          
          {/* Animated shapes in background */}
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-20 w-40 h-40 bg-white/10 rounded-full"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <div className="relative z-10 p-12 text-center text-white">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-6"
            >
              Ready to experience better healthcare management?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto mb-10 text-lg"
            >
              Join thousands of satisfied users who have transformed their healthcare experience with Hospify.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold hover:bg-white/90 transition-all duration-300 shadow-lg text-lg"
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;