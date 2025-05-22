import {
  Flex,
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

const TextToImage = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(0);

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModels] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/model/list")
      .then((r) => r.json())
      .then(setModels)
      .catch(console.error);
  }, []
  );

  const generate = async () => {
    updateLoading(true);
    axios
      .post("http://localhost:8000/model/generate/text-to-image", {
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
    <Box bg="gray.100" minHeight="100vh" px={{ base: 4, md: 8 }} py={{ base: 6, md: 12 }}>
      <Flex
        marginTop={{ base: "1vh", md: "15vh" }}
        marginBottom={{ base: "1vh", md: "15vh" }}
        justifyContent="center"
        alignItems="center"
        gap={{ base: "5%", md: "20%" }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "flex-start" }}
      >
        {/* Parameters */}
        <Box
          width={{ base: "100%", md: "35%" }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          mb={{ base: 10, md: 0 }}
        >

          {/* Model selection */}
          <Wrap marginBottom="10px" width="100%">
            <Select
              marginBottom="10px"
              placeholder="-- Choose model --"
              value={selectedModel}
              onChange={(e) => setSelectedModels(e.target.value)}
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Wrap>

          {/* Prompt selection */}
          <Wrap marginBottom="10px" width="100%">
            <Input
              value={prompt}
              onChange={(e) => updatePrompt(e.target.value)}
              width="100%"
              placeholder="Enter prompt"
            />
          </Wrap>

          {/* Negative prompt selection */}
          <Wrap marginBottom="10px" width="100%">
            <Input
              value={negativePrompt}
              onChange={(e) => updateNegativePrompt(e.target.value)}
              width="100%"
              placeholder="Enter negative prompt (optional)"
            />
          </Wrap>

          {/* Width slider */}
          <Wrap marginBottom="10px" width="100%">
            <Box marginBottom="10px" width="100%">
              <Text mb={2}>Width: {width}</Text>
              <Slider
                aria-label="Width"
                defaultValue={width}
                min={64}
                max={1024}
                step={64}
                onChange={(value) => setWidth(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Wrap>

          {/* Height slider */}
          <Wrap marginBottom="10px" width="100%">
            <Box marginBottom="10px" width="100%">
              <Text mb={2}>Height: {height}</Text>
              <Slider
                aria-label="Height"
                defaultValue={height}
                min={64}
                max={1024}
                step={64}
                onChange={(value) => setHeight(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Wrap>

          {/* Guidance slider */}
          <Wrap marginBottom="10px" width="100%">
            <Box marginBottom="10px" width="100%">
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
          </Wrap>

          {/* Seed slider */}
          <Wrap marginBottom="10px" width="100%">
            <Box marginBottom="10px" width="100%">
              <Text mb={2}>Seed: {seed}</Text>
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
          </Wrap>

          <Button onClick={generate} colorScheme="yellow" width="100%">
            Generate
          </Button>
        </Box>

        {/* Image */}
        <Flex
          width={{ base: "100%", md: "512px" }}
          height={{ base: "auto", md: "512px" }}
          align="center"
          justifyContent="center"
          bg="gray.200"
          borderRadius="md"
        >
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
              width="100%"
              height="100%"
              objectFit="contain"
            />
          ) : null}
        </Flex>


      </Flex>
    </Box>
  );
};

export default TextToImage;
