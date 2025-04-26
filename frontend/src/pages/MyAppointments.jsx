import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { Calendar, Clock, MapPin, AlertTriangle, CheckCircle, DollarSign, X } from 'lucide-react';

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  // Getting User Appointments Data Using API
  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
      setAppointments(data.appointments.reverse());
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment', 
        { appointmentId }, 
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay", 
            response, 
            { headers: { token } }
          );
          
          if (data.success) {
            navigate('/my-appointments');
            getUserAppointments();
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Function to make payment using razorpay
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-razorpay', 
        { appointmentId }, 
        { headers: { token } }
      );
      
      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to make payment using stripe
  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-stripe', 
        { appointmentId }, 
        { headers: { token } }
      );
      
      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  const getStatusBadge = (appointment) => {
    if (appointment.cancelled) {
      return (
        <div className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded-full">
          <X size={14} />
          <span className="text-xs font-medium">Cancelled</span>
        </div>
      );
    } else if (appointment.isCompleted) {
      return (
        <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-full">
          <CheckCircle size={14} />
          <span className="text-xs font-medium">Completed</span>
        </div>
      );
    } else if (appointment.payment) {
      return (
        <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
          <DollarSign size={14} />
          <span className="text-xs font-medium">Paid</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full">
          <AlertTriangle size={14} />
          <span className="text-xs font-medium">Payment Pending</span>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="flex justify-center">
            <Calendar size={48} className="text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-700">No appointments found</h3>
          <p className="mt-2 text-gray-500">Schedule your first appointment with our specialists</p>
          <button 
            onClick={() => navigate('/find-doctors')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all"
          >
            Find Doctors
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                appointment.cancelled ? 'border-red-200' : 
                appointment.isCompleted ? 'border-green-200' : 
                appointment.payment ? 'border-blue-200' : 'border-yellow-200'
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="md:w-1/6">
                    <div className="bg-blue-50 rounded-lg overflow-hidden">
                      <img 
                        className="w-full h-40 md:h-48 object-cover object-center" 
                        src={appointment.docData.image} 
                        alt={appointment.docData.name} 
                      />
                    </div>
                  </div>
                  
                  {/* Appointment Details */}
                  <div className="md:w-3/6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.docData.name}</h3>
                      <p className="text-primary font-medium">{appointment.docData.speciality}</p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-700">Address:</p>
                        <p className="text-gray-600">{appointment.docData.address.line1}</p>
                        <p className="text-gray-600">{appointment.docData.address.line2}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Date & Time: </span>
                        <span className="text-gray-600">
                          {slotDateFormat(appointment.slotDate)} | {appointment.slotTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="md:w-2/6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-end">
                      {getStatusBadge(appointment)}
                    </div>
                    
                    <div className="space-y-2">
                      {!appointment.cancelled && !appointment.payment && !appointment.isCompleted && paymentId !== appointment._id && (
                        <button 
                          onClick={() => setPaymentId(appointment._id)} 
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-primary/90 text-white font-medium rounded-lg flex justify-center items-center space-x-2 hover:shadow-md transition-all"
                        >
                          <DollarSign size={18} />
                          <span>Pay Online</span>
                        </button>
                      )}
                      
                      {!appointment.cancelled && !appointment.payment && !appointment.isCompleted && paymentId === appointment._id && (
                        <div className="space-y-2">
                          <button 
                            onClick={() => appointmentStripe(appointment._id)} 
                            className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-lg flex justify-center items-center hover:bg-gray-50 transition-all"
                          >
                            <img className="h-6" src={assets.stripe_logo} alt="Stripe" />
                          </button>
                          
                          <button 
                            onClick={() => appointmentRazorpay(appointment._id)} 
                            className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-lg flex justify-center items-center hover:bg-gray-50 transition-all"
                          >
                            <img className="h-6" src={assets.razorpay_logo} alt="Razorpay" />
                          </button>
                          
                          <button 
                            onClick={() => setPaymentId(null)} 
                            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {!appointment.cancelled && !appointment.isCompleted && (
                        <button 
                          onClick={() => cancelAppointment(appointment._id)} 
                          className={`w-full py-2 px-4 ${
                            appointment.payment ? 'bg-white text-red-500 border border-red-500' : 'bg-red-50 text-red-600'
                          } rounded-lg hover:bg-red-600 hover:text-white transition-all`}
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;