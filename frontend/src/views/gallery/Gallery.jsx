import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toaster } from "../../components/ui/toaster"


const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const navigate = useNavigate();

  const fetchGallery = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:5555/gallery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sort newest first
      setGallery(
        res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    } catch {
      toaster.create({
        title: "Error",
        description: "Unable to load gallery.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDelete = async (imageId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5555/gallery/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toaster.create({
        title: "Deleted",
        description: "Image deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setGallery(gallery.filter((img) => img.id !== imageId));
    } catch {
      toaster.create({
        title: "Error",
        description: "Failed to delete image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRedirect = (img, mode) => {
    localStorage.setItem("selectedImage", JSON.stringify(img));
    navigate(`/views/generation/${mode}`);
  };

  return (

    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-8">Your Gallery</h1>
      <div className="flex flex-wrap justify-center gap-5">
        {gallery.map((img) => (
          <div
            key={img.id}
            className="w-[300px] bg-white rounded-md shadow-md p-3"
          >
            <img
              src={`data:image/png;base64,${img.image_base64}`}
              alt="generated"
              className="w-full rounded-md mb-3 "
            />
            <div className="flex flex-col text-sm space-y-1.5">
              <p><b>Model:</b> {img.model}</p>
              <p><b>Mode:</b> {img.mode}</p>
              <p><b>Size:</b> {img.width} × {img.height}</p>
              <p><b>Prompt:</b> {img.prompt}</p>
              <p><b>Seed:</b> {img.seed}</p>
              <p><b>Guidance:</b> {img.guidance_scale}</p>
              <p><b>Created:</b> {new Date(img.created_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-col mt-3 space-y-2">
              <button
                className="bg-blue-500 text-xs text-white rounded p-1"
                onClick={() => handleRedirect(img, "text-to-image")}
              >
                Use in Text2Image
              </button>
              <button
                className="bg-green-500 text-xs text-white rounded  p-1"
                onClick={() => handleRedirect(img, "image-to-image")}
              >
                Use in Img2Img
              </button>
              <button
                className="bg-purple-500 text-xs text-white rounded p-1"
                onClick={() => handleRedirect(img, "inpainting")}
              >
                Use in Inpainting
              </button>
              <button
                className="bg-red-500 text-xs text-white rounded  p-1"
                onClick={() => handleDelete(img.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default Gallery;
