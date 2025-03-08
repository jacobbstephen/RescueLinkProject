import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminSignup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit =  async(e) => {
    e.preventDefault();
    console.log("Name:", name);
    console.log("Username:", username);
    console.log("Password:", password);

    try {
        const response = await axios.post("http://localhost:3000/admin/signup", {
          username,
          password,
          name,
        });
        if (response.status === 200) {
          console.log("SignUp Successful");
          navigate("/");
        }else{
          alert("Try again");
        }
      } catch (err) {
        console.log("Signup Not Possible");
        alert("Try again");
      }
    
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="flex w-[900px] bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left Side */}
        <div className="w-1/2 bg-gradient-to-r from-indigo-900 to-blue-700 p-10 flex flex-col justify-center text-left">
          <h2 className="text-3xl font-bold text-white">Join Us!</h2>
          <p className="text-gray-300 mt-2 text-lg">Create an account to access the admin panel.</p>
        </div>

        {/* Right Side (Form) */}
        <div className="w-1/2 p-10 flex flex-col justify-center bg-white">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Admin Signup
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="admin123"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 bg-gray-100 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-xl"
            >
              Sign Up
            </button>
            <p className="text-sm text-gray-600 text-center mt-4">
              Already have an account?{" "}
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={() => navigate("/")} // Navigate to Signup Page
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
