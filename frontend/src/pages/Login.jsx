import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [isFlipping, setIsFlipping] = useState(false)
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  const flipCard = (newState) => {
    setIsFlipping(true)
    setTimeout(() => {
      setState(newState)
      setIsFlipping(false)
    }, 400) // Half the animation duration
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Account created successfully!')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Logged in successfully!')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden p-6">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl top-20 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 rounded-full bg-purple-600 opacity-20 blur-3xl bottom-20 right-20"></div>
        <div className="absolute w-80 h-80 rounded-full bg-pink-500 opacity-10 blur-3xl top-1/2 left-1/3"></div>
      </div>

      {/* Hospital logo */}
      <div className="relative z-10 mb-8">
        <img 
          src="/src/assets/hos.png" 
          alt="Hospital Logo" 
          className="h-20 object-contain filter drop-shadow-lg" 
        />
      </div>

      {/* Card container with perspective */}
      <div className="relative z-10 w-full max-w-md perspective">
        {/* Card with flip animation */}
        <div className={`relative w-full transition-transform duration-800 transform-style-3d ${
          isFlipping ? 'animate-flip' : ''
        }`}>
          <div className="w-full rounded-2xl backdrop-blur-lg bg-white bg-opacity-10 shadow-2xl border border-white border-opacity-20 p-8 md:p-10">
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
              {/* Header */}
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-800">
                  {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-800 mt-2">
                  Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment
                </p>
              </div>

              {/* Form Fields */}
              {state === 'Sign Up' && (
                <div className="w-full group">
                  <label className="text-gray-800 text-sm font-medium mb-1 block">Full Name</label>
                  <div className="relative">
                    <input 
                      onChange={(e) => setName(e.target.value)} 
                      value={name} 
                      className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                      type="text" 
                      required 
                      placeholder="John Doe"
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-focus-within:w-full"></div>
                  </div>
                </div>
              )}
              
              <div className="w-full group">
                <label className="text-gray-800 text-sm font-medium mb-1 block">Email</label>
                <div className="relative">
                  <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                    type="email" 
                    required 
                    placeholder="your@email.com"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>
              
              <div className="w-full group">
                <label className="text-gray-800 text-sm font-medium mb-1 block">Password</label>
                <div className="relative">
                  <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} 
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                    type="password" 
                    required 
                    placeholder="••••••••"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              {/* Button */}
              <button 
                className="relative mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium text-lg overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 transform hover:translate-y-1 active:scale-95"
                type="submit"
              >
                <span className="relative z-10">{state === 'Sign Up' ? 'Create account' : 'Login'}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-x-0 group-hover:scale-x-100 origin-left transform"></span>
              </button>

              {/* Toggle between signup and login */}
              <div className="text-center text-gray-900 text-sm">
                {state === 'Sign Up' ? (
                  <p>Already have an account? <span onClick={() => flipCard('Login')} className="text-cyan-600 hover:text-cyan-200 cursor-pointer">Login here</span></p>
                ) : (
                  <p>Create a new account? <span onClick={() => flipCard('Sign Up')} className="text-cyan-600 hover:text-cyan-200 cursor-pointer">Sign up here</span></p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add these CSS rules to your global stylesheet
const styleSheet = `
@keyframes flip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
}

.animate-flip {
  animation: flip 800ms ease-in-out;
}

.perspective {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}
`;

export default Login;