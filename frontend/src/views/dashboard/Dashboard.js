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
    <Flex height="100%" width='100%' justify="center" align="center" direction='column' gap='10' bg='gray.100'>

        <Heading fontSize="6xl" color="gray.700" textAlign="center" m={0}>
          Welcome to AInterior
        </Heading>

        <Box maxW="600px" mx="auto" textAlign="center" color="gray.600" fontSize="xl" px="4" m={0}>
          AInterior is a Stable Diffusion based tool for generating stunning interiors effortlessly.
        </Box>

        <Flex align="center" justify="center" gap="4" width="60%">
          <Input
            flex="1"
            placeholder="Type your prompt..."
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
          />
          <Button backgroundColor="blue.500" minWidth="120px" onClick={handleGenerate}>
            Start generating
          </Button>
        </Flex>
      </Flex>

  );
}
