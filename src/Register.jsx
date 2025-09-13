import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // "success" | "error" | "info"
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4200);
    return () => clearTimeout(t);
  }, [message]);

  const validate = () => {
    if (!username.trim() || !password) {
      setMessageType("error");
      setMessage("Please provide a username and password.");
      return false;
    }
    if (password.length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirm) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("info");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/register", {
        username,
        password,
      });

      // expected: { success: boolean, message: string }
      const { success, message } = res.data;
      if (success) {
        setMessageType("success");
        setMessage(message || "Registration successful! Redirecting to login...");
        // short delay so user can see success
        setTimeout(() => navigate("/login"), 1800);
      } else {
        setMessageType("error");
        setMessage(message || "Registration failed. Try again.");
      }
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.message || "Server error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 relative overflow-hidden px-6">
      {/* animated decorative blobs */}
      <div className="pointer-events-none absolute -top-36 -left-36 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-300 via-indigo-400 to-pink-300 opacity-70 blur-3xl animate-blob"></div>
      <div className="pointer-events-none absolute -bottom-44 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300 via-red-300 to-pink-400 opacity-60 blur-2xl animate-blob animation-delay-2000"></div>
      <div className="pointer-events-none absolute top-20 right-10 w-44 h-44 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 opacity-40 blur-xl animate-float"></div>

      {/* glass card */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-yellow-500 flex items-center justify-center shadow-lg text-white text-lg font-bold animate-float">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 3C8 3 5 6 5 10v3l-2 4h18l-2-4v-3c0-4-3-7-7-7z" fill="white" opacity="0.95" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center mb-2 tracking-tight">
          Create account
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Join us and explore—secure, colorful, and fast.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <input
              id="reg-username"
              name="username"
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="peer w-full bg-white/40 border border-white/40 px-3 py-4 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              autoComplete="username"
              required
            />
            <label
              htmlFor="reg-username"
              className="absolute left-3 top-3 text-gray-600 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-rose-600"
            >
              Username
            </label>
            <span className="absolute right-3 top-4 text-rose-500 opacity-90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="currentColor" />
                <path d="M21 21v-1a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v1" fill="currentColor" opacity="0.9" />
              </svg>
            </span>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full bg-white/40 border border-white/40 px-3 py-4 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              autoComplete="new-password"
              required
            />
            <label
              htmlFor="reg-password"
              className="absolute left-3 top-3 text-gray-600 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-rose-600"
            >
              Password
            </label>
            <span className="absolute right-3 top-4 text-rose-500 opacity-90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M17 11V9a5 5 0 0 0-10 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="11" width="18" height="10" rx="2" fill="currentColor" opacity="0.9" />
              </svg>
            </span>
          </div>

          {/* Confirm password */}
          <div className="relative">
            <input
              id="reg-confirm"
              name="confirm"
              type="password"
              placeholder=" "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="peer w-full bg-white/40 border border-white/40 px-3 py-4 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              autoComplete="new-password"
              required
            />
            <label
              htmlFor="reg-confirm"
              className="absolute left-3 top-3 text-gray-600 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-rose-600"
            >
              Confirm password
            </label>
            <span className="absolute right-3 top-4 text-rose-500 opacity-90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M17 11V9a5 5 0 0 0-10 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="11" width="18" height="10" rx="2" fill="currentColor" opacity="0.9" />
              </svg>
            </span>
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 rounded-xl overflow-hidden text-white font-semibold shadow-xl transition-transform duration-300 transform active:scale-95 disabled:opacity-70"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-400 group-hover:scale-105 transform transition-transform duration-500"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" fill="none"></circle>
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"></path>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {loading ? "Creating..." : "REGISTER"}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-700">Already have an account?</span>{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-rose-600 font-medium hover:underline ml-1"
          >
            Login
          </button>
        </div>

        {/* Inline toast */}
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 select-none">
        <p>Powered by Voltride</p>
      </div>
    </div>
  );
}