import { useState, useEffect } from "react";

import {
    MdTableRestaurant,
    MdHeadphones,
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
    MdPalette,
    MdLandscape,
    MdCameraRoll,
    MdWhatshot,
    MdLightbulb,
    MdBrightnessLow,
    MdBrightnessHigh,
    MdElderly,
    MdChildFriendly,
    MdInvertColorsOff,
    MdWarningAmber,
    MdRoofing,
    MdRestaurant,
    MdWork,
    MdChildCare,
    MdHotel,
    MdLocalLaundryService,
    MdDoorFront,
    MdGarage,
    MdBrush,
    MdLocalLibrary,
    MdFitnessCenter,
    MdSensorWindow,
    MdDesk,
    MdBook,
} from "react-icons/md";

import {
    GiGearHammer,
    GiRetroController,
    GiFlowerPot,
    GiOlive,
    GiAncientColumns,
    GiCog,
    GiClothes,
    GiGamepad,
    GiWoodenCrate,
    GiCastle,
    GiPianoKeys,
    GiCookingPot,
    GiFireplace, 
    GiCupcake
} from "react-icons/gi";

import {
    TbConeFilled,
    TbCone2Filled,
    TbSquare
} from "react-icons/tb";

import {
    FaArrowUp,
    FaArrowDown,
    FaMagnifyingGlass,
} from "react-icons/fa6";


import { 
    FaTv,
    FaCouch, 
    FaShower, 
    FaToriiGate 
} from "react-icons/fa";

import { 
    RiMovie2AiFill,
    RiPlantFill 
} from "react-icons/ri";

import { BiCloset } from "react-icons/bi";

import { BsLampFill } from "react-icons/bs";

import { HiHomeModern } from "react-icons/hi2";

import { IoDiamond } from "react-icons/io5";

import { PiLampPendantFill } from "react-icons/pi";


import TextTooltip from "./TextTooltip";

const VisualPrompting = ({ positivePromptSetter, negativePromptSetter }) => {
    const roomButtons = [
        { id: 1, icon: MdBed, prompt: "Bedroom" },
        { id: 2, icon: MdChair, prompt: "Living Room" },
        { id: 3, icon: MdKitchen, prompt: "Kitchen" },
        { id: 4, icon: MdBathtub, prompt: "Bathroom" },
        { id: 5, icon: MdRestaurant, prompt: "Dining Room" },
        { id: 6, icon: MdWork, prompt: "Home Office" },
        { id: 7, icon: MdChildCare, prompt: "Kids Room" },
        { id: 8, icon: MdHotel, prompt: "Guest Room" },
        { id: 9, icon: GiClothes, prompt: "Dressing Room" },
        { id: 10, icon: MdLocalLaundryService, prompt: "Laundry Room" },
        { id: 11, icon: MdDoorFront, prompt: "Hallway" },
        { id: 12, icon: MdGarage, prompt: "Garage" },
        { id: 13, icon: GiWoodenCrate, prompt: "Basement" },
        { id: 14, icon: MdRoofing, prompt: "Attic" },
        { id: 15, icon: GiGamepad, prompt: "Gaming Room" },
        { id: 16, icon: MdBrush, prompt: "Creative Studio" },
        { id: 17, icon: MdLocalLibrary, prompt: "Library" },
        { id: 18, icon: MdFitnessCenter, prompt: "Home Gym" },
    ];

    const contentButtons = [
        { id: 1, icon: MdChair, prompt: "Armchair" },
        { id: 2, icon: MdTableRestaurant, prompt: "Table" },
        { id: 3, icon: MdBed, prompt: "Bed" },
        { id: 4, icon: FaCouch, prompt: "Couch" },
        { id: 5, icon: MdBathtub, prompt: "Bathtub" },
        { id: 6, icon: MdDesk, prompt: "Desk" },
        { id: 7, icon: BiCloset, prompt: "Closet" },
        { id: 8, icon: PiLampPendantFill, prompt: "Lamp" },
        { id: 9, icon: MdBook, prompt: "Bookshelf" },
        { id: 10, icon: GiPianoKeys, prompt: "Piano" },
        { id: 11, icon: GiCookingPot, prompt: "Cooking utensils" },
        { id: 12, icon: RiPlantFill, prompt: "Plants" },
        { id: 13, icon: GiFireplace, prompt: "Fireplace" },
        { id: 14, icon: GiCupcake, prompt: "Food" },
        { id: 15, icon: FaTv, prompt: "TV" },
        { id: 17, icon: FaShower, prompt: "Shower" },
        { id: 18, icon: MdSensorWindow, prompt: "Window" },
    ];

    const styleButtons = [
        { id: 1, icon: GiAncientColumns, prompt: "Ancient style interior" },
        { id: 2, icon: GiCastle, prompt: "Medieval style interior" },
        { id: 3, icon: GiGearHammer, prompt: "Industrial style interior" },
        { id: 4, icon: HiHomeModern, prompt: "Modern style interior" },
        { id: 5, icon: MdPrecisionManufacturing, prompt: "Futuristic style interior" },
        { id: 6, icon: GiCog, prompt: "Steampunk style interior" },
        { id: 7, icon: TbSquare, prompt: "Minimalistic style interior" },
        { id: 8, icon: IoDiamond, prompt: "Art déco style interior" },
        { id: 9, icon: GiFlowerPot, prompt: "Boho style interior" },
        { id: 10, icon: GiRetroController, prompt: "Retro style interior" },
        { id: 11, icon: MdHeadphones, prompt: "LoFi style interior" },
        { id: 12, icon: GiOlive, prompt: "Mediterranean style interior" },
        { id: 13, icon: FaToriiGate, prompt: "Japanese style interior" },

    ];

    const accessibilityButtons = [
        { id: 1, icon: MdAccessible, prompt: "Wheelchair friendly interior design" },
        { id: 2, icon: MdVisibilityOff, prompt: "Blind friendly interior design" },
        { id: 3, icon: MdInvertColorsOff, prompt: "Color blind friendly" },
        { id: 4, icon: MdElderly, prompt: "Elderly friendly interior design" },
        { id: 5, icon: MdChildFriendly, prompt: "Child safe interior design" },
        { id: 6, icon: MdWarningAmber, prompt: "Safety railings" },
    ];

    const compositionButtons = [
        { id: 1, icon: MdZoomOutMap, prompt: "Wide angle view" },
        { id: 2, icon: MdZoomInMap, prompt: "Close up view" },
        { id: 3, icon: MdPanoramaHorizontal, prompt: "Panoramic view" },
        { id: 4, icon: FaArrowDown, prompt: "Bird's-eye view" },
        { id: 5, icon: FaArrowUp, prompt: "Worm's-eye view" },
        { id: 6, icon: FaMagnifyingGlass, prompt: "Macro view" },
    ];

    const lightingButtons = [
        { id: 1, icon: MdLandscape, prompt: "Natural lighting" },
        { id: 2, icon: MdLightbulb, prompt: "Artificial lighting" },
        { id: 3, icon: BsLampFill, prompt: "Ambient lighting" },
        { id: 4, icon: TbConeFilled, prompt: "Spotlight" },
        { id: 5, icon: TbCone2Filled, prompt: "Backlight" },
        { id: 6, icon: MdBrightnessLow, prompt: "Soft lighting" },
        { id: 7, icon: MdBrightnessHigh, prompt: "Hard lighting" },
        { id: 8, icon: RiMovie2AiFill, prompt: "Cinematic lighting" },
    ];

    const colorButtons = [
        { id: 1, icon: MdWbSunny, prompt: "Warm colors" },
        { id: 2, icon: MdAcUnit, prompt: "Cool colors" },
        { id: 3, icon: MdPalette, prompt: "Balanced colors" },
        { id: 4, icon: MdWhatshot, prompt: "Live colors" },
        { id: 5, icon: MdCameraRoll, prompt: "Sepia" },

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
                "Colors",
                "Select color palette.",
                renderSingleChoiceButtons(colorButtons, activeColor, setActiveColor),
                "color"
            )}
        </>
    );
};

export default VisualPrompting;
