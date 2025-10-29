import axios from "axios";
import { LuX } from "react-icons/lu";
import { FiUpload } from 'react-icons/fi';
import { useState, useEffect, useRef } from "react";

import { toaster } from "../../../components/ui/toaster";
import SliderControl from "../../../components/SliderControl";

const ImageToImage = () => {
  const [image, updateImage] = useState();
  const [loadedImage, setLoadedImage] = useState(null);

  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 999999999999999));
  const [model, setModel] = useState("1.5");
  const [scalingMode, setScalingMode] = useState("scale_to_megapixels");

  const [showAdvancedParameters, setShowAdvancedParameters] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.image_base64) {
          setLoadedImage(`data:image/png;base64,${data.image_base64}`);
          updatePrompt(data.prompt || "");
          updateNegativePrompt(data.negative_prompt || "");
          setGuidance(data.guidance_scale || 7);
          setSeed(data.seed || 0);
        }
      } catch (e) {
        console.error("Invalid stored image data", e);
      } finally {
        localStorage.removeItem("selectedImage");
      }
    }
  }, []);

  const generate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toaster.create({
        title: "Not logged in",
        description: "You must be logged in to generate images.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!loadedImage) {
      toaster.create({
        title: "No image loaded",
        description: "You must upload an image to transform.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        `http://${location.hostname}:5555/model/generate/image-to-image`,
        {
          model_version: model,
          image: loadedImage.split(",")[1],
          prompt: prompt,
          negative_prompt: negativePrompt,
          guidance_scale: guidance,
          seed: seed,
          scaling_mode: scalingMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateImage(response.data.image);
    } catch (error) {
      console.error("Error:", error);
      toaster.create({
        title: "Generation failed",
        description: "Could not generate image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      updateLoading(false);
    }
  };


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLoadedImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setLoadedImage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[1800px] bg-white rounded-lg shadow p-5">
        <h1 className="font-bold text-3xl mb-5">Image to image</h1>
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 flex flex-col">
            <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              {loadedImage == null ? (
                <label
                  htmlFor="file-input"
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                >
                  <FiUpload size={23} className="mb-2 text-gray-500" />
                  <p className="text-gray-700">Drag and drop files here</p>
                  <p className="text-gray-500 text-sm">.png, .jpg up to 5MB</p>
                </label>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={loadedImage}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-md"
                  />
                  <button
                    className="absolute top-2 right-2 bg-gray-700 text-white rounded-full p-2 hover:bg-gray-800 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setLoadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = null;
                    }}
                  >
                    <LuX />
                  </button>
                </div>
              )}
            </div>
          </div>

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

        <div className="w-full max-w-[1800px] flex flex-col gap-4 mt-8">
          <p className="block text-sm font-medium">Positive prompt</p>
          <input
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            placeholder="Enter prompt"
            className="w-full p-2 border rounded"
          />
          <p className="block text-sm font-medium">Negative prompt</p>
          <input
            value={negativePrompt}
            onChange={(e) => updateNegativePrompt(e.target.value)}
            placeholder="Enter negative prompt (optional)"
            className="w-full p-2 border rounded"
          />

          {showAdvancedParameters ? (
            <>
              <button
                onClick={() => setShowAdvancedParameters(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
              >
                Hide advanced parameters ▲
              </button>

              <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={(v) => setGuidance(v[0])} />

              <div className="flex flex-col gap-2">
                <p className="block mb-2 text-sm font-medium">Seed</p>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    value={seed}
                    min={0}
                    max={999999999999999}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="w-full  p-2 border rounded"
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 999999999999999))}
                    className="bg-yellow-400 text-black py-2 rounded px-4 py-2"
                  >
                    Randomize
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p>Choose image scaling mode</p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setScalingMode("resize_and_pad")}
                    className={`rounded-2xl border-2 px-4 py-2 transition ${scalingMode === "resize_and_pad" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    Resize and pad
                  </button>
                  <button
                    onClick={() => setScalingMode("scale_to_megapixels")}
                    className={`rounded-2xl border-2 px-4 py-2 transition ${scalingMode === "scale_to_megapixels" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    Scale to megapixels
                  </button>
                  <button
                    onClick={() => setScalingMode("none")}
                    className={`rounded-2xl border-2 px-4 py-2 transition ${scalingMode === "none" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p>Choose model</p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setModel("1.5")}
                    className={`rounded-2xl border-2 px-4 py-2 w-32 transition ${model === "1.5" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    1.5
                  </button>
                  <button
                    onClick={() => setModel("2.1")}
                    className={`rounded-2xl border-2 px-4 py-2 w-32 transition ${model === "2.1" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    2.1
                  </button>
                  <button
                    onClick={() => setModel("3.0")}
                    className={`rounded-2xl border-2 px-4 py-2 w-32 transition ${model === "3.0" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    3.0
                  </button>
                  <button
                    onClick={() => setModel("xl")}
                    className={`rounded-2xl border-2 px-4 py-2 w-32 transition ${model === "xl" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    XL
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowAdvancedParameters(true)}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
            >
              Show advanced parameters ▼
            </button>
          )}


          {loadedImage ? (
            loading ? (
              <button onClick={generate} disabled={true} className="mt-auto w-full bg-gray-400 text-black py-2 rounded cursor-not-allowed" >
                Generating...
              </button>
            )
              : (
                <button onClick={generate} disabled={false} className="mt-auto w-full bg-yellow-400 text-black py-2 rounded">
                  Generate
                </button>
              )
          ) : (
            <button onClick={generate} disabled={true} className="mt-auto w-full bg-gray-400 text-black py-2 rounded cursor-not-allowed">
              Generate
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default ImageToImage;
