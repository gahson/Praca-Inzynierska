import axios from "axios";
import React from 'react';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { toaster } from "../../../components/ui/toaster"
import { loginSuccess } from "../../../features/auth/authSlice";


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toaster.create({
        title: "Missing fields",
        description: "Please enter both email and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isValidEmail(email)) {
      toaster.create({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`/api/auth/login`, {
        email,
        password,
      });

      const { access_token, first_name, last_name, email: userEmail, role:role } = res.data;

      localStorage.setItem("token", access_token);

      dispatch(
        loginSuccess({
          user: { first_name, last_name, email: userEmail, role: role },
          token: access_token,
        })
      );

      toaster.create({
        title: "Logged in successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/views/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.detail ||
        "Login failed. Please check your credentials and try again.";

      toaster.create({
        title: "Login failed",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-[90%] sm:w-[400px] bg-white rounded-md shadow-lg p-8">
        <h2 className="text-lg font-semibold text-center mb-6">Log In</h2>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 rounded p-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 rounded p-2"
          />
          <button
            onClick={handleLogin}
            className="bg-yellow-400 text-black rounded hover:bg-yellow-500 disabled:opacity-50 py-2"
            disabled={loading}
          >
            {loading ? "Logging in" : "Log in"}
          </button>
        </div>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <RouterLink to="/views/account/register" className="text-yellow-600">
            Register
          </RouterLink>
        </p>
      </div>
    </div>

  );
};

export default Login;
