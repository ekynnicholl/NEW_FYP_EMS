import React, { ReactNode, MouseEvent } from 'react';
import { AiOutlineClose } from "react-icons/ai";

interface EventListModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const EventListModal: React.FC<EventListModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return <></>;

  const handleClose = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === "wrapper") onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
      id="wrapper"
      onClick={handleClose}>
      <div className="w-[700px] h-[500px] border-slate-200 border-[1px] sm:w-[400px] md:w-[400px] lg:w-[700px] flex flex-col relative  overflow-auto">
        <button
          className="text-slate-500 text-md md:text-lg lg:text-xl absolute top-4 right-4 hover:font-medium"
          onClick={() => onClose()}>
          <AiOutlineClose />
        </button>
        <div className="bg-white p-2 rounded">{children}</div>
      </div>
    </div>
  );
};

export default EventListModal;
