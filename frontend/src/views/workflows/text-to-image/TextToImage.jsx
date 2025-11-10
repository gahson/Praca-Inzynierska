import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { toaster } from "../../../components/ui/toaster";
import TextTooltip from "../../../components/TextTooltip";
import RottaInputController from "../../../components/Rotta";
import SliderControl from "../../../components/SliderControl";

const TextToImage = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 999999999999999));
  const [model, setModel] = useState("xl");

  const [searchParams] = useSearchParams();
  const urlPrompt = searchParams.get("prompt");
  const urlNegativePrompt = searchParams.get("negativePrompt");
  const urlWidth = searchParams.get("width");
  const urlHeight = searchParams.get("height");
  const urlGuidance = searchParams.get("guidance");
  const urlSeed = searchParams.get("seed");
  const urlModel = searchParams.get("model");

  const [showAdvancedParameters, setShowAdvancedParameters] = useState(false);
  const [isArchitectModeOn, setIsArchitectModeOn] = useState(false);

  useEffect(() => {
    if (urlPrompt) updatePrompt(urlPrompt);
  }, [urlPrompt]);

  useEffect(() => {
    if (urlNegativePrompt) updateNegativePrompt(urlNegativePrompt);
  }, [urlNegativePrompt]);

  useEffect(() => {
    if (urlWidth) setWidth(urlWidth);
  }, [urlWidth]);

  useEffect(() => {
    if (urlHeight) setHeight(urlHeight);
  }, [urlHeight]);

  useEffect(() => {
    if (urlGuidance) setGuidance(urlGuidance);
  }, [urlGuidance]);

  useEffect(() => {
    if (urlSeed) setSeed(urlSeed);
  }, [urlSeed]);

  useEffect(() => {
    if (urlModel) setModel(urlModel);
  }, [urlModel]);

  useEffect(() => {
    const stored = localStorage.getItem("selectedImage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data) {
          updatePrompt(data.prompt || "");
          updateNegativePrompt(data.negative_prompt || "");
          setGuidance(data.guidance_scale || 7);
          setSeed(data.seed || 0);
          setWidth(data.width || 512);
          setHeight(data.height || 512);
          localStorage.removeItem("selectedImage");
        }
      } catch (e) {
        console.error("Invalid image data", e);
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

    updateLoading(true);
    try {
      const response = await axios.post(
        `http://${location.hostname}:5555/model/generate/text-to-image`,
        { model_version: model, prompt, negative_prompt: negativePrompt, guidance_scale: guidance, width, height, seed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateImage(response.data.image);
    } catch (error) {
      console.error("Error:", error);
      toaster.create({
        title: "Generation failed",
        description: error.response?.data?.detail || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      updateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-[1800px] flex flex-col xl:flex-row gap-8 bg-white rounded-lg shadow p-5">
        {/* Panel */}
        <div className="flex-1 flex flex-col gap-4 h-[60vh] overflow-y-auto">
          <h1 className="font-bold text-3xl mb-5">Text to image</h1>

          <div className="flex items-center space-x-3">
            <span className="font-medium">Architect mode</span>
            <div
              onClick={() => {
                const newValue = !isArchitectModeOn;

                if (newValue) {
                  const proceed = window.confirm(
                    `You are about to turn on Architect Mode. Your positive and negative prompts will be erased! Continue?`
                  );
                  if (proceed) setIsArchitectModeOn(newValue);
                }else{
                  const proceed = window.confirm(
                    `You are about to turn off Architect Mode. Your choices will be translated into textual positive and negative prompts. Continue?`
                  );
                  if (proceed) setIsArchitectModeOn(newValue);
                }

              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${isArchitectModeOn ? "bg-green-500" : "bg-gray-400"}`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${isArchitectModeOn ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            </div>
          </div>
          {isArchitectModeOn ? (

            <RottaInputController
              positivePromptSetter={updatePrompt}
              negativePromptSetter={updateNegativePrompt}
            />

          ) : (
            <>

              <TextTooltip
                text="Positive prompt"
                tooltip="Provide a natural-language description of what the image should contain."
              />
              <input
                value={prompt}
                onChange={(e) => updatePrompt(e.target.value)}
                placeholder="Enter prompt"
                className="w-full p-2 border rounded"
              />

              <TextTooltip
                text="Negative prompt"
                tooltip="Provide a natural-language description of what the image should not contain."
              />
              <input
                value={negativePrompt}
                onChange={(e) => updateNegativePrompt(e.target.value)}
                placeholder="Enter negative prompt (optional)"
                className="w-full p-2 border rounded"
              />
            </>
          )}

          {showAdvancedParameters ? (
            <>
              <button
                onClick={() => setShowAdvancedParameters(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
              >
                Hide advanced parameters ▲
              </button>


              <SliderControl label="Width" description="Width of the generated image." value={width} min={64} max={1024} step={64} onChange={(v) => setWidth(v[0])} />
              <SliderControl label="Height" description="Height of the generated image." value={height} min={64} max={1024} step={64} onChange={(v) => setHeight(v[0])} />

              <SliderControl label="Guidance scale" description="Controls how strictly the model follows the prompt. The recommended value is 7 or 8." value={guidance} min={0} max={25} step={0.1} onChange={(v) => setGuidance(v[0])} />

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
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 999999999))}
                    className="bg-yellow-400 text-black py-2 rounded px-4 py-2"
                  >
                    Randomize
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
                    onClick={() => setModel("1.5")}
                    className={`rounded-2xl border-2 px-4 py-2 w-24 transition ${model === "1.5" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    1.5
                  </button>
                  <button
                    onClick={() => setModel("2.1")}
                    className={`rounded-2xl border-2 px-4 py-2 w-24 transition ${model === "2.1" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    2.1
                  </button>
                  <button
                    onClick={() => setModel("3.0")}
                    className={`rounded-2xl border-2 px-4 py-2 w-24 transition ${model === "3.0" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    3.0
                  </button>
                  <button
                    onClick={() => setModel("xl")}
                    className={`rounded-2xl border-2 px-4 py-2 w-24 transition ${model === "xl" ? "bg-black text-white" : "text-black bg-transparent hover:bg-gray-200"}`}
                  >
                    xl
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

          {loading ? (
            <button onClick={generate} disabled={true} className="mt-auto w-full bg-gray-400 text-black py-2 rounded cursor-not-allowed">
              Generating...
            </button>
          )
            : (
              <button onClick={generate} disabled={false} className="mt-auto w-full bg-yellow-400 text-black py-2 rounded">
                Generate
              </button>
            )}

        </div>
        {/* Obrazek */}
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
    </div >
  );
};

export default TextToImage;
