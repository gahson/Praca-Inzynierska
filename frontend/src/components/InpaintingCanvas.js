import { forwardRef, useEffect, useRef, useState } from "react";
import { Box, Button, VStack } from "@chakra-ui/react";

const InpaintingCanvas = forwardRef(
  ({ imageSrc, onMaskUpdate, width, height }, ref) => {
    const imageCanvasRef = useRef(null); // Canvas for the image
    const maskCanvasRef = useRef(null); // Canvas for the mask
    const tempCanvasRef = useRef(null); // Temporary canvas for consistent opacity
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [tempContext, setTempContext] = useState(null);

    useEffect(() => {
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCanvasRef.current = tempCanvas;

      const imageCtx = imageCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      const tempCtx = tempCanvas.getContext("2d");

      // Load the background image
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageCtx.drawImage(img, 0, 0, width, height);
        console.log("Image loaded:", img.width, img.height);
      };

      // Initialize mask canvas (transparent background)
      maskCtx.fillStyle = "rgba(0, 0, 0, 0)";
      maskCtx.fillRect(0, 0, width, height);

      // Initialize temporary canvas for drawing
      tempCtx.fillStyle = "rgba(0, 0, 0, 0)";
      tempCtx.fillRect(0, 0, width, height);
      tempCtx.strokeStyle = "black"; // Solid black for temporary drawing
      tempCtx.lineWidth = 10;
      tempCtx.lineCap = "round";

      setContext(maskCtx);
      setTempContext(tempCtx);
    }, [imageSrc, width, height]);

    const startDrawing = (e) => {
      if (!tempContext) return;
      setIsDrawing(true);
      const { offsetX, offsetY } = e.nativeEvent;
      tempContext.beginPath();
      tempContext.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
      if (!isDrawing || !tempContext || !context) return;
      const { offsetX, offsetY } = e.nativeEvent;
      tempContext.lineTo(offsetX, offsetY);
      tempContext.stroke();

      // Clear mask canvas and redraw with uniform opacity
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(0, 0, 0, 0.5)"; // Uniform semi-transparent black
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "destination-in"; // Only keep areas where tempCanvas has drawn
      context.drawImage(tempCanvasRef.current, 0, 0);
      context.globalCompositeOperation = "source-over"; // Reset to default
    };

    const stopDrawing = () => {
      if (!isDrawing || !context || !tempContext) return;
      setIsDrawing(false);
      tempContext.closePath();

      // Generate grayscale mask (white = masked area)
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.drawImage(tempCanvasRef.current, 0, 0, width, height);

      const imageData = tempCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]; // Check alpha channel
        if (a > 0) { // Any non-transparent pixel becomes white
          data[i] = 255; // R
          data[i + 1] = 255; // G
          data[i + 2] = 255; // B
          data[i + 3] = 255; // A
        } else {
          data[i] = 0; // R
          data[i + 1] = 0; // G
          data[i + 2] = 0; // B
          data[i + 3] = 0; // A
        }
      }
      tempCtx.putImageData(imageData, 0, 0);

      const maskData = tempCanvas.toDataURL("image/png");
      console.log("Mask generated:", width, height);
      onMaskUpdate(maskData);
    };

    const clearMask = () => {
      if (!context || !tempContext) return;
      context.clearRect(0, 0, width, height);
      tempContext.clearRect(0, 0, width, height);
      onMaskUpdate(null); // Send null to indicate no mask
      console.log("Mask cleared");
    };

    return (
      <VStack spacing={4}>
        <Box position="relative" width={`${width}px`} height={`${height}px`}>
          {/* Image canvas */}
          <canvas
            ref={imageCanvasRef}
            width={width}
            height={height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              borderRadius: "8px",
            }}
          />
          {/* Mask canvas */}
          <canvas
            ref={maskCanvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
              borderRadius: "8px",
              cursor: "crosshair",
            }}
          />
        </Box>

        {/* Buttons */}
        <Button colorScheme="red" onClick={clearMask}>
          Delete mask
        </Button>
      </VStack>
    );
  }
);

export default InpaintingCanvas;