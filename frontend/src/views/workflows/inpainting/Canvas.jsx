import React, { useRef, useEffect } from "react";

const CanvasPreview = ({ original, mask, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!original) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = original;

    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      if (mask) {
        const maskImg = new Image();
        maskImg.src = mask;
        maskImg.onload = () => {
          ctx.globalAlpha = 0.5;
          ctx.drawImage(maskImg, 0, 0, width, height);
          ctx.globalAlpha = 1.0;
        };
      }
    };
  }, [original, mask, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="object-contain w-full h-full rounded-md shadow-lg" />;
};

export default CanvasPreview;
