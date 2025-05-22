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
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";

const Inpainting = () => {
  const [image, updateImage] = useState();

  const [loadedImage, setLoadedImage] = useState(null);
  const [loadedImageFilename, setLoadedImageFilename] = useState("");
  
  const [loadedMask, setLoadedMask] = useState(null);
  const [loadedMaskFilename, setLoadedMaskFilename] = useState("");

  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
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

  const loadImage = (e, filenameSetter, imgSetter) => {
    const file = e.target.files[0];
    if (!file) return;

    filenameSetter(file.name);
    const reader = new FileReader();
    reader.onloadend = () => imgSetter(reader.result);
    reader.readAsDataURL(file);
  };

  const unloadImage = (e, filenameSetter, imgSetter) => {
    filenameSetter(null);
    imgSetter("");
  };

  const generate = async () => {
    updateLoading(true);
    axios
      .post("http://localhost:8000/model/generate/image-to-image", {
        model: selectedModel,
        image: loadedImage.split(',')[1],
        prompt: prompt,
        negative_prompt: negativePrompt,
        guidance_scale: guidance,
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

          <Wrap marginBottom="10px" width="100%">
            <Flex
              width={{ base: "100%", md: "100%" }}
              height={{ base: "auto", md: "100%" }}
              align="center"
              justifyContent="space-between"
            >
              <Input
                type="file"
                accept="image/*"
                display="none"
                id="upload-image"
                onChange={(e) => loadImage(e, setLoadedImageFilename, setLoadedImage)}
              />
              <Button as="label" htmlFor="upload-image" cursor="pointer" colorScheme="yellow" width="50%">
                Load Image
              </Button>

              {loadedImage ? (
                <Flex align="center" justify="flex-end" width="100%" maxW="300px">
                  <Text>{loadedImageFilename}</Text>
                  <Button 
                    colorScheme="red" 
                    variant="ghost" 
                    aria-label="Delete"
                    onClick={(e) => unloadImage(e, setLoadedImageFilename, setLoadedImage)}>
                    <FaTimes size={20} />
                  </Button>
                </Flex>
              ) : (
                <Text color="gray.500">No image loaded</Text>
              )}

            </Flex>

          </Wrap>

          <Wrap marginBottom="10px" width="100%">
            <Flex
              width={{ base: "100%", md: "100%" }}
              height={{ base: "auto", md: "100%" }}
              align="center"
              justifyContent="space-between"
            >
              <Input
                type="file"
                accept="image/*"
                display="none"
                id="upload-mask"
                onChange={(e) => loadImage(e, setLoadedMaskFilename, setLoadedMask)}
              />
              <Button as="label" htmlFor="upload-mask" cursor="pointer" colorScheme="yellow" width="50%">
                Load Mask
              </Button>

              {loadedMask ? (
                <Flex align="center" justify="flex-end" width="100%" maxW="300px">
                  <Text>{loadedMaskFilename}</Text>
                  <Button 
                    colorScheme="red"
                    variant="ghost" 
                    aria-label="Delete" 
                    onClick={(e) => unloadImage(e, setLoadedMaskFilename, setLoadedMask)}>
                    <FaTimes size={20} />
                  </Button>
                </Flex>
              ) : (
                <Text color="gray.500">No mask loaded</Text>
              )}
            </Flex>

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

export default Inpainting;
