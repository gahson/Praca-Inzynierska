import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

import { toaster } from "../../../components/ui/toaster";
import SliderControl from "../../../components/SliderControl";
import InpaintingCanvas from "../../../components/InpaintingCanvas";

const Inpainting = () => {
  const [image, updateImage] = useState();
  const [loadedImage, setLoadedImage] = useState(null);
  const [loadedImageFilename, setLoadedImageFilename] = useState("");
  const [maskData, setMaskData] = useState(null);
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(0);
  const [model, setModel] = useState("2.0-inpainting");
  const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });
  const [maskEditorOpen, setMaskEditorOpen] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data) {
          const img = new Image();
          img.src = `data:image/png;base64,${data.image_base64}`;
          img.onload = () => {
            const validatedWidth = Math.round(img.width / 8) * 8;
            const validatedHeight = Math.round(img.height / 8) * 8;
            setImageDimensions({ width: validatedWidth, height: validatedHeight });
            setLoadedImage(`data:image/png;base64,${data.image_base64}`);
            setLoadedImageFilename("from_gallery.png");
            updatePrompt(data.prompt || "");
            updateNegativePrompt(data.negative_prompt || "");
            setGuidance(data.guidance_scale || 7.0);
            setSeed(data.seed || 0);
          };
        }
      } catch (err) {
        console.error("Failed to parse stored image data", err);
      } finally {
        localStorage.removeItem("selectedImage");
      }
    }
  }, []);

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadedImageFilename(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const validatedWidth = Math.round(img.width / 8) * 8;
        const validatedHeight = Math.round(img.height / 8) * 8;
        setImageDimensions({ width: validatedWidth, height: validatedHeight });
        setLoadedImage(reader.result);
        setMaskEditorOpen(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const unloadImage = () => {
    setLoadedImageFilename("");
    setLoadedImage(null);
    setMaskData(null);
    setImageDimensions({ width: 512, height: 512 });
    setMaskEditorOpen(false);
  };

  const generate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toaster.create({
        title: "Not logged in",
        description: "You must be logged in to generate images.",
        status: "warning",
      });
      return;
    }

    if (!loadedImage) {
      toaster.create({
        title: "Missing image",
        description: "You must load an image.",
        status: "error",
      });
      return;
    }

    if (!maskData) {
      toaster.create({
        title: "Missing mask",
        description: "You must draw a mask on the image.",
        status: "error",
      });
      return;
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5555/model/generate/inpainting",
        {
          model_version: model,
          image: loadedImage.split(",")[1],
          mask_image: maskData.split(",")[1],
          prompt,
          negative_prompt: negativePrompt,
          guidance_scale: guidance,
          seed,
          strength: 1.0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      updateImage(response.data.image);
    } catch (error) {
      console.error("Error:", error.response?.data?.detail || error.message);
      toaster.create({
        title: "Generation failed",
        description: error.response?.data?.detail || "Could not generate image.",
        status: "error",
      });
    } finally {
      updateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-[1800px] flex flex-col xl:flex-row gap-8"> {/*justify-center items-center mx-auto*/}
        {/* Panel */}
        <div className="flex-1 flex flex-col gap-4 justify-center items-start">
          <FileInput
            id="upload-image"
            label="Load Image"
            filename={loadedImageFilename}
            hasFile={!!loadedImage}
            onLoad={loadImage}
            onRemove={unloadImage}
          />

          <input
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            placeholder="Enter prompt"
            className="w-full p-2 border rounded"
          />
          <input
            value={negativePrompt}
            onChange={(e) => updateNegativePrompt(e.target.value)}
            placeholder="Enter negative prompt (optional)"
            className="w-full p-2 border rounded"
          />

          <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={(v) => setGuidance(v[0])} />
          <SliderControl label="Seed" value={seed} min={0} max={10000} step={1} onChange={(v) => setSeed(v[0])} />

          <div className="flex flex-col gap-2 items-start w-full">
            <p>Choose model</p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setModel("2.0-inpainting")}
                className={`rounded-2xl border-2 px-4 py-2 transition ${model === "2.0-inpainting"
                  ? "bg-black text-white"
                  : "text-black bg-transparent hover:bg-gray-200"
                  }`}
              >
                2.0-inpainting
              </button>
            </div>
          </div>

          <button onClick={generate} className="mt-auto w-full bg-yellow-400 text-black py-2 rounded">
            Generate
          </button>
        </div>

        {/* Generated Image */}
        <div className="flex-1 aspect-square flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 animate-pulse w-full h-full">
              <div className="rounded-full bg-gray-300 h-12 w-12"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ) : (
            image && <img src={`data:image/png;base64,${image}`} className="object-contain w-full h-full rounded-md shadow-lg" />
          )}
        </div>
      </div>

      {maskEditorOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex justify-center items-center">
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex justify-center items-center bg-black/90" />
          <div className="relative z-[9999] flex justify-center items-center">
            <InpaintingCanvas
              imageSrc={loadedImage}
              onMaskUpdate={setMaskData}
              width={imageDimensions.width}
              height={imageDimensions.height}
              setMaskEditorOpenRef={setMaskEditorOpen}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FileInput = ({ id, label, filename, hasFile, onLoad, onRemove }) => (
  <div className="w-full flex items-center gap-2">
    <input type="file" accept="image/*" id={id} onChange={onLoad} className="hidden" />
    <label
      htmlFor={id}
      className="cursor-pointer bg-yellow-400 text-black px-4 py-2 rounded w-1/2 text-center"
    >
      {label}
    </label>

    {hasFile ? (
      <div className="flex items-center gap-2">
        <span className="truncate max-w-[200px]">{filename}</span>
        <button
          onClick={onRemove}
          className="bg-red-500 text-white px-2 py-1 rounded flex items-center justify-center"
        >
          <FaTimes size={16} />
        </button>
      </div>
    ) : (
      <span className="text-gray-500">No file loaded</span>
    )}
  </div>
);

export default Inpainting;