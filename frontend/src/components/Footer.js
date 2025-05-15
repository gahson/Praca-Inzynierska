import { Box, Flex, Text, Link } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="blue.600"
      color="white"
      py={4}
      px={8}
      mt="auto"
      boxShadow="inner"
      position="fixed"
      bottom="0"
      width="100%"
      textAlign="center"
    >
      <Flex justify="center" gap={4} flexWrap="wrap">
        <Text>© 2025 AInterior</Text>
        <Link href="/views/privacy" _hover={{ textDecoration: "underline", color: "yellow.300" }}>
          Privacy Policy
        </Link>
        <Link href="/views/terms" _hover={{ textDecoration: "underline", color: "yellow.300" }}>
          Terms of Service
        </Link>
      </Flex>
    </Box>
  );
}
