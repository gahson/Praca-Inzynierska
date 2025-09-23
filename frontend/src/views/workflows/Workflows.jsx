import { useNavigate } from "react-router-dom";
import { FaFileImage, FaImages, FaMagic } from "react-icons/fa";
import { BsBoundingBoxCircles } from "react-icons/bs";

const Workflows = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col p-5 gap-5">

        <h1 className="font-bold text-3xl">Basic workflows</h1>

        <div className='w-full flex flex-wrap gap-10'>

        {/* Text to Image */}
        <button
          onClick={() => navigate("/views/generation/text-to-image")}
          className="h-80 w-120 bg-white hover:bg-gray-100 flex flex-col items-start p-4 rounded-lg shadow-md cursor-pointer"
        >
          <div className="bg-blue-200 flex items-center justify-center p-3 rounded-lg">
            <FaFileImage className="w-6 h-6"/>
          </div>
          <h3 className="text-lg font-semibold">Text to Image</h3>
          <p className="text-gray-700 text-sm">
            Generate an image based on a text prompt
          </p>
        </button>

        {/* Image to Image */}
        <button
          onClick={() => navigate("/views/generation/image-to-image")}
          className="h-80 w-120 bg-white hover:bg-gray-100 flex flex-col items-start p-4 rounded-lg shadow-md cursor-pointer"
        >
          <div className="bg-green-200 flex items-center justify-center p-3 rounded-lg">
            <FaImages className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Image to Image</h3>
          <p className="text-gray-700 text-sm">
            Transform an input image by providing a text prompt.
          </p>
        </button>

        {/* Inpainting */}
        <button
          onClick={() => navigate("/views/generation/inpainting")}
          className="h-80 w-120 bg-white hover:bg-gray-100 flex flex-col items-start p-4 rounded-lg shadow-md cursor-pointer"
        >
          <div className="bg-purple-200 flex items-center justify-center p-3 rounded-lg">
            <FaMagic className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Inpainting</h3>
          <p className="text-gray-700 text-sm">
            Inpainting lets you paint out areas on the image that you want to change.
          </p>
        </button>

        {/* Bounding Boxes */}
        <button
          onClick={() => navigate("/views/generation/bounding-boxes")}
          className="h-80 w-120 bg-white hover:bg-gray-100 flex flex-col items-start p-4 rounded-lg shadow-md cursor-pointer"
        >
          <div className="bg-yellow-200 flex items-center justify-center p-3 rounded-lg">
            <BsBoundingBoxCircles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Bounding Boxes</h3>
          <p className="text-gray-700 text-sm">
            Draw rectangular regions on an image to alter its appearance
          </p>
        </button>

        </div>


    </div>
  );
};

export default Workflows;
