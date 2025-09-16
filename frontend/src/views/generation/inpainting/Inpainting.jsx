import {
  Flex,
  Text,
  Input,
  Button,
  Wrap,
  Stack,
  Image as ChakraImage,
  Box,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import { toaster } from "../../../components/ui/toaster";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import SliderControl from "../../../components/SliderControl";
import InpaintingCanvas from "../../../components/InpaintingCanvas";

const Inpainting = () => {
  const [image, updateImage] = useState();
  const [loadedImage, setLoadedImage] = useState(null);
  const [loadedImageFilename, setLoadedImageFilename] = useState("");
  const [maskData, setMaskData] = useState(null);
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(0);
  const [model, setModel] = useState("runwayml/stable-diffusion-inpainting");
  const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });

  const canvasRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data) {
          const img = new Image();
          img.src = `data:image/png;base64,${data.image_base64}`;
          img.onload = () => {
            const validatedWidth = Math.round(img.width / 8) * 8;
            const validatedHeight = Math.round(img.height / 8) * 8;
            setImageDimensions({ width: validatedWidth, height: validatedHeight });
            setLoadedImage(`data:image/png;base64,${data.image_base64}`);
            setLoadedImageFilename("from_gallery.png");
            updatePrompt(data.prompt || "");
            updateNegativePrompt(data.negative_prompt || "");
            setGuidance(data.guidance_scale || 7.0);
            setSeed(data.seed || 0);
          };
        }
      } catch (err) {
        console.error("Failed to parse stored image data", err);
      } finally {
        localStorage.removeItem("selectedImage");
      }
    }
  }, []);

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadedImageFilename(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const validatedWidth = Math.round(img.width / 8) * 8;
        const validatedHeight = Math.round(img.height / 8) * 8;
        setImageDimensions({ width: validatedWidth, height: validatedHeight });
        setLoadedImage(reader.result);
      };
    };
    reader.readAsDataURL(file);
  };

  const unloadImage = () => {
    setLoadedImageFilename("");
    setLoadedImage(null);
    setMaskData(null);
    setImageDimensions({ width: 512, height: 512 });
  };

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

    if (!loadedImage) {
      toaster.create({
        title: "Missing image",
        description: "You must load an image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!maskData) {
      toaster.create({
        title: "Missing mask",
        description: "You must draw a mask on the image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5555/model/generate/inpainting",
        {
          model_version: model,
          image: loadedImage.split(",")[1],
          mask_image: maskData.split(",")[1],
          prompt,
          negative_prompt: negativePrompt,
          guidance_scale: guidance,
          seed,
          strength: 1.0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateImage(response.data.image);
    } catch (error) {
      console.error("Error:", error.response?.data?.detail || error.message);
      toaster.create({
        title: "Generation failed",
        description: error.response?.data?.detail || "Could not generate image.",
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
          <FileInput
            id="upload-image"
            label="Load Image"
            filename={loadedImageFilename}
            hasFile={!!loadedImage}
            onLoad={loadImage}
            onRemove={unloadImage}
          />

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

          <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={(value) => setGuidance(value[0])} />
          <SliderControl label="Seed" value={seed} min={0} max={10000} step={1} onChange={(value) => setSeed(value[0])} />

          <Flex direction="column" align="left" gap={1} pb={4}>
            <Text>Choose model</Text>
            <Flex direction="row" gap={4}>
              <Button
                onClick={() => setModel("v1.4")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="green.400"
                bg={model === "v1.4" ? "green.400" : "transparent"}
                color={model === "v1.4" ? "white" : "green.400"}
                _hover={{ bg: model === "v1.4" ? "green.500" : "green.100" }}
              >
                v1.4
              </Button>
              <Button
                onClick={() => setModel("runwayml/stable-diffusion-inpainting")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="blue.400"
                bg={model === "runwayml/stable-diffusion-inpainting" ? "blue.400" : "transparent"}
                color={model === "runwayml/stable-diffusion-inpainting" ? "white" : "blue.400"}
                _hover={{ bg: model === "runwayml/stable-diffusion-inpainting" ? "blue.500" : "blue.100" }}
              >
                v1.5
              </Button>
              <Button
                onClick={() => setModel("v2.0")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="purple.400"
                bg={model === "v2.0" ? "purple.400" : "transparent"}
                color={model === "v2.0" ? "white" : "purple.400"}
                _hover={{ bg: model === "v2.0" ? "purple.500" : "purple.100" }}
              >
                v2.0
              </Button>
            </Flex>
          </Flex>

          <Button onClick={generate} color="black" backgroundColor="yellow.400" width="100%">
            Generate
          </Button>
        </Box>

        <Flex
          width={{ base: "100%", md: `${imageDimensions.width}px` }}
          height={{ base: "auto", md: `${imageDimensions.height}px` }}
          align="center"
          justify="center"
          bg="gray.200"
          borderRadius="md"
          position="relative"
        >
          {loading ? (
            <Stack width="100%" height="100%">
              <SkeletonCircle />
              <SkeletonText />
            </Stack>
          ) : image ? (
            <ChakraImage
              src={`data:image/png;base64,${image}`}
              alt="Generated Image"
              boxShadow="lg"
              borderRadius="md"
              width="100%"
              height="100%"
              objectFit="contain"
            />
          ) : loadedImage ? (
            <InpaintingCanvas

              imageSrc={loadedImage}
              onMaskUpdate={setMaskData}
              width={imageDimensions.width}
              height={imageDimensions.height}
            />
          ) : (
            <Text color="gray.500">No image loaded</Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

const FileInput = ({ id, label, filename, hasFile, onLoad, onRemove }) => (
  <Wrap mb="10px" width="100%">
    <Flex width="100%" align="center" justify="space-between">
      <Input type="file" accept="image/*" display="none" id={id} onChange={onLoad} />
      <Button as="label" htmlFor={id} cursor="pointer" color="black" backgroundColor="yellow.400" width="50%">
        {label}
      </Button>

      {hasFile ? (
        <Flex align="center" justify="flex-end" width="100%" maxW="300px">
          <Text>{filename}</Text>
          <Button backgroundColor="red.500" variant="ghost" aria-label="Delete" onClick={onRemove}>
            <FaTimes size={20} />
          </Button>
        </Flex>
      ) : (
        <Text color="gray.500">No file loaded</Text>
      )}
    </Flex>
  </Wrap>
);

export default Inpainting;