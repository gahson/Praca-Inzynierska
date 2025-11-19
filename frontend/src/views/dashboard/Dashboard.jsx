import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    navigate(`/views/workflows/text-to-image?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center gap-10">
      <h1 className="text-6xl font-bold text-center m-0">
       Welcome to the world of AInterior...
      </h1>

      <div className="mx-auto text-2xl text-center">
        AInterior harnesses Stable Diffusion power to help architects design stunning interiors effortlessly.
      </div>

      <div className=" w-1/2 flex items-center justify-center gap-5 ">
        <input
          className="border-gray-300 flex-1 border rounded-lg focus:outline-none p-3 "
          placeholder="Type your prompt..."
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
        />
        <button
          className="bg-yellow-400 hover:bg-yellow-400 px-5 py-3 rounded-lg"
          onClick={handleGenerate}
        >
          Start creating
        </button>
      </div>
    </div>


  );
}
