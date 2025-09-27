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
import SliderControl from "../../../components/SliderControl";
import { FileUpload, Icon, Float, useFileUploadContext } from "@chakra-ui/react"
import { LuX } from "react-icons/lu"
import { FiUpload } from 'react-icons/fi'; // Feather icons

const ImageToImage = () => {
  const [image, updateImage] = useState();
  const [loadedImage, setLoadedImage] = useState(null);

  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(0);
  const [model, setModel] = useState("1.5");


  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.image_base64) {
          setLoadedImage(`data:image/png;base64,${data.image_base64}`);
          updatePrompt(data.prompt || "");
          updateNegativePrompt(data.negative_prompt || "");
          setGuidance(data.guidance_scale || 7);
          setSeed(data.seed || 0);
        }
      } catch (e) {
        console.error("Invalid stored image data", e);
      } finally {
        localStorage.removeItem("selectedImage");
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

    if (!loadedImage) {
      toaster.create({
        title: "No image loaded",
        description: "You must upload an image to transform.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5555/model/generate/image-to-image",
        {
          model_version: model,
          image: loadedImage.split(",")[1],
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


  const handleFileChange = (fileChangeDetails) => {

    const files = fileChangeDetails.acceptedFiles;

    if (files.length === 0) {
      setLoadedImage(null);

    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => setLoadedImage(reader.result);
      reader.readAsDataURL(file);

    }
  }

  return (

    <Flex
      width='100%'
      height='100%'
      direction="row"
      wrap="wrap"
      bg="gray.100"
      justify="center"
      align='center'
    >

      <Flex w={{ base: "80%", md: "40%" }} direction='column' justify='center' align='center' gap='1'>

        <FileUpload.Root width='100%' alignItems="stretch" maxFiles={1} onFileChange={handleFileChange}>
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone width='100%' height="256px" bg='gray.100'>
            <FileUpload.DropzoneContent width='100%' height='100%'>
              <Flex width='100%' height='100%' align='center' justify='center' direction='column'>

                {loadedImage === null ? (
                  <>
                    <FiUpload size='23'></FiUpload>
                    <Box>Drag and drop files here</Box>
                    <Box color="fg.muted">.png, .jpg up to 5MB</Box>
                  </>
                ) : (

                  <Box position="relative" width="100%" height="100%">
                    <Image
                      src={loadedImage}
                      alt="Preview"
                      width="100%"
                      height="100%"
                      objectFit="contain"
                      borderRadius="md"
                    />
                    <Float placement='top-end'>
                      <Button
                        position="absolute"
                        bg="gray.700"
                        color="white"
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setLoadedImage(null);
                        }}
                      >
                        <LuX />
                      </Button>
                    </Float>
                  </Box>
                )}

              </Flex>
            </FileUpload.DropzoneContent>

          </FileUpload.Dropzone>
        </FileUpload.Root>

        <Wrap width="100%">
          <Input value={prompt} onChange={(e) => updatePrompt(e.target.value)} placeholder="Enter prompt" />
        </Wrap>

        <Wrap width="100%">
          <Input
            value={negativePrompt}
            onChange={(e) => updateNegativePrompt(e.target.value)}
            placeholder="Enter negative prompt (optional)"
          />
        </Wrap>

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
      </Flex>

      <Flex width={{ base: "80%", md: "45%" }} align='center' justify='center'>
        <Box width='512px' height='512px' bg="gray.200" borderRadius="md">
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
          ) : null
          }
        </Box>
      </Flex>
    </Flex >
  );
};

export default ImageToImage;
