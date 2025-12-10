import axios from "axios";
import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { toaster } from "../../../components/ui/toaster"
import { loginSuccess } from "../../../features/auth/authSlice";


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { first_name, last_name, email, password } = form;

    if (!first_name || !last_name || !email || !password) {
      toaster.create({
        title: "Missing fields",
        description: "Please fill in all the fields.",
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
      await axios.post(`/api/auth/register`, form);

      const loginRes = await axios.post(`/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", loginRes.data.access_token)

      dispatch(
        loginSuccess({
          user: { first_name, last_name, email },
          token: loginRes.data.access_token,
        })
      );

      toaster.create({
        title: "Account created!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/views/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error?.response?.data?.detail === "Email already registered"
          ? "An account with this email already exists."
          : error?.response?.data?.detail || "Something went wrong. Try again.";

      toaster.create({
        title: "Registration failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-[90%] sm:w-[400px] bg-white rounded-md shadow-lg p-8">
        <h1 className="text-lg font-semibold text-center mb-6">Register</h1>
        <div className="flex flex-col gap-4">
          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <button
            onClick={handleRegister}
            className="bg-yellow-400 text-black rounded hover:bg-yellow-500 disabled:opacity-50 py-2"
            disabled={loading}
          >
            {loading ? "Registering" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
