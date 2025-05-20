import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Center, Heading, Spinner } from "@chakra-ui/react";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout());
    navigate("/views/account/login");
  }, [dispatch, navigate]);

  return (
    <Center height="100vh" bg="gray.100" flexDirection="column">
      <Heading fontSize="4xl" color="gray.700" mb={4}>
        Logging out...
      </Heading>
      <Spinner size="xl" color="gray.500" />
    </Center>
  );
}
