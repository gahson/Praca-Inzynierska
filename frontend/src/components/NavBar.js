import { useEffect, useState } from "react";
import { Box, Flex, Link, Button, Heading, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Logo from "../assets/logo.png";

import {FaUser} from "react-icons/fa";
import { FiGrid } from "react-icons/fi";
import { LuHouse } from "react-icons/lu";
import { MdOutlineTextSnippet, MdOutlineDashboard, MdOutlineLan } from "react-icons/md";

const navLinks = [
  { href: "/views/dashboard", label: "Dashboard", icon: LuHouse },
  { href: "/views/workflows", label: "Workflows", icon: MdOutlineLan  },
  { href: "/views/prompts", label: "Prompts", icon: MdOutlineTextSnippet },
  { href: "/views/gallery", label: "Gallery", icon: FiGrid },
];



export default function Navbar() {
  const [hasMounted, setHasMounted] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Box
      bg="black"
      color="white"
      px={{ base: 4, md: 8 }}
      py={{ base: 3, md: 4 }}
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="10"
      width='100vw'
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        wrap="wrap"
        gap={4}
      >
{/* Logo jako obrazek */}
<Box
  flexShrink={0}
  display="flex"
  alignItems="center"
  maxHeight="50px"    // ogranicza wysokość navbaru
  cursor="pointer"
>
  <Link as={RouterLink} to="/views/dashboard">
    <img
      src={Logo}
      alt="AInterior Logo"
      style={{
        height: '40px',   // wysokość logo w navbarze
        width: 'auto',    // zachowuje proporcje (210x109 -> ok 40x20, w proporcji)
        display: 'block', // usuwa ewentualne odstępy inline
        objectFit: 'contain' // logo mieści się w boxie, nie rozciąga się
      }}
    />
  </Link>
</Box>

        {/* Links */}
        <Flex
          wrap="wrap"
          justify={{ base: "center", md: "center" }}
          gap={4}
          flexGrow={1}
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Flex key={href} align="center" gap={2}>
              <Icon size={20} />
              <Link
                as={RouterLink}
                to={href}
                px={3}
                py={2}
              >
                {<Text color='white' _hover={{ color: "gray.300", textDecoration: "none" }}>{label}</Text>}
              </Link>
            </Flex>
          ))}
        </Flex>

        {/* Auth Controls */}
        <Flex
          align="center"
          gap={4}
          justify={{ base: "center", md: "flex-end" }}
          flexShrink={0}
        >
          {isAuthenticated && (
            <Link as={RouterLink} to="/views/account/profile">
              <Box cursor="pointer">
                <FaUser color="white" size={27} />
              </Box>
            </Link>
          )}

          <Link
            as={RouterLink}
            to={
              isAuthenticated
                ? "/views/account/logout"
                : "/views/account/login"
            }
          >
            <Button backgroundColor="yellow.400" color="black">
              {isAuthenticated ? "Logout" : "Login"}
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
