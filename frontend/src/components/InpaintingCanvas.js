import { forwardRef, useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";

const InpaintingCanvas = forwardRef(({ imageSrc, onMaskUpdate, width, height }, ref) => {
  const imageCanvasRef = useRef(null); // Background image canvas
  const maskCanvasRef = useRef(null); // Mask drawing canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    const imageCtx = imageCanvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    // Load background image
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageCtx.drawImage(img, 0, 0, width, height);
      console.log("Loaded image dimensions:", img.width, img.height);
    };

    // Initialize mask canvas
    maskCtx.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent background
    maskCtx.fillRect(0, 0, width, height);
    maskCtx.strokeStyle = "white"; // White for masked areas
    maskCtx.lineWidth = 10;
    maskCtx.lineCap = "round";

    setContext(maskCtx);
  }, [imageSrc, width, height]);

  const startDrawing = (e) => {
    if (!context) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !context) return;
    setIsDrawing(false);
    context.closePath();

    // Create grayscale mask
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    // Copy mask canvas content
    tempCtx.drawImage(maskCanvasRef.current, 0, 0, width, height);

    // Convert to grayscale (white for masked areas, transparent/black for unmasked)
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const a = data[i + 3];
      if (r === 255 && a === 255) {
        // Masked areas: white (255)
        data[i] = 255; // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 255; // A
      } else {
        // Unmasked areas: transparent black (0)
        data[i] = 0; // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 0; // A
      }
    }
    tempCtx.putImageData(imageData, 0, 0);

    // Export mask as base64
    const maskData = tempCanvas.toDataURL("image/png");
    console.log("Generated mask dimensions:", width, height);
    onMaskUpdate(maskData);
  };

  return (
    <Box position="relative" width={`${width}px`} height={`${height}px`}>
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
        }}
      />
    </Box>
  );
});

export default InpaintingCanvas;