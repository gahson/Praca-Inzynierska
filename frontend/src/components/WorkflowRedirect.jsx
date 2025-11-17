import React from "react";
import { FaImages, FaMagic, FaBorderAll, FaExpandArrowsAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const RedirectButtons = ({ image, setLoadedImage, updateImage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleWorkflowRedirect = (mode) => {
    if (!image) return;

    const selectedImage = { image_base64: image };

    if (location.pathname === `/views/workflows/${mode}`) {
      const img = new Image();
      img.src = `data:image/png;base64,${image}`;
      img.onload = () => {
        setLoadedImage(`data:image/png;base64,${image}`);
        updateImage(null);
      };
    } else {
      localStorage.setItem("selectedImage", JSON.stringify(selectedImage));
      navigate(`/views/workflows/${mode}`);
    }
  };

  return (
    <div className="absolute bottom-2 right-2 flex gap-2">
      <button
        className="bg-yellow-400 text-black p-2 rounded hover:bg-yellow-500 transition"
        onClick={() => handleWorkflowRedirect("image-to-image")}
        title="Image-to-image"
      >
        <FaImages />
      </button>

      <button
        className="bg-yellow-400 text-black p-2 rounded hover:bg-yellow-500 transition"
        onClick={() => handleWorkflowRedirect("inpainting")}
        title="Inpainting"
      >
        <FaMagic />
      </button>

      <button
        className="bg-yellow-400 text-black p-2 rounded hover:bg-yellow-500 transition"
        onClick={() => handleWorkflowRedirect("control-net")}
        title="Control Net"
      >
        <FaBorderAll />
      </button>

      <button
        className="bg-yellow-400 text-black p-2 rounded hover:bg-yellow-500 transition"
        onClick={() => handleWorkflowRedirect("outpainting")}
        title="Outpainting"
      >
        <FaExpandArrowsAlt />
      </button>
    </div>
  );
};

export default RedirectButtons;
