"use client";

import {
  ChakraProvider,
  Heading,
  Container,
  Text,
  Input,
  Button,
  Wrap,
  Stack,
  Select,
  Image,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";

const App = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [guidance, setGuidance] = useState(15.0);
  const [seed, setSeed] = useState(0);

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModels] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/model/list")
      .then((r) => r.json())
      .then(setModels)
      .catch(console.error);
  }, []
  );

  const generate = async () => {
    updateLoading(true);
    axios
      .post("http://localhost:8080/model/generate", {
        model: selectedModel,
        prompt: prompt,
        negative_prompt: negativePrompt,
        guidance_scale: guidance,
        width: width,
        height: height,
        seed: seed,
      })
      .then((response) => {
        updateImage(response.data.image);
        updateLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        updateLoading(false);
      });
  };

  return (
    <ChakraProvider>
      <Container>
        <Heading>AInterior</Heading>
        <Text marginBottom="10px">
          Stable Difussion application designed for interior architects
        </Text>
      </Container>
      <Box width="100%" height="100%" marginTop="100px">
        <Box display="flex" justifyContent="center" gap="20%">


          {/* Left Box with Input, Sliders and Button */}
          <Box width="35%" display="flex" flexDirection="column" justifyContent="center">

            <Select
              marginBottom="10px"
              placeholder="-- wybierz model --"
              value={selectedModel}
              onChange={(e) => setSelectedModels(e.target.value)}
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>

            {/* Positive Prompt Input */}
            <Wrap marginBottom="10px">
              <Input
                value={prompt}
                onChange={(e) => updatePrompt(e.target.value)}
                width="100%"
                placeholder="Enter prompt"
              />
            </Wrap>

            {/* Negative Prompt Input */}
            <Wrap marginBottom="10px">
              <Input
                value={negativePrompt}
                onChange={(e) => updateNegativePrompt(e.target.value)}
                width="100%"
                placeholder="Enter negative prompt (optional)"
              />
            </Wrap>

            {/* Width Slider */}
            <Box marginBottom="10px">
              <Text mb={2}>Width: {width}</Text>
              <Slider
                aria-label="Width"
                defaultValue={width}
                min={64}
                max={1024}
                step={8}
                onChange={(value) => setWidth(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Height Slider */}
            <Box>
              <Text mb={2}>Height: {height}</Text>
              <Slider
                aria-label="Height"
                defaultValue={height}
                min={64}
                max={1024}
                step={8}
                onChange={(value) => setHeight(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Guidance Slider */}
            <Box>
              <Text mb={2}>Guidance scale: {guidance}</Text>
              <Slider
                aria-label="Guidance"
                defaultValue={guidance}
                min={0.0}
                max={25.0}
                step={0.1}
                onChange={(value) => setGuidance(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Seed Slider */}
            <Box>
              <Text mb={2}> Seed: {seed}</Text>
              <Slider
                aria-label="Seed"
                defaultValue={seed}
                min={0}
                max={10000}
                step={1}
                onChange={(value) => setSeed(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            <Button onClick={generate} colorScheme="yellow" width="100%">
              Generate
            </Button>
          </Box>

          {/* Right Box for displaying the image */}
          <Box width="512px" height="512px" backgroundColor="gray.200" display="flex" alignItems="center" justifyContent="center">
            {loading ? (
              <Stack width="100%" height="100%">
                <SkeletonCircle />
                <SkeletonText />
              </Stack>
            ) : image ? (
              <Image
                src={`data:image/png;base64,${image}`}
                alt="Generated Image"
                boxShadow="lg"
                borderRadius="md"
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default App;
