import { FiX } from "react-icons/fi";

export default function VideoModal({ videoSrc, onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose} 
    >
      <div 
        className="relative w-full max-w-4xl bg-black rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 text-white bg-black/30 rounded-full hover:bg-black/60"
        >
          <FiX size={24} />
        </button>
        
        <div className="aspect-video">
          <video
            className="w-full h-full"
            src={videoSrc} // This will receive "/v1.mp4" from the landing page
            autoPlay
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}