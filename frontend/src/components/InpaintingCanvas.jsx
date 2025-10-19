import { forwardRef, useEffect, useRef, useState } from "react";

const SliderControl = ({ label, value, min, max, step, onChange, textColor }) => (
  <div className="w-full max-w-md">
    <label className={`block mb-2 ${textColor}`}>{label}: {value}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

const InpaintingCanvas = forwardRef(
  ({ imageSrc, onMaskUpdate, width, height, setMaskEditorOpenRef }, ref) => {
    const [canvasSize, setCanvasSize] = useState(0);
    
    const imageCanvasRef = useRef(null);
    const maskCanvasRef = useRef(null);
    const tempCanvasRef = useRef(null);
    const cursorCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [tempContext, setTempContext] = useState(null);
    const [cursorContext, setCursorContext] = useState(null);
    const [scale, setScale] = useState(1);

    const [brushSize, setBrushSize] = useState(15);
    const lastPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
      const updateCanvasSize = () => {
        const vh = window.innerHeight * 0.7;
        setCanvasSize(Math.floor(vh));
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    useEffect(() => {
      if (canvasSize === 0) return;
      
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const cursorCanvas = cursorCanvasRef.current;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasSize;
      tempCanvas.height = canvasSize;
      tempCanvasRef.current = tempCanvas;

      const imageCtx = imageCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      const tmpCtx = tempCanvas.getContext("2d");
      const cursorCtx = cursorCanvas.getContext("2d");

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const scaleX = canvasSize / width;
        const scaleY = canvasSize / height;
        const computedScale = Math.min(scaleX, scaleY);
        setScale(computedScale);

        const scaledWidth = width * computedScale;
        const scaledHeight = height * computedScale;
        const offsetX = (canvasSize - scaledWidth) / 2;
        const offsetY = (canvasSize - scaledHeight) / 2;

        imageCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      };

      if (!context) maskCtx.clearRect(0, 0, canvasSize, canvasSize);

      tmpCtx.clearRect(0, 0, canvasSize, canvasSize);
      tmpCtx.strokeStyle = "black";
      tmpCtx.lineCap = "round";

      setContext(maskCtx);
      setTempContext(tmpCtx);
      setCursorContext(cursorCtx);
    }, [imageSrc, width, height, canvasSize]);

    const drawCursor = (x, y) => {
      if (!cursorContext) return;
      cursorContext.clearRect(0, 0, canvasSize, canvasSize);
      cursorContext.beginPath();
      cursorContext.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      cursorContext.strokeStyle = "white";
      cursorContext.lineWidth = 2;
      cursorContext.stroke();
    };

    const startDrawing = (e) => {
      if (!tempContext) return;
      setIsDrawing(true);
      const { offsetX, offsetY } = e.nativeEvent;
      lastPosRef.current = { x: offsetX, y: offsetY };
      tempContext.beginPath();
      tempContext.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
      const { offsetX, offsetY } = e.nativeEvent;
      drawCursor(offsetX, offsetY);
      
      if (!isDrawing || !tempContext || !context) return;

      const lastX = lastPosRef.current.x;
      const lastY = lastPosRef.current.y;
      const distance = Math.sqrt((offsetX - lastX) ** 2 + (offsetY - lastY) ** 2);
      const steps = Math.max(1, Math.floor(distance / (brushSize / 4)));

      tempContext.lineWidth = brushSize;
      tempContext.lineJoin = "round";
      tempContext.lineCap = "round";

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = lastX + (offsetX - lastX) * t;
        const y = lastY + (offsetY - lastY) * t;
        
        if (i === 0) {
          tempContext.moveTo(x, y);
        } else {
          tempContext.lineTo(x, y);
        }
      }
      tempContext.stroke();

      lastPosRef.current = { x: offsetX, y: offsetY };

      context.clearRect(0, 0, canvasSize, canvasSize);
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, canvasSize, canvasSize);
      context.globalCompositeOperation = "destination-in";
      context.drawImage(tempCanvasRef.current, 0, 0);
      context.globalCompositeOperation = "source-over";
    };

    const stopDrawing = () => {
      if (!isDrawing || !context || !tempContext) return;
      setIsDrawing(false);
      tempContext.closePath();

      const tempMaskCanvas = document.createElement("canvas");
      tempMaskCanvas.width = canvasSize;
      tempMaskCanvas.height = canvasSize;
      const tempMaskCtx = tempMaskCanvas.getContext("2d");
      tempMaskCtx.drawImage(tempCanvasRef.current, 0, 0, canvasSize, canvasSize);

      const imageData = tempMaskCtx.getImageData(0, 0, canvasSize, canvasSize);
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
      tempMaskCtx.putImageData(imageData, 0, 0);

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = width;
      finalCanvas.height = height;
      const finalCtx = finalCanvas.getContext("2d");

      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const offsetX = (canvasSize - scaledWidth) / 2;
      const offsetY = (canvasSize - scaledHeight) / 2;

      finalCtx.drawImage(
        tempMaskCanvas,
        offsetX, offsetY, scaledWidth, scaledHeight,
        0, 0, width, height
      );

      const maskData = finalCanvas.toDataURL("image/png");
      onMaskUpdate(maskData);
    };

    const clearMask = () => {
      if (!context || !tempContext) return;
      context.clearRect(0, 0, canvasSize, canvasSize);
      tempContext.clearRect(0, 0, canvasSize, canvasSize);
      onMaskUpdate(null);
    };

    function handleExit(){
      clearMask();
      setMaskEditorOpenRef(false);
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => handleExit()}
          className="self-end bg-red-500 text-white rounded-full flex items-center justify-center px-2 px-2"
          aria-label="Close editor"
        >
          X
        </button>
        
        <div className="grid relative">
          <canvas
            ref={imageCanvasRef}
            width={canvasSize}
            height={canvasSize}
            className="rounded-lg row-start-1 col-start-1"
          />
          <canvas
            ref={maskCanvasRef}
            width={canvasSize}
            height={canvasSize}
            className="rounded-lg row-start-1 col-start-1"
          />
          <canvas
            ref={cursorCanvasRef}
            width={canvasSize}
            height={canvasSize}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={() => {
              if (cursorContext) cursorContext.clearRect(0, 0, canvasSize, canvasSize);
              stopDrawing();
            }}
            className="rounded-lg cursor-none row-start-1 col-start-1"
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

        <div className="flex gap-4 flex-wrap justify-center flex-shrink-0">
          <button
            onClick={() => setMaskEditorOpenRef(false)}
            className="bg-yellow-500 text-white rounded hover:bg-yellow-600 transition px-4 py-2"
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
      </div>
    );
  }
);

export default InpaintingCanvas;