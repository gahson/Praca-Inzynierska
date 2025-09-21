import {
  Flex,
  Text,
  Input,
  Button,
  Wrap,
  Stack,
  Image,
  Box,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import { toaster } from "../../../components/ui/toaster"
import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SliderControl from "../../../components/SliderControl";

const TextToImage = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(0);
  const [model, setModel] = useState("1.5");

  const [searchParams] = useSearchParams();
  const urlPrompt = searchParams.get("prompt");

  useEffect(() => {
    if (urlPrompt) {
      updatePrompt(urlPrompt);
    }
  }, [urlPrompt]);

  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data) {
          updatePrompt(data.prompt || "");
          updateNegativePrompt(data.negative_prompt || "");
          setGuidance(data.guidance_scale || 7);
          setSeed(data.seed || 0);
          setWidth(data.width || 512);
          setHeight(data.height || 512);
          localStorage.removeItem("selectedImage");
        }
      } catch (e) {
        console.error("Invalid image data", e);
      }
    }
  }, []);

  const generate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toaster.create({
        title: "Not logged in",
        description: "You must be logged in to generate images.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5555/model/generate/text-to-image",
        {
          model_version: model,
          prompt,
          negative_prompt: negativePrompt,
          guidance_scale: guidance,
          width,
          height,
          seed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateImage(response.data.image);
    } catch (error) {
      console.error("Error:", error);
      toaster.create({
        title: "Generation failed",
        description: error.response?.data?.detail || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      updateLoading(false);
    }
  };

  return (
    <Box bg="gray.100" minHeight="100vh" px={{ base: 4, md: 8 }} py={{ base: 6, md: 12 }}>
      <Flex
        mt={{ base: "1vh", md: "15vh" }}
        mb={{ base: "1vh", md: "15vh" }}
        justify="center"
        gap={{ base: "5%", md: "20%" }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "flex-start" }}
      >
        <Box width={{ base: "100%", md: "35%" }} display="flex" flexDirection="column" mb={{ base: 10, md: 0 }}>

          <Wrap mb="10px" width="100%">
            <Input value={prompt} onChange={(e) => updatePrompt(e.target.value)} placeholder="Enter prompt" />
          </Wrap>

          <Wrap mb="10px" width="100%">
            <Input
              value={negativePrompt}
              onChange={(e) => updateNegativePrompt(e.target.value)}
              placeholder="Enter negative prompt (optional)"
            />
          </Wrap>

          <SliderControl label="Width" value={width} min={64} max={1024} step={64} onChange={(value) => setWidth(value[0])} />
          <SliderControl label="Height" value={height} min={64} max={1024} step={64} onChange={(value) => setHeight(value[0])} />
          <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={(value) => setGuidance(value[0])} />
          <SliderControl label="Seed" value={seed} min={0} max={10000} step={1} onChange={(value) => setSeed(value[0])} />

          <Flex direction="column" align="left" gap={1} pb={4}>
            <Text>
              Choose model
            </Text>
            <Flex direction="row" gap={4}>
              <Button
                onClick={() => setModel("1.5")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="green.400"
                bg={model === "1.5" ? "green.400" : "transparent"}
                color={model === "1.5" ? "white" : "green.400"}
                _hover={{ bg: model === "1.5" ? "green.500" : "green.100" }}
              >
                1.5
              </Button>
              <Button
                onClick={() => setModel("2.1")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="orange.400"
                bg={model === "2.1" ? "orange.400" : "transparent"}
                color={model === "2.1" ? "white" : "orange.400"}
                _hover={{ bg: model === "2.1" ? "orange.500" : "orange.100" }}
              >
                2.1
              </Button>
              <Button
                onClick={() => setModel("3.0")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="blue.400"
                bg={model === "3.0" ? "blue.400" : "transparent"}
                color={model === "3.0" ? "white" : "blue.400"}
                _hover={{ bg: model === "3.0" ? "blue.500" : "blue.100" }}
              >
                3.0
              </Button>
              <Button
                onClick={() => setModel("xl")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="purple.400"
                bg={model === "xl" ? "purple.400" : "transparent"}
                color={model === "xl" ? "white" : "purple.400"}
                _hover={{ bg: model === "xl" ? "purple.500" : "purple.100" }}
              >
                xl
              </Button>
            </Flex>
          </Flex>

          <Button onClick={generate} color='black' backgroundColor="yellow.400" width="100%">
            Generate
          </Button>
        </Box>

        <Flex
          width={{ base: "100%", md: "512px" }}
          height={{ base: "auto", md: "512px" }}
          align="center"
          justify="center"
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
              alt="Generated"
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
