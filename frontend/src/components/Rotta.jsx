import { useState, useEffect } from "react";
import { GiCastle } from "react-icons/gi";

import { MdTableRestaurant, MdHeadphones, MdOutlineWeb, MdOutlineColorLens } from "react-icons/md";

import { 
    MdBed, 
    MdChair, 
    MdKitchen, 
    MdBathtub, 
    MdPrecisionManufacturing,
    MdAccessible,
    MdVisibilityOff,
    MdPanoramaHorizontal,
    MdZoomOutMap,
    MdZoomInMap,
    MdWbSunny,
    MdAcUnit,
    MdWbIncandescent,
    MdPalette,
    MdLandscape,
} from "react-icons/md";

import TextTooltip from "./TextTooltip";

const RottaInputController = ({ positivePromptSetter, negativePromptSetter }) => {
    const roomButtons = [
        { id: 1, icon: MdBed, prompt: "Bedroom" },
        { id: 2, icon: MdChair, prompt: "Living Room" },
        { id: 3, icon: MdKitchen, prompt: "Kitchen" },
        { id: 4, icon: MdBathtub, prompt: "Bathroom" },
    ];

    const contentButtons = [
        { id: 1, icon: MdChair, prompt: "armchair" },
        { id: 2, icon: MdTableRestaurant, prompt: "table" }
    ];

    const styleButtons = [
        { id: 1, icon: GiCastle, prompt: "Medieval style interior" },
        { id: 2, icon: MdHeadphones, prompt: "LoFi style interior" },
        { id: 3, icon: MdOutlineWeb, prompt: "Modern style interior" },
        { id: 4, icon: MdPrecisionManufacturing, prompt: "Futuristic style interior" },
    ];

    const accessibilityButtons = [
        { id: 1, icon: MdAccessible , prompt: "Wheelchair friendly interior design" },
        { id: 2, icon: MdVisibilityOff, prompt: "Blind friendly interior design" },
    ];

    const compositionButtons = [
        { id: 1, icon: MdZoomOutMap , prompt: "Wide angle view" },
        { id: 2, icon: MdZoomInMap, prompt: "Close up view" },
        { id: 3, icon: MdPanoramaHorizontal, prompt: "Panoramic view" },
    ];

    const lightingButtons = [
        { id: 1, icon: MdLandscape , prompt: "Natural lighting" },
        { id: 2, icon: MdWbIncandescent, prompt: "Ambient lighting" },
    ];

    const colorButtons = [
        { id: 1, icon: MdWbSunny, prompt: "Warm colors" },
        { id: 2, icon: MdAcUnit , prompt: "Cool colors" },
        { id: 3, icon: MdPalette, prompt: "Balanced colors" },
    ];

    const [activeRoom, setActiveRoom] = useState(null);
    const [activeContent, setActiveContent] = useState(() =>
        contentButtons.reduce((acc, btn) => ({ ...acc, [btn.id]: false }), {})
    );
    const [activeStyle, setActiveStyle] = useState(null);
    const [activeAccessibility, setActiveAccessibility] = useState(() =>
        accessibilityButtons.reduce((acc, btn) => ({ ...acc, [btn.id]: false }), {})
    );
    const [activeComposition, setActiveComposition] = useState(null);
    const [activeLighting, setActiveLighting] = useState(null);
    const [activeColor, setActiveColor] = useState(null);

    const [expanded, setExpanded] = useState({
        room: true,
        content: false,
        style: false,
        accessibility: false,
        composition: false,
        lighting: false,
        color: false,
    });

    const toggleExpanded = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const selectSingle = (setter, id, activeId) => {
        setter(activeId === id ? null : id);
    };
    const toggleContent = (id) => setActiveContent(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleAccessibility = (id) => setActiveAccessibility(prev => ({ ...prev, [id]: !prev[id] }));

    const updatePrompts = () => {
        const positive = [];
        const negative = [];

        if (activeRoom) {
            positive.push(roomButtons.find(b => b.id === activeRoom).prompt);
            negative.push(...roomButtons.filter(b => b.id !== activeRoom).map(b => b.prompt));
        }

        if (activeStyle) {
            positive.push(styleButtons.find(b => b.id === activeStyle).prompt);
            negative.push(...styleButtons.filter(b => b.id !== activeStyle).map(b => b.prompt));
        }

        const accessibilitySelected = Object.values(activeAccessibility).some(v => v);
        for (const id in activeAccessibility) {
            const prompt = accessibilityButtons.find(b => b.id === Number(id)).prompt;
            if (activeAccessibility[id]) {
                positive.push(prompt);
            } else if (accessibilitySelected) {
                negative.push(prompt);
            }
        }

        if (activeComposition) {
            positive.push(compositionButtons.find(b => b.id === activeComposition).prompt);
            negative.push(...compositionButtons.filter(b => b.id !== activeComposition).map(b => b.prompt));
        }

        if (activeLighting) {
            positive.push(lightingButtons.find(b => b.id === activeLighting).prompt);
            negative.push(...lightingButtons.filter(b => b.id !== activeLighting).map(b => b.prompt));
        }

        if (activeColor) {
            positive.push(colorButtons.find(b => b.id === activeColor).prompt);
            negative.push(...colorButtons.filter(b => b.id !== activeColor).map(b => b.prompt));
        }

        const contentSelected = Object.values(activeContent).some(v => v);
        for (const id in activeContent) {
            const prompt = contentButtons.find(b => b.id === Number(id)).prompt;
            if (activeContent[id]) {
                positive.push(prompt);
            } else if (contentSelected) {
                negative.push(prompt);
            }
        }

        positivePromptSetter(positive.join(", "));
        negativePromptSetter(negative.join(", "));
    };

    useEffect(() => {
        updatePrompts();
    }, [activeRoom, activeStyle, activeAccessibility, activeComposition, activeLighting, activeColor, activeContent]);

    const renderSingleChoiceButtons = (buttons, activeId, setter) => (
        <div className="flex flex-wrap gap-3 mb-4 overflow-visible">
            {buttons.map(({ id, icon: Icon, prompt }) => (
                <div key={id} className="relative group">
                    <button
                        onClick={() => selectSingle(setter, id, activeId)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-200 text-xl ${activeId === id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                    >
                        <Icon />
                    </button>
                    <div className="absolute left-full transform -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                        {prompt}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderMultiChoiceButtons = (buttons, state, toggle) => (
        <div className="flex flex-wrap gap-3 mb-4">
            {buttons.map(({ id, icon: Icon, prompt }) => (
                <div key={id} className="relative group">
                    <button
                        onClick={() => toggle(id)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-200 text-xl ${state[id] ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                    >
                        <Icon />
                    </button>
                    <div className="absolute left-full transform -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                        {prompt}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSection = (title, tooltip, content, sectionKey) => (
        <div className="mb-4">
            <div
                onClick={() => toggleExpanded(sectionKey)}
                className="flex items-center justify-between cursor-pointer select-none pb-1 border-b border-gray-300"
            >
                <TextTooltip text={title} tooltip={tooltip} />
                <span className="text-gray-500">{expanded[sectionKey] ? "▲" : "▼"}</span>
            </div>
            {expanded[sectionKey] && <div className="mt-2">{content}</div>}
        </div>
    );

    return (
        <>
            {renderSection(
                "Room",
                "Select the room for the generated interior.",
                renderSingleChoiceButtons(roomButtons, activeRoom, setActiveRoom),
                "room"
            )}
            {renderSection(
                "Image contents",
                "Select the objects that should appear in the generated image.",
                renderMultiChoiceButtons(contentButtons, activeContent, toggleContent),
                "content"
            )}
            {renderSection(
                "Image style",
                "Select the interior style of the generated image.",
                renderSingleChoiceButtons(styleButtons, activeStyle, setActiveStyle),
                "style"
            )}
            {renderSection(
                "Accessibility",
                "Select accessibility option(s).",
                renderMultiChoiceButtons(accessibilityButtons, activeAccessibility, toggleAccessibility),
                "accessibility"
            )}
            {renderSection(
                "Composition",
                "Select composition type.",
                renderSingleChoiceButtons(compositionButtons, activeComposition, setActiveComposition),
                "composition"
            )}
            {renderSection(
                "Lighting",
                "Select lighting type.",
                renderSingleChoiceButtons(lightingButtons, activeLighting, setActiveLighting),
                "lighting"
            )}
            {renderSection(
                "Color",
                "Select color palette.",
                renderSingleChoiceButtons(colorButtons, activeColor, setActiveColor),
                "color"
            )}
        </>
    );
};

export default RottaInputController;
