import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toaster } from "../../../components/ui/toaster";
import SliderControl from "../../../components/SliderControl";

const TextToImage = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negativePrompt, updateNegativePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [guidance, setGuidance] = useState(7.0);
  const [seed, setSeed] = useState(0);
  const [model, setModel] = useState("1.5");

  const [searchParams] = useSearchParams();
  const urlPrompt = searchParams.get("prompt");

  useEffect(() => {
    if (urlPrompt) updatePrompt(urlPrompt);
  }, [urlPrompt]);

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
        "http://localhost:5555/model/generate/text-to-image",
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
      <div className="w-full max-w-[1800px] flex flex-col xl:flex-row gap-8">
        {/* Panel */}
          <div className="flex-1 flex flex-col gap-4">
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

            <SliderControl label="Width" value={width} min={64} max={1024} step={64} onChange={(v) => setWidth(v[0])} />
            <SliderControl label="Height" value={height} min={64} max={1024} step={64} onChange={(v) => setHeight(v[0])} />
            <SliderControl label="Guidance scale" value={guidance} min={0} max={25} step={0.1} onChange={(v) => setGuidance(v[0])} />
            <SliderControl label="Seed" value={seed} min={0} max={10000} step={1} onChange={(v) => setSeed(v[0])} />

            <div className="flex flex-col gap-2">
              <p>Choose model</p>
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

            <button onClick={generate} className="mt-auto w-full bg-yellow-400 text-black py-2 rounded">
              Generate
            </button>
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
    </div>
  );
};

export default TextToImage;
