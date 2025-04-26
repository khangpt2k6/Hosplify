import React, { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const containerRef = useRef(null)
    
    // Handle case when doctors data is not available
    if (!doctors || doctors.length === 0) {
        return (
            <div className='py-20 bg-gradient-to-b from-white to-blue-50/30 relative'>
                <div className='container mx-auto px-4 text-center'>
                    <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>Loading Doctors...</h1>
                </div>
            </div>
        )
    }
    
    // Variants for animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <div className='py-20 bg-gradient-to-b from-white to-blue-50/30 relative' ref={containerRef}>
            {/* Decorative Background Elements */}
            <div className="absolute left-0 top-40 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
            <div className="absolute right-0 bottom-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className='container mx-auto px-4'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className='flex flex-col items-center gap-6 mb-12'
                >
                    <div className="inline-block">
                        <h1 className='text-3xl md:text-4xl font-bold text-gray-800 relative'>
                            Top Doctors to Book
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
                        Simply browse through our extensive list of trusted doctors.
                    </p>
                </motion.div>
                
                <motion.div 
                    className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8'
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {doctors.slice(0, 10).map((doctor, index) => (
                        <motion.div 
                            key={index}
                            variants={itemVariants}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => { 
                                navigate(`/appointment/${doctor._id}`); 
                                scrollTo(0, 0);
                            }}
                            className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 bg-white
                                ${hoveredIndex === index ? 'shadow-2xl scale-105' : 'shadow-md hover:shadow-xl'}`}
                        >
                            {/* Background gradient overlay when hovered */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${hoveredIndex === index ? 'from-primary/80 to-blue-600/40' : 'from-black/0 to-black/0'}
                                transition-all duration-500 opacity-0 group-hover:opacity-100 z-10`}>
                            </div>
                            
                            {/* Doctor Image with overlay */}
                            <div className="aspect-[4/5] relative overflow-hidden bg-blue-50">
                                <img 
                                    className='w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110' 
                                    src={doctor.image} 
                                    alt={doctor.name} 
                                />
                            </div>
                            
                            {/* Doctor Info on hover overlay */}
                            <div className="absolute inset-0 z-20 flex flex-col justify-end transition-all duration-300">
                                {/* Content that appears on hover */}
                                <div className={`p-4 backdrop-blur-sm bg-white/80 transform transition-all duration-500
                                    ${hoveredIndex === index ? 'translate-y-0' : 'translate-y-10 group-hover:translate-y-0'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className={`flex items-center gap-2 text-xs ${doctor.available ? 'text-green-500' : "text-gray-500"}`}>
                                            <span className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : "bg-gray-500"}`}></span>
                                            <span className="font-medium">{doctor.available ? 'Available' : "Not Available"}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-800 mt-1">{doctor.name}</h3>
                                    <p className="text-primary text-sm font-medium">{doctor.speciality}</p>
                                    
                                    {/* Additional Info on Hover */}
                                    <div className={`mt-3 transform transition-all duration-300 overflow-hidden 
                                        ${hoveredIndex === index ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100'}
                                    `}>
                                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium transform transition-all duration-300 opacity-0 group-hover:opacity-100">
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quick Action Button */}
                            <motion.div 
                                className={`absolute top-4 right-4 z-30 bg-white rounded-full p-2 shadow-lg
                                    ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'} 
                                    transition-all duration-300 group-hover:opacity-100`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                    scale: hoveredIndex === index ? 1 : 0.8,
                                    opacity: hoveredIndex === index ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
                
                <div className="flex justify-center mt-12">
                    <motion.button 
                        onClick={() => { 
                            try {
                                navigate('/doctors'); 
                                scrollTo(0, 0);
                            } catch (error) {
                                console.error("Navigation error:", error);
                            }
                        }} 
                        className='group relative overflow-hidden bg-white border-2 border-primary text-primary font-medium px-10 py-3 rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300'
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">View All Doctors</span>
                        <motion.div 
                            className="absolute inset-0 bg-primary"
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

export default TopDoctors