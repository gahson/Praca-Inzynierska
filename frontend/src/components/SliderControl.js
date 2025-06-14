import {
  Box,
  Slider,
  Text,
  Wrap,
} from "@chakra-ui/react";

const SliderControl = ({ label, value, min, max, step, onChange }) => (
  <Wrap mb="10px" width="100%">
    <Box mb="10px" width="100%">
      <Text mb={2}>
        {label}: {value}
      </Text>

      <Slider.Root colorPalette="cyan" defaultValue={[value]} step={step} min={min} max={max} onValueChange={(e)=>onChange(e.value)}>
        <Slider.Label />
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb>
            <Slider.DraggingIndicator />
            <Slider.HiddenInput />
          </Slider.Thumb>
          <Slider.MarkerGroup>
            <Slider.Marker />
          </Slider.MarkerGroup>
        </Slider.Control>
      </Slider.Root>
      
    </Box>
  </Wrap>
);

export default SliderControl;
