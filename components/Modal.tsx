import React, { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return <></>;

  const handleClose = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === "wrapper") onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[999]"
      id="wrapper"
      onClick={handleClose}>
      <div className="w-[300px] sm:w-[400px] md:w-[400px] lg:w-[500px] flex flex-col relative">
        <button
          className="text-slate-500 text-xl md:text-xl lg:text-2xl absolute top-1 right-3 hover:font-medium"
          onClick={() => onClose()}>
          x
        </button>
        <div className="bg-white p-2 rounded">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
