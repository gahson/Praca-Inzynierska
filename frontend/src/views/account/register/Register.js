import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../../../features/auth/authSlice";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { first_name, last_name, email, password } = form;

    if (!first_name || !last_name || !email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all the fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
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
      await axios.post("http://localhost:8000/auth/register", form);

      const loginRes = await axios.post("http://localhost:8000/auth/login", {
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

      toast({
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

      toast({
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
    <Flex justify="center" align="center" minHeight="80vh" bg="gray.50">
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        width={{ base: "90%", md: "400px" }}
      >
        <Heading mb={6} size="lg" textAlign="center">
          Register
        </Heading>
        <Stack spacing={4}>
          <Input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
          />
          <Input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <Button
            colorScheme="yellow"
            onClick={handleRegister}
            isLoading={loading}
            loadingText="Registering"
          >
            Register
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Register;
