import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Calendar, Clock, Info, Check, Star } from 'lucide-react'

const Appointment = () => {
    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSolts = async () => {
        setIsLoading(true)
        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {
            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];

            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {
                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))
        }
        setIsLoading(false)
    }

    const bookAppointment = async () => {
        if (!slotTime) {
            toast.warning('Please select a time slot')
            return
        }

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        setIsLoading(true)
        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        try {
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                getDoctosData()
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    return docInfo ? (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Doctor Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="bg-primary/10 px-6 py-4">
                    <h1 className="text-xl font-semibold text-gray-800">Doctor Details</h1>
                </div>
                
                <div className="flex flex-col md:flex-row p-6 gap-8">
                    {/* Doctor Image */}
                    <div className="w-full md:w-1/4 flex flex-col items-center">
                        <div className="relative mb-4">
                            <img 
                                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-md" 
                                src={docInfo.image} 
                                alt={docInfo.name} 
                            />
                            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-3 text-center w-full">
                            <p className="text-primary font-semibold">{currencySymbol}{docInfo.fees}</p>
                            <p className="text-sm text-gray-600">Consultation Fee</p>
                        </div>
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-800">{docInfo.name}</h2>
                            <div className="bg-primary/10 px-2 py-1 rounded-full">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium">4.9</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-gray-700 font-medium">{docInfo.degree}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span className="text-gray-700">{docInfo.speciality}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{docInfo.experience}</span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-primary" />
                                <h3 className="font-medium text-gray-800">About Doctor</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{docInfo.about}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Booking Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="bg-primary/10 px-6 py-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-800">Book Appointment</h2>
                </div>
                
                <div className="p-6">
                    {/* Date Selection */}
                    <h3 className="text-gray-700 font-medium mb-3">Select Date</h3>
                    <div className="flex gap-3 items-center w-full overflow-x-auto pb-2 mb-6">
                        {docSlots.length > 0 && docSlots.map((item, index) => (
                            <div 
                                onClick={() => setSlotIndex(index)} 
                                key={index} 
                                className={`flex flex-col items-center justify-center p-4 min-w-24 h-24 rounded-2xl cursor-pointer transition-all ${
                                    slotIndex === index 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <p className="text-sm font-semibold">{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                                <p className="text-2xl font-bold mt-1">{item[0] && item[0].datetime.getDate()}</p>
                                <p className="text-xs mt-1">
                                    {item[0] && new Intl.DateTimeFormat('en-US', { month: 'short' }).format(item[0].datetime)}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Time Selection */}
                    <h3 className="text-gray-700 font-medium mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Select Time Slot</span>
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-8">
                        {docSlots.length > 0 && docSlots[slotIndex].map((item, index) => (
                            <button
                                onClick={() => setSlotTime(item.time)}
                                key={index}
                                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                                    item.time === slotTime
                                        ? 'bg-primary text-white shadow-md'
                                        : 'border border-gray-200 hover:border-primary/50 text-gray-600'
                                }`}
                            >
                                {item.time.toLowerCase()}
                            </button>
                        ))}
                    </div>
                    
                    {/* Book Button */}
                    <div className="flex justify-center">
                        <button 
                            onClick={bookAppointment}
                            disabled={isLoading || !slotTime}
                            className={`px-8 py-3 rounded-xl text-white font-medium transition-all ${
                                isLoading || !slotTime
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {isLoading ? 'Processing...' : 'Book Appointment'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Doctors Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-primary/10 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-800">Similar Specialists</h2>
                </div>
                <div className="p-6">
                    <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
                </div>
            </div>
        </div>
    ) : (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-64 bg-gray-200 rounded"></div>
            </div>
        </div>
    )
}

export default Appointment