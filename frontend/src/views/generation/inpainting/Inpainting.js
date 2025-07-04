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
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";
import SliderControl from "../../../components/SliderControl";

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
  const [model, setModel] = useState("v1.5");

  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data) {
          setLoadedImage(`data:image/png;base64,${data.image_base64}`);
          setLoadedImageFilename("from_gallery.png");
          updatePrompt(data.prompt || "");
          updateNegativePrompt(data.negative_prompt || "");
          setGuidance(data.guidance_scale || 7.0);
          setSeed(data.seed || 0);
        }
      } catch (err) {
        console.error("Failed to parse stored image data", err);
      } finally {
        localStorage.removeItem("selectedImage");
      }
    }
  }, []);

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

    if (!loadedImage || !loadedMask) {
      toaster.create({
        title: "Missing image or mask",
        description: "You must load both an image and a mask.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/model/generate/inpainting",
        {
          model_version: model,
          image: loadedImage.split(",")[1],
          mask_image: loadedMask.split(",")[1],
          prompt,
          negative_prompt: negativePrompt,
          guidance_scale: guidance,
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
        description: "Could not generate image.",
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

          {/* Image input */}
          <FileInput
            id="upload-image"
            label="Load Image"
            filename={loadedImageFilename}
            hasFile={!!loadedImage}
            onLoad={(e) => loadImage(e, setLoadedImageFilename, setLoadedImage)}
            onRemove={(e) => unloadImage(e, setLoadedImageFilename, setLoadedImage)}
          />

          {/* Mask input */}
          <FileInput
            id="upload-mask"
            label="Load Mask"
            filename={loadedMaskFilename}
            hasFile={!!loadedMask}
            onLoad={(e) => loadImage(e, setLoadedMaskFilename, setLoadedMask)}
            onRemove={(e) => unloadImage(e, setLoadedMaskFilename, setLoadedMask)}
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

          <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={setGuidance} />
          <SliderControl label="Seed" value={seed} min={0} max={10000} step={1} onChange={setSeed} />

          <Flex direction="column" align="left" gap={1} pb={4}>
            <Text>
              Choose model
            </Text>
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
                onClick={() => setModel("v1.5")}
                borderRadius="2xl"
                border="2px solid"
                borderColor="blue.400"
                bg={model === "v1.5" ? "blue.400" : "transparent"}
                color={model === "v1.5" ? "white" : "blue.400"}
                _hover={{ bg: model === "v1.5" ? "blue.500" : "blue.100" }}
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

          <Button onClick={generate} color='black' backgroundColor="yellow.400" width="100%">
            Generate
          </Button>
        </Box>

        {/* Output Image */}
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

const FileInput = ({ id, label, filename, hasFile, onLoad, onRemove }) => (
  <Wrap mb="10px" width="100%">
    <Flex width="100%" align="center" justify="space-between">
      <Input type="file" accept="image/*" display="none" id={id} onChange={onLoad} />
      <Button as="label" htmlFor={id} cursor="pointer" color='black' backgroundColor="yellow.400" width="50%">
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
