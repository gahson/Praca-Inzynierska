import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Wrap,
} from "@chakra-ui/react";

const SliderControl = ({ label, value, min, max, step, onChange }) => (
  <Wrap mb="10px" width="100%">
    <Box mb="10px" width="100%">
      <Text mb={2}>
        {label}: {value}
      </Text>
      <Slider
        aria-label={label}
        defaultValue={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  </Wrap>
);

export default SliderControl;
