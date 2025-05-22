import { Heading, Input, Button, Flex, Box } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    navigate(`/views/generation/text-to-image?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <Box
      bg="gray.100"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px="4"
    >
      <Box
        height="70vh"
        width="100%"
        maxW="800px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        pt="15vh"
        pb="auto"
        flexGrow={1}
        gap="24px"
      >
        <Heading fontSize="6xl" color="gray.700" textAlign="center" m={0}>
          Welcome to AInterior
        </Heading>

        <Box maxW="600px" mx="auto" textAlign="center" color="gray.600" fontSize="xl" px="4" m={0}>
          AInterior is a Stable Diffusion based tool for generating stunning interiors effortlessly.
        </Box>

        <Flex align="center" justify="center" gap="4" width="100%">
          <Input
            flex="1"
            placeholder="Type your prompt..."
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
          />
          <Button colorScheme="blue" minWidth="120px" onClick={handleGenerate}>
            Start generating
          </Button>
        </Flex>
      </Box>
    </Box>




  );
}
