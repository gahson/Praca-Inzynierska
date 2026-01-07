import axios from "axios";
import React from "react";
import { LuX } from "react-icons/lu";
import { FiUpload } from 'react-icons/fi';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Prompts from "../../../components/Prompts";
import { toaster } from "../../../components/ui/toaster";
import TextTooltip from "../../../components/TextTooltip";
import SliderControl from "../../../components/SliderControl";
import RedirectButtons from "../../../components/QuickRedirectButtons";
import { saveToCanvas } from "../canvas/utilities/saveToCanvas";

const Outpainting = () => {
  const [image, updateImage] = useState();
  const [loadedImage, setLoadedImage] = useState(null);

  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [guidance, setGuidance] = useState(7.0);
  const [padLeft, setPadLeft] = useState(64);
  const [padRight, setPadRight] = useState(64);
  const [padTop, setPadTop] = useState(64);
  const [padBottom, setPadBottom] = useState(64);
  const [randomizeSeed, setRandomizeSeed] = useState(true);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 999999999999999));
  const [model, setModel] = useState("1.5-inpainting");
  const [scalingMode, setScalingMode] = useState("scale_to_megapixels");

  const [showAdvancedParameters, setShowAdvancedParameters] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
          setPadLeft(data.pad_left || 64);
          setPadRight(data.pad_right || 64);
          setPadTop(data.pad_top || 64);
          setPadBottom(data.pad_bottom || 64);
          setScalingMode(data.scaling_mode || "resize_and_pad");
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

    var seed_to_use = seed;
    if (randomizeSeed) {
      seed_to_use = Math.floor(Math.random() * 999999999);
      setSeed(seed_to_use);
    }

    updateLoading(true);

    try {
      const response = await axios.post(
        `/api/model/generate/outpainting`,
        {
          model_version: model,
          image: loadedImage.split(",")[1],
          prompt: prompt,
          negative_prompt: negativePrompt,
          guidance_scale: guidance,
          seed: seed,
          pad_right: padRight,
          pad_left: padLeft,
          pad_top: padTop,
          pad_bottom: padBottom,
          scaling_mode: scalingMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateImage(response.data.image);
      const canvasId = localStorage.getItem("currentCanvasId");
      
      if (canvasId) {
        try {
          const parentImageId = localStorage.getItem("parentImageId");
          
          
          saveToCanvas(
            response.data.image, 
            { 
              prompt, 
              negative_prompt: negativePrompt, 
              workflow: "outpainting", 
              guidance_scale: guidance, 
              seed: seed_to_use 
            }, 
            parentImageId
          );

          
          setTimeout(() => navigate("/views/workflows/canvas"), 800);
        } catch (e) {
          console.error("Outpainting context error:", e);
        }
      }
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
        <h1 className="font-bold text-3xl mb-5">Outpainting</h1>
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

          <div className="flex-1 aspect-square flex items-center justify-center bg-gray-200 rounded-md overflow-hidden relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 animate-pulse w-full h-full">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                {image ? (
                  <>
                    <img src={`data:image/png;base64,${image}`} className="object-contain w-full h-full rounded-md shadow-lg" />

                    <RedirectButtons
                      image={image}
                      setLoadedImage={setLoadedImage}
                      updateImage={updateImage}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p>Generated image will appear here</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full max-w-[1800px] flex flex-col gap-4 mt-8">
          <Prompts positivePrompt={prompt} setPositivePrompt={updatePrompt} negativePrompt={negativePrompt} setNegativePrompt={updateNegativePrompt} />

          {showAdvancedParameters ? (
            <>
              <button
                onClick={() => setShowAdvancedParameters(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
              >
                Hide advanced parameters ▲
              </button>

              <SliderControl label="Guidance scale" description="Controls how strictly the model follows the prompt. The recommended value is 7 or 8." value={guidance} min={0} max={25} step={0.1} onChange={(v) => setGuidance(v[0])} />
              <SliderControl label="Pad left" description="Number of pixels to be added on the left side of the image. Smaller values work better." value={padLeft} min={0} max={128} step={1} onChange={(v) => setPadLeft(v[0])} />
              <SliderControl label="Pad right" description="Number of pixels to be added on the right side of the image. Smaller values work better." value={padRight} min={0} max={128} step={1} onChange={(v) => setPadRight(v[0])} />
              <SliderControl label="Pad top" description="Number of pixels to be added on the top side of the image. Smaller values work better." value={padTop} min={0} max={128} step={1} onChange={(v) => setPadTop(v[0])} />
              <SliderControl label="Pad bottom" description="Number of pixels to be added on the bottom side of the image. Smaller values work better." value={padBottom} min={0} max={128} step={1} onChange={(v) => setPadBottom(v[0])} />

              <div className="flex items-center space-x-3">
                <TextTooltip
                  text="Auto randomize seed"
                  tooltip="Enable or disable automatic seed randomization."
                />
                <div
                  onClick={() => { setRandomizeSeed(!randomizeSeed); }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${randomizeSeed ? "bg-green-500" : "bg-gray-400"}`
                  }
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${randomizeSeed ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <TextTooltip
                  text="Seed"
                  tooltip="Controls the randomness in image generation. Keeping it fixed while adjusting other parameters will produce very similar images."
                />
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    value={seed}
                    min={0}
                    max={999999999}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className={`w-full p-2 border rounded ${randomizeSeed ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                    disabled={randomizeSeed}
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 999999999))}
                    className={`px-4 py-2 rounded ${randomizeSeed
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
                    disabled={randomizeSeed}
                  >
                    Randomize
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <TextTooltip
                  text="Choose image scaling mode"
                  tooltip="The image should be rescaled before being passed to the generative model to match the resolution it was trained on, ensuring the best results."
                />
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
                <TextTooltip
                  text="Choose model"
                  tooltip="Choose the Stable Diffusion model version. Generally, a higher version means better quality but longer generation times."
                />
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setModel("1.5-inpainting")}
                    className={`rounded-2xl border-2 px-4 py-2 transition ${model === "1.5-inpainting" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    1.5-inpainting
                  </button>
                  <button
                    onClick={() => setModel("2.0-inpainting")}
                    className={`rounded-2xl border-2 px-4 py-2 transition ${model === "2.0-inpainting" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    2.0-inpainting
                  </button>
                  <button
                    onClick={() => setModel("xl-inpainting")}
                    className={`rounded-2xl border-2 px-4 py-2 transition ${model === "xl-inpainting" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    xl-inpainting
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

export default Outpainting;