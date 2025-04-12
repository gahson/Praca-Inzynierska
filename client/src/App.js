import {
  ChakraProvider,
  Heading,
  Container,
  Text,
  Input,
  Button,
  Wrap,
  Stack,
  Image,
  Link,
  SkeletonCircle,
  SkeletonText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";

const App = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState();
  const [loading, updateLoading] = useState();
  const [width, setWidth] = useState(512); // Default width
  const [height, setHeight] = useState(512); // Default height

  const generate = async (prompt) => {
    updateLoading(true);
    const result = await axios.get(
      `http://127.0.0.1:8000/?prompt=${prompt}&width=${width}&height=${height}`
    );
    updateImage(result.data.image);
    updateLoading(false);
  };

  return (
    <ChakraProvider>
      <Container>
        <Heading>Stable Diffusion 🚀</Heading>
        <Text marginBottom={"10px"}>
          This react application leverages the model trained by Stability AI and
          Runway ML to generate images using the Stable Diffusion Deep Learning
          model. The model can be found via GitHub here{" "}
          <Link href={"https://github.com/CompVis/stable-diffusion"}>
            Github Repo
          </Link>
        </Text>

        <Wrap marginBottom={"10px"}>
          <Input
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            width={"350px"}
          ></Input>
          <Button onClick={(e) => generate(prompt)} colorScheme={"yellow"}>
            Generate
          </Button>
        </Wrap>

        {/* Width Slider */}
        <Box>
          <Text mb={2}>Width: {width}</Text>
          <Slider
            aria-label="Width"
            defaultValue={512}
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
            defaultValue={512}
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

        {loading ? (
          <Stack>
            <SkeletonCircle />
            <SkeletonText />
          </Stack>
        ) : image ? (
          <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
        ) : null}
      </Container>
    </ChakraProvider>
  );
};

export default App;