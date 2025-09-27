import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { toaster } from "../../../components/ui/toaster"
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../features/auth/authSlice";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";

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
      const res = await axios.post("http://localhost:5555/auth/login", {
        email,
        password,
      });

      const { access_token, first_name, last_name, email: userEmail } = res.data;

      localStorage.setItem("token", access_token);

      dispatch(
        loginSuccess({
          user: { first_name, last_name, email: userEmail },
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
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 h-full">
      <div className="bg-white p-8 rounded-md shadow-lg w-[90%] sm:w-[400px]">
        <h2 className="text-lg font-semibold mb-6 text-center">Log In</h2>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleLogin}
            className="bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in" : "Log in"}
          </button>
        </div>

        <p className="mt-4 text-sm text-center">
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
