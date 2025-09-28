export default function Prompts() {
  return (
    <div className="h-screen bg-gray-100">
      <div className="w-full bg-gray-200 p-4 sticky top-0 shadow-md z-50">
        <h2 className="text-lg font-semibold mb-2">Guideliness on how to construct you prompt when interacting with Stable Diffusion models</h2>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
          <li>Use English whenever possible.</li>
          <li>Prefer short phrases instead of long sentences, separated by commas.</li>
          <li>Be specific in your descriptions.</li>
          <li>Use expressions like <strong>(golden hour:1.2)</strong> to emphasize keywords.</li>
          <li>Include terms like <strong>masterpiece</strong>, <strong>best quality</strong>, <strong>4k</strong> for better results.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Adapted from <a href="https://docs.comfy.org/tutorials/basic/text-to-image" className="underline">ComfyUI docs</a>.
        </p>
      </div>
      <div className="flex justify-center mt-50">
      <h1>example prompts gallery (eg. text prompt - picture)</h1>
      </div>
    </div>
  );
}
