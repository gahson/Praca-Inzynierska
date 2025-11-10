import { LuInfo } from "react-icons/lu";

const TextTooltip = ({ text, tooltip }) => {
    return (
        <div className="flex items-center gap-2">
            <p className="block text-sm font-medium">{text}</p>
            <div className="relative group">
                <LuInfo className="text-gray-500 cursor-help" size={16} />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    {tooltip}
                </div>
            </div>
        </div>
    )
}

export default TextTooltip;