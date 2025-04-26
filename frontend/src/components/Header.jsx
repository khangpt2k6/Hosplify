import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'

const Header = () => {
    // Animation variants
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    const staggerChildren = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const pulseAnimation = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
            }
        }
    }

    return (
        <div className='mt-20 mb-16 overflow-hidden'> {/* Added margin-top to account for fixed navbar */}
            <div className='flex flex-col md:flex-row flex-wrap bg-gradient-to-br from-primary to-blue-700 rounded-2xl shadow-2xl relative px-6 md:px-10 lg:px-20'>
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05 }}
                        transition={{ duration: 1 }}
                        className="absolute -right-20 -top-20 w-64 h-64 bg-white rounded-full"
                    />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.07 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="absolute -left-12 bottom-10 w-40 h-40 bg-white rounded-full"
                    />
                </div>

                {/* --------- Header Left --------- */}
                <motion.div 
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                    className='md:w-1/2 flex flex-col items-start justify-center gap-6 py-12 m-auto md:py-[8vw] z-10'
                >
                    <motion.p 
                        variants={fadeIn}
                        className='text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white font-bold leading-tight tracking-tight'
                    >
                        Book Appointment <br className="md:block" /> With <span className="relative inline-block">
                            Trusted 
                            <motion.span 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1, duration: 1 }}
                                className="absolute bottom-1 left-0 h-2 bg-yellow-300 opacity-30 rounded"
                            />
                        </span> Doctors
                    </motion.p>
                    
                    <motion.div 
                        variants={fadeIn}
                        className='flex flex-col md:flex-row items-center gap-4 text-white/90 text-sm font-medium'
                    >
                        <div className="relative">
                            <img className='w-32 relative z-10' src={assets.group_profiles} alt="Trusted doctors" />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                                className="absolute -bottom-1 -right-1 bg-yellow-400 text-xs font-bold text-primary px-2 py-1 rounded-full z-20"
                            >
                                5000+ Doctors
                            </motion.div>
                        </div>
                        <p className="text-base backdrop-blur-sm bg-white/10 p-3 rounded-lg">
                            Simply browse through our extensive list of trusted doctors, 
                            <br className='hidden sm:block' /> schedule your appointment hassle-free.
                        </p>
                    </motion.div>
                    
                    <motion.div
                        variants={fadeIn}
                        className="flex gap-4 mt-2"
                    >
                        <motion.a 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            href='#speciality' 
                            className='group flex items-center gap-2 bg-white px-8 py-4 rounded-full text-primary font-semibold text-sm shadow-xl shadow-blue-900/20 transition-all duration-300'
                        >
                            Book appointment 
                            <motion.img 
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className='w-3 transition-transform group-hover:translate-x-1' 
                                src={assets.arrow_icon} 
                                alt="" 
                            />
                        </motion.a>
                        
                        <motion.a 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            href='/doctors' 
                            className='group flex items-center gap-2 bg-transparent border-2 border-white/30 backdrop-blur-sm px-6 py-3.5 rounded-full text-white font-medium text-sm hover:bg-white/10 transition-all duration-300'
                        >
                            Find doctors
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </motion.a>
                    </motion.div>
                    
                    <motion.div 
                        variants={fadeIn}
                        className="flex items-center gap-6 mt-4"
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white text-sm">4.9 Rating</span>
                        </div>
                        
                        <div className="h-4 w-px bg-white/30"></div>
                        
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white text-sm">Verified Doctors</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* --------- Header Right --------- */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className='md:w-1/2 relative py-8 md:py-0 z-10'
                >
                    <div className="relative h-full flex items-end justify-center md:justify-end">
                        {/* Main image with drop shadow */}
                        <motion.img 
                            variants={pulseAnimation}
                            initial="initial"
                            animate="animate"
                            className='w-4/5 md:w-auto md:h-[400px] lg:h-[450px] xl:h-[500px] object-contain drop-shadow-2xl' 
                            src={assets.nursing} 
                            alt="Doctor and patient" 
                        />
                        
                        {/* Floating badge 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            className="absolute top-20 left-10 md:left-4 bg-white p-3 rounded-xl shadow-lg"
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Online Consultations</p>
                                    <p className="text-sm font-bold text-gray-800">Available 24/7</p>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Floating badge 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3, duration: 0.6 }}
                            className="absolute bottom-20 right-8 md:right-28 bg-white p-3 rounded-xl shadow-lg"
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Quick Booking</p>
                                    <p className="text-sm font-bold text-gray-800">Same Day Appointments</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
            
        </div>
    )
}

export default Header