import React, { useState } from "react";

export default function WorkflowPanel({ workflows, currentWorkflowId, onSelect, onCreate, onRename, onDelete, onSave }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  return (
    <div className="w-64 bg-white rounded-lg shadow p-4 flex flex-col gap-4">
      <h3 className="font-semibold text-lg">Workflows</h3>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New workflow name"
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button
          className="bg-blue-500 text-white px-3 rounded text-sm"
          onClick={() => {
            if (!newName.trim()) return;
            onCreate?.(newName.trim());
            setNewName("");
          }}
        >
          New
        </button>
      </div>

      <div className="overflow-auto flex-1">
        {workflows.length === 0 && <p className="text-sm text-gray-500">No workflows</p>}
        <ul className="space-y-2 mt-2">
          {workflows.map((wf) => (
            <li key={wf.id} className={`p-2 rounded border ${wf.id === currentWorkflowId ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-white"}`}>
              <div className="flex items-center justify-between gap-2">
                {editingId === wf.id ? (
                  <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 border px-2 py-1 text-sm rounded" />
                ) : (
                  <button className="text-left flex-1 text-sm font-medium" onClick={() => onSelect?.(wf.id)}>{wf.name}</button>
                )}

                <div className="flex items-center gap-1">
                  {editingId === wf.id ? (
                    <>
                      <button className="text-xs text-green-600 px-2" onClick={() => { onRename?.(wf.id, editingName); setEditingId(null); }}>OK</button>
                      <button className="text-xs text-gray-600 px-2" onClick={() => setEditingId(null)}>✕</button>
                    </>
                  ) : (
                    <>
                      <button className="text-xs text-gray-600 px-2" onClick={() => { setEditingId(wf.id); setEditingName(wf.name); }}>Edit</button>
                      <button className="text-xs text-red-600 px-2" onClick={() => onDelete?.(wf.id)}>Del</button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button className="text-xs bg-green-500 text-white px-2 py-0.5 rounded" onClick={() => onSave?.(wf.id)}>Save</button>
                <span className="text-xs text-gray-500">id: {wf.id}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
