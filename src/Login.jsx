import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4200);
    return () => clearTimeout(t);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8080/login", {
        username,
        password,
      });

      if (res.data.success && res.data.token) {
        setMessageType("success");
        
        // Store JWT token
        localStorage.setItem('token', res.data.token);
        
        // Set default authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Update authentication state
        setIsAuthenticated(true);
        
        setMessage(res.data.message || "Login successful");
        setTimeout(() => navigate("/home"), 600);
      } else {
        setMessageType("error");
        setMessage(res.data.message || "Invalid username or password");
      }
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.message || "Server error during login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 relative overflow-hidden px-4">
    
      <div className="pointer-events-none absolute -top-36 -left-36 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-300 via-indigo-400 to-pink-300 opacity-70 filter blur-3xl animate-blob"></div>
      <div className="pointer-events-none absolute -bottom-44 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300 via-red-300 to-pink-400 opacity-60 filter blur-2xl animate-blob animation-delay-2000"></div>
      <div className="pointer-events-none absolute top-20 right-10 w-44 h-44 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 opacity-40 filter blur-xl animate-float"></div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg text-white text-lg font-bold animate-float">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2L15 8H9L12 2Z" fill="white" opacity="0.95" />
              <path d="M12 22L9 16H15L12 22Z" fill="white" opacity="0.95" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Sign in to continue to your dashboard with a colorful, animated experience.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (floating label pattern using peer) */}
          <div className="relative">
            <input 
              id="username" 
              name="username" 
              type="text" 
              placeholder=" " 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="peer w-full bg-white/40 border border-white/40 px-3 py-4 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" 
              autoComplete="username" 
              required 
            />
            <label 
              htmlFor="username" 
              className="absolute left-3 top-3 text-gray-600 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Username
            </label>
            {/* small icon */}
            <span className="absolute right-3 top-4 text-indigo-500 opacity-90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="currentColor" />
                <path d="M21 21v-1a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v1" fill="currentColor" opacity="0.9" />
              </svg>
            </span>
          </div>

          {/* Password */}
          <div className="relative">
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder=" " 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="peer w-full p-8 bg-white/40 border border-white/40 px-3 py-4 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" 
              autoComplete="current-password" 
              required 
            />
            <label 
              htmlFor="password" 
              className="absolute left-3 top-3 text-gray-600 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Password
            </label>
            <span className="absolute right-3 top-4 text-indigo-500 opacity-90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M17 11V9a5 5 0 0 0-10 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="11" width="18" height="10" rx="2" fill="currentColor" opacity="0.9" />
              </svg>
            </span>
          </div>

         
          <div className="pt-1">
            <button 
              type="submit" 
              className="group relative w-full py-3 rounded-xl overflow-hidden text-white font-semibold shadow-xl transition-transform duration-300 transform active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-100 group-hover:scale-105 transform transition-transform duration-500"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                LOGIN
              </span>
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-700">Don't have an account?</span>{" "}
          <button 
            onClick={() => navigate("/register")} 
            className="text-indigo-600 font-medium hover:underline ml-1"
          >
            Register now
          </button>
        </div>

        
        {message && (
          <div 
            role="status" 
            aria-live="polite" 
            className={`mt-6 mx-auto max-w-xs px-4 py-2 rounded-full text-center text-sm shadow-lg transform transition-all duration-400 ${
              messageType === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : messageType === "error" 
                ? "bg-red-50 text-red-800 border border-red-200" 
                : "bg-white/80 text-gray-800 border border-gray-200"
            } animate-fade-in`}
          >
            {message}
          </div>
        )}
      </div>

      {/* subtle footer accent */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 select-none">
        <p>Powered by VoltRide</p>
        <p>Authorized by Freshket</p>
      </div>
    </div>
  );
};

export default Login;