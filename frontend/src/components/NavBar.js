import { useEffect, useState } from "react";
import { Box, Flex, Link, Button, Heading } from "@chakra-ui/react";

import {
  FaUser,
  FaTachometerAlt,
  FaFileImage,
  FaImages,
  FaMagic,
  FaClipboardList,
  FaPhotoVideo
} from 'react-icons/fa';


const navLinks = [
  { href: "/views/Dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/views/generation/text-to-image", label: "Text to Image", icon: FaFileImage },
  { href: "/views/generation/image-to-image", label: "Image to Image", icon: FaImages },
  { href: "/views/generation/inpainting", label: "Inpainting", icon: FaMagic },
  { href: "/views/prompts", label: "Prompts", icon: FaClipboardList },
  { href: "/views/gallery", label: "Gallery", icon: FaPhotoVideo },
];

export default function Navbar() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Box
      bg="blue.600"
      color="white"
      px={{ base: 4, md: 8 }}
      py={{ base: 3, md: 4 }}
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex
        align="center"
        justify="space-between"
        wrap="nowrap"
      >
        {/* Left - Logo */}
        <Box flexShrink={0} mr={{ base: 2, md: "2vh" }}>
          <Heading size={{ base: "md", md: "lg" }} cursor="default">
            AInterior
          </Heading>
        </Box>

        {/* Middle - Links (can wrap) */}
        <Flex
          wrap="wrap"
          gap={4}
          flex="1"
          mx={4}
          minW={0}
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Flex key={href} align="center" gap={2}>
              <Icon size={20} />
              <Link
                href={href}
                px={3}
                py={2}
                _hover={{ color: "yellow.300", textDecoration: "none" }}
              >
                {label}
              </Link>
            </Flex>
          ))}
        </Flex>

        {/* Right - User + Logout */}
        <Flex align="center" gap={5} flexShrink={0}>
          <Box cursor="pointer">
            <FaUser size={27} />
          </Box>
          <Button colorScheme="yellow" color="black">
            Logout
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

