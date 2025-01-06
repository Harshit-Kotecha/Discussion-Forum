import { useEffect } from "react";

const AlertPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Automatically dismiss after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Clear timeout on unmount
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-500 text-white font-bold px-4 py-2 rounded shadow-lg flex items-center space-x-2">
        <span>{message}</span>
        <button className="text-white font-bold" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;
