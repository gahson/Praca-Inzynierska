import { useEffect, useState } from "react";
import { Box, Flex, Link, Button, Heading, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";

import {
  FaUser,
  FaTachometerAlt,
  FaFileImage,
  FaImages,
  FaMagic,
  FaClipboardList,
  FaPhotoVideo
} from "react-icons/fa";

const navLinks = [
  { href: "/views/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/views/generation/text-to-image", label: "Text to Image", icon: FaFileImage },
  { href: "/views/generation/image-to-image", label: "Image to Image", icon: FaImages },
  { href: "/views/generation/inpainting", label: "Inpainting", icon: FaMagic },
  { href: "/views/prompts", label: "Prompts", icon: FaClipboardList },
  { href: "/views/gallery", label: "Gallery", icon: FaPhotoVideo },
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
      bg="blue.500"
      color="white"
      px={{ base: 4, md: 8 }}
      py={{ base: 3, md: 4 }}
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        wrap="wrap"
        gap={4}
      >
        {/* Logo */}
        <Box flexShrink={0}>
          <Heading size={{ base: "md", md: "lg" }} cursor="default">
            AInterior
          </Heading>
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
