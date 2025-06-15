import { Box, Flex, Text, Link, Separator, VStack } from "@chakra-ui/react";

export default function Footer() {
    return (

        <VStack as="footer" bg='gray.100'>

            {/*<Separator size="md" width="90%" opacity='0.3'/>*/}
            <Flex width="100vw" align='center' justify='center' direction='column' py='2'>

                <Flex justify="center" gap={4} flexWrap="wrap">
                    <Text color='gray.500'>© 2025 AInterior</Text>
                    <Link
                        href="/views/privacy"
                        color="gray.500"
                        _hover={{ textDecoration: "none", color: "gray.300" }}
                        whiteSpace="nowrap" // żeby linki się nie łamały w połowie
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/views/terms"
                        color="gray.500"
                        _hover={{ textDecoration: "none", color: "gray.300" }}
                        whiteSpace="nowrap"
                    >
                        Terms of Service
                    </Link>
                </Flex>
            </Flex>

        </VStack>
    );
}
