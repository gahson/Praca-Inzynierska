import { Box, Flex, Text, Link } from "@chakra-ui/react";

export default function Footer() {
    return (
        <Box
            as="footer"
            bg="blue.600"
            color="white"
            py={4}
            px={{ base: 4, md: 8 }}
            mt="auto"
            boxShadow="inner"
            position="fixed"
            bottom="0"
            width="100%"
            textAlign="center"
            zIndex={1000}  // żeby był nad innymi elementami
        >
            <Flex justify="center" gap={4} flexWrap="wrap">
                <Text>© 2025 AInterior</Text>
                <Link
                    href="/views/privacy"
                    _hover={{ textDecoration: "underline", color: "yellow.300" }}
                    whiteSpace="nowrap" // żeby linki się nie łamały w połowie
                >
                    Privacy Policy
                </Link>
                <Link
                    href="/views/terms"
                    _hover={{ textDecoration: "underline", color: "yellow.300" }}
                    whiteSpace="nowrap"
                >
                    Terms of Service
                </Link>
            </Flex>
        </Box>
    );
}
