import React, { useState, useEffect } from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const SpecialityMenu = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    
    // Reset active index when mouse leaves the container
    const handleMouseLeave = () => setActiveIndex(null);
    
    return (
        <div id='speciality' className='py-20 bg-gradient-to-b from-blue-50/50 to-white'>
            <div className='container mx-auto px-4'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className='flex flex-col items-center gap-6 text-center'
                >
                    <div className="inline-block">
                        <h1 className='text-3xl md:text-4xl font-bold text-gray-800 relative'>
                            Find by Speciality
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="h-3 bg-primary/20 absolute -bottom-1 left-0 w-full rounded-full"
                            />
                        </h1>
                    </div>
                    
                    <p className='md:w-2/3 lg:w-1/2 xl:w-1/3 text-center text-gray-600 max-w-xl'>
                        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
                    </p>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2, staggerChildren: 0.1 }}
                        viewport={{ once: true }}
                        className='w-full flex justify-center mt-8'
                    >
                        <div 
                            className='flex gap-4 md:gap-8 py-6 px-4 md:px-0 pb-10 w-full justify-start sm:justify-center overflow-x-auto hide-scrollbar'
                            onMouseLeave={handleMouseLeave}
                        >
                            {specialityData.map((item, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    key={index}
                                >
                                    <Link 
                                        to={`/doctors/${item.speciality}`} 
                                        onClick={() => scrollTo(0, 0)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`relative flex flex-col items-center cursor-pointer flex-shrink-0 group`}
                                    >
                                        <motion.div
                                            whileHover={{ y: -10 }}
                                            className="relative"
                                        >
                                            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center 
                                                ${activeIndex === index ? 'bg-primary/10 shadow-lg' : 'bg-blue-100/30'} 
                                                transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10`}>
                                                <div className={`absolute inset-0 rounded-full 
                                                    ${activeIndex === index ? 'bg-gradient-to-br from-primary/20 to-blue-200/50' : 'bg-gradient-to-br from-blue-100 to-white'} 
                                                    transition-all duration-300`}></div>
                                                <img 
                                                    className='w-16 sm:w-20 z-10 transition-all duration-300 drop-shadow-md group-hover:scale-110' 
                                                    src={item.image} 
                                                    alt={item.speciality} 
                                                />
                                            </div>
                                            
                                            {activeIndex === index && (
                                                <motion.div
                                                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                                >
                                                    <div className="bg-primary text-white text-xs px-3 py-1 rounded-full shadow-md">
                                                        Book Now
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                        
                                        <motion.p 
                                            className={`mt-4 font-medium text-sm md:text-base ${activeIndex === index ? 'text-primary' : 'text-gray-700'} transition-all duration-300`}
                                        >
                                            {item.speciality}
                                        </motion.p>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
                
                {/* Decorative Elements */}
                <div className="absolute left-0 top-1/4 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute right-0 bottom-1/4 translate-x-1/2 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}

// Add this CSS to your global styles
// .hide-scrollbar::-webkit-scrollbar {
//     display: none;
// }
// .hide-scrollbar {
//     -ms-overflow-style: none;
//     scrollbar-width: none;
// }

export default SpecialityMenu