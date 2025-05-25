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
  SkeletonCircle,
  SkeletonText,
  useToast,
} from "@chakra-ui/react";
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

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModels] = useState("");

  const [searchParams] = useSearchParams();
  const urlPrompt = searchParams.get("prompt");

  const toast = useToast();

  useEffect(() => {
    fetch("http://localhost:8000/model/list")
      .then((r) => r.json())
      .then(setModels)
      .catch(console.error);
  }, []);

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
          setSelectedModels(data.model || "");
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
      toast({
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
        "http://localhost:8000/model/generate/text-to-image",
        {
          model: selectedModel,
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
      toast({
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
        align="center"
        gap={{ base: "5%", md: "20%" }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "flex-start" }}
      >
        <Box width={{ base: "100%", md: "35%" }} display="flex" flexDirection="column" mb={{ base: 10, md: 0 }}>
          <Wrap mb="10px" width="100%">
            <Select
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

          <SliderControl label="Width" value={width} min={64} max={1024} step={64} onChange={setWidth} />
          <SliderControl label="Height" value={height} min={64} max={1024} step={64} onChange={setHeight} />
          <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={setGuidance} />
          <SliderControl label="Seed" value={seed} min={0} max={10000} step={1} onChange={setSeed} />

          <Button onClick={generate} colorScheme="yellow" width="100%">
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
