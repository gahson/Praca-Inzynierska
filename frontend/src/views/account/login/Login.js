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
      const res = await axios.post("http://localhost:8000/auth/login", {
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
    <Flex justify="center" align="center" minHeight="80vh" bg="gray.50">
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        width={{ base: "90%", sm: "400px" }}
      >
        <Heading mb={6} size="lg" textAlign="center">
          Log In
        </Heading>

        <Stack spacing={4}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            colorScheme="yellow"
            onClick={handleLogin}
            isLoading={loading}
            loadingText="Logging in"
          >
            Log in
          </Button>
        </Stack>

        <Text mt={4} fontSize="sm" textAlign="center">
          Don&apos;t have an account?{" "}
          <RouterLink to="/views/account/register" style={{ color: "#D69E2E" }}>
            Register
          </RouterLink>
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
