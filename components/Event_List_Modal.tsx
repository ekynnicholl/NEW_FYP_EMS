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
      
      <div className="h-[500px] border-slate-350 bg-slate-50 border-[1px] rounded-t-lg sm:w-full md:w-[700px] lg:w-[1200px] flex flex-col relative shadow-md">
      <div className="p-2 w-full bg-red-500 rounded-t-lg md:w-[1200px]"></div>
        <button
          className="absolute top-5 right-3"
          onClick={() => onClose()}>
          <AiOutlineClose />
        </button>
        <div className="bg-white p-2 rounded">{children}</div>
      </div>
    </div>
  );
};

export default EventListModal;
