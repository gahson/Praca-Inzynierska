import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5555/admin/user/${id}/details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await axios.delete(`http://localhost:5555/admin/user/${id}/image/${imageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Usuń obraz z lokalnego stanu
      setUserData((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((img) => img.id !== imageId),
      }));

      alert("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error.response?.data || error.message);
      alert("Failed to delete image.");
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (!userData) return <p>User not found</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        ← Back to Users
      </button>

      <h1 className="text-3xl font-bold mb-2">
        {userData.first_name} {userData.last_name}
      </h1>
      <p className="text-gray-700 mb-4">{userData.email}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Gallery</h2>
      {userData.gallery?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userData.gallery.map((img) => (
            <div
              key={img.id}
              className="relative border rounded-lg overflow-hidden bg-white shadow-md"
            >
              {img.image_base64 ? (
                <img
                  src={`data:image/png;base64,${img.image_base64}`}
                  alt="Generated"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No preview
                </div>
              )}

              {/* Przyciski akcji */}
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-sm"
              >
                🗑 Delete
              </button>

              <div className="p-2 text-sm text-gray-700">
                <p><strong>Model:</strong> {img.model}</p>
                <p><strong>Prompt:</strong> {img.prompt}</p>
                <p><strong>Date:</strong> {img.created_at}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No images in gallery.</p>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Prompts</h2>
      {userData.prompts?.length ? (
        <ul className="list-disc ml-6">
          {userData.prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ) : (
        <p>No prompts found.</p>
      )}
    </div>
  );
}
