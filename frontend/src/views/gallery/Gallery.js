import {
  Box,
  Heading,
  Text,
  Image,
  Stack,
  Button,
  Wrap,
} from "@chakra-ui/react";
import { toaster } from "../../components/ui/toaster"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const navigate = useNavigate();

  const fetchGallery = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:8000/gallery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sort newest first
      setGallery(
        res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    } catch {
      toaster.create({
        title: "Error",
        description: "Unable to load gallery.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDelete = async (imageId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:8000/gallery/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toaster.create({
        title: "Deleted",
        description: "Image deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setGallery(gallery.filter((img) => img.id !== imageId));
    } catch {
      toaster.create({
        title: "Error",
        description: "Failed to delete image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRedirect = (img, mode) => {
    localStorage.setItem("selectedImage", JSON.stringify(img));
    navigate(`/views/generation/${mode}`);
  };

  return (
    <Box p={10} bg="gray.100" minHeight="100vh">
      <Heading mb={8}>Your Gallery</Heading>
      <Wrap spacing="20px" justify="center">
        {gallery.map((img) => (
          <Box
            key={img.id}
            p={3}
            bg="white"
            borderRadius="md"
            boxShadow="md"
            w="300px"
          >
            <Image
              src={`data:image/png;base64,${img.image_base64}`}
              alt="generated"
              borderRadius="md"
              mb={3}
              w="100%"
            />
            <Stack spacing={0.5} fontSize="sm">
              <Text><b>Model:</b> {img.model}</Text>
              <Text><b>Mode:</b> {img.mode}</Text>
              <Text><b>Size:</b> {img.width} × {img.height}</Text>
              <Text><b>Prompt:</b> {img.prompt}</Text>
              <Text><b>Seed:</b> {img.seed}</Text>
              <Text><b>Guidance:</b> {img.guidance_scale}</Text>
              <Text><b>Created:</b> {new Date(img.created_at).toLocaleString()}</Text>
            </Stack>
            <Stack direction="column" spacing={2} mt={3}>
              <Button
                size="xs"
                colorScheme="blue"
                onClick={() => handleRedirect(img, "text-to-image")}
              >
                Use in Text2Image
              </Button>
              <Button
                size="xs"
                colorScheme="green"
                onClick={() => handleRedirect(img, "image-to-image")}
              >
                Use in Img2Img
              </Button>
              <Button
                size="xs"
                colorScheme="purple"
                onClick={() => handleRedirect(img, "inpainting")}
              >
                Use in Inpainting
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => handleDelete(img.id)}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        ))}
      </Wrap>
    </Box>
  );
};

export default Gallery;
