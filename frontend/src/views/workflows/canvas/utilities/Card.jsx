import { useNavigate } from "react-router-dom";

const WORKFLOW_BUTTONS = [
  { id: "txt2img", label: "Text to Image", color: "bg-blue-500 hover:bg-blue-600" },
  { id: "img2img", label: "Image to Image", color: "bg-purple-500 hover:bg-purple-600" },
  { id: "inpainting", label: "Inpainting", color: "bg-green-500 hover:bg-green-600" },
  { id: "controlnet", label: "ControlNet", color: "bg-orange-500 hover:bg-orange-600" },
  { id: "outpainting", label: "Outpainting", color: "bg-pink-500 hover:bg-pink-600" },
];

export default function Card({ image, onWorkflowSelect }) {

  const navigate = useNavigate();

  const mapWorkflowToRoute = (id) => {
    switch (id) {
      case "txt2img":
        return "text-to-image";
      case "img2img":
        return "image-to-image";
      case "inpainting":
        return "inpainting";
      case "controlnet":
        return "control-net";
      case "outpainting":
        return "outpainting";
      default:
        return id;
    }
  };

  const handleWorkflowClick = (workflowId) => {
    // prefer parent handler if provided (for node-level workflow selection)
    if (onWorkflowSelect) {
      onWorkflowSelect(workflowId);
      return;
    }

    // otherwise perform redirect flow: store selectedImage + (ensure) currentCanvasId and navigate
    if (!image) return;

    const imageBase64 = typeof image === "string" && image.startsWith("data:") ? image.split(",")[1] : image;
    const selectedImage = { image_base64: imageBase64 };

    try {
      // preserve current canvas id if present
      const curCanvas = localStorage.getItem("currentCanvasId");
      if (curCanvas) selectedImage.canvas_id = curCanvas;
      localStorage.setItem("selectedImage", JSON.stringify(selectedImage));
      // keep the canvas id explicitly (helpful if other code clears it)
      if (curCanvas) localStorage.setItem("currentCanvasId", curCanvas);
    } catch (e) {
      // ignore storage errors
    }

    const route = mapWorkflowToRoute(workflowId);
    navigate(`/views/workflows/${route}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Select Workflow</h3>

      {/* Image Preview */}
      <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center border-2 border-gray-300">
        {image ? (
          <img
            src={typeof image === "string" ? image : `data:image/png;base64,${image}`}
            alt="Current"
            className="object-contain w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 bg-gray-300 rounded-full mb-2"></div>
            <p className="text-xs">No image</p>
          </div>
        )}
      </div>

      {/* Workflow Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {WORKFLOW_BUTTONS.map((workflow) => (
          <button
            key={workflow.id}
            onClick={() => handleWorkflowClick(workflow.id)}
            className={`${workflow.color} text-white font-semibold py-3 px-3 rounded-lg transition text-sm hover:shadow-md`}
          >
            {workflow.label}
          </button>
        ))}
      </div>
    </div>
  );
}