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
      const res = await axios.get(`http://${location.hostname}:5555/gallery`, {
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
      await axios.delete(`http://${location.hostname}:5555/gallery/${imageId}`, {
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
    navigate(`/views/workflows/${mode}`);
  };

  return (

    <div className="w-full min-h-screen bg-gray-100 flex flex-col p-5 gap-5">
      <h1 className="font-bold text-3xl">Your Gallery</h1>
      <div className="flex flex-wrap justify-center gap-5">
        {gallery.length == 0 ? (
          <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center gap-10">
            <h1 className="text-3xl font-bold text-center m-0">
              Loading gallery...
            </h1>
          </div>
        ) : (
          gallery.map((img) => (
            <div
              key={img.id}
              className="w-[300px] bg-white rounded-md shadow-md p-3 flex flex-col justify-between"
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
                {img.model == "controlnet" ? (
                  <>
                  <p><b>Canny low threshold:</b> {img.canny_low_threshold}</p>
                  <p><b>Canny high threshold:</b> {img.canny_high_threshold}</p>
                  </>
                ) : (
                  <>
                  </>
                )}
                
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
          ))
        )}
      </div>
    </div>

  );
};

export default Gallery;
