import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const WORKFLOW_COLORS = {
  start: "bg-gray-500",
  txt2img: "bg-blue-500",
  img2img: "bg-purple-500",
  inpainting: "bg-green-500",
  controlnet: "bg-orange-500",
  outpainting: "bg-pink-500",
};

const WORKFLOW_LABELS = {
  start: "Start",
  txt2img: "Text to Image",
  img2img: "Image to Image",
  inpainting: "Inpainting",
  controlnet: "ControlNet",
  outpainting: "Outpainting",
};

const WORKFLOW_BUTTONS = [
  { id: "txt2img", label: "Text→Image" },
  { id: "img2img", label: "Image→Image" },
  { id: "inpainting", label: "Inpaint" },
  { id: "controlnet", label: "ControlNet" },
  { id: "outpainting", label: "Outpaint" },
];

export default function WorkflowNode({ node, onImageGenerated, onModify, onDelete, onDrag, onGenerate }) {
  const navigate = useNavigate();
  const bgColor = WORKFLOW_COLORS[node.workflow || node.type] || "bg-gray-500";
  const label = WORKFLOW_LABELS[node.workflow || node.type] || node.label;

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
    if (!node.image) return;
    
    const imageBase64 = typeof node.image === "string" && node.image.startsWith("data:") 
      ? node.image.split(",")[1] 
      : node.image;
    
    const selectedImage = { image_base64: imageBase64 };
    
    try {
      const curCanvas = localStorage.getItem("currentCanvasId");
      if (curCanvas) selectedImage.canvas_id = curCanvas;
      localStorage.setItem("selectedImage", JSON.stringify(selectedImage));
      if (curCanvas) localStorage.setItem("currentCanvasId", curCanvas);
      if (node.image_id) localStorage.setItem("parentImageId", node.image_id);
    } catch (e) {
    }

    const route = mapWorkflowToRoute(workflowId);
    navigate(`/views/workflows/${route}`);
  };

  const fileInputRef = useRef(null);
  const handlePointerDown = (e) => {
    e.preventDefault();
    const startX = e.clientX ?? e.touches?.[0]?.clientX;
    const startY = e.clientY ?? e.touches?.[0]?.clientY;
    const origX = node.x ?? 20;
    const origY = node.y ?? 20;

    const onMove = (ev) => {
      const mx = ev.clientX ?? ev.touches?.[0]?.clientX;
      const my = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (mx == null || my == null) return;
      const nx = origX + (mx - startX);
      const ny = origY + (my - startY);
      onDrag?.(nx, ny);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      onImageGenerated?.(node.id, data);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-md hover:shadow-lg transition w-56 cursor-grab relative"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
    <button
        onClick={handleUploadClick}
        className="absolute top-2 left-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded"
        aria-label="Add image to node"
    >
    Add
    </button>
  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded"
        aria-label="Delete node"
      >
        Del
      </button>

      <div className="space-y-2 mt-2">
        <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
          {node.image_id && (
            <p className="text-gray-600 truncate">
              <span className="font-semibold">ID:</span> {node.image_id}
            </p>
          )}
          {node.parent_id && (
            <p className="text-gray-600 truncate mt-1">
              <span className="font-semibold">Parent:</span> {node.parent_id}
            </p>
          )}
        </div>

        <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300">
          {node.image ? (
            <img
              src={typeof node.image === "string" ? node.image : `data:image/png;base64,${node.image}`}
              alt={label}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <div className="w-6 h-6 bg-gray-300 rounded-full mb-1"></div>
              <p className="text-xs">
                {node.type === "start" ? "Input" : "Processing..."}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {WORKFLOW_BUTTONS.map((w) => (
            <button
              key={w.id}
              onClick={(e) => { e.stopPropagation(); handleWorkflowClick(w.id); }}
              disabled={!node.image}
              className={`text-xs font-semibold py-1 px-2 rounded whitespace-normal text-center ${node.image ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
