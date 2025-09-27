import { FaTimes } from "react-icons/fa";

const FileInput = ({ id, label, filename, hasFile, onLoad, onRemove }) => (
  <div className="w-full">
    <div className="flex w-full items-center justify-between">
      <input
        type="file"
        accept="image/*"
        id={id}
        onChange={onLoad}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="w-1/2 bg-yellow-400 cursor-pointer text-black rounded text-center px-4 py-2"
      >
        {label}
      </label>

      {hasFile ? (
        <div className="w-full max-w-[300px] flex items-center justify-end gap-2">
          <span className="truncate">{filename}</span>
          <button
            onClick={onRemove}
            aria-label="Delete"
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
      ) : (
        <span className="text-gray-500">No file loaded</span>
      )}
    </div>
  </div>
);

export default FileInput;
