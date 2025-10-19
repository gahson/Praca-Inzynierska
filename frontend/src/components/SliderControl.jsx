const SliderControl = ({ label, value, min, max, step, onChange, textColor = "text-gray-700" }) => (
  <div className="w-full">
    <label className={`block text-sm font-medium ${textColor}`}>
      {label}: {value}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange([Number(e.target.value)])}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export default SliderControl;
