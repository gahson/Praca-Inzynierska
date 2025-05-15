import { ChakraProvider, Center, Heading } from "@chakra-ui/react";

export default function App() {
  return (
    <ChakraProvider>
      <Center height="100vh" bg="gray.100">
        <Heading fontSize="6xl" color="gray.700">
          Inpainting
        </Heading>
      </Center>
    </ChakraProvider>
  );
}
