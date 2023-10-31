import React, { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  const handleClose = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === 'wrapper') onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[999]" id="wrapper" onClick={handleClose}>
      <div className="w-[200px] sm:w-[200px] md:w-[200px] lg:w-[200px] flex flex-col relative">
        <button className="text-slate-500 text-md md:text-lg lg:text-xl absolute top-1 right-3 hover:font-medium dark:text-slate-200" onClick={() => onClose()}>x</button>
        <div className="bg-white p-2 rounded shadow-md dark:bg-dark_mode_card">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal;
