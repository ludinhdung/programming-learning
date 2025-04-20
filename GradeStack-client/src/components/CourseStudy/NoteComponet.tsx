import { useVideoStore } from '../../store/videoStore';



const NoteComponent = () => {
    const currentTime = useVideoStore((state) => state.currentTime);

    return (
        <div className="text-white p-4">
            <h1 className="text-xl font-bold mb-4">Note</h1>
            <div className="mb-4">
                <span className="text-gray-400">Current Time: </span>
                <span className="text-white">{Math.floor(currentTime)}s</span>
            </div>
            <button
                onClick={() => {
                    alert(`Current time: ${Math.floor(currentTime)}s`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
                Show Current Time
            </button>
        </div>
    );
};

export default NoteComponent;
