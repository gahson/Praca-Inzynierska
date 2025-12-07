import React, { useState, useCallback, useEffect } from "react";
// Card removed: per-node buttons used instead
import WorkflowNode from "./utilities/WorkflowNode";
import WorkflowPanel from "./WorkflowPanel";

export default function Canvas() {
  const [workflowNodes, setWorkflowNodes] = useState([
    {
      id: "start",
      type: "start",
      label: "Start",
      image: null,
      workflow: "start",
      parentId: null,
      x: 20,
      y: 20,
    },
  ]);

  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);

  const API_BASE = `http://${location.hostname}:5555`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken") || localStorage.getItem("jwt");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // load workflows from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/canvases`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load canvases");
        const list = await res.json();
        setWorkflows(list);
        if (list && list.length > 0) {
          setCurrentWorkflowId(list[0].id);
          // auto-select first workflow
          selectWorkflow(list[0].id);
        }
      } catch (e) {
        console.warn("Could not load canvases:", e);
        // fallback to default
        setWorkflows([{ id: "default", name: "Default" }]);
        setCurrentWorkflowId("default");
      }
    })();
  }, []);

  const addNode = (node) => setWorkflowNodes((s) => [...s, node]);

  const handleWorkflowSelect = (workflowId) => {
    // create a placeholder node; image will be filled after generation/modify
    const newNode = {
      id: `node-${Date.now()}`,
      type: "workflow",
      label: workflowId,
      image: null,
      workflow: workflowId,
      parentId: workflowNodes[workflowNodes.length - 1]?.id,
      x: (workflowNodes[workflowNodes.length - 1]?.x || 20) + 240,
      y: 20,
    };
    addNode(newNode);
  };

  const createWorkflow = async (name) => {
    try {
      const res = await fetch(`${API_BASE}/canvases`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create canvas");
      const data = await res.json();
      const wf = { id: data.id, name: data.name };
      setWorkflows((s) => [...s, wf]);
      setCurrentWorkflowId(wf.id);
      // persist current canvas id for generation pages
      try { localStorage.setItem("currentCanvasId", wf.id); } catch (e) {}
      setWorkflowNodes([
        { id: "start", type: "start", label: "Start", image: null, workflow: "start", parentId: null, x: 20, y: 20 },
      ]);
    } catch (e) {
      console.error("createWorkflow error", e);
    }
  };

  const renameWorkflow = async (id, name) => {
    setWorkflows((s) => s.map((w) => (w.id === id ? { ...w, name } : w)));
    try {
      await fetch(`${API_BASE}/canvases/${id}`, { method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify({ name }) });
    } catch (e) {
      // ignore
    }
  };

  const deleteWorkflow = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/canvases/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete canvas");
      setWorkflows((s) => s.filter((w) => w.id !== id));
      if (currentWorkflowId === id) {
        const next = workflows.find((w) => w.id !== id) || { id: "default", name: "Default" };
        setCurrentWorkflowId(next.id);
        // try to select next
        if (next.id) selectWorkflow(next.id);
        else setWorkflowNodes([{ id: "start", type: "start", label: "Start", image: null, workflow: "start", parentId: null, x: 20, y: 20 }]);
      }
      try {
        const cur = localStorage.getItem("currentCanvasId");
        if (cur === id) {
          if (next && next.id) localStorage.setItem("currentCanvasId", next.id);
          else localStorage.removeItem("currentCanvasId");
        }
      } catch (e) {}
    } catch (e) {
      console.error("deleteWorkflow error", e);
    }
  };

  const stripDataUrl = (dataUrl) => {
    if (!dataUrl) return dataUrl;
    const idx = dataUrl.indexOf("base64,");
    return idx >= 0 ? dataUrl.substring(idx + 7) : dataUrl;
  };

  const saveWorkflow = async (id) => {
    if (!id) return;
    try {
      // Post each node's image (except start) to the canvas
      const nodesToSave = workflowNodes.filter((n) => n.id !== "start" && n.image);
      for (const node of nodesToSave) {
        const payload = {
          image_base64: stripDataUrl(node.image),
          metadata: { label: node.label, workflow: node.workflow, nodeId: node.id }
        };
        await fetch(`${API_BASE}/canvases/${id}/images`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      }
      console.log("Saved workflow to server", id);
    } catch (e) {
      console.error("saveWorkflow error", e);
    }
  };

  const selectWorkflow = async (id) => {
    setCurrentWorkflowId(id);
    try { localStorage.setItem("currentCanvasId", id); } catch (e) {}
    try {
      const res = await fetch(`${API_BASE}/canvases/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch canvas");
      const data = await res.json();
      // build nodes: start + images from canvas
      const nodes = [
        { id: "start", type: "start", label: "Start", image: null, workflow: "start", parentId: null, x: 20, y: 20 },
        ...((data.images || []).map((img, i) => ({
          id: `node-${i}`,
          type: "workflow",
          label: img.metadata?.label || `step-${i}`,
          image: img.image_base64?.startsWith("data:") ? img.image_base64 : `data:image/png;base64,${img.image_base64}`,
          workflow: img.metadata?.workflow || "workflow",
          parentId: i === 0 ? "start" : `node-${i - 1}`,
          x: 20 + i * 240,
          y: 20,
        })))
      ];
      setWorkflowNodes(nodes);
    } catch (e) {
      console.error("selectWorkflow error", e);
      setWorkflowNodes([{ id: "start", type: "start", label: "Start", image: null, workflow: "start", parentId: null, x: 20, y: 20 }]);
    }
  };

  const handleImageGenerated = (nodeId, imageData) => {
    setWorkflowNodes((s) => s.map((n) => (n.id === nodeId ? { ...n, image: imageData } : n)));
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      // set start node image
      setWorkflowNodes((s) => s.map((n) => (n.id === "start" ? { ...n, image: data } : n)));
    };
    reader.readAsDataURL(file);
  };

  const updateNodePosition = (nodeId, x, y) => {
    setWorkflowNodes((s) => s.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
  };

  const removeNode = async (nodeId) => {
    // Find node to remove (get its image_id if exists)
    const nodeToRemove = workflowNodes.find((n) => n.id === nodeId);
    
    // Update local state first
    setWorkflowNodes((s) => {
      const parentId = nodeToRemove?.parentId ?? null;
      // remove node and reparent its children to the removed node's parent
      return s
        .filter((n) => n.id !== nodeId)
        .map((n) => (n.parentId === nodeId ? { ...n, parentId } : n));
    });

    // If node has metadata with image_id, delete from backend
    if (nodeToRemove?.image) {
      try {
        const canvasId = currentWorkflowId;
        // Get the image_id from canvas images array by matching the image content
        const res = await fetch(`${API_BASE}/canvases/${canvasId}`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const canvas = await res.json();
        
        // Find and delete the matching image
        const imageToDelete = canvas.images?.find((img) => 
          stripDataUrl(img.image_base64) === stripDataUrl(nodeToRemove.image)
        );
        
        if (imageToDelete?.image_id) {
          await fetch(`${API_BASE}/canvases/${canvasId}/images/${imageToDelete.image_id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
          });
        }
      } catch (err) {
        console.warn("Failed to delete image from canvas backend:", err);
      }
    }
  };

  const simulateModify = useCallback((srcDataUrl, modifier = "tint") => {
    // return a Promise that resolves with a new dataUrl after applying a simple effect
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // apply a simple tint/overlay to show modification
        ctx.fillStyle = "rgba(255,128,0,0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // slightly shift pixels (simple effect)
        ctx.globalCompositeOperation = "difference";
        ctx.fillStyle = "rgba(30,144,255,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(srcDataUrl);
      img.src = srcDataUrl;
    });
  }, []);

  const simulateGenerate = useCallback((srcDataUrl, workflowId) => {
    // Simulate generation without color tint: apply subtle filters per workflow
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        // choose filter per workflow (no color overlay)
        let filter = "none";
        if (workflowId === "txt2img") filter = "contrast(110%) saturate(105%)";
        else if (workflowId === "img2img") filter = "blur(0.6px) contrast(105%)";
        else if (workflowId === "inpainting") filter = "brightness(102%) contrast(103%)";
        else if (workflowId === "controlnet") filter = "contrast(108%) saturate(102%)";
        else if (workflowId === "outpainting") filter = "brightness(103%) saturate(104%)";

        ctx.filter = filter;
        ctx.drawImage(img, 0, 0);
        ctx.filter = "none";

        // small vignette for depth (neutral color)
        const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.3, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.9);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.04)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(srcDataUrl);
      img.src = srcDataUrl;
    });
  }, []);

  const handleModify = async (nodeId) => {
    // find node and its image; if node has no image, use last node with image
    const node = workflowNodes.find((n) => n.id === nodeId);
    let sourceImage = node?.image;
    if (!sourceImage) {
      const lastWithImage = [...workflowNodes].reverse().find((n) => n.image);
      sourceImage = lastWithImage?.image;
    }
    if (!sourceImage) return;

    const generated = await simulateModify(sourceImage);

    const newNode = {
      id: `node-${Date.now()}`,
      type: "workflow",
      label: "modify",
      image: generated,
      workflow: "modify",
      parentId: nodeId,
    };
    addNode(newNode);
  };

  const currentImage = workflowNodes[workflowNodes.length - 1]?.image || null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full mx-auto h-[calc(100vh-4rem)]">
        <h1 className="font-bold text-3xl mb-8 text-gray-800">Canvas Workflow</h1>

        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Left side - Workflow Panel */} 
          <WorkflowPanel
            workflows={workflows}
            currentWorkflowId={currentWorkflowId}
            onSelect={(id) => selectWorkflow(id)}
            onCreate={(name) => createWorkflow(name)}
            onRename={(id, name) => renameWorkflow(id, name)}
            onDelete={(id) => deleteWorkflow(id)}
            onSave={(id) => saveWorkflow(id)}
          />

          {/* Center - Workflow Visualization (horizontal) */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <h2 className="font-semibold text-lg text-gray-700 mb-6">Workflow Graph ({workflows.find(w=>w.id===currentWorkflowId)?.name || currentWorkflowId})</h2>
            <div className="relative flex-1 border rounded p-2 overflow-auto">
              <div className="relative" style={{ minWidth: Math.max(800, workflowNodes.length * 260) }}>
                {workflowNodes.map((node, index) => (
                  <div
                    key={node.id}
                    style={{ position: "absolute", left: node.x ?? 20, top: node.y ?? 20 }}
                  >
                    <WorkflowNode
                      node={node}
                      currentCanvasId={currentWorkflowId}
                      onImageGenerated={(id, img) => handleImageGenerated(id, img)}
                      onModify={() => handleModify(node.id)}
                      onDelete={() => removeNode(node.id)}
                      onDrag={(x, y) => updateNodePosition(node.id, x, y)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Current Image preview + step count */}
          <div className="w-96 flex-shrink-0 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg text-gray-700 mb-4">Current Image</h2>
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-300">
                {currentImage ? (
                  <img
                    src={typeof currentImage === "string" ? currentImage : `data:image/png;base64,${currentImage}`}
                    alt="Current"
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
                    <p className="text-sm">No image yet</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-3">{workflowNodes.length} step{workflowNodes.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}