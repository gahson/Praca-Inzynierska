import { useNavigate } from "react-router-dom";

function Error() {

    const navigate = useNavigate();

    const handleTakeMeBack = () => {
        navigate(`/views/dashboard`);
    };
    return (
        <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center gap-10">
            <h1 className="text-6xl font-bold text-center m-0">
                Page not found!
            </h1>
            <button
                className="bg-yellow-400 hover:bg-yellow-400 px-5 py-3 rounded-lg"
                onClick={handleTakeMeBack}
            >
                Take me back!
            </button>
        </div>
    );
}

export default Error;
