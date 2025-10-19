import { useNavigate } from "react-router-dom";

import cathedral from './../../assets/cathedral.png'
import skyscraper from './../../assets/skyscraper.png'
import living_room from './../../assets/living_room.png'
import office1 from './../../assets/office1.png'
import office2 from './../../assets/office2.png'
import office3 from './../../assets/office3.png'
import park1 from './../../assets/park1.png'
import park2 from './../../assets/park2.png'
import park3 from './../../assets/park3.png'
import lighting1 from './../../assets/lighting1.png'
import lighting2 from './../../assets/lighting2.png'
import lighting3 from './../../assets/lighting3.png'
import interior1 from './../../assets/interior1.png'
import interior2 from './../../assets/interior2.png'
import emphasis1 from './../../assets/emphasis1.png'
import emphasis2 from './../../assets/emphasis2.png'
import emphasis3 from './../../assets/emphasis3.png'
import alternating1 from './../../assets/alternating1.png'
import alternating2 from './../../assets/alternating2.png'
import alternating3 from './../../assets/alternating3.png'
import colors1 from './../../assets/colors1.png'
import colors2 from './../../assets/colors2.png'
import colors3 from './../../assets/colors3.png'

export default function Prompts() {
  const navigate = useNavigate();


  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col p-5 gap-5">

      <h1 className="font-bold text-3xl">Prompt guideliness</h1>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">General infromation</h2>
        <p className="text-lg mb-2">
          Prompt construction is a sophisticated process that has evolved into its own scientific
          branch called <span className="font-semibold italic">prompt engineering</span>.
          Given the complexity of the topic, we’ve summarized the key information below and included examples. To begin, consider a few general principles:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Prompts should be expressend in the natural language.</li>
          <li>It is advised to use English whenever possible.</li>
          <li>Try to formulate short phrases separated by commas instead of long sentences.</li>
          <li>Be specific to avoid ambiguity.</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Subject</h2>
        <p className="text-lg mb-5">
          The subject of the image for e.g. person, building, vahicle, animal should be described first, followed by the situation or action it is involved in.
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={cathedral} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">A gothic cathedral</span>, illuminated at night, tourists walking around the square, dramatic shadows on the facade.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A gothic cathedral, illuminated at night, tourists walking around the square, dramatic shadows on the facade.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={skyscraper} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">A glass skyscraper</span>, reflecting the sunset, surrounded by smaller office buildings, people commuting home.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A glass skyscraper, reflecting the sunset, surrounded by smaller office buildings, people commuting home.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={living_room} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">A minimalist living room</span>, furnished with a wooden table and modern chairs, sunlight streaming through large windows, a person reading on the sofa.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A minimalist living room, furnished with a wooden table and modern chairs, sunlight streaming through large windows, a person reading on the sofa.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>


      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Style</h2>
        <p className="text-lg mb-5">
          The Style of an image refers to artistic form in which it is presented. It may include photography, painting, digital illustration or any other visual technique.
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={office1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern office building, <span className="font-semibold italic">captured in high‑resolution photography</span>, with natural daylight and realistic shadows.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern office building, captured in high‑resolution photography, with natural daylight and realistic shadows.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={office2} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern office building, <span className="font-semibold italic">depicted as an oil painting on canvas</span>, with expressive brushstrokes and warm colors.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern office building, depicted as an oil painting on canvas, with expressive brushstrokes and warm colors.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={office3} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern office building, <span className="font-semibold italic">rendered as a digital illustration</span>, with clean vector lines and a stylized, minimalistic look.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern office building, rendered as a digital illustration, with clean vector lines and a stylized, minimalistic look.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Composition</h2>
        <p className="text-lg mb-5">
          The composition describes how an image is framed, including the choice of angles and perspectives.
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={park1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A city park, <span className="font-semibold italic">viewed from above</span>, showing winding paths, trees forming geometric patterns, and people scattered across the lawns.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A city park, viewed from above, showing winding paths, trees forming geometric patterns, and people scattered across the lawns.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={park2} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A city park, <span className="font-semibold italic">close‑up on a wooden bench under a tree</span>, with fallen leaves scattered on the ground.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A city park, close‑up on a wooden bench under a tree, with fallen leaves scattered on the ground.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={park3} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A city park, <span className="font-semibold italic">captured in a wide shot</span>, with a fountain in the center, children playing nearby, and tall buildings visible in the background.
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A city park, captured in a wide shot, with a fountain in the center, children playing nearby, and tall buildings visible in the background.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Lighting</h2>
        <p className="text-lg mb-5">
          The composition describes how an image is framed, including the choice of angles and perspectives.
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={lighting1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              An elegant living room, <span className="font-semibold italic">illuminated with soft lighting, gentle shadows on the furniture, warm and cozy atmosphere.</span>
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "An elegant living room, illuminated with soft lighting, gentle shadows on the furniture, warm and cozy atmosphere.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={lighting2} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A city park at noon, <span className="font-semibold italic">illuminated by even ambient lighting, with balanced tones and no harsh contrasts.</span>
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A city park at noon, illuminated by even ambient lighting, with balanced tones and no harsh contrasts.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={lighting3} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern glass skyscraper, <span className="font-semibold italic">photographed at sunrise with strong backlight, dramatic dynamic shadows cast across the square.</span>
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern glass skyscraper, photographed at sunrise with strong backlight, dramatic dynamic shadows cast across the square.",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Colors</h2>
        <p className="text-lg mb-5">
         To enhance the image’s visual tone, you can specify a color style (e.g., realistic, vibrant, muted, ...), mood (e.g., warm tones, cool tones, ...), and technical parameters such as contrast or color grading.
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={colors1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern interior, natural lighting, <span className="font-semibold italic">realistic colors</span>
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern interior, natural lighting, realistic colors",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={colors2} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern interior, <span className="font-semibold italic">black and white photography, soft contrast</span>
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern interior, black and white photography, soft contrast",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={colors3} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              A modern interior, <span className="font-semibold italic">sepia tone, vintage atmosphere</span>
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern interior, sepia tone, vintage atmosphere",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Negative prompts</h2>
        <p className="text-gray-600 mb-6">
          Negative prompts in contrast to the positive ones specify what should not appear in the image. They are useful for polishing and refining the image.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6 text-sm text-gray-700 rounded">
          <strong>Tip:</strong> Use affirmative terms rather than negations.
          For example, write <em>people</em> instead of <em>no people</em>,
          or <em>old furniture</em> instead of <em>no old furniture</em>.
        </div>
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={interior1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">Positive prompt:</span> A modern living room, Scandinavian style, large windows with natural light, wooden floor, minimalist furniture, neutral color palette, cozy atmosphere
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern living room, Scandinavian style, large windows with natural light, wooden floor, minimalist furniture, neutral color palette, cozy atmosphere",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={interior2} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">Positive prompt:</span> A modern living room, Scandinavian style, large windows with natural light, wooden floor, minimalist furniture, neutral color palette, cozy atmospher
              <br />
              <span className="font-semibold italic">Negative prompt:</span> messy objects, old furniture, low resolution, distorted proportions, extra people
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "A modern living room, Scandinavian style, large windows with natural light, wooden floor, minimalist furniture, neutral color palette, cozy atmospher",
                    negativePrompt:
                      "messy objects, old furniture, low resolution, distorted proportions, extra people",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Phrase emphasis</h2>
        <p className="text-gray-600 mb-6">
          It is possible to assign a weight to any phrase to indicate its importance for the Stable Diffusion model. Positive weights range from 1.1 to 2.0, while negative weights range from 0.1 to 0.9. The emphasis is specified using the format <code className="bg-gray-100 px-1 py-1 rounded text-sm">(word:weight)</code>, for example (bookshelf:1.2).
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={emphasis1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              luxury home library interior, <span className="font-semibold italic">(wooden bookshelves:1.2)</span>, warm lighting, leather armchairs, large windows, cozy intellectual atmosphere
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "luxury home library interior, (wooden bookshelves:1.2), warm lighting, leather armchairs, large windows, cozy intellectual atmosphere",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={emphasis2} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              luxury home library interior, <span className="font-semibold italic">(wooden bookshelves:1.5)</span>, warm lighting, leather armchairs, large windows, cozy intellectual atmosphere
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "luxury home library interior, (wooden bookshelves:1.5), warm lighting, leather armchairs, large windows, cozy intellectual atmosphere",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={emphasis3} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              luxury home library interior, <span className="font-semibold italic">(wooden bookshelves:2.0)</span>, warm lighting, leather armchairs, large windows, cozy intellectual atmosphere
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "luxury home library interior, (wooden bookshelves:2.0), warm lighting, leather armchairs, large windows, cozy intellectual atmosphere",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-bold text-2xl mb-4">Phrase blending</h2>
        <p className="text-gray-600 mb-6">
          The syntax <code className="bg-gray-100 px-1 py-1 rounded text-sm">(keyword1|keyword2)</code> introduces phrase blending, where half of the generation time is spent on keyword1 and the other on keyword2 leading to interesting results.
        </p>
        <div className="grid grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={alternating1} alt="Cathedral" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">(winter park|autumn park)</span>, soft sunlight, detailed trees, atmospheric mood
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "(winter park|autumn park), soft sunlight, detailed trees, atmospheric mood",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={alternating2} alt="Skyscraper" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">(cyberpunk city|dense forest)</span>, neon lights, atmospheric mood, cinematic perspective
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "(cyberpunk city|dense forest), neon lights, atmospheric mood, cinematic perspective",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl shadow-md p-4">
            <img src={alternating3} alt="Interior" className="rounded-lg w-full h-auto mb-3" />
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold italic">(Cracow | Tokyo)</span>, panoramic cityscape, dramatic sunset sky
            </p>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg cursor-pointer"
              onClick={() =>
                navigate(
                  `/views/workflows/text-to-image?${new URLSearchParams({
                    prompt:
                      "(Cracow | Tokyo), panoramic cityscape, dramatic sunset sky",
                    width: "1024",
                    height: "1024",
                    guidance: "8",
                    seed: "9502",
                    model: "xl",
                  }).toString()}`)}
            >
              Try it out
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
