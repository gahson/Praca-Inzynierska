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

const Register = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      // 1. Register
      await axios.post("http://localhost:8000/auth/register", form);

      // 2. Then login
      const loginRes = await axios.post("http://localhost:8000/auth/login", {
        email: form.email,
        password: form.password,
      });

      dispatch(loginSuccess({
        user: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email
        },
        token: loginRes.data.access_token
      }));


      toast({
        title: "Account created!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/views/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.detail || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex justify="center" align="center" minHeight="80vh">
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
          <Button colorScheme="yellow" onClick={handleRegister}>
            Register
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Register;
