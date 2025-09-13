import React from "react";
import { Link } from "react-router-dom";

const Success = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl mb-4 text-green-900">Registered Successfully ✅</h1>
        <Link to="/login" className="text-blue-500">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default Success;
