import React, { useState, useCallback, useEffect } from "react";
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

  const API_BASE = `/api`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken") || localStorage.getItem("jwt");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/canvases/`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load canvases");
        const list = await res.json();
        setWorkflows(list);
        if (list && list.length > 0) {
          setCurrentWorkflowId(list[0].id);
          selectWorkflow(list[0].id);
        }
      } catch (e) {
        console.warn("Could not load canvases:", e);
        setWorkflows([{ id: "default", name: "Default" }]);
        setCurrentWorkflowId("default");
      }
    })();
  }, []);

  const addNode = (node) => setWorkflowNodes((s) => [...s, node]);

  const createWorkflow = async (name) => {
    try {
      const res = await fetch(`${API_BASE}/canvases/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create canvas");
      const data = await res.json();
      const wf = { id: data.id, name: data.name };
      setWorkflows((s) => [...s, wf]);
      setCurrentWorkflowId(wf.id);
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
      await fetch(`${API_BASE}/canvases/${id}/`, { method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify({ name }) });
    } catch (e) {}
  };

  const deleteWorkflow = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/canvases/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete canvas");
      setWorkflows((s) => s.filter((w) => w.id !== id));
      if (currentWorkflowId === id) {
        const next = workflows.find((w) => w.id !== id) || { id: "default", name: "Default" };
        setCurrentWorkflowId(next.id);
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



  const selectWorkflow = async (id) => {
    setCurrentWorkflowId(id);
    try { localStorage.setItem("currentCanvasId", id); } catch (e) {}
    try {
      const res = await fetch(`${API_BASE}/canvases/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch canvas");
      const data = await res.json();
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
          image_id: img.image_id,
          parent_id: img.parent_id
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

  const updateNodePosition = (nodeId, x, y) => {
    setWorkflowNodes((s) => s.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
  };

  const removeNode = async (nodeId) => {
    const nodeToRemove = workflowNodes.find((n) => n.id === nodeId);
    
    setWorkflowNodes((s) => {
      const parentId = nodeToRemove?.parentId ?? null;
      return s
        .filter((n) => n.id !== nodeId)
        .map((n) => (n.parentId === nodeId ? { ...n, parentId } : n));
    });

    if (nodeToRemove?.image) {
      try {
        const canvasId = currentWorkflowId;
        const res = await fetch(`${API_BASE}/canvases/${canvasId}`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const canvas = await res.json();
 
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
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = "rgba(255,128,0,0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  const handleModify = async (nodeId) => {
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
  console.log(workflows)
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full mx-auto h-[calc(100vh-4rem)]">
        <h1 className="font-bold text-3xl mb-8 text-gray-800">Canvas Workflow</h1>

        <div className="flex flex-col lg:flex-row gap-8 h-full">
          <WorkflowPanel
            workflows={workflows}
            currentWorkflowId={currentWorkflowId}
            onSelect={(id) => selectWorkflow(id)}
            onCreate={(name) => createWorkflow(name)}
            onRename={(id, name) => renameWorkflow(id, name)}
            onDelete={(id) => deleteWorkflow(id)}
          />

          <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <h2 className="font-semibold text-lg text-gray-700 mb-6">Workflow Graph ({workflows.find(w=>w.id===currentWorkflowId)?.name || currentWorkflowId})</h2>
            <div className="relative flex-1 border rounded p-2 overflow-auto">
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 0,
                  minWidth: Math.max(800, workflowNodes.length * 260)
                }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="black" />
                  </marker>
                </defs>
                {workflowNodes.map((node) => {
                  if (!node.parent_id) return null; 

                  const parentNode = workflowNodes.find((n) => n.image_id === node.parent_id);
                  if (!parentNode) return null;

                  const x1 = (parentNode.x ?? 20) + 224;
                  const y1 = (parentNode.y ?? 20) + 80;
                  const x2 = node.x ?? 20;
                  const y2 = (node.y ?? 20) + 80;

                  const midX = (x1 + x2) / 2;
                  const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                  return (
                    <path
                      key={`line-${node.id}`}
                      d={pathData}
                      stroke="black"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
              </svg>

              <div className="relative" style={{ minWidth: Math.max(800, workflowNodes.length * 260), zIndex: 1 }}>
                {workflowNodes.map((node, index) => (
                  <div
                    key={node.id}
                    style={{ position: "absolute", left: node.x ?? 20, top: node.y ?? 20 }}
                  >
                    <WorkflowNode
                      node={node}
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