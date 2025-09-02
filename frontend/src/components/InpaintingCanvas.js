import { forwardRef, useEffect, useRef, useState } from "react";
import { Box, Button, VStack } from "@chakra-ui/react";

const InpaintingCanvas = forwardRef(
  ({ imageSrc, onMaskUpdate, width, height }, ref) => {
    const imageCanvasRef = useRef(null); // Płótno z obrazem
    const maskCanvasRef = useRef(null); // Płótno z maską
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);

    useEffect(() => {
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      const imageCtx = imageCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");

      // Załaduj obraz na tło
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageCtx.drawImage(img, 0, 0, width, height);
        console.log("Załadowano obraz:", img.width, img.height);
      };

      // Inicjalizacja maski (przezroczyste tło)
      maskCtx.fillStyle = "rgba(0, 0, 0, 0)";
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.strokeStyle = "white"; // Maskowane obszary = białe
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

      // Generowanie maski w formacie grayscale (białe = maska)
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.drawImage(maskCanvasRef.current, 0, 0, width, height);

      const imageData = tempCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const a = data[i + 3];
        if (r === 255 && a === 255) {
          data[i] = 255; // R
          data[i + 1] = 255; // G
          data[i + 2] = 255; // B
          data[i + 3] = 255; // A
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
      tempCtx.putImageData(imageData, 0, 0);

      const maskData = tempCanvas.toDataURL("image/png");
      console.log("Wygenerowano maskę:", width, height);
      onMaskUpdate(maskData);
    };

    const clearMask = () => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      onMaskUpdate(null); // Możemy wysłać null, aby oznaczyć brak maski
      console.log("Maska została wyczyszczona");
    };

    return (
      <VStack spacing={4}>
        <Box position="relative" width={`${width}px`} height={`${height}px`}>
          {/* Płótno z obrazem */}
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
          {/* Płótno do rysowania maski */}
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

        {/* Przyciski */}
        <Button colorScheme="red" onClick={clearMask}>
          Delete mask
        </Button>
      </VStack>
    );
  }
);

export default InpaintingCanvas;
