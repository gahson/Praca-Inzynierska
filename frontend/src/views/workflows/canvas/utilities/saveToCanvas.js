export const saveToCanvas = async (imageBase64, metadata = {}, parentId = null) => {
  try {
    const canvasId = localStorage.getItem("currentCanvasId");
    if (!canvasId) return;

    const API_BASE = `http://${location.hostname}:5555`;    

    const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken") || localStorage.getItem("jwt");
    const headers = { "Content-Type": "application/json" };
    if (token && token.length < 5000) headers["Authorization"] = `Bearer ${token}`;

    const payload = {
      image_base64: typeof imageBase64 === "string" && imageBase64.startsWith("data:") 
        ? imageBase64.split(",")[1] 
        : imageBase64,
      metadata: typeof metadata === "object" ? Object.keys(metadata).length > 0 ? metadata : {} : {},
    };
    if (parentId) {
      payload.parent_id = parentId;
    }

    await fetch(`${API_BASE}/canvases/${canvasId}/images`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    try {
      localStorage.removeItem("currentCanvasId");
    } catch (e) {
    }
  } catch (err) {
    console.warn("Failed to save to canvas:", err);
  }
};