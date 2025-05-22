import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../features/auth/authSlice";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });

      const { access_token, first_name, last_name, email: userEmail } = res.data;

      dispatch(loginSuccess({
        user: { first_name, last_name, email: userEmail },
        token: access_token
      }));

      toast({
        title: "Logged in successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/views/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error?.response?.data?.detail || "Check your credentials and try again.",
        status: "error",
        duration: 4000,
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
          Login
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
          <Button colorScheme="yellow" onClick={handleLogin}>
            Log in
          </Button>
        </Stack>

        {/* Register link */}
        <Text mt={4} fontSize="sm" textAlign="center">
          Don&apos;t have an account?{" "}
          <RouterLink to="/views/account/register" style={{ color: "#ECC94B" }}>
            Register
          </RouterLink>
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
