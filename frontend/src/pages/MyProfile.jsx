import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext);

  // Function to update user profile data using API
  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);
      
      image && formData.append('image', image);
      
      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } });
      
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return userData ? (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 w-full relative">
        <div className="absolute -bottom-16 left-8">
          {isEdit ? (
            <label htmlFor="image" className="inline-block relative cursor-pointer">
              <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img
                  className="w-full h-full object-cover transition-all hover:opacity-75"
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt="Profile"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <img className="w-6 h-6" src={assets.upload_icon} alt="Upload" />
                  </div>
                </div>
              </div>
              <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" className="hidden" />
            </label>
          ) : (
            <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden">
              <img className="w-full h-full object-cover" src={userData.image} alt="Profile" />
            </div>
          )}
        </div>
        
        {isEdit ? (
          <button 
            onClick={updateUserProfileData} 
            className="absolute right-6 top-6 bg-white text-indigo-600 px-4 py-2 rounded-full font-medium text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Save
          </button>
        ) : (
          <button 
            onClick={() => setIsEdit(true)} 
            className="absolute right-6 top-6 bg-white text-indigo-600 px-4 py-2 rounded-full font-medium text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
        )}
      </div>
      
      <div className="pt-20 px-8 pb-8">
        {isEdit ? (
          <input 
            className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-indigo-300 focus:border-indigo-600 outline-none w-full max-w-sm" 
            type="text" 
            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
            value={userData.name} 
          />
        ) : (
          <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
        )}
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center bg-indigo-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-700">CONTACT INFO</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="text-indigo-600">{userData.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                {isEdit ? (
                  <input 
                    className="w-full bg-white rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all" 
                    type="text" 
                    onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                    value={userData.phone} 
                  />
                ) : (
                  <p className="text-indigo-600">{userData.phone}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                {isEdit ? (
                  <div className="space-y-2">
                    <input 
                      className="w-full bg-white rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all" 
                      type="text" 
                      placeholder="Line 1"
                      onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                      value={userData.address.line1} 
                    />
                    <input 
                      className="w-full bg-white rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all" 
                      type="text" 
                      placeholder="Line 2"
                      onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                      value={userData.address.line2} 
                    />
                  </div>
                ) : (
                  <p className="text-gray-700">
                    {userData.address.line1} <br /> {userData.address.line2}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center bg-indigo-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-700">BASIC INFO</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                {isEdit ? (
                  <select 
                    className="w-full bg-white rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all appearance-none" 
                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                    value={userData.gender}
                  >
                    <option value="Not Selected">Not Selected</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{userData.gender}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Birthday</p>
                {isEdit ? (
                  <input 
                    className="w-full bg-white rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all" 
                    type="date" 
                    onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                    value={userData.dob} 
                  />
                ) : (
                  <p className="text-gray-700">{userData.dob}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default MyProfile;