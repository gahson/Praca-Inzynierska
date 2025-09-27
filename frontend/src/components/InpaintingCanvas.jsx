import { forwardRef, useEffect, useRef, useState } from "react";

import SliderControl from "./SliderControl";

const InpaintingCanvas = forwardRef(
  ({ imageSrc, onMaskUpdate, width, height, setMaskEditorOpenRef }, ref) => {
    const imageCanvasRef = useRef(null);
    const maskCanvasRef = useRef(null);
    const tempCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [tempContext, setTempContext] = useState(null);

    const [brushSize, setBrushSize] = useState(15);

    useEffect(() => {
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCanvasRef.current = tempCanvas;

      const imageCtx = imageCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      const tmpCtx = tempCanvas.getContext("2d");

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageCtx.clearRect(0, 0, width, height);
        imageCtx.drawImage(img, 0, 0, width, height);
      };

      if (!context) maskCtx.clearRect(0, 0, width, height);

      tmpCtx.clearRect(0, 0, width, height);
      tmpCtx.strokeStyle = "black";
      tmpCtx.lineCap = "round";

      setContext(maskCtx);
      setTempContext(tmpCtx);
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

      tempContext.lineWidth = brushSize;
      tempContext.lineTo(offsetX, offsetY);
      tempContext.stroke();

      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "destination-in";
      context.drawImage(tempCanvasRef.current, 0, 0);
      context.globalCompositeOperation = "source-over";
    };

    const stopDrawing = () => {
      if (!isDrawing || !context || !tempContext) return;
      setIsDrawing(false);
      tempContext.closePath();

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = width;
      finalCanvas.height = height;
      const finalCtx = finalCanvas.getContext("2d");
      finalCtx.drawImage(tempCanvasRef.current, 0, 0, width, height);

      const imageData = finalCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a > 0) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
      finalCtx.putImageData(imageData, 0, 0);

      const maskData = finalCanvas.toDataURL("image/png");
      onMaskUpdate(maskData);
    };

    const clearMask = () => {
      if (!context || !tempContext) return;
      context.clearRect(0, 0, width, height);
      tempContext.clearRect(0, 0, width, height);
      onMaskUpdate(null);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="grid">
          <canvas
            ref={imageCanvasRef}
            width={width}
            height={height}
            className="rounded-lg row-start-1 col-start-1"
          />
          <canvas
            ref={maskCanvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            className="rounded-lg cursor-crosshair row-start-1 col-start-1"
          />
        </div>
        
        <SliderControl
          label="Brush size"
          value={brushSize}
          min={1}
          max={100}
          step={1}
          onChange={(val) => setBrushSize(val)}
          textColor="text-white"
        />

        <button
          onClick={() => setMaskEditorOpenRef(false)}
          className="bg-yellow-500 text-white rounded hover:bg-red-600 transition px-4 py-2"
        >
          Save mask
        </button>

        <button
          onClick={clearMask}
          className="bg-red-500 text-white rounded hover:bg-red-600 transition px-4 py-2"
        >
          Delete mask
        </button>

         

      </div>
    );
  }
);

export default InpaintingCanvas;
