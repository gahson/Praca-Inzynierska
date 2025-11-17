import React from "react";
import { useState} from "react";

import TextTooltip from "./TextTooltip";
import VisualPrompting from "./VisualPrompting";

const Prompts = ({positivePrompt, setPositivePrompt, negativePrompt, setNegativePrompt}) => {

    const [isVisualPromptingOn, setIsVisualPromptingOn] = useState(false);

    return(
        <>
         {/*Visual prompting*/}
          <div className="flex items-center space-x-3">
            <TextTooltip
                text="Visual prompting"
                tooltip="Enable or disable visual prompting."
              />
            <div
              onClick={() => {
                const newValue = !isVisualPromptingOn;

                if (newValue) {
                  const proceed = window.confirm(
                    `You are about to turn on Visual Prompting mode. Your positive and negative prompts will be erased! Continue?`
                  );
                  if (proceed) setIsVisualPromptingOn(newValue);
                }else{
                  const proceed = window.confirm(
                    `You are about to turn off Visual Prompting Mode. Your choices will be translated into textual positive and negative prompts. Continue?`
                  );
                  if (proceed) setIsVisualPromptingOn(newValue);
                }

              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${isVisualPromptingOn ? "bg-green-500" : "bg-gray-400"}`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${isVisualPromptingOn ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            </div>
          </div>
          {isVisualPromptingOn ? (

            <VisualPrompting
              positivePromptSetter={setPositivePrompt}
              negativePromptSetter={setNegativePrompt}
            />

          ) : (
            <>

              <TextTooltip
                text="Positive prompt"
                tooltip="Provide a natural-language description of what the image should contain."
              />
              <input
                value={positivePrompt}
                onChange={(e) => updatePrompt(e.target.value)}
                placeholder="Enter prompt"
                className="w-full p-2 border rounded"
              />

              <TextTooltip
                text="Negative prompt"
                tooltip="Provide a natural-language description of what the image should not contain."
              />
              <input
                value={negativePrompt}
                onChange={(e) => updateNegativePrompt(e.target.value)}
                placeholder="Enter negative prompt (optional)"
                className="w-full p-2 border rounded"
              />
            </>
          )}
        </>
    )

}

export default Prompts;